const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const carritoSchema = new Schema({
	id: { type: String, required: true},
	timestamp: { type: String, required: true},
	productos: { type: Array, required: true},
});

module.exports = carritoSchema;