const mongoose = require('mongoose');


const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    grade: { type: Number, required: true },
});


const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [ratingSchema], // Intégration des notes dans le schéma du livre
});

module.exports = mongoose.model('Book', bookSchema); // Notez que nous exportons le schéma du livre ici
