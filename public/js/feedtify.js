var username = $("#userNameLoggedIn").text();
var currentLocation = window.location.href;
var currentPath = currentLocation.split(":3000/")[1].split("/")[0].trim();

function Feedtify(){
	this.User = function(){
		this.getData = function(callback) {
			$.ajax({
				url: "/api/data/from/"+username,
				error: function() {
					console.log('error!')
				},
				success: function(data) {
					callback(data);
				},
				dataType: 'json'
			});
		},
		this.getCategories = function(callback) {
			$.ajax({
				url: "/api/categories/from/"+username,
				error: function() {
					console.log('error!')
				},
				success: function(data) {
					callback(data);
				},
				dataType: 'json'
			});
		},
		this.getGroups = function(callback) {
			$.ajax({
				url: "/api/groups/from/"+username,
				error: function() {
					console.log('error!')
				},
				success: function(data) {
					callback(data);
				},
				dataType: 'json'
			});
		},
		this.getFeeds = function(callback) {
			$.ajax({
				url: "/api/feeds/from/"+username,
				error: function() {
					console.log('error!')
				},
				success: function(data) {
					callback(data);
				},
				dataType: 'json'
			});
		},
		this.getPosts = function(callback) {
			$.ajax({
				url: "/api/posts/from/"+username,
				error: function() {
					console.log('error!')
				},
				success: function(data) {
					callback(data);
				},
				dataType: 'json'
			});
		}
	},
	this.Group = function(){
		this.getData = function(group, callback){
			$.ajax({
				url: "/api/data/group/"+group,
				error: function() {
					console.log('error!')
				},
				success: function(data) {
					callback(data);
				},
				dataType: 'json'
			});
		}
	},
	this.getUserName = function(){
		return username;
	},
	this.init = function(){
		if(currentPath == "dashboard"){
			this.loadLastFeedsPosts(3);
		}
		else if(currentPath.includes("category")){
			this.loadCategoryPosts();
		}
		else if(currentPath.includes("mygroups")){
			this.loadUserGroups();
		}
		else if(currentPath.includes("group")){
			this.loadGroupData();
		}
	},
	this.loadLastFeedsPosts = function(maxPostsPerFeed){
		var user = new this.User();
		var lastFeedsRow = $("#lastFeeds");
	
		user.getData(function(data){
			for(var i = 0; i < data.feeds.length; i++){
				var feedUrl = data.feeds[i].url;
	
				$.getFeed({
					url: feedUrl,
					indexValue: {data: data, index: i},
					success: function(feed){
						for(var j = 0; j < maxPostsPerFeed; j++){
							var feedCategory = this.indexValue.data.feeds[this.indexValue.index].category;
							var categoryColor = this.indexValue.data.categories.find(x => x.id == feedCategory).color;
							var categoryName = this.indexValue.data.categories.find(x => x.id == feedCategory).name;
							var categoryIcon = this.indexValue.data.categories.find(x => x.id == feedCategory).icon;
	
							var feedCard = $("#f-card-hidden").clone();
							feedCard.removeAttr("hidden");
							feedCard.removeAttr("id");
	
							feedCard.find(".f-card-header").css("background-color", categoryColor);
							feedCard.find(".f-card-header-text i").addClass(categoryIcon + " fa-fw")
							feedCard.find(".f-card-header-text span").text(categoryName);
							feedCard.find(".f-card-image img").attr("src", $(feed.items[j].description).find("img").attr("src"));
							feedCard.find(".f-card-title h6").attr("title", feed.items[j].title);
							feedCard.find(".f-card-title h6 a").text(feed.items[j].title);
							feedCard.find(".f-card-title h6 a").attr("href", feed.items[j].link);
	
							var description = $(feed.items[j].description).clone().children().remove().end().text();
							feedCard.find(".f-card-description").text(description);
	
							lastFeedsRow.append(feedCard);
						}
					}
				});
			}
		});
	},
	this.deleteFeed = function(url, callback){
		$.ajax({
			url: "http://localhost:3000/deletefeed",
			method: "POST",
			data: {feedUrl: url},
			success: function(data){
				if(data.success){
					new PNotify({
						title: 'Successful!',
						text: 'Feed deleted successfully!',
						type: 'success'
					});
				}else{
					new PNotify({
						title: 'Error!!',
						text: data.message,
						type: 'error'
					});
				}
				callback(data);
			}
		});
	},
	this.deletePost = function(category, title, link, callback){
		$.ajax({
			url: "http://localhost:3000/deletepost",
			method: "POST",
			data: {category: category, title: title, link: link},
			success: function(data){
				if(!data.success){
					new PNotify({
						title: 'Error!!',
						text: data.message,
						type: 'error'
					});
				}
				callback(data);
			}
		});
	},
	this.loadCategoryPosts = function(){
		var user = new this.User();
		var fself = this;

		//Columns
		var unreadColumn = $("#unread-column");
		var readedColumn = $("#readed-column");
		var favColumn = $("#fav-column");

		// Category data elements
		var catName = currentLocation.split(":3000/")[1].split("/")[1].trim();
		var catHeader = $(".cat-header");
		var catHeaderText = $(".cat-header-text span");
		var catHeaderIcon = $(".cat-header-text i")
		catHeaderText.text(catName);

		user.getData(function(data){
			var catId = data.categories.find(x => x.name == catName).id;
			var catIcon = data.categories.find(x => x.name == catName).icon;
			var catColor = data.categories.find(x => x.name == catName).color;

			// Change styles
			catHeaderIcon.addClass(catIcon + " fa-fw");
			catHeader.css("background-color", catColor);

			// Load feeds
			for(var i = 0; i < data.feeds.length; i++){
				// Check feeds from selected category
				if(data.feeds[i].category == catId){
					var feedUrl = data.feeds[i].url;
					
					$.getFeed({
						url: feedUrl,
						indexValue: {id: catId, name: catName, domain: data.feeds[i].domain, icon: catIcon, color: catColor},
						success: function(feed){
							for(var j = 0; j < feed.items.length; j++){
								// Clone the card
								var feedCard = $("#f-card-hidden").clone();
								
								// Remove hidden attributes
								feedCard.removeAttr("hidden");
								feedCard.removeAttr("id");
		
								// Fill card with desired data
								feedCard.attr("data-id", this.indexValue.id)
								feedCard.find(".f-card-header").css("background-color", this.indexValue.color);
								feedCard.find(".f-card-header-text i").addClass(this.indexValue.icon + " fa-fw")
								feedCard.find(".f-card-header-text span").text(this.indexValue.domain);
								feedCard.find(".f-card-image img").attr("src", $(feed.items[j].description).find("img").attr("src"));
								//feedCard.find(".f-card-image").css("background-image", "url('"+$(feed.items[j].description).find("img").attr("src")+"')").css("background-size", "cover");
								feedCard.find(".f-card-title h6").attr("title", feed.items[j].title);
								feedCard.find(".f-card-title h6 a").text(feed.items[j].title);
								feedCard.find(".f-card-title h6 a").attr("href", feed.items[j].link);
		
								// Get text only from description 
								var description = $(feed.items[j].description).clone().children().remove().end().text();
								feedCard.find(".f-card-description").text(description);
		
								//Add the card to "unread" column
								unreadColumn.append(feedCard);
							}
						}
					});
				}
			}

			// Load posts
			for(var i = 0; i < data.posts.length; i++){
				var category = data.posts[i].category;

				if(category == catId){
					var cardTitle = data.feeds.find(x => x.category == category).domain;
					var image = data.posts[i].image;
					var title = data.posts[i].title;
					var content = data.posts[i].content;
					var link = data.posts[i].link;
					var type = data.posts[i].type;
	
					// Clone the card
					var feedCard = $("#f-card-hidden").clone();
					
					// Remove hidden attributes
					feedCard.removeAttr("hidden");
					feedCard.removeAttr("id");
					feedCard.find(".delPostBtn").removeAttr("hidden");
	
					// Fill card with desired data
					feedCard.attr("data-id", category)
					feedCard.find(".f-card-header").css("background-color", catColor);
					feedCard.find(".f-card-header-text i").addClass(catIcon + " fa-fw")
					feedCard.find(".f-card-header-text span").text(cardTitle);
					feedCard.find(".f-card-image img").attr("src", image);
					//feedCard.find(".f-card-image").css("background-image", "url('"+image+"')").css("background-size", "cover");
					feedCard.find(".f-card-title h6").attr("title", title);
					feedCard.find(".f-card-title h6 a").text(title);
					feedCard.find(".f-card-title h6 a").attr("href", link);
					feedCard.find(".f-card-description").text(content);
	
					//Add the card to desired column
					if(type == "later"){
						readedColumn.append(feedCard);
					}else if(type == "fav"){
						favColumn.append(feedCard);
					}
				}
			}

			// Delete posts event click
			$(".delPostBtn").on("click", function(){
				var category = $(this).parent().parent().parent().attr("data-id");
				var title = $(this).parent().parent().parent().find(".f-card-title h6 a").text();
				var link = $(this).parent().parent().parent().find(".f-card-title h6 a").attr("href");
				var self = $(this);
				
				feedtify.deletePost(category, title, link, function(data){
					if(data.success){
						self.parent().parent().parent().remove();
					}
				});
			});
		});
	},
	this.loadUserGroups = function(){
		var user = new this.User();

		//Columns
		var createdColumn = $("#createdColumn");
		var joinedColumn = $("#joinedColumn");

		user.getData(function(data){
			var length = data.groups.length;
			for(var i = 0; i < length; i++){
				var group = data.groups[i];
				var gId = group.id;

				$.ajax({
					url: "http://localhost:3000/api/data/group/" + gId,
					method: "GET",
					dataType: "json",
					indexValue: {group: group},
					success: function(data){
						// Check if user has created the group or joined to it
						var gCreated = this.indexValue.group.created;

						// Clone card
						var gCard = $("#g-card-hidden").clone();
				
						// Remove hidden attributes
						gCard.removeAttr("hidden");
						gCard.removeAttr("id");

						// Fill card
						var link = $("<a href='/group/"+data.slug+"' style='color: black'>"+data.name+"</a>");
						gCard.find(".g-card-name").append(link);
						gCard.find(".g-card-description").text(data.description);
						gCard.find(".g-card-owner").text(" "+data.owner);
						gCard.find(".g-card-users").text(" "+data.users);


						if(gCreated){
							createdColumn.append(gCard);
						}else{
							joinedColumn.append(gCard);
						}
					}
				});
			}
		});
	},
	this.loadGroupData = function(){
		var user = new this.User();
		var groupSlug = currentLocation.split(":3000/")[1].split("/")[1].trim();
		var self = this;

		var feedsRow = $("#feedsRow");
		
		var gName = $(".g-name");
		var gDesc = $(".g-description");
		var gOwner = $(".g-card-owner");
		var gUsers = $(".g-card-users");
		var joinBtn = $("#joinBtn");

		$.ajax({
			url: "http://localhost:3000/api/data/group/" + groupSlug,
			method: "GET",
			dataType: "json",
			success: function(data){
				gName.text("[GROUP] " + data.name);
				gDesc.text(data.description);
				gOwner.text(" " + data.owner);
				gUsers.text(" " + data.users);

				if(username == data.owner){
					joinBtn.attr("disabled", "disabled");
					joinBtn.text("OWNER");
				}else{
					self.getGroupJoinState(data.id, joinBtn);
				}

				$("title").text("Feedtify | " + data.name);

				self.loadGroupFeeds(data.slug, 3);
			}
		});
	},
	this.getGroupJoinState = function(groupId, button){
		$.ajax({
			url: "http://localhost:3000/api/data/from/" + username,
			method: "GET",
			dataType: "json",
			success: function(data){
				var gFound = data.groups.find(x => x.id == groupId);

				if(gFound){
					button.text("UNJOIN")
				}
			}
		});
	},
	this.loadGroupFeeds = function(groupId, maxPostsPerFeed){
		var group = new this.Group();
		var feedsRow = $("#feedsRow");

		group.getData(groupId, function(data){
			for(var i = 0; i < data.feeds.length; i++){
				var feedUrl = data.feeds[i].url;
				
				$.getFeed({
					url: feedUrl,
					indexValue: {data: data, index: i},
					success: function(feed){
						for(var j = 0; j < maxPostsPerFeed; j++){
							var feedCard = $("#f-card-hidden").clone();
							feedCard.removeAttr("hidden");
							feedCard.removeAttr("id");
	
							feedCard.find(".f-card-header").css("background-color", this.indexValue.data.color);
							feedCard.find(".f-card-header-text i").addClass(this.indexValue.data.icon + " fa-fw")
							feedCard.find(".f-card-header-text span").text(this.indexValue.data.feeds[this.indexValue.index].domain);
							feedCard.find(".f-card-image img").attr("src", $(feed.items[j].description).find("img").attr("src"));
							feedCard.find(".f-card-title h6").attr("title", feed.items[j].title);
							feedCard.find(".f-card-title h6 a").text(feed.items[j].title);
							feedCard.find(".f-card-title h6 a").attr("href", feed.items[j].link);
	
							var description = $(feed.items[j].description).clone().children().remove().end().text();
							feedCard.find(".f-card-description").text(description);
	
							feedsRow.append(feedCard);
						}
					}
				});
			}
		});
	}
}

var feedtify = new Feedtify();
feedtify.init();