
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants';

const api = axios.create({
    baseURL: Constants.expoConfig?.extra?.apiDevUrl,
})

api.interceptors.request.use(
    async (config) => {
      try {
        const token = await SecureStore.getItemAsync('my-jwt');
        if (token && config.headers) {
          config.headers.set('Authorization', `Bearer ${token}`);
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



export default api;