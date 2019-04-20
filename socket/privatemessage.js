module.exports = function(io) {
    io.on("connection", function(socket) {
        socket.on('join private message', function(param) {
            socket.join(param.room1);
            socket.join(param.room2);
        });

        socket.on("typing", function(data) {
            io.to(data.room).emit("typing", data);
        });

        socket.on('private message', function(message, callback) {
            io.to(message.room).emit('new private message', {
                value: message.value,
                sender: message.sender,
                userImage: message.userImage,
                createdAt: message.createdAt
            });

            io.emit('message display', {});
            callback();
        });
    });
}