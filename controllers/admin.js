'use strict';
const path = require('path');
const fs = require('fs');
const Group = require('../models/groups');

module.exports = function(formidable) {
    return {
        setRouting: function(router) {
            router.get("/dashboard", function(req,res) {
                res.render("admin/dashboard");
            });

            router.post("/uploadFile", function(req,res) {
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

            router.post("/dashboard", function(req,res) {
                const newGroup = new Group();
                newGroup.name = req.body.title;
                newGroup.country = req.body.country;
                newGroup.image = req.body.upload;
                newGroup.save(function(err) {
                    if(err) throw err;
                    res.redirect('/dashboard');
                })
            });
        }
    }
}