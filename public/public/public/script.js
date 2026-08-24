const socket = io();

// Éléments du DOM
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');
const activeUsersCount = document.getElementById('active-users-count');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

let myUsername = '';
let deferredPrompt;

// 1. Rejoindre le Chat
joinBtn.addEventListener('click', () => {
  const pseudo = usernameInput.value.trim();
  if (pseudo !== '') {
    myUsername = pseudo;
    socket.emit('join', pseudo);
    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
  }
});

usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

// 2. Envoyer un message
function sendMessage() {
  const text = messageInput.value.trim();
  if (text !== '') {
    socket.emit('send-message', { text });
    messageInput.value = '';
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// 3. Recevoir un message
socket.on('receive-message', (data) => {
  appendMessage(data);
});

// 4. Charger l'historique depuis MongoDB
socket.on('load-history', (history) => {
  messagesContainer.innerHTML = '';
  history.forEach(msg => appendMessage(msg));
});

// 5. Mettre à jour le nombre d'utilisateurs en ligne
socket.on('user-list', (users) => {
  activeUsersCount.textContent = `${users.length} en ligne`;
});

// Fonction pour afficher un message à l'écran
function appendMessage(data) {
  const isMe = data.sender === myUsername;
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;
  
  msgDiv.innerHTML = `
    <span class="sender">${data.sender}</span>
    <p class="text">${data.text}</p>
    <span class="time">${data.time}</span>
  `;
  
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 6. Gestion du Service Worker et Installation PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('✅ Service Worker Enregistré'))
    .catch(err => console.error('❌ Erreur Service Worker:', err));
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaInstallBtn) pwaInstallBtn.style.display = 'block';
});

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        pwaInstallBtn.style.display = 'none';
      });
    }
  });
}
