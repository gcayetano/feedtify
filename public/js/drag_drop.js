$(document).ready(function(){

    var unreadColumn = document.querySelector("#unread-column");
    var readLaterColumn = document.querySelector("#readed-column");
    var favColumn = document.querySelector("#fav-column");

    var drake = dragula([unreadColumn, readLaterColumn, favColumn], {
        invalid: function (el) {
            return el.classList.contains('f-card-content');
        },
        copy: function (el, source) {
            return source.id === 'unread-column';
        }
    });

    drake.on("drop", function(el, target, source, sibling){
        // el => HTML del elemento que se arrastra
        // target => Contenedor donde se suelta
        // source => Contenedor desde el que se arrastra

        var targetId = $(target).attr("id");
        var category = $(el).attr("data-id");
        var image = $(el).find(".f-card-image img").attr("src");
        var title = $(el).find(".f-card-title h6 a").text();
        var link = $(el).find(".f-card-title h6 a").attr("href");
        var content = $(el).find(".f-card-description").text();
        var type = "";
        
        if(targetId == "readed-column"){
            type = "later";
        }else if(targetId == "fav-column"){
            type = "fav";
        }

        if(targetId !== "unread-column"){
            $.ajax({
                url: "http://localhost:3000/addpost",
                method: "POST",
                data: {category: category, image: image, title: title, content: content, link: link, type: type},
                success: function(data){
                    if(!data.success){
                        new PNotify({
                            title: 'Error!!',
                            text: data.message,
                            type: 'error'
                        });
                    }
                }
            });

            if($(el).find(".delPostBtn").attr("hidden")){
                $(el).find(".delPostBtn").removeAttr("hidden");
                $(el).find(".delPostBtn").on("click", function(){
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
            }  
        }
    });
});