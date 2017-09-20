var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// Esquema para los usuarios
var userSchema = mongoose.Schema({
	id: String,
	username: String,
	password: String,
	email: String,
	avatar: String,
	groups: Array,
	categories: Array,
	feeds: Array,
	posts: Array
})

//------- Métodos
// Genera el hash para cifrar la contraseña
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Comprueba si la contraseña es válida
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Exporta el modelo basado en el esquema anterior
module.exports = mongoose.model('Users', userSchema);