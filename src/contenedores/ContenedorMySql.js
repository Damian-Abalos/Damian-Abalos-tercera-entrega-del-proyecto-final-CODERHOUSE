import knex from "knex"

class ContenedorSQL {

    constructor(config, tabla) {
        this.tableName = tabla        
        this.knex = knex(config);
    }

    createTableMessages() {
        this.knex.schema.createTable(this.tableName, table => {
            table.string('author')
            table.string('text')
        })
            .then(() => console.log("table created"))
            .catch((err) => { console.log(err); throw err })
            .finally(() => {
                this.knex.destroy();
            })
    }

    createTableProducts() {
        this.knex.schema.createTable(this.tableName, table => {
            table.string('nombre').notNullable()
            table.float('precio')
            table.string('imagen').notNullable()
        })
            .then(() => console.log("table created"))
            .catch((err) => { console.log(err); throw err })
            .finally(() => {
                this.knex.destroy();
            })
    }

    async insertData(data) {
        try {
            const [id] = await this.knex(this.tableName).insert(data);
            return id;
        } catch (error) {
            console.log(error); throw error;
        }
    }

    async selectData() {
        try {
            return rows = await this.knex.from(this.tableName).select('*');
        } catch (error) {
            console.log('Error:', error);
        }
    }

    async updateWhere(element) {
        try {
            return dataUpdated = await this.knex.from(this.tableName).where('id', element.id).update(element)
        } catch (error) {
            console.log('Error:', error);
        }
    }

    async deleteData() {
        try {
            await this.knex.from(this.tableName).del()
            return ('data deleted')
        } catch (error) {
            console.log('Error:', error);
        }
    }

    async deleteWhere(key, value) {
        try {
            await this.knex.from(this.tableName).where(key, value).del()
            return ('data deleted')
        } catch (error) {
            console.log('Error:', error);
        }
    }
}

module.exports = ContenedorSQL