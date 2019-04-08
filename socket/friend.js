module.exports = function(io) {
    io.on("connection", function(socket) {
        
        socket.on('joinRequest', function(data, callback) {
            socket.join(data.sender);
            callback();
        });

        socket.on('friendRequest', function(data, callback) {
            io.to(data.receiver).emit("newFriendRequest", {
                from: data.sender,
                to: data.receiver
            });
            callback();
        }); 

    }); 
}