const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');


const container = require('./container');

container.resolve(function(users) {

    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://iliyas:hesoyam007@ds123196.mlab.com:23196/nodechat', { useNewUrlParser: true });

    const app = setupExpress();

    function setupExpress() {
        const app = express();
        const server = http.createServer(app);
        server.listen(3000, function() {
            console.log("Node Chat Application running on port 3000");
        }); 
        configureExpress(app); 
        const router = require('express-promise-router')();
        users.setRouting(router);

        app.use(router);
    }

    function configureExpress(app) {
        app.use(express.static('public'));
        app.use(cookieParser());

        app.engine("html", ejs.renderFile);
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(validator());
        app.use(session({
            secret: "NodeCHAT",
            resave: true,
            saveUninitialized: true,
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
    }
});