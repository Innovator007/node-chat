$(document).ready(function() {
    var socket = io();

    var room = $("#room-name").text();
    var sender = $("#sender").text();

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
        $("#messages__list").append(`
        <li>
            <div class="pull-left">
                <img src="http://placehold.it/300x300" class="img-circle">
            </div>
            <div class="row">
                <div class="col-md-10">
                    <h6 style="font-weight: bolder;">${message.sender}</h6>
                    <p>${message.value}</p>
                </div>
            </div>
        </li>
        `)
    });

    $("#send-msg").on("click", function(e) {
        e.preventDefault();
        var msg = $("#msg").val();

        if(msg.trim() === "") {
            return false;
        } else {
            socket.emit("createMessage", {
                value: msg,
                room: room,
                sender: sender
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

});