// Ensure config.js is loaded before this script in HTML

document.addEventListener('DOMContentLoaded', function() {
    const notificationSection = document.getElementById('notification-section');
    const toggleButton = document.getElementById('toggle-notifications');
    const clearButton = document.getElementById('clear-notifications');
    const notificationHistory = document.getElementById('notification-history');
    const historyContent = document.getElementById('history-content');
    const notificationCount = document.getElementById('notification-count');
    const activeNotifications = document.getElementById('active-notifications');

    // Check if required elements exist
    if (!activeNotifications) {
        console.warn('Active notifications element not found');
        return;
    }

    let notifications = [];
    const MAX_VISIBLE_NOTIFICATIONS = 3;
    const MAX_HISTORY_ITEMS = 10;

    // Function to save notifications to localStorage
    function saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    // Function to load notifications from localStorage
    function loadNotifications() {
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            notifications = JSON.parse(savedNotifications);
            updateUI();
        }
    }

    // Function to toggle notification history
    function toggleNotificationHistory() {
        if (!notificationHistory || !toggleButton) return;
        
        const isHidden = notificationHistory.classList.contains('hidden');
        notificationHistory.classList.toggle('hidden');
        const icon = toggleButton.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
        toggleButton.querySelector('i').classList.toggle('fa-chevron-up');
    }

    // Function to update notification count
    function updateNotificationCount() {
        const count = notifications.length;
        if (notificationCount) {
            notificationCount.textContent = count;
            notificationCount.style.display = count > 0 ? 'flex' : 'none';
        }
        if (notificationSection) {
            notificationSection.style.display = count > 0 ? 'block' : 'none';
        }
    }

    // Function to format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    // Function to add a notification to history
    function addToHistory(notification) {
        if (!historyContent) return; // Skip if history element doesn't exist
        
        const historyItem = document.createElement('div');
        historyItem.className = 'text-sm text-gray-300 hover:text-white transition-colors duration-300';
        
        if (notification.link) {
            historyItem.innerHTML = `
                <a href="${notification.link}" class="flex items-center justify-between">
                    <span>${notification.message}</span>
                    <span class="text-xs text-gray-500">${formatTimestamp(notification.timestamp)}</span>
                </a>
            `;
        } else {
            historyItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>${notification.message}</span>
                    <span class="text-xs text-gray-500">${formatTimestamp(notification.timestamp)}</span>
                </div>
            `;
        }

        historyContent.insertBefore(historyItem, historyContent.firstChild);

        // Keep only the latest MAX_HISTORY_ITEMS
        while (historyContent.children.length > MAX_HISTORY_ITEMS) {
            historyContent.removeChild(historyContent.lastChild);
        }
    }

    // Function to update the UI with current notifications
    function updateUI() {
        // Update active notifications
        activeNotifications.innerHTML = '';
        notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS).forEach((notif, index) => {
            const notificationElement = document.createElement('div');
            if (notif.link) {
                notificationElement.innerHTML = `
                    <a href="${notif.link}" class="text-blue-300 hover:text-blue-400 transition-colors duration-300">
                        ${notif.message}
                    </a>
                `;
            } else {
                notificationElement.textContent = notif.message;
            }
            
            if (index < notifications.length - 1) {
                const bullet = document.createElement('span');
                bullet.className = 'mx-2 text-gray-400';
                bullet.textContent = '•';
                activeNotifications.appendChild(bullet);
            }
            
            activeNotifications.appendChild(notificationElement);
        });

        // Update history (only if element exists)
        if (historyContent) {
            historyContent.innerHTML = '';
            notifications.forEach(notification => {
                addToHistory(notification);
            });
        }

        // Update count and visibility
        updateNotificationCount();
    }

    // Function to add a new notification
    window.addNotification = function(message, link = null) {
        const notification = {
            message,
            link,
            timestamp: new Date().getTime()
        };

        notifications.unshift(notification);
        
        // Keep only the latest notifications
        if (notifications.length > MAX_HISTORY_ITEMS) {
            notifications.pop();
        }

        // Update UI and save to localStorage
        updateUI();
        saveNotifications();
    };

    // Clear all notifications
    function clearNotifications() {
        notifications = [];
        updateUI();
        saveNotifications();
    }

    // Add event listeners (only if elements exist)
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleNotificationHistory);
    }
    if (clearButton) {
        clearButton.addEventListener('click', clearNotifications);
    }

    // Load saved notifications on page load
    loadNotifications();
});

// Simple notification loader: fetches notifications from the backend and displays them
function showNotifications(messages) {
    const activeNotifications = document.getElementById('active-notifications');
    if (!activeNotifications) {
        console.warn('Active notifications element not found');
        return;
    }
    
    activeNotifications.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'notification-card animate-fade-in';
        div.innerHTML = `
            <span class="notification-icon"><i class="fas fa-bell"></i></span>
            <span class="notification-text">${msg}</span>
        `;
        activeNotifications.appendChild(div);
    });
}

// Fetch notifications from the backend
function loadNotifications() {
    fetch(window.API_BASE_URL + '/api/notifications')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data.notifications)) {
                showNotifications(data.notifications);
            }
        });
}

document.addEventListener('DOMContentLoaded', loadNotifications); 