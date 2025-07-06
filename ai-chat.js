// Ensure config.js is loaded before this script in HTML

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const clearNotificationsButton = document.getElementById('clear-notifications');
    const aiNotifications = document.getElementById('ai-notifications');

    // Function to smoothly scroll to bottom
    function scrollToBottom() {
        const chatBox = document.getElementById('chat-box');
        const scrollOptions = {
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        };
        chatBox.scrollTo(scrollOptions);
    }

    // Function to add a message to the chat
    function addMessage(message, isUser = false, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;
        
        const messageContent = document.createElement('div');
        messageContent.className = `max-w-[80%] p-3 rounded-lg ${
            isError 
                ? 'bg-red-500/20 text-red-300'
                : isUser 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300'
        }`;
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom after a short delay to ensure content is rendered
        setTimeout(scrollToBottom, 100);
    }

    // Function to add a new notification
    window.addAINotification = function(message, link = null) {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'text-blue-300 hover:text-blue-400 transition-colors duration-300';
        
        if (link) {
            notificationElement.innerHTML = `
                <a href="${link}">${message}</a>
            `;
        } else {
            notificationElement.textContent = message;
        }

        aiNotifications.insertBefore(notificationElement, aiNotifications.firstChild);
    };

    // Clear notifications
    clearNotificationsButton.addEventListener('click', function() {
        aiNotifications.innerHTML = '';
    });

    // Example notifications
    addAINotification('🎉 New project added: Vehicle Classifier', '#projects');
    addAINotification('🚀 Check out my new Chrome Extension', 'https://github.com/10Rudra01/Chrome-Extension');
    addAINotification('📬 New contact form available', '#contact');

    // Add scroll event listener to chat box
    const chatBox = document.getElementById('chat-box');
    let isScrolledToBottom = true;

    chatBox.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = chatBox;
        isScrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    });

    // Function to handle sending messages
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Clear input immediately
        chatInput.value = '';

        // Add user message to chat
        addMessage(message, true);

        // Disable input and button while processing
        chatInput.disabled = true;
        sendButton.disabled = true;

        try {
            // Show loading state
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'flex justify-start';
            loadingDiv.innerHTML = `
                <div class="max-w-[80%] p-3 rounded-lg bg-white/10 text-gray-300">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(loadingDiv);
            scrollToBottom();

            // Send message to backend
            const response = await fetch(window.API_BASE_URL + '/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);

            // Add AI response
            addMessage(data.response || "Message sent successfully! I'll get back to you soon.");

            // Show success state in button
            sendButton.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
            sendButton.classList.remove('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
            sendButton.classList.add('from-green-500', 'to-green-600');

            // Reset button after 2 seconds
            setTimeout(() => {
                sendButton.innerHTML = '<span>Send</span><i class="fas fa-arrow-right"></i>';
                sendButton.classList.remove('from-green-500', 'to-green-600');
                sendButton.classList.add('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            // Show error message instead of success message
            addMessage(error.message || "Sorry, there was an error processing your request. Please try again.", false, true);
            
            // Show error state in button
            sendButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
            sendButton.classList.remove('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
            sendButton.classList.add('from-red-500', 'to-red-600');

            // Reset button after 2 seconds
            setTimeout(() => {
                sendButton.innerHTML = '<span>Send</span><i class="fas fa-arrow-right"></i>';
                sendButton.classList.remove('from-red-500', 'to-red-600');
                sendButton.classList.add('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
            }, 2000);
        } finally {
            // Re-enable input and button
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.focus();
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Remove the default welcome message since we have our styled version in HTML
    // const welcomeMessage = `👋 Hello! I'm your AI assistant...`;
    // addMessage(welcomeMessage);
}); 