// Importation des modules nécessaires
const express = require('express'); // Framework web pour Node.js
const mongoose = require('mongoose'); // ORM pour MongoDB
const path = require('path'); // Module pour gérer les chemins de fichiers

// Création de l'application Express
const app = express();

const stuffRoutes = require('./routes/stuff'); // Import routes pour les opérations sur les livres
const userRoutes = require('./routes/user'); // Import routes pour l'authentification des utilisateurs

// URI de connexion à la base de données MongoDB
const mongoURI = 'mongodb+srv://jimbob:69GS6BAT@cluster0.ytj4l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connexion à MongoDB avec Mongoose
mongoose.connect(mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !')) // Si la connexion réussit
  .catch((error) => { // Si la connexion échoue
    console.error('Connexion à MongoDB échouée !');
    console.error('Erreur :', error.message);
    console.error('Stack trace :', error.stack);
  });

// Middleware pour parser les requêtes avec un corps JSON
app.use(express.json());

// Middleware pour configurer les en-têtes CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permettre l'accès depuis n'importe quelle origine
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autoriser certains en-têtes
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autoriser certaines méthodes HTTP
  next(); 
});

// Routes pour les opérations sur les livres
app.use('/api/books', stuffRoutes);

// Routes pour l'authentification des utilisateurs
app.use('/api/auth', userRoutes);

// Middleware pour servir les fichiers statiques (images) depuis le répertoire 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
