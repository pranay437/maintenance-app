// Utility functions for the Maintenance Request App

// API Configuration
const API_BASE_URL = 'http://localhost:3001';

// Local Storage helpers
function getAuthToken() {
  return localStorage.getItem('maintenance_app_token');
}

function setAuthToken(token) {
  localStorage.setItem('maintenance_app_token', token);
}

function getUserData() {
  const userData = localStorage.getItem('maintenance_app_user');
  return userData ? JSON.parse(userData) : null;
}

function setUserData(user) {
  localStorage.setItem('maintenance_app_user', JSON.stringify(user));
}

function clearAuthData() {
  localStorage.removeItem('maintenance_app_token');
  localStorage.removeItem('maintenance_app_user');
}

// Validation functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // At least 6 characters, contains letters and numbers
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
}

// Form error handling
function showFieldError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
  
  if (inputElement) {
    inputElement.closest('.form-group').classList.add('error');
  }
}

function clearFieldError(fieldName) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
  
  if (inputElement) {
    inputElement.closest('.form-group').classList.remove('error');
  }
}

function clearFormErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  const formGroups = document.querySelectorAll('.form-group.error');
  
  errorElements.forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  
  formGroups.forEach(el => {
    el.classList.remove('error');
  });
}

// Button loading state
function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  const textSpan = button.querySelector('.btn-text');
  const loadingSpan = button.querySelector('.btn-loading');
  
  if (isLoading) {
    button.disabled = true;
    if (textSpan) textSpan.style.display = 'none';
    if (loadingSpan) loadingSpan.style.display = 'flex';
  } else {
    button.disabled = false;
    if (textSpan) textSpan.style.display = 'inline-flex';
    if (loadingSpan) loadingSpan.style.display = 'none';
  }
}

// Toast notifications
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  // Remove existing classes
  toast.className = 'toast';
  
  // Add type class
  toast.classList.add(type);
  
  // Set message
  toast.textContent = message;
  
  // Show toast
  toast.classList.add('show');
  
  // Hide after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
  
  // Remove content after animation
  setTimeout(() => {
    toast.textContent = '';
    toast.className = 'toast';
  }, duration + 300);
}

// Date formatting
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return formatRelativeTime(dateString);
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = (now - date) / 1000;
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// API request helper
async function makeAuthenticatedRequest(url, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      clearAuthData();
      showToast('Session expired. Please login again.', 'error');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    showToast('Network error. Please check your connection.', 'error');
    return null;
  }
}

// Status badge helper
function getStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'status-pending';
    case 'in progress':
      return 'status-in-progress';
    case 'resolved':
      return 'status-resolved';
    default:
      return 'status-pending';
  }
}

function getStatusIcon(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return '⏳';
    case 'in progress':
      return '🔧';
    case 'resolved':
      return '✅';
    default:
      return '⏳';
  }
}

// Category helpers
function getCategoryIcon(category) {
  switch (category.toLowerCase()) {
    case 'electrical':
      return '⚡';
    case 'plumbing':
      return '🚰';
    case 'cleaning':
      return '🧹';
    case 'other':
      return '🔧';
    default:
      return '🔧';
  }
}

function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// Text helpers
function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// URL helpers
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function updateQueryParam(param, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }
  window.history.replaceState({}, '', url);
}

// Element helpers
function createElement(tag, className = '', textContent = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function showElement(element) {
  if (element) element.style.display = 'block';
}

function hideElement(element) {
  if (element) element.style.display = 'none';
}

function toggleElement(element) {
  if (element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  }
}

// Loading states
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = 'block';
  }
}

function hideLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = 'none';
  }
}

// Debounce function for search/filter
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

// Modal helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeModal(e.target.id);
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal[style*="block"]');
    openModals.forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// Form helpers
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    clearFormErrors();
  }
}

function serializeForm(form) {
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    // Handle multiple values for the same key
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

// Export functions for use in other scripts
window.utils = {
  // Auth
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  clearAuthData,
  
  // Validation
  isValidEmail,
  isValidPassword,
  
  // Form handling
  showFieldError,
  clearFieldError,
  clearFormErrors,
  setButtonLoading,
  resetForm,
  serializeForm,
  
  // UI
  showToast,
  showElement,
  hideElement,
  toggleElement,
  showLoading,
  hideLoading,
  openModal,
  closeModal,
  
  // Formatting
  formatDate,
  formatRelativeTime,
  getStatusBadgeClass,
  getStatusIcon,
  getCategoryIcon,
  formatCategory,
  truncateText,
  capitalizeFirst,
  
  // Helpers
  makeAuthenticatedRequest,
  createElement,
  debounce,
  getQueryParam,
  updateQueryParam
};