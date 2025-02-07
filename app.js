require("dotenv").config(); // Load environment variables at the start
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var sse = require('./middleware/sse');
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

let clients = [];

app.get("/subscribe", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // console.log('subscribed');
    // console.log(res)
    clients.push(res);
    req.on("close", () => {
        clients = clients.filter(client => client !== res);
    });
})

const eventChangeStream = require('./models/events').watch();
eventChangeStream.on('change', (change) => sse({ collection: 'events' }, clients));

const feedbackChangeStream = require('./models/feedbacks').watch();
feedbackChangeStream.on('change', (change) => sse({ collection: 'feedbacks' }, clients));

const invitesChangeStream = require('./models/invites').watch();
invitesChangeStream.on('change', (change) => sse({ collection: 'invites' }, clients));

const usersChangeStream = require('./models/users').watch();
usersChangeStream.on('change', (change) => sse({ collection: 'users' }, clients));


app.use(function (req, res, next) {
    res.status(404);
    res.json({ erro: 'Not Found' });
});

module.exports = app;
