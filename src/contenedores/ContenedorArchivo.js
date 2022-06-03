const fs = require('fs').promises

class ContenedorArchivo {

    constructor(ruta) {
        this.ruta = ruta
    }

    async getAll() {
        try {
            const all = await fs.readFile(this.ruta, 'utf-8')
            return JSON.parse(all)
        } catch (error) {
            return error
        }
    }

    async getAllCarts() {
        try {
            const all = await fs.readFile(this.ruta, 'utf-8')
            return JSON.parse(all)
        } catch (error) {
            return error
        }
    }

    async getById(id) {
        try {
            const data = await this.getAll()
            const search = data.find(res => res.id == id)
            return search || { error: `producto no encontrado` }
        } catch (error) {
            throw new Error(`Error al buscar: ${error}`)
        }
    }

    async getProductsById(id) {
        const search = await this.getById(id)
        const products = search.productos
        try {
            return products || { error: `productos no encontrados` }
        } catch (error) {
            throw new Error(`Error al buscar: ${error}`)
        }
    }

    async save(object) {
        try {
            const data = await this.getAll()
            let ultimoId;
            let ultimoProducto = data[data.length - 1];

            if (data.length == 0) { ultimoId = 0 } else { ultimoId = ultimoProducto.id }

            const nId = ultimoId + 1
            const time = Date(Date.now()).toString()
            const nuevoProducto = { ...object, timestamp: time, id: nId }
            data.push(nuevoProducto);
            let jsonProducts = JSON.stringify(data);

            await fs.writeFile(this.ruta, jsonProducts, err => {
                if (err) {
                    return (err)
                } else {
                    return nuevoProducto
                }
            })
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async saveById(object, id) {
        try {
            const carts = await this.getAll();
            const index = carts.findIndex((res) => res.id == id);
            const saveIn = carts[index];
            const array = saveIn.productos;
            if (index == -1) {
                return { Error: `no se encontró el id ${id}` };
            } else {
                array.push(object);
                let jsonProducts = JSON.stringify(carts);
                await fs.writeFile(this.ruta, jsonProducts, (err) => {
                    if (err) {
                        return (`Error al guardar: ${err}`);
                    } else {
                        return (saveIn);
                    }
                });
            }
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }

    async updateById(object, id) {
        try {
            const all = await this.getAll()
            const toUpdate = await this.getById(id)
            const updated = { ...object, timestamp: toUpdate.timestamp, id: toUpdate.id }
            await fs.writeFile(this.ruta, JSON.stringify(all), err => {
                if (err) {
                    return (err)
                } else {
                    return updated
                }
            })
        } catch (error) {
            throw new Error(`Error al modificar: ${error}`)
        }
    }

    async updateCartById(id, id_prod) {
        const carts = await this.getAll()
        const cartIndex = carts.findIndex(res => res.id == id)
        const prods = carts[cartIndex].productos
        const indexToDelete = prods.findIndex(res => res.id == id_prod)

        if (indexToDelete == -1) {
            return { error: `producto no encontrado` }
        } else {
            prods.splice(indexToDelete, 1)
            fs.writeFile(this.ruta, JSON.stringify(carts, null, 2), err => {
                if (err) {
                    resolve(err)
                } else {
                    resolve(`producto con id:${id_prod} borrado`)
                }
            })
        }
    }

    async deleteById(id) {
        try {
            const all = await this.getAll()            
            const index = all.findIndex((res) => res.id == id);
            const toDelete = all[index]
            await all.splice(toDelete - 1, 1)
            let jsonProducts = JSON.stringify(all);
            await fs.writeFile(this.ruta, jsonProducts, err => {
                if (err) {
                    return (err);
                } else {
                    console.log("eliminado");
                }
            })
        } catch (error) {
            throw new Error(`Error al eliminar: ${error}`)
        }
    }
}

module.exports = ContenedorArchivo