const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
  console.log('Signup request received');
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      return user.save();
    })
    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
    .catch(error => {
      console.error('Error during signup:', error);
      res.status(400).json({ error });
    });
};

exports.login = (req, res, next) => {
  console.log('Login request received');
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => {
          console.error('Error during password comparison:', error);
          res.status(500).json({ error });
        });
    })
    .catch(error => {
      console.error('Error during login:', error);
      res.status(500).json({ error });
    });
};
