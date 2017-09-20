var express       = require('express');
var app           = express();
var mongoose      = require('mongoose');
var path          = require('path');
var MongooseExtension = require('nunjucks-mongoose');
var nunjucks      = require('nunjucks');
var passport      = require('passport');
var flash 		  = require('connect-flash');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var session       = require('express-session');
var port          = process.env.PORT || 3000;

var options = { 
  useMongoClient: true
}

// Database configuration settings
var configDB = require('./config/database.js');

// Connection to database
mongoose.connect(configDB.url, options);

//require('./config/passport')(passport); // pass passport for configuration

// Middleware que permite usar archivos locales estaticos como .css
// Es necesario crear la carpeta public e incluir en ellas las carpetas css, js, etc
app.use(express.static(path.join(__dirname, 'public')));

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./config/passport')(passport); // pass passport for configuration

// Setup nunjucks templating engine
var env = nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true,
    noCache: false
});
env.addExtension('MongooseExtension', new MongooseExtension(mongoose, 'get'));

// Set Nunjucks as rendering engine for pages with .html suffix
app.engine( 'html', nunjucks.render ) ;
app.set( 'view engine', 'html' );

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/api_routes.js')(app, passport);

// app.get("/dashboard", function(req, res) {
// 	res.render("layouts/dashboard.html", null);
// })

// app.get("/myfeeds", function(req, res) {
//   res.render("layouts/myfeeds.html", null);
// })

// app.get("/mygroups", function(req, res) {
//   res.render("layouts/mygroups.html", null);
// })

// app.get("/group/:group_slug", function(req, res) {
//   res.render("layouts/group.html", null);
// })

// app.get("/category/:category_slug", function(req, res) {
//   res.render("layouts/category.html", null);
// })

// app.post("/login", function (req, res){
//   res.send("LOGIN!");
// })


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('layouts/404.html');
// });

// bind the app to listen for connections on a specified port
app.listen(port);

// Render some console log output
console.log("Listening on port " + port);

module.exports = app;