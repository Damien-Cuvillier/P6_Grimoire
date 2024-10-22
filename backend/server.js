const http = require('http');
const app = require('./app');

// Fonction pour normaliser le port en un numéro ou une chaîne
const normalizePort = val => {
  // Conversion de la valeur en un entier
  const port = parseInt(val, 10);

  // Si la valeur n'est pas un nombre, retourner la valeur telle quelle
  if (isNaN(port)) {
    return val;
  }
  // Si la valeur est un nombre positif, retourner le port
  if (port >= 0) {
    return port;
  }
  
  return false;
};

// Normalisation du port à partir de la variable d'environnement ou utiliser '4000' par défaut
const port = normalizePort(process.env.PORT);
// Définir le port pour l'application Express
app.set('port', port);

// Fonction pour gérer les erreurs spécifiques liées à l'écoute du serveur
const errorHandler = error => {
  // Vérifier si l'erreur est liée à l'écoute
  if (error.syscall !== 'listen') {
    throw error; // Si ce n'est pas le cas, lancer l'erreur
  }
  // Obtenir l'adresse du serveur
  const address = server.address();
  // Définir une chaîne de description de l'adresse
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  // Gestion des erreurs
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1); // Quitter le processus avec un code d'erreur
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1); 
      break;
    default:
      throw error; // Lancer l'erreur pour les autres cas
  }
};

// Création du serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

// Ajout d'un gestionnaire d'événements pour les erreurs du serveur
server.on('error', errorHandler);
// Ajout d'un gestionnaire d'événements pour l'événement "listening"
server.on('listening', () => {
  // Obtenir l'adresse du serveur
  const address = server.address();
  // Définir une chaîne de description de l'adresse
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind); // Afficher un message indiquant sur quel port le serveur écoute
});

// Démarrer le serveur en écoutant sur le port défini
server.listen(port);
