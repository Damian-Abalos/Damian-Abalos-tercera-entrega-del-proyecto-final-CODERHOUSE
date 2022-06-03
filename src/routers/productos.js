const {Router} = require("express")
require('dotenv').config()

const onlyAdmin = require('../middlewares/onlyAdmin')
const validatorProductos = require('../middlewares/validators/validatorProductos')

const productos = process.env.DB == 'Firebase' ? require('../daos/productos/ProductosDaoFirebase') : require('../daos/productos/ProductosDaoMongoDB')

const rutaProductos = Router();

//productos

rutaProductos.get("/", (req, res) => {
    productos.getAll().then((resp) => res.send(resp));
});

rutaProductos.get("/:id", (req, res) => {
    const id = req.params.id;
    productos.getById(id).then((resp) => res.send(resp));
});

rutaProductos.post("/", validatorProductos, onlyAdmin, (req, res) => {
    const newData = req.body;
    productos.save(newData).then((resp) => res.send(resp));    
});

rutaProductos.put("/:id", onlyAdmin, (req, res) => {
    let id = req.params.id;
    productos.updateById(req.body, id).then((resp) => res.send(resp));
});

rutaProductos.delete("/:id", onlyAdmin, (req, res) => {
    let id = req.params.id;
    productos.deleteById(id).then((resp) => res.send(resp));    
});

module.exports = rutaProductos