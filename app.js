require("dotenv").config(); // Load environment variables at the start
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var passport = require('passport');


var indexRouter = require('./routes/index');
var eventsRouter = require('./routes/events');
var usersRouter = require('./routes/users');
var invitesRouter = require('./routes/invites');
var feedbacksRouter = require('./routes/feedbacks');

const mongoose = require("mongoose");

const url = process.env.MONGO_URI || 'mongodb://localhost:27017/eventese';
const connection = mongoose.connect(url);
connection.then((db) => {
    console.log('Connected to database');
});

connection.catch((err) => {
    console.log('Não conseguiu conectar ao banco.');
})


var app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: 'http://localhost:3000'
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/events', eventsRouter);
app.use('/invites', invitesRouter);
app.use('/feedbacks', feedbacksRouter);
app.use("/uploads", express.static('uploads'));


app.use(function (req, res, next) {
    res.status(404);
    res.json({ erro: 'Not Found' });
});

module.exports = app;
