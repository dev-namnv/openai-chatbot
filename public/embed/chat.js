(function () {
  const apiKey = document.currentScript.getAttribute('data-api-key');
  const serverUrl = 'https://your-server.com'; // backend của bạn

  // Tạo chat button
  const chatButton = document.createElement('div');
  chatButton.innerText = '💬';
  chatButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    z-index: 9999;
  `;
  document.body.appendChild(chatButton);

  // Tạo chat box
  const chatBox = document.createElement('div');
  chatBox.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    display: none;
    flex-direction: column;
    z-index: 9999;
  `;
  document.body.appendChild(chatBox);

  const messagesContainer = document.createElement('div');
  messagesContainer.style.cssText = `
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    font-family: sans-serif;
    font-size: 14px;
  `;
  chatBox.appendChild(messagesContainer);

  const inputContainer = document.createElement('div');
  inputContainer.style.cssText = 'display: flex; border-top: 1px solid #ddd;';
  chatBox.appendChild(inputContainer);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type a message...';
  input.style.cssText = 'flex:1; border:none; padding:10px; font-size:14px;';
  inputContainer.appendChild(input);

  const sendBtn = document.createElement('button');
  sendBtn.innerText = 'Send';
  sendBtn.style.cssText =
    'border:none; background:#007bff; color:white; padding:10px;';
  inputContainer.appendChild(sendBtn);

  // Toggle chat box
  chatButton.addEventListener('click', () => {
    chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
  });

  // Send message
  async function sendMessage(msg) {
    const userDiv = document.createElement('div');
    userDiv.textContent = 'You: ' + msg;
    userDiv.style.margin = '5px 0';
    messagesContainer.appendChild(userDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    input.value = '';

    const res = await fetch(`${serverUrl}/embed/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();

    const botDiv = document.createElement('div');
    botDiv.textContent = 'Bot: ' + (data.message || '...');
    botDiv.style.margin = '5px 0';
    botDiv.style.color = 'blue';
    messagesContainer.appendChild(botDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendBtn.addEventListener('click', () => {
    if (input.value.trim()) {
      sendMessage(input.value.trim());
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      sendMessage(input.value.trim());
    }
  });
})();
