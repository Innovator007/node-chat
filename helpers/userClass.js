class Users {
    constructor() {
        this.users = [];
    }
    addUser(id, name, room) {
        var user = {
            id: id,
            name: name,
            room: room
        }
        this.users.push(user);
        return user;
    }
    getUserList(room) {
        var roomUsers = this.users.filter(function(user) {
            return user.room === room;
        });
        var roomUsersName = roomUsers.map(function(user) {
            return user.name;
        });
        return roomUsersName; 
    }
    getUserId(id) {
        var getUser = this.users.filter(function(user) {
            return user.id === id;
        })[0];
        return getUser;
    }
    removeUser(id) {
        var user = this.getUserId(id);
        if(user) {
            this.users = this.users.filter(function(user) {
                return user.id !== id;
            });
        }
        return user;
    }
}

module.exports = { Users };