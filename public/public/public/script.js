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

// Rejoindre le chat
joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    
    // Débloquer le champ de texte et le bouton d'envoi
    messageInput.disabled = false;
    sendBtn.disabled = false;

    // Masquer la connexion et afficher le chat
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';

    socket.emit('user-joined', currentUser);
  }
});

// Envoyer un message
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text && currentUser) {
    socket.emit('send-message', { user: currentUser, text: text });
    messageInput.value = '';
  }
});

// Recevoir les messages (historique + nouveaux)
socket.on('message', (data) => {
  addMessageToUI(data);
});

socket.on('load-messages', (messages) => {
  messagesContainer.innerHTML = '';
  messages.forEach(msg => addMessageToUI(msg));
});

// Compteur en ligne
socket.on('user-count', (count) => {
  userCount.textContent = `${count} en ligne`;
});

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
