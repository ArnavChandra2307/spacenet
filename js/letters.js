// Firebase Configuration
const firebaseConfig = {
    // Replace with your actual Firebase config
    apiKey: "AIzaSyCQQVIJkNbSiGqZKBvJFFFiWgEs9Unphbc",
    authDomain: "letters-b49ee.firebaseapp.com",
    databaseURL: "https://letters-b49ee-default-rtdb.firebaseio.com",
    projectId: "letters-b49ee",
    storageBucket: "letters-b49ee.firebasestorage.app",
    messagingSenderId: "724306242988",
    appId: "1:724306242988:web:a437b13342ca2d18af5e09"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const lettersRef = database.ref('letters');

// DOM Elements
const currentDateEl = document.getElementById('currentDate');
const letterTitleEl = document.getElementById('letterTitle');
const letterBodyEl = document.getElementById('letterBody');
const senderNameEl = document.getElementById('senderName');
const sendLetterBtn = document.getElementById('sendLetter');
const lettersContainer = document.getElementById('lettersContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadLetters();
});

function initializePage() {
    // Set current date
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    
    // Hide loading overlay after 2 seconds
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 2000);
}

function setupEventListeners() {
    // Send letter button
    sendLetterBtn.addEventListener('click', sendLetter);
    
    // Enter key in title field moves to body
    letterTitleEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            letterBodyEl.focus();
        }
    });
    
    // Auto-resize textarea as user types
    letterBodyEl.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.max(350, this.scrollHeight) + 'px';
    });
    
    // Ctrl+Enter to send letter
    letterBodyEl.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            sendLetter();
        }
    });
}

function sendLetter() {
    const title = letterTitleEl.value.trim();
    const body = letterBodyEl.value.trim();
    const sender = senderNameEl.value;
    
    // Validation
    if (!title) {
        showNotification('Please add a title to your letter 💕', 'warning');
        letterTitleEl.focus();
        return;
    }
    
    if (!body) {
        showNotification('Your letter seems empty. Pour your heart out! 💕', 'warning');
        letterBodyEl.focus();
        return;
    }
    
    if (body.length < 10) {
        showNotification('Write a bit more, sweetheart! 💝', 'warning');
        letterBodyEl.focus();
        return;
    }
    
    // Create letter object
    const letter = {
        id: Date.now().toString(),
        title: title,
        body: body,
        sender: sender,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        date: new Date().toISOString()
    };
    
    // Disable send button to prevent double submission
    sendLetterBtn.disabled = true;
    sendLetterBtn.innerHTML = '<span class="heart">💕</span> Sending... <span class="heart">💕</span>';
    
    // Push to Firebase
    lettersRef.push(letter)
        .then(() => {
            // Clear form
            letterTitleEl.value = '';
            letterBodyEl.value = '';
            letterBodyEl.style.height = '350px';
            
            // Show success message
            showNotification(`Letter sent with love! 💕`, 'success');
            
            // Focus back to title for next letter
            letterTitleEl.focus();
        })
        .catch((error) => {
            console.error('Error sending letter:', error);
            showNotification('Failed to send letter. Please try again. 💔', 'error');
        })
        .finally(() => {
            // Re-enable send button
            sendLetterBtn.disabled = false;
            sendLetterBtn.innerHTML = '<span class="heart">💕</span> Send Letter <span class="heart">💕</span>';
        });
}

function loadLetters() {
    // Listen for new letters in real-time
    lettersRef.orderByChild('timestamp').on('value', (snapshot) => {
        const letters = [];
        
        snapshot.forEach((childSnapshot) => {
            const letter = childSnapshot.val();
            letter.firebaseKey = childSnapshot.key;
            letters.push(letter);
        });
        
        // Sort letters by timestamp (newest first)
        letters.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        displayLetters(letters);
    });
}

function displayLetters(letters) {
    if (letters.length === 0) {
        lettersContainer.innerHTML = `
            <div class="no-letters">
                <div class="empty-heart">💝</div>
                <p>No letters yet... Write the first one! 💕</p>
            </div>
        `;
        return;
    }
    
    lettersContainer.innerHTML = '';
    
    letters.forEach((letter, index) => {
        const letterEl = createLetterElement(letter, index);
        lettersContainer.appendChild(letterEl);
    });
}

function createLetterElement(letter, index) {
    const letterDiv = document.createElement('div');
    letterDiv.className = 'letter-item';
    letterDiv.style.animationDelay = `${index * 0.1}s`;
    
    // Format date
    const date = new Date(letter.date || letter.timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    letterDiv.innerHTML = `
        <div class="letter-header">
            <h3 class="letter-item-title">${escapeHtml(letter.title)}</h3>
            <div class="letter-timestamp">${dateStr}</div>
        </div>
        <div class="letter-item-body">${escapeHtml(letter.body)}</div>
        <div class="letter-signature">
            With love, ${escapeHtml(letter.sender)} 💕
        </div>
    `;
    
    return letterDiv;
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #ff6b9d, #c44569)' : 
                     type === 'warning' ? 'linear-gradient(135deg, #ffa726, #ff7043)' :
                     type === 'error' ? 'linear-gradient(135deg, #ef5350, #e53935)' :
                     'linear-gradient(135deg, #42a5f5, #1e88e5)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1001;
        font-family: 'Playfair Display', serif;
        font-size: 16px;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .notification-close:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle Firebase connection errors
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === false) {
        showNotification('Connection lost. Trying to reconnect... 💔', 'warning');
    }
});

// Export functions for potential external use
window.LoveLetters = {
    sendLetter,
    showNotification
};