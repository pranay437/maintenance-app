// Authentication related functions

// Check if user is authenticated
function isAuthenticated() {
  const token = getAuthToken();
  return !!token;
}

// Check user role
function getUserRole() {
  const userData = getUserData();
  return userData ? userData.role : null;
}

// Redirect based on authentication status
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard';   // ✅ fixed
    return true;
  }
  return false;
}

function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = '/login';       // ✅ fixed
    return true;
  }
  return false;
}

// Auto-logout on token expiration
function setupAuthCheck() {
  setInterval(async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          clearAuthData();
          showToast('Session expired. Please login again.', 'error');
          setTimeout(() => {
            window.location.href = '/login';   // ✅ fixed
          }, 2000);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
  }, 5 * 60 * 1000);
}

// Initialize auth check on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setupAuthCheck();
  });
}

// Password strength checker
function checkPasswordStrength(password) {
  const strength = { score: 0, feedback: [] };

  if (password.length >= 8) strength.score += 1;
  else strength.feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) strength.score += 1;
  else strength.feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) strength.score += 1;
  else strength.feedback.push('Add uppercase letters');

  if (/\d/.test(password)) strength.score += 1;
  else strength.feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength.score += 1;
  else strength.feedback.push('Add special characters');

  if (strength.score === 5) {
    strength.level = 'very-strong';
    strength.text = 'Very Strong';
  } else if (strength.score === 4) {
    strength.level = 'strong';
    strength.text = 'Strong';
  } else if (strength.score === 3) {
    strength.level = 'medium';
    strength.text = 'Medium';
  } else if (strength.score >= 2) {
    strength.level = 'weak';
    strength.text = 'Weak';
  } else {
    strength.level = 'very-weak';
    strength.text = 'Very Weak';
  }
  
  return strength;
}

// Display password strength
function displayPasswordStrength(inputId, strengthContainerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(strengthContainerId);
  if (!input || !container) return;
  
  input.addEventListener('input', (e) => {
    const password = e.target.value;
    if (!password) {
      container.innerHTML = '';
      return;
    }
    
    const strength = checkPasswordStrength(password);
    container.innerHTML = `
      <div class="password-strength">
        <div class="strength-bar">
          <div class="strength-fill strength-${strength.level}" style="width: ${(strength.score / 5) * 100}%"></div>
        </div>
        <div class="strength-text">
          <span class="strength-level">${strength.text}</span>
          ${strength.feedback.length > 0 ? `<span class="strength-feedback">${strength.feedback.join(', ')}</span>` : ''}
        </div>
      </div>
    `;
  });
}

// Enhanced form validation
function validateRegistrationForm(formData) {
  const errors = {};
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const strength = checkPasswordStrength(formData.password);
    if (strength.score < 2) {
      errors.password = 'Password is too weak. ' + strength.feedback.join(', ');
    }
  }
  return errors;
}

function validateLoginForm(formData) {
  const errors = {};
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  return errors;
}

// Handle form submission errors
function handleFormErrors(errors) {
  clearFormErrors();
  Object.keys(errors).forEach(field => {
    showFieldError(field, errors[field]);
  });
  const firstErrorField = Object.keys(errors)[0];
  const firstErrorElement = document.getElementById(firstErrorField);
  if (firstErrorElement) firstErrorElement.focus();
}

// Login with remember me
async function loginUser(credentials, rememberMe = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    if (result.success) {
      setAuthToken(result.token);
      setUserData(result.user);
      if (rememberMe) {
        localStorage.setItem('maintenance_app_remember_email', credentials.email);
      } else {
        localStorage.removeItem('maintenance_app_remember_email');
      }
      return { success: true, user: result.user };
    } else {
      return { success: false, message: result.message, errors: result.errors };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

// Register user
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    if (result.success) {
      setAuthToken(result.token);
      setUserData(result.user);
      return { success: true, user: result.user };
    } else {
      return { success: false, message: result.message, errors: result.errors };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

// Logout user
function logoutUser() {
  clearAuthData();
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  window.location.href = '/login';   // ✅ fixed
}

// Auto-fill remembered email
function fillRememberedEmail() {
  const rememberedEmail = localStorage.getItem('maintenance_app_remember_email');
  const emailInput = document.getElementById('email');
  const rememberCheckbox = document.getElementById('rememberMe');
  
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
}

// Password visibility toggle
function setupPasswordToggle() {
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const input = toggle.parentElement.querySelector('input[type="password"], input[type="text"]');
      const icon = toggle.querySelector('.toggle-icon');
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
      } else {
        input.type = 'password';
        icon.textContent = '👁️';
      }
    });
  });
}

// Initialize auth-related features
function initializeAuthFeatures() {
  if (window.location.pathname.includes('login')) {
    fillRememberedEmail();
  }
  setupPasswordToggle();
  const passwordInput = document.getElementById('password');
  if (passwordInput && document.getElementById('password-strength')) {
    displayPasswordStrength('password', 'password-strength');
  }
}

// Demo account credentials
const DEMO_ACCOUNTS = {
  student: { email: 'john.student@example.com', password: 'password123', role: 'student' },
  admin:   { email: 'admin@hostel.com', password: 'admin123', role: 'admin' }
};

// Quick demo login
async function quickDemoLogin(role) {
  const credentials = DEMO_ACCOUNTS[role];
  if (!credentials) {
    showToast('Invalid demo account', 'error');
    return;
  }
  showToast('Logging in with demo account...', 'info');
  const result = await loginUser(credentials);
  if (result.success) {
    showToast('Demo login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';   // ✅ fixed
    }, 1000);
  } else {
    showToast(result.message || 'Demo login failed', 'error');
  }
}

// Create demo accounts
async function createDemoAccounts() {
  const accounts = [
    { name: 'John Doe', email: 'john.student@example.com', password: 'password123', hostelCode: 'HST001', hostelName: 'Demo Hostel' },
    { name: 'Admin User', email: 'admin@hostel.com', password: 'admin123', hostelCode: 'HST001', hostelName: 'Demo Hostel' },
    { name: 'Jane Smith', email: 'jane.student@example.com', password: 'password123', hostelCode: 'HST001', hostelName: 'Demo Hostel' }
  ];
  
  for (const account of accounts) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
    } catch (error) {
      console.log(`Demo account ${account.email} might already exist`);
    }
  }
}

// Social login placeholders
function setupSocialLogins() {
  const googleLogin = document.getElementById('googleLogin');
  const githubLogin = document.getElementById('githubLogin');
  if (googleLogin) {
    googleLogin.addEventListener('click', () => showToast('Google login coming soon!', 'info'));
  }
  if (githubLogin) {
    githubLogin.addEventListener('click', () => showToast('GitHub login coming soon!', 'info'));
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeAuthFeatures();
  setupSocialLogins();
  if (window.location.hostname === 'localhost') {
    setTimeout(createDemoAccounts, 1000);
  }
});

// Export auth functions
window.auth = {
  isAuthenticated,
  getUserRole,
  redirectIfAuthenticated,
  redirectIfNotAuthenticated,
  validateRegistrationForm,
  validateLoginForm,
  handleFormErrors,
  loginUser,
  registerUser,
  logoutUser,
  quickDemoLogin,
  checkPasswordStrength,
  fillRememberedEmail,
  DEMO_ACCOUNTS
};
