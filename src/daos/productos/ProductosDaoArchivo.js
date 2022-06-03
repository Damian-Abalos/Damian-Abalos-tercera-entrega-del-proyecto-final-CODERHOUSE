const config = require ('../../utils/config.js')

const ContenedorArchivo = require("../../contenedores/ContenedorArchivo")

// const productos = new ContenedorArchivo('../DB/productos.txt')
const productos = new ContenedorArchivo(config.fileSystem.productsPath)

module.exports =  productos