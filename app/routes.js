var feedtify = require("./feedtify.js");
var User = require('./models/user');
var Group = require('./models/group');

module.exports = function(app, passport) {

	// =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('layouts/index.html');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard', // redirect to the secure profile section
        failureRedirect: 'http://google.es', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    // =====================================
    // DASHBOARD ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('layouts/dashboard', {
            user: req.user, // get the user out of session and pass to template
            categories: req.user.categories,
            groups: req.user.groups
        });
    });

    // =====================================
    // GROUP ===============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/group/:group_slug?', isLoggedIn, function(req, res) {
        res.render('layouts/group.html', {
            user: req.user, // get the user out of session and pass to template
            categories: req.user.categories,
            groups: req.user.groups
        });
    });

    // =====================================
    // MY GROUPS ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/mygroups', isLoggedIn, function(req, res) {
        res.render('layouts/mygroups.html', {
            user: req.user, // get the user out of session and pass to template
            categories: req.user.categories,
            groups: req.user.groups
        });
    });

    // =====================================
    // MY FEEDS ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/myfeeds', isLoggedIn, function(req, res) {
        res.render('layouts/myfeeds.html', {
            user: req.user, // get the user out of session and pass to template
            feeds: req.user.feeds,
            categories: req.user.categories,
            groups: req.user.groups
        });
    });


    // =====================================
    // CATEGORY ============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/category/:category_slug?', isLoggedIn, function(req, res) {
        res.render('layouts/category.html', {
            user: req.user, // get the user out of session and pass to template
            category: req.params.category_slug,
            categories: req.user.categories,
            groups: req.user.groups
        });
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
	    return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}