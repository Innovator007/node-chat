const User = require('../models/user');
const Message = require('../models/message');
const GroupMessage = require('../models/groupmessage');

module.exports = function(async) {
    return {
        setRouting: function(router) {
            router.get("/group/:name", function(req,res) {
                const name = req.params.name;

                async.parallel([
                    function(callback) {
                        User.findOne({
                            'username': req.user.username
                        })
                        .populate('requests.userId')
                        .exec(function(err, results) {
                            callback(err,results);
                        });
                    },
                    function(callback) {
                        Message.aggregate([
                            {
                                $match: { $or: [{'senderName': req.user.username}, {'receiverName': req.user.username}] }
                            }, 
                            {
                                $sort: { 'createdAt': -1 }
                            }, 
                            {
                                $group: { 
                                    "_id": { 
                                        "last_message_between": {
                                            $cond: [
                                                {
                                                    $gt: [
                                                        {
                                                            $substr: ["$senderName", 0, 1]
                                                        },
                                                        {
                                                            $substr: ["$receiverName", 0, 1]
                                                        }
                                                    ]
                                                },
                                                {
                                                    $concat: ["$senderName", " and ", "$receiverName"]
                                                },
                                                {
                                                    $concat: ["$receiverName", " and ", "$senderName"]
                                                }
                                            ]
                                        }
                                    },
                                    "body": {
                                        $first: "$$ROOT"
                                    }
                                }
                            }
                        ], function(err, newResults) {
                            if(err) throw err;
                            callback(err, newResults);
                        });
                    },
                    function(callback) {
                        GroupMessage.find({ 'name': req.params.name })
                            .populate('sender')
                            .exec(function(err, groupMessages) {
                                callback(err, groupMessages);
                            });
                    }
                ], function(err, results) {
                    const res1 = results[0];
                    const res2 = results[1];
                    const res3 = results[2];
                    res.render("groupchat/group", { name:name, data: res1, chat: res2, messages: res3 });
                });
            });

            router.post("/group/:name", function(req,res) {
                async.parallel([
                    function(callback) {
                        if(req.body.receiver) {
                            User.update({
                                'username': req.body.receiver,
                                'requests.userId': { $ne: req.user._id },
                                'friendsList.friendId': { $ne: req.user._id }
                            }, {
                                $push: {
                                    requests: {
                                        userId: req.user._id,
                                        username: req.user.username
                                    }
                                },
                                $inc: {
                                    totalRequests: 1
                                }
                            }, function(err, count) {
                                callback(err, count);
                            });
                        }
                    },
                    function(callback) {
                        if(req.body.receiver) {
                            User.update({
                                'username': req.user.username,
                                'sentRequest.username': { $ne: req.body.receiver }
                            }, {
                                $push: {
                                    sentRequest: {
                                        username: req.body.receiver
                                    }
                                }
                            }, function(err,count) {
                                callback(err, count);
                            });
                        }
                    }
                ], function(err, results) {
                    res.redirect("/group/" + req.params.name);
                });

                async.parallel([
                    function(callback) {
                        if(req.body.senderId) {
                            User.update({
                                '_id': req.user._id,
                                'friendsList.friendId': { $ne: req.body.senderId }
                            }, {
                                $push: {
                                    friendsList: {
                                        friendId: req.body.senderId,
                                        friendUsername: req.body.senderName
                                    }
                                },
                                $pull: {
                                    requests: {
                                        userId: req.body.senderId,
                                        username: req.body.senderName
                                    }
                                },
                                $inc: {
                                    totalRequests: -1
                                }
                            }, function(err, count) {
                                callback(err, count);
                            });
                        }
                    },
                    function(callback) {
                        if(req.body.senderId) {
                            User.update({
                                '_id': req.body.senderId,
                                'friendsList.friendId': { $ne: req.user._id }
                            }, {
                                $push: {
                                    friendsList: {
                                        friendId: req.user._id,
                                        friendUsername: req.user.username
                                    }
                                },
                                $pull: {
                                    sentRequest: {
                                        username: req.user.username
                                    }
                                }
                            }, function(err, count) {
                                callback(err, count);
                            });
                        }
                    },
                    function(callback) {
                        if(req.body.user_Id) {
                            User.update({
                                '_id': req.user._id,
                                'requests.userId': { $eq: req.body.user_Id }
                            }, {
                                $pull: {
                                    requests: {
                                        userId: req.body.user_Id
                                    }
                                },
                                $inc: {
                                    totalRequests: -1
                                }
                            }, function(err, count) {
                                callback(err, count);
                            });
                        }
                    },
                    function(callback) {
                        if(req.body.user_Id) {
                            User.update({
                                '_id': req.body.user_Id,
                                'sentRequest.username': { $eq: req.user.username }
                            }, {
                                $pull: {
                                    sentRequest: {
                                        username: req.user.username
                                    }
                                }
                            }, function(err, count) {
                                callback(err, count);
                            });
                        }
                    }
                ], function(err, results) {
                    res.redirect("/group/" + req.params.name);
                });
                
            });

            router.post("/group/:name/message", function(req,res) {
                if(req.body.message) {
                    var groupMessage = new GroupMessage();
                    groupMessage.sender = req.user._id;
                    groupMessage.body = req.body.message;
                    groupMessage.name = req.body.group;
                    groupMessage.createdAt = new Date();

                    groupMessage.save(function(err, result) {
                        res.redirect("/group/" + req.params.name);
                    })
                }
            });
        }
    }
}