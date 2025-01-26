var express = require('express');
// var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var eventsRouter = require('./routes/events');
var usersRouter = require('./routes/users');

const mongoose = require("mongoose");

const url = 'mongodb://localhost:27017/eventese';
const connection = mongoose.connect(url);
connection.then((db) => {
    console.log('Connected to database');
});

connection.catch((err) => {
    console.log('Não conseguiu conectar ao banco.');
})


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/events', eventsRouter);

app.use(function (req, res, next) {
    res.status(404);
    res.json({ erro: 'Not Found' });
});

module.exports = app;
