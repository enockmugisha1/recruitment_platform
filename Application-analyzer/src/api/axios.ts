import axios from "axios";

// Get base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed to false - cookies not needed for JWT
});

// Request interceptor - Add auth token to protected requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Public endpoints that don't need authentication (only for GET requests)
    const publicGETEndpoints = [
      '/access/jobs',  // Public job listings (GET only)
    ];
    
    // Auth endpoints that don't need token
    const authEndpoints = [
      '/auth/register/',
      '/auth/login/',
      '/auth/token/refresh/',
      '/auth/otp/request/',
      '/auth/otp/verify/',
      '/auth/password/reset/',
    ];
    
    // Check if this is a public GET request
    const isPublicGET = config.method?.toLowerCase() === 'get' && 
      publicGETEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    // Check if this is an auth endpoint
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Add token for all requests except public GETs and auth endpoints
    if (!isPublicGET && !isAuthEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added to request:', config.url);
      } else {
        console.warn('⚠️ No token found for protected request:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh for public endpoints
    const publicEndpoints = [
      '/auth/register/',
      '/auth/login/',
      '/auth/token/refresh/',
      '/auth/otp/request/',
      '/auth/otp/verify/',
      '/auth/password-reset/',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // If error is 401, not a public endpoint, and we haven't tried to refresh yet
    if (error.response?.status === 401 && !isPublicEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refreshToken') || 
                           sessionStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request new access token
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Store new access token
        localStorage.setItem('accessToken', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;