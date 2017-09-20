// Carga el modelo de usuarios
var User = require('./models/user');
var Group = require('./models/group');
var Feedtify = require('./feedtify.js');

module.exports = function(app, passport){

    // =====================================
    // GET PUBLIC DATA FROM USER ===========
    // =====================================
    app.get('/api/:type/from/:name?', function(req, res) {
        if(req.params.name) {
            if(req.params.type === "data") {
                // User.findOne({username: req.params.name}, {_id: 0, password: 0, __v: 0, posts: 0, groups: 0, categories: 0, feeds: 0}, function(err, data){
                //     if(err) console.log(err);

                //     if(data){
                //         res.json(data)
                //     }
                // });
                User.findOne({username: req.params.name}, {_id: 0, password: 0, __v: 0}, function(err, data){
                    if(err) console.log(err);

                    if(data){
                        res.json(data)
                    }
                });
            }
            else {
                User.findOne({username: req.params.name}, {_id: 0}, function(err, data){
                    if(err) console.log(err);

                    if(data){
                        res.json(data[req.params.type])
                    }
                });
            }
        }
        else {
            res.json({success: false, message: "Username required!"});
        }
    });

    // =====================================
    // GET PUBLIC DATA FROM GROUP ==========
    // =====================================
    app.get('/api/data/group/:name?', function(req, res) {
        if(req.params.name) {
            Group.findOne({ $or: [{name: req.params.name}, {id: req.params.name}, {slug: req.params.name}] }, {_id: 0, __v: 0}, function(err, data){
                if(err) console.log(err);

                if(data){
                    res.json(data);
                }
            });  
        }
        else {
            res.json({success: false, message: "Group name required!"});
        }
    });

    // =====================================
    // ADD FEED ============================
    // =====================================

    app.post('/addfeed', isLoggedIn, function(req, res){
        var user = req.user.username;

        var feedUrl = req.body.feedUrl;
        var feedDomain = req.body.feedDomain;
        var feedCategorySelect = req.body.feedCategorySelect;
        var feedCategory = req.body.feedCategory;
        var groupSelect = req.body.groupSelect;
        var feedColor = req.body.feedColor;
        var feedIcon = req.body.feedIconsSelect;
        var category = feedCategory;
        
        if(feedCategory == undefined || feedCategory == null || feedCategory == "" || feedCategory == " ")
            category = feedCategorySelect;

        // Find user
        User.findOne({username: user}, function(err, userdata){
            if(err) res.json({success: false, message: err});

            // If user found
            if(userdata){ 
                // Check if selected category exists. If not, create it
                var catLength = userdata.categories.length;
                var catFound = userdata.categories.some(found => found["name"] == category);

                // New feed object
                var newFeed = {
                    category: catLength+1,
                    url: feedUrl,
                    domain: feedDomain
                }

                // If category is found
                if(catFound){
                    // Get index from current category
                    var catIndex = userdata.categories.findIndex(x => x["name"] == category);
                    // Set category index for new feed
                    newFeed.category = catIndex+1;
                    // Add new feed to database
                    if(groupSelect != ""){
                        newFeed.group = groupSelect;
                    }

                    User.update({username: user}, {$push: {feeds: newFeed}}, { upsert: true }, function(err){
                        if(err)
                            res.json({success: false, message: err});

                        // If user select a group, add the feed to it
                        if(groupSelect != ""){
                            Group.find({name: groupSelect}, function(err, group){
                                if(err) res.json({success: false, message: err});

                                if(group){
                                    var newGroupFeed ={
                                        url: feedUrl,
                                        domain: feedDomain
                                    };
                                    Group.update({name: groupSelect}, {$push: {feeds: newGroupFeed}}, { upsert: true }, function(err){
                                        if(err) res.json({success: false, message: err});
                
                                        res.json({success: true});
                                    });
                                }
                            });
                        }
                        else{
                            res.json({success: true});
                        }
                        
                    });
                }else{
                    // Create a new category object
                    var slug = category.split(" ").filter(function(entry) { return entry.trim() != ''; }).join("_");
                    var newCategory = {
                        id: catLength+1,
                        name: category,
                        icon: feedIcon,
                        color: feedColor,
                        slug: slug
                    }

                    // Add new feed and new category to database
                    User.update({username: user}, {$push: {feeds: newFeed, categories: newCategory}}, { upsert: true }, function(err){
                        if(err)
                            res.json({success: false, message: err});

                        // If user select a group, add the feed to it
                        if(groupSelect != ""){
                            Group.find({name: groupSelect}, function(err, group){
                                if(err) res.json({success: false, message: err});

                                if(group){
                                    var newGroupFeed ={
                                        url: feedUrl,
                                        domain: feedDomain
                                    };
                                    Group.update({name: groupSelect}, {$push: {feeds: newGroupFeed}}, { upsert: true }, function(err){
                                        if(err) res.json({success: false, message: err});
                
                                        res.json({success: true});
                                    });
                                }
                            });
                        }

                        res.json({success: true});
                    });
                }
            }
        });
    });

    // =====================================
    // ADD GROUP ===========================
    // =====================================

    app.post('/addgroup', isLoggedIn, function(req, res){
        var user = req.user.username;

        var groupName = req.body.name;
        var groupDesc = req.body.description;
        var groupOwner = req.body.owner;
        var groupColor = req.body.color;
        var groupIcon = req.body.icon;
        var groupSlug = groupName.split(" ").filter(function(entry) { return entry.trim() != ''; }).join("_");
        var groupUsers = 1;

        // Find group
        Group.findOne({name: groupName}, function(err, group){
            if(err) res.json({success: false, message: err});

            // If group found, send error message. If not, create it
            if(group){
                res.json({success: false, message: "Group already exists!"});
            }else{
                Group.count({}, function(err, count){
                    if(err) res.json({success: false, message: "An error ocurred!"});

                    var gId = count + 1;
                    var newGroup = new Group({id: gId, name: groupName, slug: groupSlug, description: groupDesc, avatar: "", owner: groupOwner, users: groupUsers, color: groupColor, icon: groupIcon, feeds: []});
                    newGroup.save(function(err, created){
                        if(err) res.json({success: false, message: "An error ocurred when creating the group!"});

                        // Find user and save the group to his profile
                        User.update({username: user}, {$push: {groups: {id: gId, created: true}}}, function(err){
                            if(err) res.json({success: false, message: "An error ocurred when saving the group to profile!"});

                            res.json({success: true});
                        })
                    })
                })
            }
        })
    });

    // =====================================
    // JOIN GROUP ==========================
    // =====================================

    app.post('/joingroup', isLoggedIn, function(req, res){
        var user = req.user.username;

        var groupName = req.body.name;
        var groupSlug = groupName.split(" ").filter(function(entry) { return entry.trim() != ''; }).join("_");
        var groupUsers = req.body.users;
        groupSlug = groupSlug.replace("[GROUP]_", "").trim();

        // Find group
        Group.findOne({slug: groupSlug}, function(err, group){
            if(err) res.json({success: false, message: err});

            // If group found, join or unjoin user
            if(group){
                var gId = group.id;
                var gUsers = parseInt(group.users);

                User.findOne({groups: {$elemMatch: {id:gId}}}, function(err, userdata){
                    if(err) res.json({success: false, message: err});

                    // If user found, unjoin from group
                    if(userdata){
                        User.update({username: user}, {$pull: {groups: {id: gId}}}, function(err){
                            if(err) res.json({success: false, message: err});

                            // Reduce group users number and save
                            gUsers--;
                            Group.update({id: gId}, {$set: {users: gUsers}}, function(err){
                                if(err) res.json({success: false, message: err});

                                res.json({success: true});
                            })
                        });
                    }else{
                        User.update({username: user}, {$push: {groups: {id: gId, created: false}}}, function(err){
                            if(err) res.json({success: false, message: err});

                            // Reduce group users number and save
                            gUsers++;
                            Group.update({id: gId}, {$set: {users: gUsers}}, function(err){
                                if(err) res.json({success: false, message: err});

                                res.json({success: true});
                            })
                        });
                    }
                });
            }
        })
    });

    // =====================================
    // DELETE FEED =========================
    // =====================================

    app.post('/deletefeed', isLoggedIn, function(req, res){
        var user = req.user.username;

        var feedUrl = req.body.feedUrl;

        // Find user
        User.findOne({username: user}, function(err, userdata){
            if(err) res.json({success: false, message: err});

            // If user found
            if(userdata){ 
                // Find and delete the selected feed
                User.update( {username: user}, { $pull: {feeds: {url: feedUrl} } }, function(err){
                    if(err){
                        res.json({success: false, message: err});
                    }
                       
                    res.json({success: true});
                });
            }
        });
    });

    // =====================================
    // ADD POST ============================
    // =====================================

    app.post('/addpost', isLoggedIn, function(req, res){
        var user = req.user.username;

        var category = req.body.category;
        var image = req.body.image;
        var title = req.body.title;
        var content = req.body.content;
        var link = req.body.link;
        var type = req.body.type;

        // Find user
        User.findOne({username: user}, function(err, userdata){
            if(err) res.json({success: false, message: err});

            // If user found
            if(userdata){ 
                // Check if post already exists
                var postFound = userdata.posts.some(x => x.category == category && x.title == title && x.link == link);

                // If posts exists, update it. If not, create it
                if(postFound){
                    User.update({username: user, "posts.category": category, "posts.title": title}, {$set: {"posts.$.type": type}}, function(err){
                        if(err){
                            res.json({success: false, message: err});
                        }
                        
                        res.json({success: true});
                    });
                }else{
                    // New post object
                    var newPost = {
                        category: category,
                        image: image,
                        title: title,
                        content: content,
                        link: link,
                        type: type
                    }

                    // Find and delete the selected feed
                    User.update({username: user}, {$push: {posts: newPost}}, { upsert: true }, function(err){
                        if(err){
                            res.json({success: false, message: err});
                        }
                        
                        res.json({success: true});
                    });
                }
            }
        });
    });

    // =====================================
    // DELETE POST =========================
    // =====================================

    app.post('/deletepost', isLoggedIn, function(req, res){
        var user = req.user.username;

        var category = req.body.category;
        var title = req.body.title;
        var link = req.body.link;

        // Find user
        User.findOne({username: user}, function(err, userdata){
            if(err) res.json({success: false, message: err});

            // If user found
            if(userdata){ 
                // Check if post already exists
                var postFound = userdata.posts.some(x => x.category == category && x.title == title && x.link == link);

                // If posts exists, update it. If not, create it
                if(postFound){
                    // User.update({username: user, "posts.category": category, "posts.title": title}, {$set: {"posts.$.type": type}}, function(err){
                    //     if(err){
                    //         res.json({success: false, message: err});
                    //     }
                        
                    //     res.json({success: true});
                    // });
                    
                    User.update( {username: user}, { $pull: {posts: {category: category, title: title, link: link} } }, function(err){
                        if(err){
                            res.json({success: false, message: err});
                        }
                           
                        res.json({success: true});
                    });
                }else{
                    res.json({success: false, message: "Not found!"});
                }
            }
        });
    });
}



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    // res.redirect('/');

    res.json({status: 404, message: "Not Athorized"});
}