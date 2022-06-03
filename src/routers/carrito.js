const {Router} = require("express")
require('dotenv').config()

const validateCarrito = require('../middlewares/validators/validatorCarrito')

const productos = process.env.DB == 'Firebase' ? require('../daos/productos/ProductosDaoFirebase') : require('../daos/productos/ProductosDaoMongoDB')
const carritos = process.env.DB == 'Firebase' ? require('../daos/carritos/CarritosDaoFirebase') : require('../daos/carritos/CarritosDaoMongoDB')

const rutaCarrito = Router();

//carrito

rutaCarrito.get("/", (req, res) => {
    carritos.getAllCarts().then((resp) => res.send(resp));
});

rutaCarrito.get("/:id", (req, res) =>{
    const id = req.params.id;
    carritos.getById(id).then((resp) => res.send(resp));
})

// rutaCarrito.post('/', validateCarrito, (req, res) => {
//     let object = req.body
//     carritos.save(object).then(resp => res.send(resp))
// })

rutaCarrito.post('/:idUser', (req, res) => {
    let object = {"productos":[]}
    let idUser = req.params.idUser
    carritos.saveCart(object, idUser).then(resp => res.send(resp))
})

rutaCarrito.delete('/:id', (req, res) => {
    const id = req.params.id
    carritos.deleteById(id).then(resp => res.send(resp))
})

rutaCarrito.post('/:id/productos', async (req, res) => {
    const id = req.params.id
    const id_prod = req.body.id_prod
    productos.getById(id_prod)
        .then(resp => {
            carritos.saveById(resp, id).then(respo => res.send(respo))
        })
})

rutaCarrito.get('/:id/productos', (req, res) => {
    const id = req.params.id
    carritos.getProductsById(id).then(resp => res.send(resp))
})

rutaCarrito.delete('/:id/productos/:id_prod', (req, res) => {
    const id = req.params.id
    const id_prod = req.params.id_prod
    carritos.updateCartById(id, id_prod).then(resp => res.send(resp))
})

module.exports = rutaCarrito