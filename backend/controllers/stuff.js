const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  try {
    console.log('Received data:', req.body);
    const bookObject = JSON.parse(req.body.book);
    console.log('Parsed book object:', bookObject);
    delete bookObject._id;
    delete bookObject._userId;

    // Vérification des champs requis sauf le champ `price`
    if (!bookObject.title || !bookObject.author || !bookObject.year || !bookObject.genre || !req.file ) {
      console.log('Missing required fields:', bookObject);
      return res.status(400).json({ error: 'All fields except price are required.' });
    }

    console.log('Book object before saving:', bookObject);

    let imageUrl = '';
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: imageUrl
    });

    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => {
        console.error('Error saving book:', error);
        res.status(400).json({ error });
      });
  } catch (error) {
    console.error('Error parsing book object:', error);
    res.status(400).json({ error: 'Invalid book data' });
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