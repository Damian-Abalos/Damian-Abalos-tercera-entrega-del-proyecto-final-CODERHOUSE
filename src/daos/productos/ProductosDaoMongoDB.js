const config = require ('../../utils/config.js')
const ContenedorMongoDB = require("../../contenedores/ContenedorMongoDB")
const schemaProductos = require("../../schemas/producto.schema")

const productos = new ContenedorMongoDB(config.mongoLocal.cnxStr, 'productos', schemaProductos)

module.exports = productos