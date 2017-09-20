var mongoose = require("mongoose");
var User = require('./models/user');

module.exports = {

	/// ====================
	/// Función que devuelve las categorias del usuario
	/// ====================
    getUserCategories: function(user){
    	User.findOne({"username": user}, function(err, data){
			if(err) throw err;

			if(user) {
				return data.categories;
			}

			return [];
		})
    }

};