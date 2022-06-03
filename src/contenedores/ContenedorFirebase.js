const FieldValue = require('firebase-admin').firestore.FieldValue;
const arrayUnion = require('firebase-admin').firestore.arrayUnion;
const admin = require("firebase-admin");
const serviceAccount = require("../DB/basefirebase-a035b-firebase-adminsdk-8uw8n-2507f5c523.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
class ContenedorFirebase {
    constructor(collection) {
        this.collection = collection
    }

    async getAll() {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const querySnapshot = await query.get()
            let docs = querySnapshot.docs;

            const response = docs.map((doc) => ({
                nombre: doc.data().nombre,
                descripcion: doc.data().descripcion,
                codigo: doc.data().codigo,
                foto: doc.data().foto,
                precio: doc.data().precio,
                stock: doc.data().stock,
                timestamp: doc.data().timestamp,
                id: doc.data().id
            }))
            return response
        } catch (error) {
            throw new Error(`Error al buscar: ${error}`)
        }
    }

    async getAllCarts() {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const querySnapshot = await query.get()
            let docs = querySnapshot.docs;

            const response = docs.map((doc) => ({
                productos: doc.data().productos,
                timestamp: doc.data().timestamp,
                id: doc.data().id
            }))
            return response
        } catch (error) {
            throw new Error(`Error al buscar: ${error}`)
        }
    }

    async getById(id) {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const doc = query.doc(`${id}`)
            const item = await doc.get()
            const response = item.data()
            return response || { error: `${this.collection} no encontrado` }
        } catch (error) {
            throw new Error(`Error al buscar por id: ${error}`)
        }
    }

    async getProductsById(id){
        try {
            const carrito = await this.getById(id)
            const productos = carrito.productos
            return  productos
        } catch (error) {
            throw new Error(`Error al buscar por id: ${error}`)
        }
    }

    async save(object) {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const data = await this.getAll()
            let ultimoId;
            let ultimoProducto = await data[data.length - 1];

            if (data.length == 0) { ultimoId = 0 } else { ultimoId = ultimoProducto.id }

            const nId = await ultimoId + 1
            const time = Date(Date.now()).toString()

            let doc = query.doc(`${nId}`)
            await doc.create({ ...object, timestamp: time, id: nId })
            await console.log('documento creado:' + doc);
            return 'documento creado correctamente' 

        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async saveCart(object, idUser) {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);

            const nId = idUser
            const time = Date(Date.now()).toString()

            let doc = query.doc(`${nId}`)
            await doc.create({ ...object, timestamp: time, id: nId })
            await console.log('documento creado:' + doc);
            return 'documento creado correctamente' 

        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async saveById(object, id) {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const carrito = query.doc(id)
            await carrito.update({
                productos:FieldValue.arrayUnion(object)
            })
            return `producto: ${object.nombre} cargado en carrito con id: ${id}`

        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async updateById(object, id) {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const doc = query.doc(id)
            await doc.update(object)
            const actualizado = await this.getById(id)
            return actualizado
        } catch (error) {
            throw new Error(`Error al modificar: ${error}`)
        }
    }

    async updateCartById(id, id_prod){
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const carrito = query.doc(id)
            const productos = await this.getProductsById(id)
            const indexToDelete = productos.findIndex(res => res.id == id_prod)
            if (indexToDelete == -1) {
                return { error: `producto no encontrado` }
            } else {
                productos.splice(indexToDelete, 1)
            await carrito.update({
                productos:productos
            })}
            return `producto con id:${id_prod} eliminado correctamente del carrito con id: ${id}`
        } catch (error) {
            throw new Error(`Error al modificar: ${error}`)
        }
    }

    async deleteById(id) {
        try {
            const db = admin.firestore();
            const query = db.collection(this.collection);
            const doc = query.doc(id)
            await doc.delete()
            return `${this.collection} con id ${id} borrado exitosamente`
        } catch (error) {
            throw new Error(`Error al borrar: ${error}`)
        }
    }
}

module.exports = ContenedorFirebase