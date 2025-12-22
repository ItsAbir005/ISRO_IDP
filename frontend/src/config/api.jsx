// frontend/src/config/api.js

// Use environment variable or fallback to localhost for development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function for API calls with proper error handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};