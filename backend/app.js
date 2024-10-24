// Importation des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');


// Création de l'application Express
const app = express();

// Middleware pour configurer les en-têtes CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  res.setHeader('Access-Control-Allow-Origin', '*'); //Autorise toutes les origines
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); //En-têtes autorisés
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //Spécifie les méthodes HTTP autorisées
  res.setHeader('Access-Control-Allow-Credentials', 'true'); //Autorise les cookies cross-origin
  next();
0.});

const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

// Connexion à MongoDB avec Mongoose
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => {
    console.error('Connexion à MongoDB échouée !');
    console.error('Erreur :', error.message);
    console.error('Stack trace :', error.stack);
  });

// Ajout de Helmet pour la sécurité des en-têtes
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// Middleware pour parser les requêtes avec un corps JSON
app.use(express.json());

// Routes pour les opérations sur les livres
app.use('/api/books', stuffRoutes);

// Routes pour l'authentification des utilisateurs
app.use('/api/auth', userRoutes);

// Middleware pour servir les fichiers statiques (images) depuis le répertoire 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
