
$(document).ready(function() {
    var socket = io();
    var timeout;
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
            if($(this).text() === sender) {
                $("#add-friend").hide();
            }
            var friends = $(".friend").text();
            var friend = friends.split("@");
            if(friend.indexOf($(this).text()) > -1) {
                $("#add-friend").attr("disabled",true);
                $("#add-friend").text("Friends")
            }
            $("#profileLink").attr("href", "/profile/" + $(this).text());
        });
        $('#no-of-users').text(`(${data.length})`);
    });

    function timeoutFunction() {
        socket.emit("typing", { username: sender, room: room, isTyping: false });
    }

    $("#msg").on("keydown", function() {
        console.log("keydown event");
        socket.emit("typing", {
            username: sender,
            isTyping: true,
            room: room
        });
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction,2000);
    });

    socket.on("typing", function(data) {
        if(data.isTyping) {
            if(data.username !== sender) {
                $("#typing").html("(" + data.username + " is typing...)");
            }
        } else {
            $("#typing").html("");
        }
    });

    socket.on("newMessage", function(message) {
        if(message.userImage.match(/https/i)) {
            $("#messages__list").append(`
            <li>
                <div class="pull-left">
                    <img src="${message.userImage}" class="img-circle">
                </div>
                <div class="row">
                    <div class="col-md-10">
                        <h6 style="font-weight: bolder;">${message.sender} <span style="font-size: 11px;margin-left: 10px;color: #333;">${moment(message.createdAt).fromNow()}</span></h6>
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
                        <h6 style="font-weight: bolder;">${message.sender} <span style="font-size: 11px;margin-left: 10px;color: #333;">${moment(message.createdAt).fromNow()}</span></h6>
                        <p>${message.value}</p>
                    </div>
                </div>
            </li>
            `)
        }
        $('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 500);
        if(message.sender !== sender) {
            Push.create("New Message From " + message.sender, {
                body: message.value,
                icon: '../../uploads/favicon.png',
                timeout: 6000,
                vibrate: [200, 100],
                requireInteraction: false,
                link: "/group/" + room,
                onClick: function () {
                    window.focus();
                    this.close();
                }
            });
        }
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
                userImage: userImage,
                createdAt: moment()
            });
            $("#msg").val(""); 
            $('.emoji-wysiwyg-editor').html("");
            $.ajax({
                type: "POST",
                url: "/group/" + room + "/message",
                data: {
                    message: msg,
                    group: room
                },
                success: function() {
                    $("#msg").val("");
                    $('.emoji-wysiwyg-editor').html("");
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
                    userImage: userImage,
                    createdAt: moment()
                });
                $("#msg").val(""); 
                $('.emoji-wysiwyg-editor').html("");
                $.ajax({
                    type: "POST",
                    url: "/group/" + room + "/message",
                    data: {
                        message: msg,
                        group: room
                    },
                    success: function() {
                        $("#msg").val("");
                        $('.emoji-wysiwyg-editor').html("");
                    }
                })
            }
           return false;  
         }
    });

});