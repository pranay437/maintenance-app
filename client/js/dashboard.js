// Dashboard functionality

// ✅ Base URL for backend API
const API_BASE = "";

// Utility for authenticated requests
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = getAuthToken();

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    }
  });
}


// Dashboard functionality

let currentUser = null;
let complaints = [];
let currentComplaintId = null;

// Initialize Student Dashboard
async function initializeStudentDashboard() {
  // Setup event listeners
  setupStudentEventListeners();
  
  // Load initial data
  await loadStudentComplaints();
  
  // Setup filters
  setupStudentFilters();
}

// Initialize Admin Dashboard  
async function initializeAdminDashboard() {
  // Setup event listeners
  setupAdminEventListeners();
  
  // Load initial data
  await loadAllComplaints();
  
  // Setup filters
  setupAdminFilters();
}

// Student Event Listeners
function setupStudentEventListeners() {
  // Complaint form submission
  const complaintForm = document.getElementById('complaintForm');
  if (complaintForm) {
    complaintForm.addEventListener('submit', handleComplaintSubmission);
  }
  
  // Toggle form visibility
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  if (toggleFormBtn) {
    toggleFormBtn.addEventListener('click', toggleComplaintForm);
  }
  
  // Refresh complaints
  const refreshBtn = document.getElementById('refreshComplaints');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadStudentComplaints());
  }
  
  // Photo upload functionality
  const selectPhotoBtn = document.getElementById('selectPhotoBtn');
  const problemPhoto = document.getElementById('problemPhoto');
  const removePhotoBtn = document.getElementById('removePhoto');
  
  if (selectPhotoBtn && problemPhoto) {
    selectPhotoBtn.addEventListener('click', () => problemPhoto.click());
    problemPhoto.addEventListener('change', handlePhotoSelection);
  }
  
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', removeSelectedPhoto);
  }
}

// Admin Event Listeners
function setupAdminEventListeners() {
  // Refresh all complaints
  const refreshAllBtn = document.getElementById('refreshAllComplaints');
  if (refreshAllBtn) {
    refreshAllBtn.addEventListener('click', () => loadAllComplaints());
  }
  
  // Status update modal
  const statusUpdateForm = document.getElementById('statusUpdateForm');
  if (statusUpdateForm) {
    statusUpdateForm.addEventListener('submit', handleStatusUpdate);
  }
  
  // Modal close buttons
  const closeModalBtn = document.getElementById('closeModal');
  const cancelUpdateBtn = document.getElementById('cancelUpdate');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => closeModal('statusModal'));
  }
  
  if (cancelUpdateBtn) {
    cancelUpdateBtn.addEventListener('click', () => closeModal('statusModal'));
  }
}

// Student Filters
function setupStudentFilters() {
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      filterStudentComplaints(e.target.value);
    });
  }
}

// Admin Filters
function setupAdminFilters() {
  const statusFilter = document.getElementById('adminStatusFilter');
  const categoryFilter = document.getElementById('adminCategoryFilter');
  
  if (statusFilter) {
    statusFilter.addEventListener('change', () => filterAdminComplaints());
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => filterAdminComplaints());
  }
}

// Handle complaint form submission
async function handleComplaintSubmission(e) {
  e.preventDefault();
  
  // Clear previous errors
  clearFormErrors();
  
  // Get form data
  const formData = new FormData(e.target);
  const data = {
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    category: formData.get('category')
  };
  
  // Client-side validation
  const errors = validateComplaintForm(data);
  if (Object.keys(errors).length > 0) {
    handleFormErrors(errors);
    return;
  }
  
  // Show loading state
  setButtonLoading('submitComplaintBtn', true);
  
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/complaints/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response && response.ok) {
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        showToast('Request submitted successfully!', 'success');
        
        // Reset form
        resetForm('complaintForm');
        removeSelectedPhoto();
        
        // Reload complaints
        await loadStudentComplaints();
        
        // Hide form
        toggleComplaintForm();
        
      } else {
        showToast(result.message || 'Failed to submit request', 'error');
      }
    }
    
  } catch (error) {
    console.error('Complaint submission error:', error);
    showToast('Failed to submit request. Please try again.', 'error');
  } finally {
    setButtonLoading('submitComplaintBtn', false);
  }
}

// Validate complaint form
function validateComplaintForm(data) {
  const errors = {};
  
  if (!data.title || data.title.length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  }
  
  if (!data.description || data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }
  
  if (!data.category) {
    errors.category = 'Please select a category';
  }
  
  return errors;
}

// Toggle complaint form visibility
function toggleComplaintForm() {
  const container = document.getElementById('complaintFormContainer');
  const button = document.getElementById('toggleFormBtn');
  
  if (container && button) {
    const isVisible = container.style.display !== 'none';
    
    if (isVisible) {
      container.style.display = 'none';
      button.textContent = 'Show Form';
    } else {
      container.style.display = 'block';
      button.textContent = 'Hide Form';
    }
  }
}

// Load student complaints
async function loadStudentComplaints() {
  showLoading('complaintsLoading');
  
  try {
    const response = await makeAuthenticatedRequest('/api/complaints/my');
    
    if (response && response.ok) {
      const result = await response.json();
      
      if (result.success) {
        complaints = result.complaints || [];
        renderStudentComplaints(complaints);
        updateStudentStats(complaints);
      } else {
        showToast('Failed to load complaints', 'error');
      }
    }
    
  } catch (error) {
    console.error('Load complaints error:', error);
    showToast('Failed to load complaints', 'error');
  } finally {
    hideLoading('complaintsLoading');
  }
}

// Load all complaints (admin)
async function loadAllComplaints() {
  showLoading('adminComplaintsLoading');
  
  try {
    const response = await makeAuthenticatedRequest('/api/complaints/all');
    
    if (response && response.ok) {
      const result = await response.json();
      
      if (result.success) {
        complaints = result.complaints || [];
        renderAdminComplaints(complaints);
        updateAdminStats(result.statistics || {});
      } else {
        showToast('Failed to load complaints', 'error');
      }
    }
    
  } catch (error) {
    console.error('Load all complaints error:', error);
    showToast('Failed to load complaints', 'error');
  } finally {
    hideLoading('adminComplaintsLoading');
  }
}

// Render student complaints
function renderStudentComplaints(complaintsList) {
  const container = document.getElementById('complaintsContainer');
  const noComplaints = document.getElementById('noComplaints');
  
  if (!container) return;
  
  if (complaintsList.length === 0) {
    container.innerHTML = '';
    showElement(noComplaints);
    return;
  }
  
  hideElement(noComplaints);
  
  container.innerHTML = complaintsList.map(complaint => `
    <div class="complaint-card">
      <div class="complaint-header">
        <div>
          <h3 class="complaint-title">${escapeHtml(complaint.title)}</h3>
          <div class="complaint-meta">
            <span>${getCategoryIcon(complaint.category)} ${formatCategory(complaint.category)}</span>
            <span>Submitted ${formatDate(complaint.createdAt)}</span>
          </div>
        </div>
        <div class="status-badge ${getStatusBadgeClass(complaint.status)}">
          ${getStatusIcon(complaint.status)} ${complaint.status}
        </div>
      </div>
      ${complaint.photo ? `<div class="complaint-photo"><img src="/api/uploads/${complaint.photo}" alt="Problem photo" style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: cover; margin: 10px 0; cursor: pointer;" onclick="viewPhoto('/api/uploads/${complaint.photo}')"></div>` : ''}
      <p class="complaint-description">${escapeHtml(truncateText(complaint.description))}</p>
      <div class="complaint-footer">
        <span class="complaint-date">Last updated: ${formatDate(complaint.updatedAt)}</span>
      </div>
    </div>
  `).join('');
}
// Render admin complaints
function renderAdminComplaints(complaintsList) {
  const container = document.getElementById('adminComplaintsContainer');
  const noComplaints = document.getElementById('adminNoComplaints');
  
  if (!container) return;
  
  if (complaintsList.length === 0) {
    container.innerHTML = '';
    showElement(noComplaints);
    return;
  }
  
  hideElement(noComplaints);
  
  container.innerHTML = complaintsList.map(complaint => {
    const userName = complaint.userId ? escapeHtml(complaint.userId.name) : "Unknown User";
    const userEmail = complaint.userId ? escapeHtml(complaint.userId.email) : "N/A";
    
    return `
      <div class="complaint-card">
        <div class="complaint-header">
          <div>
            <h3 class="complaint-title">${escapeHtml(complaint.title)}</h3>
            <div class="complaint-meta">
              <span>👤 ${userName} (${userEmail})</span>
              <span>${getCategoryIcon(complaint.category)} ${formatCategory(complaint.category)}</span>
              <span>Submitted ${formatDate(complaint.createdAt)}</span>
            </div>
          </div>
          <div class="status-badge ${getStatusBadgeClass(complaint.status)}">
            ${getStatusIcon(complaint.status)} ${complaint.status}
          </div>
        </div>
        ${complaint.photo ? `<div class="complaint-photo"><img src="/api/uploads/${complaint.photo}" alt="Problem photo" style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: cover; margin: 10px 0; cursor: pointer;" onclick="viewPhoto('/api/uploads/${complaint.photo}')"></div>` : ''}
        <p class="complaint-description">${escapeHtml(truncateText(complaint.description))}</p>
        <div class="complaint-footer">
          <span class="complaint-date">Last updated: ${formatDate(complaint.updatedAt)}</span>
          <div class="admin-actions">
            <button class="btn btn-sm action-btn action-btn-primary" onclick="openStatusModal('${complaint._id}')">
              Update Status
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


// Update student stats
function updateStudentStats(complaintsList) {
  const total = complaintsList.length;
  const pending = complaintsList.filter(c => c.status === 'pending').length;
  const inProgress = complaintsList.filter(c => c.status === 'in progress').length;
  const resolved = complaintsList.filter(c => c.status === 'resolved').length;
  
  updateStatElement('totalComplaints', total);
  updateStatElement('pendingComplaints', pending);
  updateStatElement('inProgressComplaints', inProgress);
  updateStatElement('resolvedComplaints', resolved);
}

// Update admin stats
function updateAdminStats(stats) {
  updateStatElement('adminTotalComplaints', stats.total || 0);
  updateStatElement('adminPendingComplaints', stats.pending || 0);
  updateStatElement('adminInProgressComplaints', stats.inProgress || 0);
  updateStatElement('adminResolvedComplaints', stats.resolved || 0);
}

// Update stat element
function updateStatElement(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    // Add animation
    element.style.transform = 'scale(1.1)';
    element.textContent = value;
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 150);
  }
}

// Filter student complaints
function filterStudentComplaints(status) {
  const filteredComplaints = status ? 
    complaints.filter(c => c.status === status) : 
    complaints;
  
  renderStudentComplaints(filteredComplaints);
}

// Filter admin complaints
function filterAdminComplaints() {
  const statusFilter = document.getElementById('adminStatusFilter').value;
  const categoryFilter = document.getElementById('adminCategoryFilter').value;
  
  let filteredComplaints = complaints;
  
  if (statusFilter) {
    filteredComplaints = filteredComplaints.filter(c => c.status === statusFilter);
  }
  
  if (categoryFilter) {
    filteredComplaints = filteredComplaints.filter(c => c.category === categoryFilter);
  }
  
  renderAdminComplaints(filteredComplaints);
}

// Open status update modal
function openStatusModal(complaintId) {
  const complaint = complaints.find(c => c._id === complaintId);
  if (!complaint) return;
  
  currentComplaintId = complaintId;
  
  // Safely handle missing userId
  const userName = complaint.userId ? complaint.userId.name : "Unknown User";
  
  // Populate modal with complaint details
  document.getElementById('modalComplaintTitle').textContent = complaint.title;
  document.getElementById('modalComplaintDescription').textContent = complaint.description;
  document.getElementById('modalComplaintUser').textContent = userName;
  document.getElementById('modalComplaintCategory').textContent = formatCategory(complaint.category);
  
  // Set current status in dropdown
  document.getElementById('newStatus').value = complaint.status;
  
  // Show modal
  openModal('statusModal');
}

// Handle status update
async function handleStatusUpdate(e) {
  e.preventDefault();
  
  if (!currentComplaintId) {
    showToast('No complaint selected', 'error');
    return;
  }
  
  const newStatus = document.getElementById('newStatus').value;
  
  if (!newStatus) {
    showToast('Please select a status', 'error');
    return;
  }
  
  // Show loading state
  setButtonLoading('confirmUpdate', true);
  
  try {
    const response = await makeAuthenticatedRequest(
      `/api/complaints/update/${currentComplaintId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      }
    );
    
    if (!response) {
      showToast('No response from server', 'error');
      return;
    }

    const result = await response.json();

    if (response.ok && result.success) {
      showToast('Status updated successfully!', 'success');
      
      // Close modal
      closeModal('statusModal');
      
      // Reload complaints (admin only)
      await loadAllComplaints();
    } else {
      console.error('Update error response:', result);
      showToast(result.message || 'Failed to update status', 'error');
    }
    
  } catch (error) {
    console.error('Status update error:', error);
    showToast('Failed to update status. Please try again.', 'error');
  } finally {
    setButtonLoading('confirmUpdate', false);
    currentComplaintId = null;
  }
}


// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleFormErrors(errors) {
  Object.keys(errors).forEach(field => {
    showFieldError(field, errors[field]);
  });
}

function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

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

// Auto-refresh data every 30 seconds
function setupAutoRefresh() {
  setInterval(async () => {
    const user = getUserData();
    if (!user) return;
    
    try {
      if (user.role === 'admin') {
        await loadAllComplaints();
      } else {
        await loadStudentComplaints();
      }
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }, 30000); // 30 seconds
}

// Photo handling functions
function handlePhotoSelection(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Photo size must be less than 5MB', 'error');
    e.target.value = '';
    return;
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    showToast('Only JPG, PNG, and GIF files are allowed', 'error');
    e.target.value = '';
    return;
  }
  
  // Show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewImage = document.getElementById('previewImage');
    const photoPreview = document.getElementById('photoPreview');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    
    if (previewImage && photoPreview && photoPlaceholder) {
      previewImage.src = e.target.result;
      photoPreview.style.display = 'block';
      photoPlaceholder.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

function removeSelectedPhoto() {
  const problemPhoto = document.getElementById('problemPhoto');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.getElementById('photoPlaceholder');
  const previewImage = document.getElementById('previewImage');
  
  if (problemPhoto) problemPhoto.value = '';
  if (previewImage) previewImage.src = '';
  if (photoPreview) photoPreview.style.display = 'none';
  if (photoPlaceholder) photoPlaceholder.style.display = 'block';
}

// Photo viewing function
function viewPhoto(photoUrl) {
  const modal = document.createElement('div');
  modal.className = 'photo-modal';
  modal.innerHTML = `
    <div class="photo-modal-content">
      <span class="photo-modal-close">&times;</span>
      <img src="${photoUrl}" alt="Problem photo" style="max-width: 90vw; max-height: 90vh; object-fit: contain;">
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.className === 'photo-modal-close') {
      document.body.removeChild(modal);
    }
  });
}

// Export dashboard functions
window.dashboard = {
  initializeStudentDashboard,
  initializeAdminDashboard,
  loadStudentComplaints,
  loadAllComplaints,
  openStatusModal,
  setupAutoRefresh,
  handlePhotoSelection,
  removeSelectedPhoto
};

window.viewPhoto = viewPhoto;

// Initialize auto-refresh
document.addEventListener('DOMContentLoaded', () => {
  setupAutoRefresh();
});