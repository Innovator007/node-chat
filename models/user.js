const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({    
    username: {
        type: String
    },
    fullname: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        default: ""
    },
    userImage: {
        type: String,
        default: "default.png"
    },
    facebook: {
        type: String,
        default: ""
    },
    fbTokens: Array,
    google: {
        type: String,
        default: ""
    },
    sentRequest: [{
        username: {
            type: String
        }
    }],
    requests: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: {
            type: String
        }
    }],
    totalRequests: {
        type: Number,
        default: 0
    },
    friendsList: [{
        friendsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        friendUsername: {
            type: String
        }
    }]
});

userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validUserPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
