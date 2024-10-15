const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Book=require('./models/Book')

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

app.post('./api/stuff', (req, res, next )=>{
    delete req.body._id;
    const book=new Book ({
        ...req.body
    })
    book.save()
        .then(() => res.status(201).json({message: 'Livre enregistré'}))
        .catch(error => res.status(400).json({error}))
})
app.put('/api/stuff/:id', (req, res, next)=>{
    Book.updateOne({_id: req.params.id}, {...req.body, _id:req.params.id})
        .then(()=>res.status(200).json({message: 'Livre modifié '}))
        .catch(error => res.status(400).json({error}))
})
addEventListener.delete('/api/stuff/:id', (req, res, next)=>{
    Book.deleteOne({ _id: req.params.id})
        .then(()=>res.status(200).json({message:'Livre supprimé '}))
        .catch(error => res.status(400).json({error}))
})
app.get('/api/stuff/:id', (req,res,next)=>{
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}))
})

app.get('/api/stuff', (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}))
  });

module.exports = app;