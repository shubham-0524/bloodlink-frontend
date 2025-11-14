// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    verifyOtp: `${API_BASE_URL}/api/auth/verify-otp`,
    resendOtp: `${API_BASE_URL}/api/auth/resend-otp`,
    profile: `${API_BASE_URL}/api/auth/profile`,
    logout: `${API_BASE_URL}/api/auth/logout`
  },
  
  // User management endpoints
  users: {
    profile: `${API_BASE_URL}/api/users/profile`,
    stats: `${API_BASE_URL}/api/users/stats`,
    availability: `${API_BASE_URL}/api/users/availability`,
    nearbyDonors: `${API_BASE_URL}/api/users/nearby-donors`,
    pendingVerifications: `${API_BASE_URL}/api/users/pending-verifications`,
    getUserById: (userId) => `${API_BASE_URL}/api/users/${userId}`,
    verifyUser: (userId) => `${API_BASE_URL}/api/users/${userId}/verify`
  },
  
  // Blood request endpoints
  bloodRequests: {
    create: `${API_BASE_URL}/api/blood-requests`,
    list: `${API_BASE_URL}/api/blood-requests`,
    searchDonors: `${API_BASE_URL}/api/blood-requests/search-donors`,
    getById: (requestId) => `${API_BASE_URL}/api/blood-requests/${requestId}`,
    respond: (requestId) => `${API_BASE_URL}/api/blood-requests/${requestId}/respond`,
    cancel: (requestId) => `${API_BASE_URL}/api/blood-requests/${requestId}/cancel`
  }
};

// HTTP request helper with authentication
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      if (data.errors) {
        error.details = data.errors;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_BASE_URL;