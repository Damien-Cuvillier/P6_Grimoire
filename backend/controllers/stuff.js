// Importation des modules nécessaires
const Book = require('../models/Book'); // Modèle Book pour interagir avec la base de données
const fs = require('fs').promises; // Promises pour les opérations de fichiers
const sharp = require('sharp'); // Bibliothèque pour le traitement d'images
const mongoose = require('mongoose'); // Mongoose pour interagir avec MongoDB
const path = require('path'); // Module pour gérer les chemins de fichiers

// Fonction pour créer un livre
exports.createBook = async (req, res, next) => {
  try {
    // Affichage des données reçues dans la requête
    console.log('Received data:', req.body);
    const bookObject = JSON.parse(req.body.book); // Analyse du corps de la requête pour obtenir l'objet livre
    console.log('Parsed book object:', bookObject);
    
    // Suppression des champs non nécessaires
    delete bookObject._id;
    delete bookObject._userId;

    // Vérification des champs requis
    if (!bookObject.title || !bookObject.author || !bookObject.year || !bookObject.genre || !req.file) {
      return res.status(400).json({ error: 'All fields except price are required and an image must be provided.' });
    }
   
    // Création d'une nouvelle instance de Book avec les données fournies
    const book = new Book({
      ...bookObject, // Propriétés du livre
      userId: req.auth.userId, // ID de l'utilisateur authentifié
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // URL de l'image
    });

    await book.save(); // Sauvegarde du livre dans la base de données
    res.status(201).json({ message: 'Livre enregistré !' }); // Réponse de succès
  } catch (error) {
    console.error('Error creating book:', error); 
    res.status(500).json({ error: 'Internal server error' }); 
  }
};

// Fonction pour modifier un livre existant
exports.modifyBook = (req, res, next) => {
  // Création d'un objet bookObject basé sur la requête
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book), // Si une nouvelle image est fournie, l'URL de l'image est mise à jour
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }; // Sinon, utiliser les données existantes

  // Suppression de _userId pour éviter les fuites de données
  delete bookObject._userId;

  // Recherche du livre par ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification si l'utilisateur est le propriétaire du livre
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        // Mise à jour du livre dans la base de données
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié !' })) 
          .catch(error => res.status(401).json({ error })); 
      }
    })
    .catch((error) => {
      res.status(400).json({ error }); // Réponse d'erreur si le livre n'est pas trouvé
    });
};

// Fonction pour noter un livre
exports.rateBook = (req, res, next) => {
  const bookId = req.params.id; // ID du livre à noter
  const userId = req.auth.userId; // ID utilisateur de l'utilisateur authentifié
  const userRating = req.body.rating; // Note fournie par l'utilisateur

  // Affichage des informations de notation
  console.log('UserId:', userId);
  console.log('BookId:', bookId);
  console.log('UserRating:', userRating);

  // Vérification de la présence de l'ID utilisateur
  if (!userId) {
    return res.status(400).json({ error: 'User ID is missing' });
  }

  // Vérification de la validité de la note
  if (!userRating || typeof userRating !== 'number' || userRating < 1 || userRating > 5) {
    return res.status(400).json({ error: 'Invalid rating value' });
  }

  // Recherche du livre par ID
  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: 'Book not found' }); 
      }

      console.log('Found Book:', book);

      // Vérification de l'existence d'une notation précédente par l'utilisateur
      const existingRating = book.ratings.some(rating => rating.userId.toString() === userId.toString());

      if (existingRating) {
        return res.status(403).json({ error: 'User has already rated this book' });
      }

      // Ajout de la nouvelle note
      console.log('Adding new rating');
      book.ratings.push({ userId: userId, grade: userRating }); // Ajout d'une nouvelle note

      // Calcul de la nouvelle note moyenne
      book.averageRating = (book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length).toFixed(2);
      
      console.log(book);

      // Sauvegarde des modifications du livre
      book.save()
        .then(() => res.status(200).json(book)) // Réponse avec le livre mis à jour
        .catch(error => res.status(400).json({ error })); 
    })
    .catch(error => res.status(400).json({ error: `Error while rating book: ${error.message}` }));
};



// Fonction pour supprimer un livre
exports.deleteBook = async (req, res, next) => {
  try {
    console.log('Début de la fonction deleteBook');
    const book = await Book.findOne({ _id: req.params.id }); // Recherche du livre par ID
    
    // Vérification si l'utilisateur est le propriétaire du livre
    if (book.userId != req.auth.userId) {
      console.log('Utilisateur non autorisé');
      return res.status(401).json({ message: 'Non autorisé' }); 
    }

    console.log('Utilisateur autorisé');
    const filename = book.imageUrl.split('/images/')[1]; // Extraction du nom de fichier de l'URL
    const filePath = path.join(__dirname, '../images/', filename); // Création du chemin complet du fichier

    console.log(`Chemin du fichier : ${filePath}`);

    // Suppression de l'image du disque
    try {
      await fs.unlink(filePath);
      console.log(`Image supprimée : ${filePath}`); 
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'image :', err); 
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' }); 
    }

    // Suppression du livre de la base de données
    try {
      await Book.deleteOne({ _id: req.params.id });
      console.log(`Livre avec ID ${req.params.id} supprimé.`); 
      res.status(200).json({ message: 'Livre supprimé' }); 
    } catch (err) {
      console.error('Erreur lors de la suppression du livre :', err); 
      res.status(500).json({ error: 'Erreur lors de la suppression du livre' }); 
    }
  } catch (error) {
    console.error('Erreur lors de la recherche du livre :', error); 
    res.status(500).json({ error }); 
  }
};

// Fonction pour obtenir un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id // Recherche du livre par ID
  }).then(
    (book) => {
      res.status(200).json(book); // Réponse avec le livre trouvé
    }
  ).catch((error) => {
    res.status(404).json({ error: error.message }); // Réponse si le livre n'est pas trouvé
  });
};

// Fonction pour obtenir tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      // Conversion de l'année en nombre pour chaque livre
      const updatedBooks = books.map(book => ({
        ...book._doc,
        year: Number(book.year)
      }));
      res.status(200).json(updatedBooks);
    })
    .catch(error => res.status(400).json({ error }));
};

// Fonction pour obtenir les livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie les livres par note moyenne décroissante
    .limit(3) // Limite à 5 livres les mieux notés
    .then(books => res.status(200).json(books)) // Réponse avec la liste des livres
    .catch(error => res.status(400).json({ error })); 
};

