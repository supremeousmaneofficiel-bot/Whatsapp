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

// Se connecter au chat
if (joinBtn) {
  joinBtn.addEventListener('click', () => {
    const username = usernameInput ? usernameInput.value.trim() : '';
    if (username !== '') {
      currentUser = username;

      if (messageInput) messageInput.disabled = false;
      if (sendBtn) sendBtn.disabled = false;

      if (loginScreen) loginScreen.style.display = 'none';
      if (chatScreen) chatScreen.style.display = 'block';

      socket.emit('user-joined', currentUser);
    } else {
      alert('Veuillez entrer un pseudo valide !');
    }
  });
}

// Envoyer un message
if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput ? messageInput.value.trim() : '';
    if (text && currentUser) {
      socket.emit('send-message', { user: currentUser, text: text });
      messageInput.value = '';
    }
  });
}

// Écouteurs d'événements Socket.io
socket.on('message', (data) => {
  addMessageToUI(data);
});

socket.on('load-messages', (messages) => {
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
    messages.forEach((msg) => addMessageToUI(msg));
  }
});

socket.on('user-count', (count) => {
  if (userCount) {
    userCount.textContent = `${count} en ligne`;
  }
});

// Afficher le message dans le DOM
function addMessageToUI(data) {
  if (!messagesContainer) return;

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
