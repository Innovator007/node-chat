'use strict';

module.exports = function() {
    return {
        signUpValidation: function(req,res,next) {
            req.checkBody('username', 'Username must contain at least 6 letters!').isLength({ min: 6 });
            req.checkBody('email', "Email must be valid!").isEmail();
            req.checkBody('password', "Password must be at least 6 characters!").isLength({ min: 6 });
            
            req.getValidationResult()
                .then(function(result) {
                    const errors = result.array();
                    const messages = [];
                    errors.forEach(function(error) {
                        messages.push(error.msg);
                    });
                    req.flash('error', messages);
                    res.redirect('/signup');
                })
                .catch(function(err) {
                    return next();
                });
        },
        loginValidation: function(req,res,next) {
            req.checkBody('email', "Email must be valid!").isEmail();
            req.checkBody('password', "Password must be at least 6 characters!").isLength({ min: 6 });
            
            req.getValidationResult()
                .then(function(result) {
                    const errors = result.array();
                    const messages = [];
                    errors.forEach(function(error) {
                        messages.push(error.msg);
                    });
                    req.flash('error', messages);
                    res.redirect('/');
                })
                .catch(function(err) {
                    return next();
                });
        }
    }
}