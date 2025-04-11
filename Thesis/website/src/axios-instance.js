import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://django-firebase-psql-production.up.railway.app/',  
  headers: {
    'Content-Type': 'application/json',
    // 'ngrok-skip-browser-warning': 'true'
  },
});


axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
    } catch (error) {
      console.error('Error retrieving access token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);
export default axiosInstance;
