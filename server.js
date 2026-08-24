const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Connexion à MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://supremeousmaneofficiel_db_user:FXxaouYhGu2ngQq6@cluster0.vd3e6bk.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connecté avec succès à la base de données MongoDB !'))
  .catch((err) => console.error('❌ Erreur de connexion MongoDB :', err));

// 2. Modèle des Messages
const MessageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Servir le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Redirection forcée vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = {};

io.on('connection', async (socket) => {
  console.log('Utilisateur connecté :', socket.id);

  // Charger les 50 derniers messages de l'historique
  try {
    const history = await Message.find().sort({ createdAt: 1 }).limit(50);
    socket.emit('load-history', history);
  } catch (err) {
    console.error('Erreur chargement historique :', err);
  }

  socket.on('join', (pseudo) => {
    users[socket.id] = pseudo;
    io.emit('user-list', Object.values(users));
  });

  socket.on('send-message', async (data) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderName = users[socket.id] || 'Anonyme';

    // Sauvegarde permanente dans MongoDB
    try {
      const newMsg = new Message({
        sender: senderName,
        text: data.text,
        time: time
      });
      await newMsg.save();

      io.emit('receive-message', {
        sender: senderName,
        text: data.text,
        time: time,
        senderId: socket.id
      });
    } catch (err) {
      console.error('Erreur sauvegarde message :', err);
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user-list', Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur le port ${PORT}`);
});
