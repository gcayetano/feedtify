// Carga el modelo de usuarios
var User = require('./models/user');

module.exports = function(app){

	// =====================================
    // GET CATEGORIES FROM USER ============
    // =====================================
    app.get('/api/categories/from/:name', function(req, res) {
    	if(req.params.name) {
    		User.findOne({username: req.params.name}, function(err, data){
    			if(err) console.log(err);

    			if(data)
    				res.json(data.categories)
    		});
    	}
	});
}