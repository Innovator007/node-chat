$(document).ready(function() {
    var socket = io();

    var room = $("#room-name").text();
    var sender = $("#sender").text();

    socket.on('connect', function() {
        var params = {
            sender: sender
        }
        socket.emit('joinRequest', params, function() {
            console.log("Joined Request");
        });
    });

    socket.on("newFriendRequest", function(data) {
        $("#reload").load(location.href + ' #reload');

        $(document).on("click","#accept_request", function() {
            var senderId = $("#senderId").val();
            var senderName = $("#senderName").val();
            $.ajax({
                url: '/group/' + room,
                type: "POST",
                data: {
                    senderId: senderId,
                    senderName: senderName
                },
                success: function() {
                    $(senderId).remove();
                }
            });
            $("#reload").load(location.href + ' #reload');
        });

        $(document).on("click","#reject_request", function() {
            var user_Id = $("#user_Id").val();
            $.ajax({
                url: '/group/' + room,
                type: "POST",
                data: {
                    user_Id: user_Id
                },
                success: function() {
                    $(user_Id).remove();
                }
            });
            $("#reload").load(location.href + ' #reload');
        });
    });

    $("#accept_request").on("click", function() {
        var senderId = $("#senderId").val();
        var senderName = $("#senderName").val();
        $.ajax({
            url: '/group/' + room,
            type: "POST",
            data: {
                senderId: senderId,
                senderName: senderName
            },
            success: function() {
                $(senderId).remove();
            }
        });
        $("#reload").load(location.href + ' #reload');
    });
    
    $("#reject_request").on("click", function() {
        var user_Id = $("#user_Id").val();
        $.ajax({
            url: '/group/' + room,
            type: "POST",
            data: {
                user_Id: user_Id
            },
            success: function() {
                $(user_Id).remove();
            }
        });
        $("#reload").load(location.href + ' #reload');
    });

    $("#add-friend").on("click", function() {
        var receiverName = $("#receiverName").val();
        $.ajax({
            url: "/group/" + room,
            type: "POST",
            data: {
                receiver: receiverName
            },
            success: function() {
                socket.emit("friendRequest", {
                    receiver: receiverName,
                    sender: sender
                }, function() {
                    $("#usersModal").modal("hide");
                });
            }
        })
    });

});