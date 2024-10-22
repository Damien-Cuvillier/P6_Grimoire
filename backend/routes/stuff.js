// Importation des modules nécessaires
const express = require('express'); // Framework web pour Node.js
const router = express.Router(); // Création d'un routeur Express
const auth = require('../middleware/auth'); // Middleware pour l'authentification
const stuffCtrl = require('../controllers/stuff'); // Contrôleurs pour les opérations sur les livres
const { upload, optimizeImage } = require('../middleware/multer-config'); // Middleware pour la gestion des fichiers (images)

// Route pour obtenir tous les livres
router.get('/', stuffCtrl.getAllBooks);

// Route pour obtenir les livres les mieux notés
router.get('/bestrating', stuffCtrl.getBestRatedBooks);

// Route pour obtenir un livre spécifique par son ID
router.get('/:id', stuffCtrl.getOneBook);

// Route pour créer un nouveau livre (authentification et gestion des fichiers requises)
router.post('/', auth, upload, optimizeImage, stuffCtrl.createBook); 

// Route pour noter un livre spécifique (authentification requise)
router.post('/:id/rating', auth, stuffCtrl.rateBook);

// Route pour modifier un livre existant (authentification et gestion des fichiers requises)
router.put('/:id', auth, upload, optimizeImage, stuffCtrl.modifyBook);

// Route pour supprimer un livre spécifique (authentification requise)
router.delete('/:id', auth, stuffCtrl.deleteBook);

module.exports = router;
