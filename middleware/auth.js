var passport = require('passport');
var LocalStrategy = require('passport-local').Strateg;
var User = require('../models/users');
var jwtStrategy = require('passport-jwt').Strategy;
var jwt = require('jsonwebtoken');
const { ExtractJwt } = require('passport-jwt');


// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: 3600
    });
}

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

exports.jwtPassport = passport.use(new jwtStrategy(opts,
    async (jwt_payload, done) => {
        try {
            const user = await User.findOne({ _id: jwt_payload._id });
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    }
))

exports.verifyUser = passport.authenticate('jwt', { session: false });