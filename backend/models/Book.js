const mongoose = require('mongoose');

// Définition du schéma pour les évaluations (ratings)
const ratingSchema = mongoose.Schema({
    userId: { type: String, required: true }, // Identifiant de l'utilisateur ayant donné la note
    grade: { type: Number, required: true }   // Note donnée par l'utilisateur
});

// Définition du schéma pour les livres
const bookSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Identifiant de l'utilisateur ayant ajouté le livre
    title: { type: String, required: true },                         // Titre du livre
    author: { type: String, required: true },                        // Auteur du livre
    year: { type: String, required: true },                          // Année de publication du livre
    genre: { type: String, required: true },                         // Genre du livre
    ratings: [ratingSchema],                                         // Tableau des évaluations (schéma d'évaluation défini ci-dessus)
    averageRating: { type: Number, default: 0 },                     // Note moyenne du livre, initialisée à 0
    imageUrl: { type: String, required: true }                       // URL de l'image de couverture du livre
});

module.exports = mongoose.model('Book', bookSchema);
