var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require('../models/users');
const auth = require('../middleware/auth');
const upload = require('../multer/multer');
const fs = require('fs');
const { route } = require('./events');

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch {
    res.statusCode = 500;
    res.json({ message: 'Houve um erro interno.' })
  }
});

router.post('/register', upload.single('img'), async (req, res) => {
  var userData = req.body;
  var password = req.body.password;
  delete userData.password;
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const img = `/uploads/${req.file.filename}`;
    userData.img = img;

    const registeredUser = await User.register(
      new User(userData),
      password,
    );

    const token = jwt.sign({ id: registeredUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiration
    });

    res.statusCode = 201;
    return res.json({
      token,
      user: { name: registeredUser.name, _id: registeredUser._id, email: registeredUser.email, img: registeredUser.img }
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    if (error) {
      if (error.name === 'ValidationError') {
        res.statusCode = 400;
        res.json({ message: error.message });
      } else if (error?.code === 11000) {
        res.statusCode = 400;
        res.json({ message: 'O registro possui dados já cadastrados.' });
      } else {
        res.statusCode = 500;
        console.log('Houve erro aqui')
        console.log(error)
        res.json(error);
        return;
      }
    }
  }
})

router.post('/login', passport.authenticate('local'), async (req, res) => {
  var token = auth.getToken({ _id: req.user._id });
  res.statusCode = 201;
  console.log(req.user);
  res.setHeader('Content-Type', 'application/json');
  res.json({
    message: 'Login Successful',
    token,
    user: {
      _id: req.user._id,
      email: req.user.email,
      img: req.user.img
    }
  });
});

router.get('/refresh', auth.verifyUser, async (req, res) => {
  res.json({ user: req.user });
})

module.exports = router;
