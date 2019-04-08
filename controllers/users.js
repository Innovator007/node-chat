'use strict';
module.exports = function(_, passport, uservalidation) {
    return {
        setRouting: function(router) {
            router.get('/', function(req,res) {
                const errors = req.flash("error");
                if(req.user) {
                    res.redirect("/home");
                } else {
                    return res.render("index", { messages: errors, hasErrors: errors.length > 0 });
                }
            });

            router.post("/", uservalidation.loginValidation, this.postLogin);

            router.get("/signup", function(req,res) {
                const errors = req.flash('error');
                if(req.user) {
                    res.redirect("/home");
                } else {
                    return res.render("signup", { messages: errors, hasErrors: errors.length > 0 });
                }
            });

            router.post("/signup", uservalidation.signUpValidation, this.postSignup);
          
            router.get("/logout", function(req,res) {
                req.logout();
                req.session.destroy(function(err) {
                    res.redirect("/");
                });
            })
            
            router.get("/auth/facebook", this.getFacebookLogin);

            router.get("/auth/facebook/callback", this.facebookLogin);

            router.get('/auth/google', this.getGoogleLogin);

            router.get('/auth/google/callback', this.googleLogin);
            
        },
        postSignup: passport.authenticate("local.signup", {
            successRedirect: "/home",
            failureRedirect: "/signup",
            failureFlash: true
        }),
        postLogin: passport.authenticate('local.login', {
            successRedirect: "/home",
            failureRedirect: "/",
            failureFlash: true
        }),
        getFacebookLogin: passport.authenticate("facebook", {
            scope: "email"
        }),
        facebookLogin: passport.authenticate("facebook", {
            successRedirect: "/home",
            failureRedirect: "/signup",
            failureFlash: true
        }),
        getGoogleLogin: passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read',]
        }),
        googleLogin: passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: "/signup",
            failureFlash: true
        })
    }
}