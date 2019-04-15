require('dotenv').config()

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
const socketIO = require('socket.io');
const { Users } = require('./helpers/userClass');
const { Global } = require('./helpers/Global');
const compression = require('compression');
const helmet = require('helmet');
const config = require("./config/config");

const container = require('./container');

container.resolve(function(users, admin, home, group, privatechat, profile, _) {

    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true });

    const app = setupExpress();

    function setupExpress() {
        const app = express();
        const server = http.createServer(app);
        const io = socketIO(server);
        const port = process.env.PORT || 3000;
        server.listen(port, function() {
            console.log("Node Chat Application running on port " + port);
        }); 
        configureExpress(app); 

        require("./socket/groupchat")(io, Users);
        require("./socket/friend")(io);
        require('./socket/globalroom')(io, Global, _);
        require("./socket/privatemessage")(io);

        const router = require('express-promise-router')();
        users.setRouting(router);
        admin.setRouting(router);
        home.setRouting(router);
        group.setRouting(router);
        privatechat.setRouting(router);
        profile.setRouting(router);

        app.use(router);
    }

    function configureExpress(app) {

        app.use(compression());
        app.use(helmet());

        require('./passport/passport-local');
        require('./passport/passport-facebook');
        require('./passport/passport-google');

        app.use(express.static(__dirname + "/public"));
        app.use(cookieParser());

        app.engine("html", ejs.renderFile);
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(validator());
        app.use(session({
            secret: process.env.SECRET_KEY,
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(function(req,res,next){
            res.locals.currentUser = req.user;
            next();
        });
    }
});