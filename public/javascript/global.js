$(document).ready(function() {
    var socket = io();

    socket.on('connect', function() {
        var room = "Global Room";
        var name = $("#user-name").val();
        var image = $("#user-image").val();
        socket.emit('global room', {
            room: room,
            name: name,
            image: image
        })
        socket.on('message display', function() {
            $("#reload").load(location.href + ' #reload');
        });
    });


    socket.on('loggedInUser', function(users) {
        var friends = $(".friend").text();
        var friend = friends.split("@");
        var name = $("#user-name").val();
        var urlname = name.replace(/ /g, '-');
        var ol = $("<div></div>");
        var arr = [];
        for(var i=0;i<users.length;i++) {
            if(friend.indexOf(users[i].name) > -1) {
                arr.push(users[i]);
                var list = `
                    <img src="https://placehold.it/300x300" class="pull-left img-circle" style="width: 50px;margin-right: 10px;" />
                    <p><a href="/chat/${users[i].name.replace(/ /g, "-").toLowerCase()}.${urlname.toLowerCase()}"><h5 style="padding-top: 15px;font-size: 18px;">@${users[i].name} <span class="pull-right"><i class="fa fa-circle" style="color: green;font-size: 10px;"></i></span></h5></a></p>
                `;
                ol.append(list);
            }
        }
        $("#num-of-friends").text("(" + arr.length + ")");
        $("#online-friends").html(ol);
    });
});