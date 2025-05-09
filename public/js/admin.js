// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let currentData = {
  users: [],
  artworks: [],
  events: [],
  orders: []
};

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Set overview as default section
  showSection('overview');
  
  // Initialize dashboard data
  fetchDashboardData();
  
  // Initialize charts
  initializeCharts();
  
  // Add event listeners to search inputs and filters
  addEventListeners();
});

// Section visibility handling
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Remove active class from all sidebar links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Show selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.remove('hidden');
  }
  
  // Add active class to selected sidebar link
  const selectedLinks = document.querySelectorAll(`.sidebar-link[onclick="showSection('${sectionId}')"]`);
  selectedLinks.forEach(link => {
    link.classList.add('active');
  });
  
  // Load data for the selected section if needed
  if (sectionId === 'users' && currentData.users.length === 0) {
    fetchUsers();
  } else if (sectionId === 'artworks' && currentData.artworks.length === 0) {
    fetchArtworks();
  } else if (sectionId === 'events' && currentData.events.length === 0) {
    fetchEvents();
  } else if (sectionId === 'orders' && currentData.orders.length === 0) {
    fetchOrders();
  }
}

// Fetch dashboard data
function fetchDashboardData() {
  fetch('/api/admin/dashboard')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update count cards
      document.querySelector('#userCount').textContent = data.counts.users;
      document.querySelector('#artworkCount').textContent = data.counts.artworks;
      document.querySelector('#eventCount').textContent = data.counts.events;
      document.querySelector('#orderCount').textContent = data.counts.orders;
      
      // Update activities table
      updateActivitiesTable(data.activities);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      showNotification('Error loading dashboard data. Please try again.', 'error');
    });
}

// Update activities table
function updateActivitiesTable(activities) {
  const tableBody = document.querySelector('#activitiesTable tbody');
  tableBody.innerHTML = '';
  
  if (activities && activities.length > 0) {
    activities.forEach(activity => {
      const row = document.createElement('tr');
      
      const userCell = document.createElement('td');
      userCell.className = 'flex items-center';
      userCell.innerHTML = `
        <img src="${activity.user.profilePicture || '/default.jpg'}" alt="User" class="w-8 h-8 rounded-full mr-3">
        <span>${activity.user.name}</span>
      `;
      
      const actionCell = document.createElement('td');
      actionCell.textContent = activity.action;
      
      const resourceCell = document.createElement('td');
      resourceCell.textContent = activity.resource;
      
      const timeCell = document.createElement('td');
      timeCell.textContent = timeAgo(new Date(activity.timestamp));
      
      row.appendChild(userCell);
      row.appendChild(actionCell);
      row.appendChild(resourceCell);
      row.appendChild(timeCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 4;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No recent activities';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
}

// Initialize Charts
function initializeCharts() {
  // Monthly Sales Chart
  const salesCtx = document.getElementById('monthlySalesChart').getContext('2d');
  const monthlySalesChart = new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Sales ($)',
        data: [1200, 1900, 3000, 5000, 2000, 3000, 4500, 3800, 4000, 5500, 6500, 7000],
        backgroundColor: 'rgba(75, 85, 99, 0.2)',
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // User Growth Chart
  const userCtx = document.getElementById('userGrowthChart').getContext('2d');
  const userGrowthChart = new Chart(userCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'New Users',
        data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 90],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Add event listeners
function addEventListeners() {
  // User search
  const userSearchInput = document.querySelector('#userSearch');
  if (userSearchInput) {
    userSearchInput.addEventListener('input', debounce(() => {
      filterUsers(userSearchInput.value);
    }, 300));
  }
  
  // Artwork search
  const artworkSearchInput = document.querySelector('#artworkSearch');
  if (artworkSearchInput) {
    artworkSearchInput.addEventListener('input', debounce(() => {
      filterArtworks(artworkSearchInput.value);
    }, 300));
  }
  
  // Event search
  const eventSearchInput = document.querySelector('#eventSearch');
  if (eventSearchInput) {
    eventSearchInput.addEventListener('input', debounce(() => {
      filterEvents(eventSearchInput.value);
    }, 300));
  }
  
  // Order search
  const orderSearchInput = document.querySelector('#orderSearch');
  if (orderSearchInput) {
    orderSearchInput.addEventListener('input', debounce(() => {
      filterOrders(orderSearchInput.value);
    }, 300));
  }
  
  // Add other event listeners for filters, pagination, etc.
}

// Users CRUD operations
function fetchUsers() {
  fetch('/api/admin/users')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(users => {
      currentData.users = users;
      renderUsers(users);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      showNotification('Error loading users. Please try again.', 'error');
    });
}

function renderUsers(users, page = 1) {
  const tableBody = document.querySelector('#usersTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  // Calculate pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = users.slice(start, end);
  
  if (paginatedUsers.length > 0) {
    paginatedUsers.forEach(user => {
      const row = document.createElement('tr');
      
      // User info cell
      const userCell = document.createElement('td');
      userCell.className = 'flex items-center';
      userCell.innerHTML = `
        <img src="${user.profilePicture || '/default.jpg'}" alt="${user.username}" class="w-8 h-8 rounded-full mr-3">
        <div>
          <div class="font-medium">${user.username}</div>
          <div class="text-sm text-gray-500">${user.email}</div>
        </div>
      `;
      
      // Full name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = user.fullName || 'N/A';
      
      // Role cell
      const roleCell = document.createElement('td');
      let roleClass = '';
      
      switch (user.role) {
        case 'admin':
          roleClass = 'bg-red-100 text-red-800';
          break;
        case 'artist':
          roleClass = 'bg-blue-100 text-blue-800';
          break;
        default:
          roleClass = 'bg-gray-100 text-gray-800';
      }
      
      roleCell.innerHTML = `<span class="px-2 py-1 ${roleClass} rounded-full text-xs font-medium">${user.role}</span>`;
      
      // Joined date cell
      const joinedCell = document.createElement('td');
      joinedCell.textContent = new Date(user.createdAt).toLocaleDateString();
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'flex space-x-2';
      actionsCell.innerHTML = `
        <button onclick="editUser('${user._id}')" class="p-1 text-blue-600 hover:text-blue-800" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteUser('${user._id}')" class="p-1 text-red-600 hover:text-red-800" title="Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button onclick="viewUserDetails('${user._id}')" class="p-1 text-gray-600 hover:text-gray-800" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      `;
      
      row.appendChild(userCell);
      row.appendChild(nameCell);
      row.appendChild(roleCell);
      row.appendChild(joinedCell);
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 5;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No users found';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
  
  // Update pagination info
  updatePaginationInfo('users', users.length, page);
}

function filterUsers(query) {
  if (!query) {
    renderUsers(currentData.users);
    return;
  }
  
  query = query.toLowerCase();
  const filteredUsers = currentData.users.filter(user => 
    user.username.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query) || 
    (user.fullName && user.fullName.toLowerCase().includes(query))
  );
  
  renderUsers(filteredUsers);
}

function editUser(userId) {
  const user = currentData.users.find(u => u._id === userId);
  if (!user) return;
  
  // Create modal for editing user
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'editUserModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Edit User</h3>
        <button onclick="closeModal('editUserModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="editUserForm">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" id="username" name="username" value="${user.username}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" value="${user.email}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" id="fullName" name="fullName" value="${user.fullName || ''}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select id="role" name="role" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="artist" ${user.role === 'artist' ? 'selected' : ''}>Artist</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('editUserModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="updateUser('${userId}')" class="px-4 py-2 bg-black text-white rounded-md">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function updateUser(userId) {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const fullName = document.getElementById('fullName').value;
  const role = document.getElementById('role').value;
  
  // Validate inputs
  if (!username || !email) {
    showNotification('Username and email are required.', 'error');
    return;
  }
  
  fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, fullName, role })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update user in the current data
      const index = currentData.users.findIndex(u => u._id === userId);
      if (index !== -1) {
        currentData.users[index] = { ...currentData.users[index], ...data.user };
        renderUsers(currentData.users);
      }
      
      closeModal('editUserModal');
      showNotification('User updated successfully.', 'success');
    })
    .catch(error => {
      console.error('Error updating user:', error);
      showNotification('Error updating user. Please try again.', 'error');
    });
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        // Remove user from current data
        currentData.users = currentData.users.filter(u => u._id !== userId);
        renderUsers(currentData.users);
        showNotification('User deleted successfully.', 'success');
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user. Please try again.', 'error');
      });
  }
}

// Similar CRUD functions for artworks, events, and orders...
function fetchArtworks() {
  fetch('/api/admin/artworks')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(artworks => {
      currentData.artworks = artworks;
      renderArtworks(artworks);
    })
    .catch(error => {
      console.error('Error fetching artworks:', error);
      showNotification('Error loading artworks. Please try again.', 'error');
    });
}

function renderArtworks(artworks, page = 1) {
  const tableBody = document.querySelector('#artworksTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  // Calculate pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedArtworks = artworks.slice(start, end);
  
  if (paginatedArtworks.length > 0) {
    paginatedArtworks.forEach(artwork => {
      // Render artworks similar to renderUsers function
      // ...
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 7;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No artworks found';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
  
  // Update pagination info
  updatePaginationInfo('artworks', artworks.length, page);
}

// Helper functions
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
    type === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
    type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
    'bg-blue-100 text-blue-800 border-blue-300'
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${
        type === 'success' ? 'check-circle' :
        type === 'error' ? 'exclamation-circle' :
        'info-circle'
      } mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function updatePaginationInfo(entityType, totalItems, currentPage) {
  const paginationInfo = document.querySelector(`#${entityType}PaginationInfo`);
  if (!paginationInfo) return;
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, totalItems);
  
  paginationInfo.innerHTML = `
    Showing <span class="font-medium">${start}</span> to <span class="font-medium">${end}</span> of <span class="font-medium">${totalItems}</span> results
  `;
  
  // Update pagination buttons
  const paginationButtons = document.querySelector(`#${entityType}Pagination`);
  if (!paginationButtons) return;
  
  paginationButtons.innerHTML = '';
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn';
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => goToPage(entityType, currentPage - 1);
  paginationButtons.appendChild(prevButton);
  
  // Page buttons
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust the range to show 5 pages
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    pageButton.textContent = i;
    pageButton.onclick = () => goToPage(entityType, i);
    paginationButtons.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn';
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => goToPage(entityType, currentPage + 1);
  paginationButtons.appendChild(nextButton);
}

function goToPage(entityType, page) {
  currentPage = page;
  
  switch (entityType) {
    case 'users':
      renderUsers(currentData.users, page);
      break;
    case 'artworks':
      renderArtworks(currentData.artworks, page);
      break;
    case 'events':
      renderEvents(currentData.events, page);
      break;
    case 'orders':
      renderOrders(currentData.orders, page);
      break;
  }
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
} 