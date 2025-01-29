var passport = require('passport');
var LocalStrategy = require('passport-local').Strateg;
var User = require('../models/users');

// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = function (req, res, next) {
    if (!req.user) {
        res.statusCode = 403;
        res.json({ message: 'Você precisa estar logado!' });
        return;
    }

    next();
}