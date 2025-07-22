// Firebase Configuration
// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCaFFbdo8USD85ozoUtSjCxM9YWb0RM98k",
    authDomain: "picture-garden.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "picture-garden",
    storageBucket: "picture-garden.firebasestorage.app",
    messagingSenderId: "633944237417",
    appId: "1:633944237417:web:f4e270361bf1d2881889f8"
};

// Initialize Firebase
// Note: Uncomment and configure when you have Firebase setup
// firebase.initializeApp(firebaseConfig);
// const storage = firebase.storage();
// const database = firebase.database();

// For demo purposes, using local storage
let memories = JSON.parse(localStorage.getItem('memories')) || [];

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const markSpecial = document.getElementById('markSpecial');
const galleryContainer = document.getElementById('galleryContainer');
const overlay = document.getElementById('overlay');
const overlayImage = document.getElementById('overlayImage');
const closeBtn = document.getElementById('closeBtn');
const loading = document.getElementById('loading');

// Initialize the gallery
document.addEventListener('DOMContentLoaded', function() {
    loadExistingMemories();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    imageUpload.addEventListener('change', handleImageUpload);
    closeBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeOverlay();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeOverlay();
        }
    });
}

// Handle image upload
function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    showLoading();
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                id: Date.now() + index,
                src: e.target.result,
                isSpecial: markSpecial.checked,
                timestamp: new Date().toISOString(),
                name: file.name
            };
            
            memories.push(imageData);
            saveToStorage(imageData);
            createImageElement(imageData);
            
            // Hide loading after last image
            if (index === files.length - 1) {
                setTimeout(hideLoading, 500);
            }
        };
        reader.readAsDataURL(file);
    });
    
    // Reset form
    imageUpload.value = '';
    markSpecial.checked = false;
}

// Create image element with scattered positioning
function createImageElement(imageData, isInitialLoad = false) {
    const img = document.createElement('img');
    img.src = imageData.src;
    img.alt = 'Memory';
    img.className = 'memory-image';
    img.dataset.id = imageData.id;
    
    if (imageData.isSpecial) {
        img.classList.add('special');
    }
    
    // Random positioning and rotation
    const position = getRandomPosition();
    const rotation = getRandomRotation();
    
    img.style.left = position.x + 'px';
    img.style.top = position.y + 'px';
    img.style.transform = `rotate(${rotation}deg)`;
    img.style.zIndex = Math.floor(Math.random() * 10) + 1;
    
    // Add click event for full-screen view
    img.addEventListener('click', () => openOverlay(imageData.src));
    
    // Add entrance animation delay for initial load
    if (isInitialLoad) {
        img.style.animationDelay = `${Math.random() * 2}s`;
    }
    
    galleryContainer.appendChild(img);
    
    // Store position for potential repositioning
    imageData.position = position;
    imageData.rotation = rotation;
}

// Get random position ensuring images don't overlap too much
function getRandomPosition() {
    const containerRect = galleryContainer.getBoundingClientRect();
    const margin = 50;
    const imageSize = { width: 250, height: 200 };
    
    let attempts = 0;
    let position;
    
    do {
        position = {
            x: Math.random() * (containerRect.width - imageSize.width - margin * 2) + margin,
            y: Math.random() * (window.innerHeight - imageSize.height - 200) + 200
        };
        attempts++;
    } while (attempts < 10 && isPositionTooClose(position));
    
    return position;
}

// Check if position is too close to existing images
function isPositionTooClose(newPos) {
    const existingImages = galleryContainer.querySelectorAll('.memory-image');
    const minDistance = 100;
    
    for (let img of existingImages) {
        const rect = img.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(newPos.x - rect.left, 2) + 
            Math.pow(newPos.y - rect.top, 2)
        );
        
        if (distance < minDistance) {
            return true;
        }
    }
    return false;
}

// Get random rotation angle
function getRandomRotation() {
    return (Math.random() - 0.5) * 20; // -10 to +10 degrees
}

// Open overlay for full-screen view
function openOverlay(imageSrc) {
    overlayImage.src = imageSrc;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close overlay
function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
        overlayImage.src = '';
    }, 400);
}

// Show loading indicator
function showLoading() {
    loading.classList.add('active');
}

// Hide loading indicator
function hideLoading() {
    loading.classList.remove('active');
}

// Save to storage (localStorage for demo, Firebase in production)
function saveToStorage(imageData) {
    localStorage.setItem('memories', JSON.stringify(memories));
    
    // Firebase implementation (uncomment when configured)
    /*
    database.ref('memories/' + imageData.id).set({
        isSpecial: imageData.isSpecial,
        timestamp: imageData.timestamp,
        name: imageData.name
    });
    
    // Upload image to Firebase Storage
    const imageRef = storage.ref('images/' + imageData.id);
    fetch(imageData.src)
        .then(res => res.blob())
        .then(blob => {
            return imageRef.put(blob);
        })
        .then(() => {
            console.log('Image uploaded to Firebase Storage');
        });
    */
}

// Load existing memories
function loadExistingMemories() {
    showLoading();
    
    // Load from localStorage (demo)
    if (memories.length > 0) {
        memories.forEach((memory, index) => {
            setTimeout(() => {
                createImageElement(memory, true);
                if (index === memories.length - 1) {
                    setTimeout(hideLoading, 500);
                }
            }, index * 200);
        });
    } else {
        hideLoading();
    }
    
    // Firebase implementation (uncomment when configured)
    /*
    database.ref('memories').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(key => {
                const memory = data[key];
                // Get download URL from Storage
                storage.ref('images/' + key).getDownloadURL()
                    .then(url => {
                        const imageData = {
                            id: key,
                            src: url,
                            isSpecial: memory.isSpecial,
                            timestamp: memory.timestamp,
                            name: memory.name
                        };
                        createImageElement(imageData);
                    });
            });
        }
        hideLoading();
    });
    */
}

// Handle window resize to reposition images if needed
window.addEventListener('resize', debounce(function() {
    const images = galleryContainer.querySelectorAll('.memory-image');
    images.forEach(img => {
        const newPosition = getRandomPosition();
        img.style.left = newPosition.x + 'px';
        img.style.top = newPosition.y + 'px';
    });
}, 300));

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some interactive particles that follow mouse (optional enhancement)
document.addEventListener('mousemove', function(e) {
    if (Math.random() > 0.97) { // Only occasionally create particles
        createMouseParticle(e.clientX, e.clientY);
    }
});

function createMouseParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '3px';
    particle.style.height = '3px';
    particle.style.background = 'rgba(255, 255, 255, 0.6)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1';
    particle.style.animation = 'fadeOut 2s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 2000);
}

// Add fadeOut animation for mouse particles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);