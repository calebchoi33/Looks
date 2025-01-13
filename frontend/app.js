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
const video = document.getElementById('video');

// Auth state
let token = localStorage.getItem('token');
updateAuthUI();

// Event Listeners
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

// Camera functionality
cameraBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        cameraBtn.classList.add('hidden');
        closeCamera.classList.remove('hidden');
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
    closeCamera.classList.add('hidden');
    cameraBtn.classList.remove('hidden');
});

// Helper functions
function updateAuthUI() {
    if (token) {
        authBtn.textContent = 'Account';
        userMenu.classList.add('hidden');
    } else {
        authBtn.textContent = 'Login / Sign Up';
    }
}
