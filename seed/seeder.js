import { exit } from 'node:process'
import categorias from "./categorias.js";
import precios from './precios.js';
import usuarios from './Usuarios.js';
import db from "../config/db.js";
import { Categoria, Precio, Usuario } from '../models/index.js'

const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate()

        // Genrear las Columnas
        await db.sync()

        // Insertamos los datos
                //FORMA SI UN AWAIT DEPENDE DEL OTRO
        //      await Categoria.bulkCreate(categorias)
        //      await Precio.bulkCreate(precios)

            //  FORMA SI LOS AWAIT NO DEPENDEN UNO DEL OTRO
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos importados correctamente')
        exit() // exit 0 o exit vacio significa finalizar un proceso correctamente

    } catch (error) {
        console.log(error)
        exit(1) // Exit 1 significa que hubo un error, finalizar un proceso forzadamente por un error
    }
}

const eliminarDatos = async () => {
    try {
        
        // Forma 1

        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ])

        // Forma 2

        await db.sync({force: true})
        console.log('Datos eliminados correctamente')
        exit()
    } catch (error) {
        console.log(error)
        exit(1) 
    }
}

if(process.argv[2] === "-i") {
    importarDatos();
}

if(process.argv[2] === "-e") {
    eliminarDatos();
}