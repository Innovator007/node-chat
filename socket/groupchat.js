module.exports = function(io, Users) {

    const users = new Users();

    io.on("connection", function(socket) {    
        socket.on('join', function(params, callback) {
            socket.join(params.room);
            users.addUser(socket.id, params.name, params.room);
            io.to(params.room).emit("usersList", users.getUserList(params.room));
            callback();
        });

        socket.on("createMessage", function(message) {
            io.to(message.room).emit("newMessage", message);
        });

        socket.on('disconnect', function() {
            var user = users.removeUser(socket.id);
            if(user) {
                io.to(user.room).emit("usersList", users.getUserList(user.room));
            }
        });

    });
}