var mongoose = require("mongoose");
var User = require('./models/user');

module.exports = {
	/// ====================
	/// Función que devuelve las categorias del usuario
	/// ====================
	getUserCategories: function(username, callback) {
		User.findOne({"username": username}, function(err, data){
			if(err) callback(err, null);

			if(data) {
				callback(null, data.categories);
			}

			return(null, data);
		});
	},
	/// ====================
	/// Función que devuelve el index de una categoria
	/// ====================
	getCategoryIndex: function(username, categoryName){
		User.findOne({"username": username}, function(err, userdata){
			if(err) throw err;
			var index = userdata.categories.findIndex(x => x["name"] == categoryName);
			return index;
		});
	},
	getUserFeeds: function(username){
		User.findOne({"username": username}, function(err, data){
			if(err) callback(err, null);

			if(data) {
				callback(null, data.feeds);
			}

			return(null, data);
		});
	},
	/// ====================
	/// Función inserta un documento en un array
	/// ====================
	pushToArray: function(res, username, arrayName, data){
		User.update({username: username}, {$push: {arrayName: data}}, { upsert: true }, function(err){
			if(err)
				res.json({success: false, message: err});

			res.json({success: true});
		});
	},
	/// ====================
	/// Función inserta varios documentos en sus respectivos arrays
	/// ====================
	pushToArrayMulti: function(res, username, objectArray, data){
		User.update({username: username}, {$push: objectArray}, { upsert: true }, function(err){
			if(err)
				res.json({success: false, message: err});

			res.json({success: true});
		});
	}
}