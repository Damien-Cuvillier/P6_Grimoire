// Importation de la bibliothèque jsonwebtoken pour la gestion des tokens JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware pour l'authentification
module.exports = (req, res, next) => {
    try {
        // Récupération du token JWT depuis les en-têtes de la requête
        const token = req.headers.authorization.split(' ')[1];
        // Vérification du token et décodage du contenu en utilisant une clé secrète
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Extraction de l'ID utilisateur du token décodé
        const userId = decodedToken.userId;
        // Ajout de l'ID utilisateur à l'objet de requête pour un accès ultérieur
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        // En cas d'erreur (token invalide ou absent), renvoie un statut 401 (Non autorisé)
        res.status(401).json({ error });
    }
};
