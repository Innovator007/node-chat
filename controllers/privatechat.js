const User = require('../models/user');
const Message = require("../models/message");
const middleware = require("../middlewares/index");

module.exports = function(async) {
    return {
        setRouting: function(router) {
            router.get('/chat/:name', middleware.isLoggedin,function(req,res) {
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
                        Message.find({'$or': [{ 'senderName': req.user.username }, { 'receiverName': req.user.username }]})
                            .populate('sender')
                            .populate('receiver')
                            .exec(function(err, messages) {
                                callback(err, messages);
                            }); 
                    }
                ], function(err, results) {
                    const res1 = results[0];
                    const res2 = results[1];
                    const res3 = results[2];
                    var params = req.params.name.split('.');
                    const nameParams = params[0];
                    res.render("privatechat/privatechat", { data: res1, chat: res2, messages: res3, name: nameParams });
                });
            });

            router.post("/chat/:name", middleware.isLoggedin,function(req,res) {
                var params = req.params.name.split('.');
                const nameParams = params[0];
                const nameRegex = new RegExp("^"+nameParams.toLowerCase(), "i");

                async.waterfall([
                    
                    function(callback) {
                        if(req.body.message) {
                            User.findOne({'username': { $regex: nameRegex }}, function(err,data) {
                                callback(err, data);
                            });
                        }
                    },
                    function(data, callback) {
                        if(req.body.message) {
                            const newMessage = new Message();
                            newMessage.sender = req.user._id;
                            newMessage.receiver = data._id;
                            newMessage.senderName = req.user.username;
                            newMessage.receiverName = data.username;
                            newMessage.message = req.body.message;
                            newMessage.userImage = req.user.userImage;
                            newMessage.createdAt = new Date();

                            newMessage.save(function(err, result) {
                                if(err) {
                                    return next(err);
                                }
                                callback(err, result);
                            });
                        }
                    } 

                ], function(err, results) {
                    res.redirect("/chat/" + req.params.name);
                });
            });
        }
    }
}