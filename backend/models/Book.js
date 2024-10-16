const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: String, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model('Book', bookSchema);
