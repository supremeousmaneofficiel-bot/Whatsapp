const socket = io();

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');
const userCount = document.getElementById('user-count');

let currentUser = '';

// Quand on clique sur "Rejoindre le chat"
joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username !== '') {
    currentUser = username;
    
    // Débloquer l'envoi de message
    messageInput.disabled = false;
    sendBtn.disabled = false;

    // Cacher l'écran de pseudo et afficher le chat
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'block';

    // Prévenir le serveur
    socket.emit('user-joined', currentUser);
  } else {
    alert('Veuillez entrer un pseudo valide !');
  }
});

// Envoi d'un message
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text && currentUser) {
    socket.emit('send-message', { user: currentUser, text: text });
    messageInput.value = '';
  }
});

// Réception des messages isolés
socket.on('message', (data) => {
  addMessageToUI(data);
});

// Réception de l'historique
socket.on('load-messages', (messages) => {
  messagesContainer.innerHTML = '';
  messages.forEach(msg => addMessageToUI(msg));
});

// Mise à jour du compteur
socket.on('user-count', (count) => {
  userCount.textContent = `${count} en ligne`;
});

// Fonction pour afficher un message à l'écran
function addMessageToUI(data) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  
  if (data.user === currentUser) {
    msgDiv.classList.add('my-message');
  } else {
    msgDiv.classList.add('other-message');
  }

  msgDiv.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
