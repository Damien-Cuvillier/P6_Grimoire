// Importation de bcrypt pour le hachage des mots de passe
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Fonction pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
  console.log('Signup request received'); 
  // Hachage du mot de passe fourni par l'utilisateur
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Création d'un nouvel utilisateur avec l'email et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash
      });
      // Enregistrement de l'utilisateur dans la base de données
      return user.save();
    })
    .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) 
    .catch(error => {
      console.error('Error during signup:', error); 
      res.status(400).json({ error }); 
    });
};

// Fonction pour la connexion d'un utilisateur
exports.login = (req, res, next) => {
  console.log('Login request received'); 
  // Recherche de l'utilisateur par son adresse email
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        console.log('User not found'); 
        return res.status(401).json({ error: 'Utilisateur non trouvé !' }); 
      }
      // Comparaison du mot de passe fourni avec le mot de passe haché dans la base de données
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            console.log('Invalid password'); 
            return res.status(401).json({ error: 'Mot de passe incorrect !' }); 
          }
          // Réponse réussie avec l'ID utilisateur et le token JWT
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id }, // Payload du token contenant l'ID utilisateur
              process.env.JWT_SECRET, // Clé secrète pour signer le token
              { expiresIn: '12h' } // Durée de validité du token
            )
          });
        })
        .catch(error => {
          console.error('Error during password comparison:', error); 
          res.status(500).json({ error }); // Réponse en cas d'erreur
        });
    })
    .catch(error => {
      console.error('Error during login:', error); 
      res.status(500).json({ error }); // Réponse en cas d'erreur
    });
};
