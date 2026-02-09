document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');
    const chatWindow = document.getElementById('ai-chat-window');

    // Toggle Chat Window
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('chat-closed');
        if (!chatWindow.classList.contains('chat-closed')) {
            chatInput.focus();
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('chat-closed');
    });

    // Function to smoothly scroll to bottom
    function scrollToBottom() {
        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to add a message to the chat
    function addMessage(message, isUser = false, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-msg' : 'ai-msg';
        
        if (isError) {
            messageDiv.style.borderColor = 'var(--color-primary)';
            messageDiv.style.color = 'var(--color-primary)';
        }

        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }

    // Function to handle sending messages
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.value = '';
        addMessage(message, true);

        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-msg';
        loadingDiv.innerHTML = '<span class="cursor"></span> THINKING...';
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();

        try {
            // Real Backend Call
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            chatMessages.removeChild(loadingDiv);
            addMessage(data.response || "No response received.");

        } catch (error) {
            chatMessages.removeChild(loadingDiv);
            addMessage("ERROR: Connection to Neural Grid failed. (Ensure Backend is Running)", false, true);
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});