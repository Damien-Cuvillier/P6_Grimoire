const multer = require('multer'); // Importation de Multer,pour la gestion des fichiers

// Définir les types MIME acceptés et leurs extensions de fichier correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage des fichiers avec Multer
const storage = multer.diskStorage({
  // Définir la destination des fichiers
  destination: (req, file, callback) => {
    callback(null, 'images'); // Les fichiers seront stockés dans le dossier 'images'
  },
  // Définir le nom du fichier
  filename: (req, file, callback) => {
    // Générer un nom de fichier unique avec le nom d'origine sans espaces, suivi d'un timestamp et de l'extension appropriée
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image'); // Gérer un seul fichier image par requête
