//const express = require('express') // Common JS
import express from 'express'; // ES Modules
import { formularioLogin, autenticar, cerrarSesion, formularioRegistro, registrar, confirmar, formularioOlvidePassword, resetPassword, comprobarToken, nuevoPassword } from '../controllers/usuarioController.js';

const router = express.Router()

//Routing
//      FORMA INDIVIDUAL
router.get('/login', formularioLogin);
router.post('/login', autenticar);

// Cerrar Sesion
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)




// router.post('/', (req, res) => {
//     res.json({msg:'respuesta de tipo post'})
// });

//          FORMA AGRUPADA
// router.route('/')
//     .get (function (req, res) {
//         res.json({msg:'Lo de siempre en express'})
//     })
//     .post(function (req, res) {
//         res.json({msg:'respuesta de tipo post'})
//     })

export default router;