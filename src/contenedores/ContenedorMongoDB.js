const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const { model } = require('mongoose');

class ContenedorMongoDB {

    constructor(url, collection, schema) {
        this.url = url
        this.nameCollection = collection
        this.collection = model(collection, schema)
    }

    async getAll() {
        try {
            await mongoose.connect(this.url)
            return await this.collection.find()
        } catch (err) {
            throw new Error(`Error al buscar: ${err}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async getAllCarts() {
        try {
            await mongoose.connect(this.url)
            return await this.collection.find()
        } catch (err) {
            throw new Error(`Error al buscar: ${err}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async getById(id) {
        try {
            await mongoose.connect(this.url)            
            const byId = await this.collection.find({id:id})
            return byId
        } catch (err) {
            throw new Error(`Error al buscar: ${err}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async getProductsById(id) {
        try {
            await mongoose.connect(this.url)
            const productos = await this.collection.find({ id: id }, { productos: 1, _id: 0 })
            console.log(productos);
            return productos


        } catch (error) {
            throw new Error(`Error al buscar: ${error}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async save(object) {
        try {
            const data = await this.getAll()
            let ultimoId;
            let ultimoProducto = await data[data.length - 1];

            if (data.length == 0) { ultimoId = 0 } else { ultimoId = ultimoProducto.id }

            const nId = await ultimoId + 1
            const time = Date(Date.now()).toString()
            const nuevoProducto = await new this.collection({ ...object, timestamp: time, id: nId })
            await mongoose.connect(this.url)
            const toSave = await nuevoProducto.save()
            return `producto cargado: ${toSave}`
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async saveById(object, id) {
        try {
            await mongoose.connect(this.url)
            const objeto = object
            console.log(objeto.find(obj => obj.id));
            if (objeto.find(obj => obj.id) == undefined) {
                return "no se encontro el objeto"
            } else {
                await this.collection.updateOne({ id: id }, { $push: { productos: object } })
            return `producto cargado en carrito con id: ${id}`
            }
            
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async updateById(object, id) {
        try {
            await mongoose.connect(this.url)
            await this.collection.updateOne({ id: id }, { $set: object })
            return `producto actualizado`
        } catch (error) {
            throw new Error(`Error al modificar: ${error}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async updateCartById(id, id_prod) {
        try {
            const carrito = await this.getById(id)
            await mongoose.connect(this.url)
            let productos = await carrito[0].productos
            const indexProd = productos.findIndex(idProduc => idProduc[0].id == id_prod)
            console.log(indexProd);
            if (indexProd != -1){
                productos.splice(indexProd,1)
                await this.collection.updateOne({id:id},{$set:{productos:productos}})
                return `producto eliminado en el carrito con id:${id}`        
            } else {
                return(`Error al eliminar`)
            }
        } catch (error) {
            throw new Error(`Error al eliminar: ${error}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }

    async deleteById(id) {
        try {
            await mongoose.connect(this.url)
            await this.collection.deleteOne({ id: id })
            return `${this.nameCollection} con id:${id} eliminado`
        } catch (error) {
            throw new Error(`Error al eliminar: ${error}`)
        } finally {
            mongoose.disconnect()
                .catch((err) => { console.error(err) })
        }
    }
}

module.exports = ContenedorMongoDB