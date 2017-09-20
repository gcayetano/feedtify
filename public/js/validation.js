$(document).ready(function(){

	var feedtify = new Feedtify();

	// SignUp Form
	var signUpForm = $("#signUpForm");
	var signUpBtn = $("#signUpBtn");
	var password = $("#passwdSignUp");
	var passwordConfirm = $("#passwd2SignUp");
	var alert = $(".form-alert");
	var message;

	signUpBtn.on("click", function(e){
		if(password.val() != passwordConfirm.val()) {
			message = "Password does not match!";
			alert.text(message);
			alert.toggle();
		} 
		else {
			alert.hide();
			signUpForm.submit();
		}
		
		e.preventDefault();
	});

	// Add New Feed
	var feedBtn = $("#feedBtn");
	var feedUrl = $("#feedUrl");
	var feedDomain = $("#feedDomain");
	var feedColor = $("#feedColor")

	var selectCatRadio = $("#selectCatRadio");
	var createCatRadio = $("#createCatRadio");
	var selectCatGroup = $("#selectCatGroup");
	var createCatGroup = $("#createCatGroup");

	var groupSelect = $("#feedGroupSelect");
	var groupCheck = $("#feedGroupCheck");

	var iconsSelect = $("#feedIconsSelect");
	var feedCategorySelect = $("#feedCategorySelect");
	var feedCategory = $("#feedCategory");

	selectCatRadio.on("change", function() {
		if($(this).is(':checked')) {
	        if(!createCatGroup.attr('disabled')) {
		        createCatGroup.attr('disabled', 'disabled');
			}
				
			if(feedCategorySelect.attr("disabled"))
				feedCategorySelect.removeAttr('disabled');
	    } 
	});

	createCatRadio.on("change", function(){
		if($(this).is(':checked')) {
	        if(createCatGroup.attr('disabled')) {
				createCatGroup.removeAttr('disabled');
				selectCatRadio.val("");
			}
				
			if(iconsSelect.attr("disabled")){
				iconsSelect.removeAttr("disabled");
			}

			if(!feedCategorySelect.attr("disabled"))
				feedCategorySelect.attr('disabled', 'disabled');
	    } 
	});

	groupCheck.on("change", function(){
		if($(this).is(':checked')) {
	        if(groupSelect.attr('disabled')) {
				groupSelect.removeAttr('disabled');
			}
	    }else{
			groupSelect.attr("disabled", "disabled");
		}
	});

	$("#addFeedBtn").on("click", function(){
		var selectedGroup = "";

		if(groupCheck.is(":checked")){
			selectedGroup = groupSelect.val();
		}

		$.ajax({
			url: "http://localhost:3000/addfeed",
			method: "POST",
			data: {feedUrl: feedUrl.val(), feedDomain: feedDomain.val(), feedCategorySelect: feedCategorySelect.val(), feedCategory: feedCategory.val(), feedColor: feedColor.val(), feedIconsSelect: iconsSelect.val(), groupSelect: selectedGroup},
			dataType: "json",
			success: function(data){
				if(data.success){
					new PNotify({
						title: 'Successful!',
						text: 'New feed added successfully!',
						type: 'success'
					});
				}else{
					new PNotify({
						title: 'Error!!',
						text: data.message,
						type: 'error'
					});
				}
				
				// Close "Add new feed" modal
				$("#addFeedModal").modal("toggle");

				// Reload page
				setTimeout(function(){
					location.reload();
				}, 700);
			}
		})
	});

	// Add new group
	var groupName = $("#groupName");
	var groupDesc = $("#groupDesc");
	var groupColor = $("#groupFeedsColor");
	var groupIcon = $("#groupIconsSelect");

	$("#addGroupBtn").on("click", function(){
		$.ajax({
			url: "http://localhost:3000/addgroup",
			method: "POST",
			data: {name: groupName.val(), description: groupDesc.val(), owner: feedtify.getUserName(), color: groupColor.val(), icon: groupIcon.val()},
			dataType: "json",
			success: function(data){
				if(data.success){
					new PNotify({
						title: 'Successful!',
						text: 'New group added successfully!',
						type: 'success'
					});
				}else{
					new PNotify({
						title: 'Error!!',
						text: data.message,
						type: 'error'
					});
				}
				
				// Close "Add group" modal
				$("#addGroupModal").modal("toggle");

				// Reload page
				setTimeout(function(){
					location.reload();
				}, 700);
			}
		})
	});

	//Join group
	var gName = $(".g-name");
	var groupUsers = $(".g-card-users");

	$("#joinBtn").on("click", function(){
		var self = $(this);

		$.ajax({
			url: "http://localhost:3000/joingroup",
			method: "POST",
			data: {name: gName.text().trim(), users: groupUsers.text().trim()},
			dataType: "json",
			success: function(data){
				if(data.success){
					if(self.text() == "JOIN"){
						new PNotify({
							title: 'Successful!',
							text: 'Joined successfully!',
							type: 'success'
						});
						self.text("UNJOIN");
					}else if(self.text() == "UNJOIN"){
						new PNotify({
							title: 'Successful!',
							text: 'Unjoined successfully!',
							type: 'success'
						});
						self.text("JOIN");
					}
				}else{
					new PNotify({
						title: 'Error!!',
						text: data.message,
						type: 'error'
					});
				}
			}
		})
	});

	feedUrl.on("keyup", function(){
		feedDomain.val(extractHostname(feedUrl.val()));
	})

	function extractHostname(url) {
		var hostname;
		//find & remove protocol (http, ftp, etc.) and get hostname
	
		if (url.indexOf("://") > -1) {
			hostname = url.split('/')[2];
		}
		else {
			hostname = url.split('/')[0];
		}

		if((url.indexOf("www.") > -1)){
			hostname = hostname.split('www.')[1];
		}
	
		//find & remove port number
		hostname = hostname.split(':')[0];
		//find & remove "?"
		hostname = hostname.split('?')[0];
	
		return hostname;
	}

	$(".delFeedBtn").on("click", function(){
		var url = $(this).parent().parent().parent().find("td")[0].innerText.trim();		
		var self = $(this);

		feedtify.deleteFeed(url, function(data){
			if(data.success){
				self.parent().parent().parent().remove();
			}
		});
	});
});