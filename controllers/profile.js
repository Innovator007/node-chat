const Message = require("../models/message");
const User = require('../models/user');
const Group = require("../models/groups");
const path = require('path');
const fs = require('fs');
const middleware = require("../middlewares/index");

module.exports = function(async, formidable) {
    return {
        setRouting: function(router) {
            router.get("/profile", middleware.isLoggedin,function(req,res) {
                async.parallel([
                    function(callback) {
                        if(req.user) {
                            User.findOne({
                                'username': req.user.username
                            })
                            .populate('requests.userId')
                            .exec(function(err, results) {
                                callback(err,results);
                            });
                        } else {
                            return {};
                        }
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
                    }     
                ], function(err, results) {
                    const result3 = results[0];
                    const result4 = results[1];
                    res.render("profile/profile", { data: result3, chat: result4 });
                });
            }); 

            router.post("/profile", middleware.isLoggedin,function(req,res) {
                async.waterfall([
                    function(callback) {
                        User.findOne({"_id": req.user._id}, function(err, result) {
                            callback(err,result);
                        });
                    },
                    function(result, callback) {
                        var userImage = req.body.image === "" ? req.user.userImage : req.body.image;
                        User.updateOne({
                            '_id': req.user._id
                        }, {
                            fullname: req.body.fullname,
                            desc: req.body.desc,
                            gender: req.body.gender,
                            userImage: userImage,
                            country: req.body.country
                        }, {
                            upsert: true
                        }, function(err, result) {
                            res.redirect("/profile");
                        });
                    }
                ]);
            });

            router.get("/profile/friends", middleware.isLoggedin,function(req,res) {
                async.parallel([
                    function(callback) {
                        if(req.user) {
                            User.findOne({
                                'username': req.user.username
                            })
                            .populate('requests.userId')
                            .exec(function(err, results) {
                                callback(err,results);
                            });
                        } else {
                            return {};
                        }
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
                    }
                ], function(err, results) {
                    const result3 = results[0];
                    const result4 = results[1];
                    res.render("profile/friends", { data: result3, chat: result4 });
                });
            });

            router.get("/profile/:name", middleware.isLoggedin,function(req,res) {
                async.parallel([
                    function(callback) {
                        if(req.user) {
                            User.findOne({
                                'username': req.user.username
                            })
                            .populate('requests.userId')
                            .exec(function(err, results) {
                                callback(err,results);
                            });
                        } else {
                            return {};
                        }
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
                        User.findOne({"username": req.params.name}, function(err, user) {
                            callback(err,user);
                        });
                    },
                    function(callback) {
                        Group.find({
                            "favourites": {
                                $elemMatch: { "username": req.params.name }
                            }
                        }, { name: 1, image: 1 } ,function(err, groups) {
                            callback(err, groups);
                        });
                    }
                ], function(err, results) {
                    const result3 = results[0];
                    const result4 = results[1];
                    const result5 = results[2];
                    const result6 = results[3];
                    
                    res.render("profile/overview", { data: result3, chat: result4, user: result5, favGroups: result6 });
                });
            });

            router.post("/userUpload", function(req,res) {
                const form = new formidable.IncomingForm();
                form.uploadDir = path.join(__dirname, "../public/uploads");
                form.on('file', function(field, file) {
                    fs.rename(file.path, path.join(form.uploadDir, file.name), function(err) {
                        if(err) throw err;
                        console.log("File renamed succesfully!");
                    });
                });
                form.on("error", function(err) {
                    console.log(err);
                });
                form.on("end", function() {
                    console.log("File uploaded succesfully!");
                });
                form.parse(req);
            });
        }
    }
}