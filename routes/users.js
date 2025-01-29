var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require('../models/users');
const auth = require('../middleware/auth');

/* GET users listing. */
router.get('/', auth.verifyUser, async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch {
    res.statusCode = 500;
    res.json({ message: 'Houve um erro interno.' })
  }
});

router.post('/register', async (req, res) => {
  var userData = req.body;
  var password = req.body.password;
  delete userData.password;
  try {
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
      user: { name: registeredUser.name, _id: registeredUser._id, email: registeredUser.email }
    });

  } catch (error) {
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
  res.setHeader('Content-Type', 'application/json');
  res.json({
    message: 'Login Successful',
    token
  });
});

module.exports = router;
