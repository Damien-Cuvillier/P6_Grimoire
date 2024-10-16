const Book = require('../models/Book');
const fs = require('fs').promises;
const sharp = require('sharp');

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
  const bookId = req.params.id; // Récupération de l'ID du livre
  const rating = req.body.rating; // Récupération de la note envoyée

  // Vérifie si l'ID du livre est défini
  if (!bookId) {
    return res.status(400).json({ error: 'Book ID is required.' });
  }

  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
      }
      // Ajoute la note au livre
      if (!book.ratings) book.ratings = [];
      book.ratings.push(rating);
      return book.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Rating added successfully!' });
    })
    .catch(error => {
      console.error('Error while rating book:', error); // Log pour le débogage
      res.status(500).json({ error });
    });
};


  
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book =>{
            if (book.userId != req.auth.userId){
                res.status(401).json({message: 'Non autorisé'})
            } else {
                const filename= book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, ()=> {
                    Book.deleteOne({_id: req.params.id})
                    .then(() => {res.status(200).json({message: 'Livre supprimé'})})
                    .catch(error => res.status(401).json({error}))
                })
            }
        })
        .catch( error =>{
            res.status(500).json({error})
        })
  }

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