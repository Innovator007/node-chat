'use strict';

const passport = require('passport');
const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../config/config');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret,
    profileFields: ['email', 'displayName', 'photos'],
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback: true
}, function(req,token, refreshToken, profile, done) {
    User.findOne({ facebook: profile.id }, function(err, user) {
        if(err) {
            return done(err);
        }
        if(user) {
            return done(null, user);
        } else {
            const newUser = new User();
            newUser.facebook = profile.id;
            newUser.fullname = profile.displayName;
            newUser.username = profile.displayName;
            newUser.email = profile._json.email;
            newUser.userImage = 'https://graph.facebook.com/'+profile.id+'/picture?type=large';
            newUser.fbTokens.push({ token: token });
            newUser.save(function(err) {
                done(null, newUser);
            });
        }
    });
}));
