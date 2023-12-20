//const express = require('express') // Common JS
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import express from 'express'; // ES Modules
import usuaioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js';

// Crear la app
const app = express()

// Habilitar lectura de datos de formularios
app.use( express.urlencoded({extended: true}))

// Habilitar cookie parser
app.use( cookieParser() )

// Habilitar CSRF
app.use( csrf ({cookie: true}))

// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log('Conexion exitosa a la base de datos')
} catch (error) {
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta Publica
app.use( express.static('public') )

// Routing
app.use('/', appRoutes)
app.use('/auth', usuaioRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});