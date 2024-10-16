const mongoose = require('mongoose');


const ratingSchema = mongoose.Schema({
    userId: { type: String, required: true },
    grade: { type: Number, required: true }
  });

const bookSchema = mongoose.Schema({
    userId: {type : mongoose.Schema.Types.ObjectId, required: true},
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: String, required: true },
    genre: { type: String, required: true },
    ratings: [
     ratingSchema
    ],
    averageRating: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
  });

module.exports = mongoose.model('Book', bookSchema); // Notez que nous exportons le schéma du livre ici
