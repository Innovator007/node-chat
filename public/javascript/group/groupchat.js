$(document).ready(function() {
    var socket = io();

    var room = $("#room-name").text();
    var sender = $("#sender").text();
    $('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 2000);
    socket.on("connect", function() {
        console.log("Connected!");
        var params = {
            room: room,
            name: sender
        }
        socket.emit("join", params, function() {
            console.log("User has joined this room!");
        });
    });
    
    socket.on("usersList", function(data) {
        var ol = $("<ol></ol>");
        var onlineUsersDiv = $('#online-users');
        var uniqueData = [ ...new Set(data) ]
        for(var i = 0; i<uniqueData.length;i++) {
            ol.append(`<p><a style="cursor:pointer;" class="modalval" id="${uniqueData[i]}" data-toggle="modal" data-target="#usersModal">${uniqueData[i]}</a></p>`);
        }
        onlineUsersDiv.html(ol);
        $(document).on("click", '.modalval', function() {
            $("#name").text('@' + $(this).text());
            $("#receiverName").val($(this).text());
            $("#profileLink").attr("href", "/profile/" + $(this).text());
        })
        $('#no-of-users').text(`(${data.length})`);
    });

    socket.on("newMessage", function(message) {
        if(message.userImage.match(/https/i)["index"] === 0) {
            $("#messages__list").append(`
            <li>
                <div class="pull-left">
                    <img src="${message.userImage}" class="img-circle">
                </div>
                <div class="row">
                    <div class="col-md-10">
                        <h6 style="font-weight: bolder;">${message.sender}</h6>
                        <p>${message.value}</p>
                    </div>
                </div>
            </li>
            `)
        } else {
            $("#messages__list").append(`
            <li>
                <div class="pull-left">
                    <img src="../uploads/${message.userImage}" class="img-circle">
                </div>
                <div class="row">
                    <div class="col-md-10">
                        <h6 style="font-weight: bolder;">${message.sender}</h6>
                        <p>${message.value}</p>
                    </div>
                </div>
            </li>
            `)
        }
        $('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 500);
    });

    $("#send-msg").on("click", function(e) {
        e.preventDefault();
        var msg = $("#msg").val();
        var userImage = $("#user-image").val();
        if(msg.trim() === "") {
            return false;
        } else {
            socket.emit("createMessage", {
                value: msg,
                room: room,
                sender: sender,
                userImage: userImage
            });
            $("#msg").val(""); 

            $.ajax({
                type: "POST",
                url: "/group/" + room + "/message",
                data: {
                    message: msg,
                    group: room
                },
                success: function() {
                    $("#msg").val("");
                    console.log("Group Message Sent successfully");
                }
            })
        }
    });

    $(document).keypress(function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
         {
            e.preventDefault();
            var msg = $("#msg").val();
            var userImage = $("#user-image").val();
            if(msg.trim() === "") {
                return false;
            } else {
                socket.emit("createMessage", {
                    value: msg,
                    room: room,
                    sender: sender,
                    userImage: userImage
                });
                $("#msg").val(""); 
    
                $.ajax({
                    type: "POST",
                    url: "/group/" + room + "/message",
                    data: {
                        message: msg,
                        group: room
                    },
                    success: function() {
                        $("#msg").val("");
                        console.log("Group Message Sent successfully");
                    }
                })
            }
           return false;  
         }
    });

});