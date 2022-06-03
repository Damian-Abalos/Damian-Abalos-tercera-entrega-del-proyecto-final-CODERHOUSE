const config = require ('../../utils/config.js')

const ContenedorArchivo = require ("../../contenedores/ContenedorArchivo")

const carritos = new ContenedorArchivo(config.fileSystem.carritosPath)

module.exports = carritos