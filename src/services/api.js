/**
 * API Service - Handles all API communication with the backend
 * Provides methods for NLQ operations, query execution, and data fetching
 */

import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://avirat-empire-api.store/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad Request');
        case 401:
          throw new Error('Unauthorized access');
        case 403:
          throw new Error('Forbidden access');
        case 404:
          throw new Error('Resource not found');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('Internal server error');
        default:
          throw new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

/**
 * NLQ API Service
 */
export const nlqAPI = {
  /**
   * Process natural language query
   * @param {string} query - Natural language query
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Query result
   */
  async processQuery(query, options = {}) {
    const response = await api.post('/nlq/query', {
      query,
      language: options.language || 'en',
      options: {
        includeExplanation: options.includeExplanation !== false,
        validateBeforeExecution: options.validateBeforeExecution !== false,
        maxResults: options.maxResults || 1000,
        ...options
      }
    });
    return response.data;
  },

  /**
   * Generate SQL without execution
   * @param {string} query - Natural language query
   * @param {string} language - Query language
   * @returns {Promise<Object>} SQL generation result
   */
  async generateSQL(query, language = 'en') {
    const response = await api.post('/nlq/generate-sql', {
      query,
      language
    });
    return response.data;
  },

  /**
   * Execute SQL query
   * @param {string} sql - SQL query
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeSQL(sql, options = {}) {
    const response = await api.post('/nlq/execute-sql', {
      sql,
      options: {
        maxResults: options.maxResults || 1000,
        ...options
      }
    });
    return response.data;
  },

  /**
   * Get query suggestions
   * @param {string} query - Partial query string
   * @returns {Promise<Object>} Suggestions result
   */
  async getSuggestions(query = '') {
    const response = await api.get('/nlq/suggestions', {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Get database schema information
   * @returns {Promise<Object>} Schema information
   */
  async getSchema() {
    const response = await api.get('/nlq/schema');
    return response.data;
  },

  /**
   * Add table relationship
   * @param {Object} relationship - Relationship data
   * @returns {Promise<Object>} Operation result
   */
  async addRelationship(relationship) {
    const response = await api.post('/nlq/relationships', relationship);
    return response.data;
  },

  /**
   * Refresh schema metadata
   * @returns {Promise<Object>} Operation result
   */
  async refreshSchema() {
    const response = await api.post('/nlq/refresh-schema');
    return response.data;
  },

  /**
   * Get service health status
   * @returns {Promise<Object>} Health status
   */
  async getHealth() {
    const response = await api.get('/nlq/health');
    return response.data;
  },

  /**
   * Get service statistics
   * @returns {Promise<Object>} Service statistics
   */
  async getStats() {
    const response = await api.get('/nlq/stats');
    return response.data;
  }
};

/**
 * Dashboard API Service
 */
export const dashboardAPI = {
  /**
   * Get dashboard metrics (KPIs)
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getMetrics() {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },

  /**
   * Get revenue trend data
   * @returns {Promise<Object>} Revenue trend data
   */
  async getRevenueTrend() {
    const response = await api.get('/dashboard/revenue-trend');
    return response.data;
  },

  /**
   * Get sales data by category
   * @returns {Promise<Object>} Sales by category data
   */
  async getSalesByCategory() {
    const response = await api.get('/dashboard/sales-by-category');
    return response.data;
  },

  /**
   * Get top selling products
   * @returns {Promise<Object>} Top products data
   */
  async getTopProducts() {
    const response = await api.get('/dashboard/top-products');
    return response.data;
  },

  /**
   * Get recent orders
   * @param {number} limit - Number of orders to fetch
   * @returns {Promise<Object>} Recent orders data
   */
  async getRecentOrders(limit = 5) {
    const response = await api.get('/dashboard/recent-orders', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get all dashboard data in one request
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getAllData() {
    const response = await api.get('/dashboard/all');
    return response.data;
  }
};

/**
 * Utility functions for API operations
 */
export const apiUtils = {
  /**
   * Check if API is available
   * @returns {Promise<boolean>} API availability status
   */
  async isAvailable() {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get API base URL
   * @returns {string} API base URL
   */
  getBaseURL() {
    return api.defaults.baseURL;
  },

  /**
   * Set API base URL
   * @param {string} url - New base URL
   */
  setBaseURL(url) {
    api.defaults.baseURL = url;
  },

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Error handling utilities
 */
export const errorHandler = {
  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    if (error.message) {
      return error.message;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    return 'An unexpected error occurred';
  },

  /**
   * Check if error is a network error
   * @param {Error} error - Error object
   * @returns {boolean} True if network error
   */
  isNetworkError(error) {
    return !error.response && error.request;
  },

  /**
   * Check if error is a timeout error
   * @param {Error} error - Error object
   * @returns {boolean} True if timeout error
   */
  isTimeoutError(error) {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  },

  /**
   * Check if error is a rate limit error
   * @param {Error} error - Error object
   * @returns {boolean} True if rate limit error
   */
  isRateLimitError(error) {
    return error.response?.status === 429 || error.message.includes('rate limit');
  }
};

export default api;
