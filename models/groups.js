const mongoose = require('mongoose');

const groupName = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: "default.png"
    },
    favourites: [{
        username: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        }
    }]
}); 

module.exports = mongoose.model("Group", groupName);