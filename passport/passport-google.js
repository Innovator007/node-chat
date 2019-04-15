'use strict';

const passport = require('passport');
const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../config/config');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
    User.findOne({ google: profile.id }, function(err, user) {
        if(err) {
            return done(err);
        }
        if(user) {
            return done(null, user);
        } else {
            const newUser = new User();
            newUser.google = profile.id;
            newUser.username = profile.displayName;
            newUser.fullname = profile.displayName;
            newUser.userImage = profile._json.picture;
            newUser.save(function(err) {
                if(err) {
                    return done(err);
                }
                return done(null, newUser);
            })
        }
    });
}));
