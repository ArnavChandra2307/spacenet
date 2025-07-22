// ✅ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyByXBzUA8zImYAlG-uTN5_q4f2lDyu9CGw",
  authDomain: "justus-chat-edd5b.firebaseapp.com",
  databaseURL: "https://justus-chat-edd5b-default-rtdb.firebaseio.com",
  projectId: "justus-chat-edd5b",
  storageBucket: "justus-chat-edd5b.firebasestorage.app",
  messagingSenderId: "452116561573",
  appId: "1:452116561573:web:5480cdc8788f744578974c"
};
firebase.initializeApp(firebaseConfig);

// 🔐 Get current user
const currentUser = localStorage.getItem("username");
if (!currentUser) window.location.href = "login.html";

// 💬 Define chat info
const chatRoom = "private_chat";
const chatPartner = currentUser === "Arnav" ? "Anokhiii" : "Arnav";

// 👤 Set partner name in chat header
document.getElementById("chatHeaderName").innerText = chatPartner;

// 🖼️ Set avatar based on who is viewing
const avatarImg = document.querySelector(".chat-header .avatar");
if (avatarImg) {
  avatarImg.src = currentUser === "Arnav" ? "assets/hamster.png" : "assets/monkey.png";
}

// ✅ Firebase refs
const messagesRef = firebase.database().ref(`messages/${chatRoom}`);
// 🚀 NEW: Typing indicator ref
const typingRef = firebase.database().ref(`typing/${chatRoom}`);

// 🚀 NEW: Typing indicator variables
let typingTimer;
let isTyping = false;
const TYPING_DELAY = 2000; // 2 seconds delay before stopping typing indicator

// 🚀 Track user activity for seen status
let isWindowActive = true;
let unseenMessages = [];
let unreadCount = 0;
let hasInitialLoad = false;

window.addEventListener('focus', () => {
  isWindowActive = true;
  console.log('Window focused - marking unseen messages as seen');
});

window.addEventListener('blur', () => {
  isWindowActive = false;
  console.log('Window blurred - user not actively viewing');
});

// 🚀 NEW: Typing indicator functions
function startTyping() {
  if (!isTyping) {
    isTyping = true;
    typingRef.child(currentUser).set({
      isTyping: true,
      timestamp: Date.now()
    });
  }
  
  // Clear existing timer
  clearTimeout(typingTimer);
  
  // Set new timer to stop typing
  typingTimer = setTimeout(() => {
    stopTyping();
  }, TYPING_DELAY);
}

function stopTyping() {
  if (isTyping) {
    isTyping = false;
    typingRef.child(currentUser).remove();
  }
  clearTimeout(typingTimer);
}

// 🚀 NEW: Check initial unread messages on page load
function checkInitialUnreadMessages() {
  console.log('🔍 Checking for unread messages...');
  
  messagesRef.once('value', (snapshot) => {
    let initialUnreadCount = 0;
    const messages = [];
    
    console.log('📋 All messages data:', snapshot.val());
    
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const key = childSnapshot.key;
      
      console.log(`📨 Message from ${data.sender}, seen: ${data.seen}, current user: ${currentUser}`);
      
      // Count messages from partner that are not seen
      if (data.sender !== currentUser && !data.seen) {
        console.log(`🔴 Found unread message: ${data.message}`);
        initialUnreadCount++;
        unseenMessages.push(key);
      }
      
      messages.push({ key, data });
    });
    
    console.log(`📊 Total unread messages found: ${initialUnreadCount}`);
    
    if (initialUnreadCount > 0) {
      unreadCount = initialUnreadCount;
      console.log('🎯 Showing unread banner with count:', unreadCount);
      showUnreadBanner(unreadCount);
      
      // Auto-hide banner and mark as seen after 5 seconds (increased time)
      setTimeout(() => {
        console.log('⏰ Auto-marking messages as seen after 5 seconds');
        markAllAsSeen();
      }, 5000);
    } else {
      console.log('✅ No unread messages found');
    }
    
    hasInitialLoad = true;
  });
}

// 🚀 NEW: Mark all unseen messages as seen
function markAllAsSeen() {
  console.log('✅ Marking all unseen messages as seen...');
  console.log('📝 Unseen messages list:', unseenMessages);
  
  if (unseenMessages.length > 0) {
    unseenMessages.forEach(messageKey => {
      console.log(`🔄 Updating message ${messageKey} to seen`);
      messagesRef.child(messageKey).update({
        seen: true,
        seenAt: Date.now()
      });
    });
    
    unseenMessages = [];
    unreadCount = 0;
    showUnreadBanner(0);
    console.log('✅ All messages marked as seen');
  } else {
    console.log('ℹ️ No unseen messages to mark');
  }
}
function showUnreadBanner(count) {
  let banner = document.getElementById('unread-banner');
  
  if (count > 0) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'unread-banner';
      banner.classList.add('unread-banner');
      
      const chatBox = document.getElementById('chat-box');
      chatBox.parentNode.insertBefore(banner, chatBox);
    }
    
    const displayCount = count > 4 ? '4+' : count;
    banner.innerHTML = `
      <div class="unread-content">
        <span class="unread-count">${displayCount}</span>
        <span class="unread-text">${count === 1 ? 'unread message' : 'unread messages'}</span>
        <button class="scroll-down-btn" onclick="scrollToBottom()">↓</button>
      </div>
    `;
    banner.style.display = 'flex';
  } else {
    if (banner) {
      banner.style.display = 'none';
    }
  }
}

// 🚀 NEW: Scroll to bottom function
function scrollToBottom() {
  const chatBox = document.getElementById('chat-box');
  chatBox.scrollTop = chatBox.scrollHeight;
}
function updateTypingIndicator(typingUsers) {
  const chatBox = document.getElementById("chat-box");
  let typingIndicator = document.getElementById("typing-indicator");
  
  // Filter out current user and check if partner is typing
  const partnerTyping = Object.keys(typingUsers || {}).find(user => 
    user !== currentUser && typingUsers[user].isTyping
  );
  
  if (partnerTyping) {
    // Show typing indicator
    if (!typingIndicator) {
      typingIndicator = document.createElement("div");
      typingIndicator.id = "typing-indicator";
      typingIndicator.classList.add("message", "received", "typing");
      typingIndicator.innerHTML = `
        <span class="sender">${chatPartner}</span>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="typing-text">is typing...</span>
      `;
      chatBox.appendChild(typingIndicator);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  } else {
    // Hide typing indicator
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

// 🚀 NEW: Listen for typing status
typingRef.on('value', (snapshot) => {
  const typingData = snapshot.val();
  updateTypingIndicator(typingData);
});

// 📨 Enhanced send message with better status tracking
function sendMessage() {
  const input = document.getElementById("message-input");
  const messageText = input.value.trim();

  if (messageText !== "") {
    // Stop typing indicator when sending message
    stopTyping();
    
    const messageData = {
      sender: currentUser,
      message: messageText,
      timestamp: Date.now(),
      delivered: null,    // 🚀 NEW: Will be set when partner receives
      seen: false,
      seenAt: null       // 🚀 NEW: Will be set when partner views
    };
    messagesRef.push(messageData);
    input.value = "";
  }
}

// 🕒 Enhanced time formatting
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffSec / 3600);
  const diffDay = Math.floor(diffSec / 86400);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 30) return "now";
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return `${diffWeek}w ago`;
}

// 🚀 NEW: Get status icon and text
function getMessageStatus(data) {
  if (data.sender !== currentUser) return null; // Only show status for sent messages
  
  if (data.seen && data.seenAt) {
    return {
      icon: "💙", // Blue tick for seen
      text: `Seen ${formatTimeAgo(data.seenAt)}`,
      class: "seen"
    };
  } else if (data.delivered) {
    return {
      icon: "✓✓", // Double tick for delivered
      text: `Delivered ${formatTimeAgo(data.delivered)}`,
      class: "delivered"
    };
  } else {
    return {
      icon: "✓", // Single tick for sent
      text: "Sent",
      class: "sent-only"
    };
  }
}

// 💬 Enhanced display message with better status indicators
function displayMessage(sender, message, seen, timestamp, messageKey, data) {
  const chatBox = document.getElementById("chat-box");

  // Check if message already exists (for updates)
  const existingMessage = document.querySelector(`[data-message-key="${messageKey}"]`);
  if (existingMessage) {
    // Update existing message status
    const statusSpan = existingMessage.querySelector(".seen-status");
    if (statusSpan && sender === currentUser) {
      const status = getMessageStatus(data);
      if (status) {
        statusSpan.innerHTML = `<span class="status-icon ${status.class}">${status.icon}</span> ${status.text}`;
      }
    }
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(sender === currentUser ? "sent" : "received");
  messageDiv.setAttribute("data-message-key", messageKey); // 🚀 NEW: For message updates

  // 🟢 Enhanced status display for sent messages
  let statusHtml = "";
  if (sender === currentUser) {
    const status = getMessageStatus(data);
    if (status) {
      statusHtml = `<span class="seen-status"><span class="status-icon ${status.class}">${status.icon}</span> ${status.text}</span>`;
    }
  }

  messageDiv.innerHTML = `
    <span class="sender">${sender === currentUser ? "You" : sender}</span>
    <p>${message}</p>
    ${statusHtml}
  `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🔁 Enhanced message listener with better status handling
messagesRef.on("child_added", (snapshot) => {
  const data = snapshot.val();
  const key = snapshot.key;

  // Skip initial load processing for unread count
  if (!hasInitialLoad) {
    displayMessage(data.sender, data.message, data.seen, data.seenAt || data.timestamp, key, data);
    return;
  }

  // 🚀 NEW: Mark as delivered when partner receives the message
  if (data.sender !== currentUser && !data.delivered) {
    messagesRef.child(key).update({
      delivered: Date.now()
    });
  }

  // 🟣 Enhanced seen logic - only mark as seen if window is active
  if (data.sender !== currentUser && !data.seen) {
    if (isWindowActive) {
      // User is actively viewing - mark as seen immediately
      messagesRef.child(key).update({
        seen: true,
        seenAt: Date.now()
      });
    } else {
      // User not viewing - add to unseen list
      unseenMessages.push(key);
      unreadCount++;
      showUnreadBanner(unreadCount);
    }
  }

  displayMessage(data.sender, data.message, data.seen, data.seenAt || data.timestamp, key, data);
});

// 🚀 NEW: Listen for message updates (status changes)
messagesRef.on("child_changed", (snapshot) => {
  const data = snapshot.val();
  const key = snapshot.key;
  
  console.log(`Message ${key} updated:`, data);
  
  // Update the existing message display
  displayMessage(data.sender, data.message, data.seen, data.seenAt || data.timestamp, key, data);
});

// 🚀 NEW: Mark unseen messages as seen when window becomes active
window.addEventListener('focus', () => {
  isWindowActive = true;
  if (unseenMessages.length > 0) {
    console.log(`Marking ${unseenMessages.length} messages as seen`);
    markAllAsSeen();
  }
});

// 📥 UI Event listeners for Send button and Enter key
document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.querySelector('button');
  const messageInput = document.getElementById('message-input');
  const chatBox = document.getElementById('chat-box');

  const scrollToBottom = () => {
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  // Make scrollToBottom available globally
  window.scrollToBottom = scrollToBottom;

  sendButton.addEventListener('click', () => {
    sendMessage();
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // 🚀 NEW: Typing indicator on input
  messageInput.addEventListener('input', () => {
    const value = messageInput.value.trim();
    if (value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  });

  // 🚀 NEW: Stop typing on blur
  messageInput.addEventListener('blur', () => {
    stopTyping();
  });

  scrollToBottom();
  
  // 🚀 NEW: Check for unread messages on page load
  setTimeout(() => {
    console.log('🚀 Starting unread messages check...');
    checkInitialUnreadMessages();
  }, 1000); // Increased delay to ensure Firebase is loaded
});

// 🚀 NEW: Cleanup typing status when user leaves/refreshes page
window.addEventListener('beforeunload', () => {
  stopTyping();
});

// Clear typing status on page visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopTyping();
  }
});

// 🚀 NEW: Debug functions (remove in production)
window.debugMessages = function() {
  messagesRef.once('value', (snapshot) => {
    console.log('All messages:', snapshot.val());
  });
};

window.clearAllMessages = function() {
  if (confirm('Clear all messages?')) {
    messagesRef.remove();
  }
};

window.debugTyping = function() {
  typingRef.once('value', (snapshot) => {
    console.log('Typing status:', snapshot.val());
  });
};

// 🚀 NEW: Debug function for unread messages
window.debugUnread = function() {
  console.log('Current user:', currentUser);
  console.log('Unseen messages:', unseenMessages);
  console.log('Unread count:', unreadCount);
  
  messagesRef.once('value', (snapshot) => {
    let unreadCount = 0;
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const key = childSnapshot.key;
      
      if (data.sender !== currentUser && !data.seen) {
        unreadCount++;
        console.log(`Unread: ${data.message} from ${data.sender}`);
      }
    });
    console.log('Total unread found:', unreadCount);
  });
};

// 🚀 NEW: Force create unread banner for testing
window.testUnreadBanner = function() {
  console.log('🧪 Testing unread banner...');
  showUnreadBanner(3);
};