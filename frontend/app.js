const API_URL = 'http://localhost:8000';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const logoutBtn = document.getElementById('logoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const cameraBtn = document.getElementById('cameraBtn');
const closeCamera = document.getElementById('closeCamera');
const video = document.getElementById('video');
const cameraContainer = document.getElementById('camera-container');

// Auth state
let token = localStorage.getItem('token');
if (token) {
    showApp();
}

// Event Listeners
showSignupLink.addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
});

showLoginLink.addEventListener('click', () => {
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

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
            localStorage.setItem('token', data.access_token);
            showApp();
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
    showAuth();
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
                alert('Account deleted successfully.');
                showAuth();
            } else {
                alert('Failed to delete account.');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            alert('An error occurred while deleting your account.');
        }
    }
});

// Camera functionality
cameraBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        cameraContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Camera error:', error);
        alert('Error accessing camera. Please make sure you have granted camera permissions.');
    }
});

closeCamera.addEventListener('click', () => {
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
    cameraContainer.classList.add('hidden');
});

// Helper functions
function showAuth() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

function showApp() {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
}
