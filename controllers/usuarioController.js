import { check, validationResult } from "express-validator"
import bcrypt from 'bcrypt'
import Usuario from "../models/Usuario.js"
import { generarJWT, generarId } from "../helpers/tokens.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js"

const formularioLogin = (req, res) => {
    res.render('auth/login', {
       pagina: 'Iniciar Sesion',
       csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { email, password } = req.body
    
    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } })
    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario no existe"}]
        })
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: "La cuenta no ha sido confirmada"}]
        })
    }

    // Revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El Password es incorrecto"}]
        })
    }

    // Autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
    console.log(token)

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true SOLO SI SE TIENE CERTIFICADO SSL
        // sameSite: true SOLO SI SE TEIENE CERTIFICADO SSL
    }).redirect('/mis-propiedades')
}

const cerrarSesion = (req,res) => {
    
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) => {

    res.render('auth/registro', {
       pagina: 'Crear Cuenta',
       csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    // Validacion
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('Debe registrar un email valido').run(req)
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no son iguales').run(req)
    
    let resultado = validationResult(req)

    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Extraer los datos
    const { nombre, email, password } = req.body

    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where : { email } })

    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario ya esta registrado"}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    
    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envia Email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un Email de Confirmacion'
    })
}

// Funcion que comprueba una cuenta
const confirmar = async (req, res) => {
    const { token } = req.params

    // Verificar si el token es valido
    const usuario = await Usuario.findOne({ where: {token}})
    
    if (!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })

    }

    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmo correctamente',
        error: false
    })

}


const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
       pagina: 'Recupera tu acceso a Bienes Raices',
       csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('Debe ingresar un email valido').run(req)
    
    let resultado = validationResult(req)

    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Buscar el usuario

    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email }} )
    
    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El email no pertenece a ningun usuario"}]
        })
    }

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    // Mostarr mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu password',
        mensaje: 'Hemos enviado un Email con las instrucciones'
    })

}

const comprobarToken = async (req, res) => {

    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: {token} })

    if (!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }

    //Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    
    // Valida el password
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
    
    let resultado = validationResult(req)

    // Verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { token } = req.params
    const { password } = req.body

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({ where: {token} })

    // Hashear el nuevo pasword
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash( password, salt)
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El password se guardo correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}