const express = require('express');
const mongoose = require('mongoose');
const app = express();
const stuffRoutes= require('./routes/stuff')
const userRoutes = require('./routes/user')

const mongoURI = 'mongodb+srv://jimbob:69GS6BAT@cluster0.ytj4l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => {
    console.error('Connexion à MongoDB échouée !');
    console.error('Erreur :', error.message);
    console.error('Stack trace :', error.stack);
  });

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;