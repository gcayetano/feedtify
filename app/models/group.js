var mongoose = require('mongoose');

// Esquema para los grupos
var groupSchema = mongoose.Schema({
	id: String,
	name: String,
	slug: String,
	description: String,
	avatar: String,
	owner: String,
	users: Number,
	color: String,
	icon: String,
	feeds: Array
});

// Exporta el modelo basado en el esquema anterior
module.exports = mongoose.model('Groups', groupSchema);