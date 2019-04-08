'use strict';

const Group = require('../models/groups');
const User = require('../models/user');
const Message = require('../models/message');

module.exports = function(_, async) {
    return {
        setRouting: function(router) {
            router.get('/home', function(req,res) {
                if(!req.user) {
                    res.redirect("/");
                }
                async.parallel([
                    function(callback) {
                        if(req.query.filter) {
                            const regex = new RegExp((req.query.filter), 'gi');
                            Group.find({ '$or': [{'country': regex},{'name': regex}] }, function(err, groups) {
                                callback(err,groups);
                            });
                        } else {
                            Group.find({}, function(err, groups) {
                                callback(err,groups);
                            });
                        }
                    },
                    function(callback) {
                        Group.aggregate([{
                            $group: {
                                _id: "$country"
                            }
                        }],function(err,newResult) {
                            callback(err, newResult);
                        });
                    },
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
                    const result1 = results[0];
                    const result2 = results[1];
                    const result3 = results[2];
                    const result4 = results[3];
                    const countrySort = _.sortBy(result2, '_id');
                    res.render("home", { groups: result1, countries: countrySort, data: result3, chat: result4 });
                });
            });

            router.get("/members", function(req,res) {
                if(req.query.member) {
                    const regex = new RegExp((req.query.member), 'gi');
                    User.find({ '$or': [{'username': regex},{'fullname': regex}] }, function(err, users) {
                        res.render("members", { members: users });
                    });
                } else {
                    User.find({}, function(err, users) {
                        res.render("members", { members: users });
                    });
                }
            });

            router.post("/home", function(req,res) {
                async.parallel([
                    function(callback) {
                        Group.update({
                            '_id': req.body.id,
                            'favourites.username': { $ne: req.user.username }
                        }, {
                            $push: {
                                favourites: {
                                    username: req.user.username,
                                    email: req.user.email
                                }
                            }
                        }, function(err, count) {
                            callback(err, count);
                        });
                    }
                ], function(err, results) {
                    res.redirect('/home');
                });
            });
        }
    }
}