import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Juan',
        email: 'jcamil-2010@hotmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios;