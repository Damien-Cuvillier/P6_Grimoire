const mongoose = require('mongoose');
// Importation du plugin mongoose-unique-validator pour garantir l'unicité des champs
const uniqueValidator = require('mongoose-unique-validator');

// Définition du schéma pour les utilisateurs
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Adresse email de l'utilisateur, unique et requise
  password: { type: String, required: true }             // Mot de passe de l'utilisateur, requis
});

// Application du plugin uniqueValidator au schéma userSchema
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
