module.exports = function(io, Global, _) {
    const clients = new Global();
    io.on('connection', function(socket) {
        socket.on('global room', function(data) {
            socket.join(data.room);
            clients.enterRoom(socket.id, data.name, data.room, data.image);

            var nameProp = clients.getRoomList(data.room);
            const arr = _.uniqBy(nameProp, 'name');
            io.to(data.room).emit('loggedInUser', arr);
        });

        socket.on('disconnect', function() {
            const client = clients.removeUser(socket.id);
            if(client) {
                var userData = clients.getRoomList(client.room);
                const arr = _.uniqBy(userData, 'name');
                const removeData = _.remove(arr, {
                    'name': client.name
                })
                io.to(client.room).emit("loggedInUser",arr);
            }
        });
    }); 
}