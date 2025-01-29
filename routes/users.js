var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require('../models/users');
const authMiddleware = require('../middleware/auth');

/* GET users listing. */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch {
    res.statusCode = 500;
    res.json({ message: 'Houve um erro interno.' })
  }
  // res.send('respond with a resource');
});

// router.post('/', async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.statusCode = 201;
//     res.json({ status: 'Registration completed!', user });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       res.statusCode = 400;
//       res.json(error);
//     } else if (error?.code === 11000) {
//       res.statusCode = 400;
//       res.json({ message: 'O registro possui dados já cadastrados.' });
//     } else {
//       res.statusCode = 500;
//       res.json({ message: 'Houve um erro interno' })
//     }
//   }
// });

router.post('/register', async (req, res) => {
  var userData = req.body;
  var password = req.body.password;
  delete userData.password;

  User.register(
    new User(userData),
    password,
    (error, result) => {
      if (error) {
        if (error.name === 'ValidationError') {
          res.statusCode = 400;
          res.json({ message: error.message });
        } else if (error?.code === 11000) {
          res.statusCode = 400;
          res.json({ message: 'O registro possui dados já cadastrados.' });
        } else {
          res.statusCode = 500;
          res.json(error);
          return;
        }
      }

      passport.authenticate('local');
      res.json({ message: 'Usuário criado com sucesso.' })

    }
  )
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find the user by email or CPF
    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify the password
    const isPasswordValid = await pt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token valid for 1 hour
    );

    // Respond with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
