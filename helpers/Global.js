class Global {
    constructor() {
        this.globalRoom = [];
    }
    enterRoom(id, name, room, image) {
        var roomName = {
            id: id,
            name: name,
            room: room,
            image: image
        }
        this.globalRoom.push(roomName);
        return roomName;
    }
    getRoomList(room) {
        var roomName = this.globalRoom.filter(function(user) {
            return user.room === room;
        });
        var roomUsersName = roomName.map(function(user) {
            return {
                name: user.name,
                image: user.image
            };
        });
        return roomUsersName; 
    }
    getUserId(id) {
        var getUser = this.globalRoom.filter(function(user) {
            return user.id === id;
        })[0];
        return getUser;
    }
    removeUser(id) {
        var user = this.getUserId(id);
        if(user) {
            this.globalRoom = this.globalRoom.filter(function(user) {
                return user.id !== id;
            });
        }
        return user;
    }
}

module.exports = { Global };