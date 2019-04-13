$(document).ready(function() {
    var socket = io();
    $('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 2000);
    var paramOne = deparam(window.location.pathname);
    var newParams = paramOne.split(".");
    var receiverName = newParams[0];
    $("#receiver-name").text("@" + receiverName);
    swap(newParams, 0, 1);
    var paramTwo = newParams[0] + "." + newParams[1];

    socket.on('connect', function() {
        var params  = {
            room1: paramOne,
            room2: paramTwo
        }
        socket.emit('join private message', params);

        socket.on('message display', function() {
            $("#message-reload").load(location.href + ' #message-reload');
        }); 
    });

    socket.on("new private message", function(message) {
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
        $('.messages').animate({scrollTop: $('.messages').prop("scrollHeight")}, 500);
    });

    $("#send-msg").on("click", function(e) {
        e.preventDefault();
        var msg = $("#msg").val();
        var senderName = $("#sender-name").val();
        var userImage = $("#user-image").val();
        if(msg.trim().length > 0) {
            socket.emit('private message',{ value: msg, sender: senderName, room: paramOne, userImage: userImage }, function() {
                $("#msg").val("");
            });
            $.ajax({
                url: "/chat/" + paramOne,
                type: "POST",
                data: {
                    message: msg
                },
                success: function(data) {
                    $("#msg").val("");
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
        var senderName = $("#sender-name").val();
        var userImage = $("#user-image").val();
        if(msg.trim().length > 0) {
            socket.emit('private message',{ value: msg, sender: senderName, room: paramOne, userImage: userImage }, function() {
                $("#msg").val("");
            });
            $.ajax({
                url: "/chat/" + paramOne,
                type: "POST",
                data: {
                    message: msg
                },
                success: function(data) {
                    $("#msg").val("");
                }
            })
        }
           return false;  
         }
    });

});

function swap(input, val1, val2) {
    var temp = input[val1];
    input[val1] = input[val2];
    input[val2] = temp;
}

function deparam(uri) {
    if(uri === undefined) {
        uri = window.location.pathname;
    }
    var value1 = window.location.pathname;
    var value2 = value1.split("/");
    var value3 = value2.pop();
    return value3;
}