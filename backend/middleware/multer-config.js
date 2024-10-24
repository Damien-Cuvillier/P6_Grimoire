const multer = require('multer'); // Importation de Multer pour la gestion des fichiers
const sharp = require('sharp'); // Importation de Sharp pour l'optimisation des images
const fs = require('fs'); // Importation de fs pour la gestion des fichiers système

// Définir les types MIME acceptés et leurs extensions de fichier correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage des fichiers avec Multer
const storage = multer.memoryStorage(); // Utiliser la mémoire pour que les images soient temporaires

// Middleware pour gérer le stockage des fichiers
const upload = multer({ storage: storage }).single('image');//indique que seule une image doit être upload

// Middleware pour optimiser les images après le téléchargement
const optimizeImage = async (req, res, next) => {
  if (!req.file) { //Vérifie si un fichier a été upload
    return next(); // Passer au middleware suivant si aucun fichier n'est présent
  }

  //Création d'un nom de fichier optimisé
  const name = req.file.originalname.split(' ').join('_');
  const extension = MIME_TYPES[req.file.mimetype];
  const optimizedFileName = `${name}${Date.now()}.webp`;

  try { //Optimisation de l'image
    console.log('Optimizing image...'); 
    await sharp(req.file.buffer) //Utilise sharp pour traiter l'image
      .resize(600) // Redimensionner l'image à une largeur de 600px
      .toFormat('webp') // Convertir l'image au format WebP
      .toFile(`images/${optimizedFileName}`); //Enregistre l'image optimisée dans le répertoire images avec le nom de fichier optimisé.

    // Ajouter le nom du fichier optimisé à la requête
    req.file.filename = optimizedFileName; //Si l'optimisation réussit, le nom du fichier optimisé est ajouté
    console.log('Image optimized:', optimizedFileName);
    next(); // Passer au middleware suivant
  } catch (err) {
    console.error('Error optimizing image:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Exporter le middleware d'upload et d'optimisation
module.exports = { upload, optimizeImage };
