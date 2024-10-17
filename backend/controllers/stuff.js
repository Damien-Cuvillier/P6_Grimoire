const Book = require('../models/Book');
const fs = require('fs').promises;
const sharp = require('sharp');
const mongoose = require('mongoose');
const path = require('path');


exports.createBook = async (req, res, next) => {
  try {
    console.log('Received data:', req.body);
    const bookObject = JSON.parse(req.body.book);
    console.log('Parsed book object:', bookObject);
    delete bookObject._id;
    delete bookObject._userId;

    // Vérification des champs requis
    if (!bookObject.title || !bookObject.author || !bookObject.year || !bookObject.genre || !req.file) {
      return res.status(400).json({ error: 'All fields except price are required and an image must be provided.' });
    }

    // Compression de l'image avec Sharp
    const buffer = await sharp(req.file.buffer)
      .webp({ quality: 80 }) // Vous pouvez ajuster la qualité ici
      .toBuffer();

    const filename = `${Date.now()}-${req.file.originalname.split(' ').join('_')}.webp`; // Nom de fichier optimisé

    // Enregistrement de l'image compressée sur le disque
    await fs.writeFile(`images/${filename}`, buffer);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



    

exports.modifyBook= (req, res, next) => {
    const bookObject= req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };

   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
    .then((book)=>{
        if (book.userId != req.auth.userId){
            res.status(401).json({message: 'Non autorisé'})
        } else {
            Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
            .then(()=> res.status(200).json({message : 'Objet modifié !'}))
            .catch(error => res/status(401).json({error}))
        }
    })
    .catch((error)=>{
        res.status(400).json({error})
    })
}

exports.rateBook = (req, res, next) => {
  const bookId = req.params.id;
  const userId = req.auth.userId; // ID utilisateur de l'utilisateur authentifié
  const userRating = req.body.rating;

  console.log('UserId:', userId);
  console.log('BookId:', bookId);
  console.log('UserRating:', userRating);

  if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
  }

  if (!userRating || typeof userRating !== 'number' || userRating < 1 || userRating > 5) {
      return res.status(400).json({ error: 'Invalid rating value' });
  }

  Book.findById(bookId)
      .then(book => {
          if (!book) {
              return res.status(404).json({ error: 'Book not found' });
          }

          console.log('Found Book:', book);

          const existingRatingIndex = book.ratings.findIndex(rating => {
              // Convert userId and rating.userId to strings for comparison
              const ratingUserId = rating.userId.toString(); // Conversion en chaîne
              console.log('Comparing rating.userId:', ratingUserId, 'with userId:', userId.toString());
              return ratingUserId === userId.toString();
          });

          console.log('existingRatingIndex:', existingRatingIndex);

          if (existingRatingIndex !== -1) {
              console.log('Updating existing rating');
              book.ratings[existingRatingIndex].grade = userRating;
          } else {
              console.log('Adding new rating');
              book.ratings.push({ userId: userId, grade: userRating });
          }

          book.averageRating = (book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length).toFixed(2);

          book.save()
              .then(updatedBook => res.status(200).json(updatedBook))
              .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(400).json({ error: `Error while rating book: ${error.message}` }));
};



  
exports.deleteBook = async (req, res, next) => {
  try {
    console.log('Début de la fonction deleteBook');
    const book = await Book.findOne({ _id: req.params.id });
    
    if (book.userId != req.auth.userId) {
      console.log('Utilisateur non autorisé');
      return res.status(401).json({ message: 'Non autorisé' });
    }

    console.log('Utilisateur autorisé');
    const filename = book.imageUrl.split('/images/')[1];
    const filePath = path.join(__dirname, '../images/', filename);

    console.log(`Chemin du fichier : ${filePath}`);

    try {
      await fs.unlink(filePath);
      console.log(`Image supprimée : ${filePath}`);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'image :', err);
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
    }

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


exports.getOneBook = (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        res.status(200).json(book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  }

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  }