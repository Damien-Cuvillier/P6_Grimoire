const express = require('express'); // Framework web pour Node.js
const router = express.Router(); // Création d'un routeur Express
const userCtrl = require('../controllers/user'); // Contrôleurs pour les opérations sur les utilisateurs

// Route pour l'inscription des utilisateurs
router.post('/signup', userCtrl.signup);

// Route pour la connexion des utilisateurs
router.post('/login', userCtrl.login);

module.exports = router;
