import Propiedad from './Propiedad.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'
import Mensaje from './Mensaje.js'

    // relacion 1:1 primera forma
// Precio.hasOne(Propiedad)
    // relacion 1:1 segunda forma
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'})
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'})
Propiedad.belongsTo(Usuario, {foreignKey: 'usuarioId'})
Propiedad.hasMany(Mensaje, { foreignKey: 'propiedadId'})

Mensaje.belongsTo(Propiedad, { foreignKey: 'propiedadId'})
Mensaje.belongsTo(Usuario, { foreignKey: 'usuarioId'})

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}