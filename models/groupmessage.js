const mongoose = require('mongoose');

const groupMessageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    body: {
        type: String
    },
    name: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);