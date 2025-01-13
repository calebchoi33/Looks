const API_URL = 'http://localhost:8000';

// DOM Elements
const authBtn = document.getElementById('authBtn');
const userMenu = document.getElementById('userMenu');
const authModal = document.getElementById('authModal');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const cameraBtn = document.getElementById('cameraBtn');
const closeCamera = document.getElementById('closeCamera');
const measureBtn = document.getElementById('measureBtn');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const faceRatioSpan = document.getElementById('faceRatio');
const faceLengthSpan = document.getElementById('faceLength');
const faceWidthSpan = document.getElementById('faceWidth');

let isModelLoaded = false;
let faceDetectionInterval = null;

// Load face-api.js models
async function loadFaceDetectionModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights')
        ]);
        isModelLoaded = true;
        console.log('Face detection models loaded');
        if (video.srcObject) {
            startFaceDetection();
        }
    } catch (err) {
        console.error('Error loading face detection models:', err);
    }
}

// Start loading models
loadFaceDetectionModels();

// Auth state
let token = localStorage.getItem('token');
updateAuthUI();

// Event Listeners for auth
authBtn.addEventListener('click', () => {
    if (token) {
        userMenu.classList.toggle('hidden');
    } else {
        authModal.classList.remove('hidden');
    }
});

closeModal.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.add('hidden');
    }
    if (!e.target.matches('#authBtn') && !userMenu.classList.contains('hidden')) {
        userMenu.classList.add('hidden');
    }
});

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

// Camera functionality
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        video.srcObject = stream;
        await video.play();
        cameraBtn.classList.add('hidden');
        closeCamera.classList.remove('hidden');
        measureBtn.classList.remove('hidden');
        
        if (isModelLoaded) {
            startFaceDetection();
        }
    } catch (error) {
        console.error('Camera error:', error);
        alert('Error accessing camera. Please make sure you have granted camera permissions.');
    }
}

cameraBtn.addEventListener('click', startCamera);

closeCamera.addEventListener('click', () => {
    stopCamera();
});

function stopCamera() {
    if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    closeCamera.classList.add('hidden');
    measureBtn.classList.add('hidden');
    cameraBtn.classList.remove('hidden');
    clearMeasurements();
    stopFaceDetection();
}

// Face detection and measurement
function startFaceDetection() {
    if (!video.srcObject || !isModelLoaded) return;

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(overlay, displaySize);

    faceDetectionInterval = setInterval(async () => {
        if (!video.srcObject) return;

        try {
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            // Clear previous drawings
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, overlay.width, overlay.height);

            // Draw face landmarks
            faceapi.draw.drawFaceLandmarks(overlay, resizedDetections);

            if (detections.length > 0) {
                const landmarks = detections[0].landmarks;
                const positions = landmarks.positions;

                // Calculate face measurements
                const faceLength = calculateDistance(
                    positions[8], // chin
                    positions[27] // nose bridge top
                );

                const faceWidth = calculateDistance(
                    positions[2], // left cheek
                    positions[14] // right cheek
                );

                // Calculate and display ratio
                const ratio = faceLength / faceWidth;
                
                faceRatioSpan.textContent = ratio.toFixed(2);
                faceLengthSpan.textContent = Math.round(faceLength);
                faceWidthSpan.textContent = Math.round(faceWidth);
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, 100);
}

function stopFaceDetection() {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
}

function calculateDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + 
        Math.pow(point2.y - point1.y, 2)
    );
}

function clearMeasurements() {
    faceRatioSpan.textContent = '-';
    faceLengthSpan.textContent = '-';
    faceWidthSpan.textContent = '-';
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
}

// Auth related functions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });

        if (response.ok) {
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem('token', token);
            updateAuthUI();
            authModal.classList.add('hidden');
            loginForm.reset();
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            alert('Account created successfully! Please log in.');
            signupForm.reset();
            showLoginLink.click();
        } else {
            alert('Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup.');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    updateAuthUI();
    userMenu.classList.add('hidden');
});

deleteAccountBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('token');
                token = null;
                updateAuthUI();
                userMenu.classList.add('hidden');
                alert('Account deleted successfully.');
            } else {
                alert('Failed to delete account.');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            alert('An error occurred while deleting your account.');
        }
    }
});

function updateAuthUI() {
    if (token) {
        authBtn.textContent = 'Account';
        userMenu.classList.add('hidden');
    } else {
        authBtn.textContent = 'Login / Sign Up';
    }
}
