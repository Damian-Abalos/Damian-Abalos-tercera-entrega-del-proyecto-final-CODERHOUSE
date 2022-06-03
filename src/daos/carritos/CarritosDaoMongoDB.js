const config = require ('../../utils/config.js')
const ContenedorMongoDB = require("../../contenedores/ContenedorMongoDB")
const schemaCarrito = require("../../schemas/carrito.schema")

const carritos = new ContenedorMongoDB(config.mongoLocal.cnxStr, 'carrito', schemaCarrito)

module.exports = carritos