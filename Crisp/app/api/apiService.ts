// import { API_URL } from '../../AuthContext/AuthContext'
import * as SecureStore from 'expo-secure-store';

export type UserDataType = {
    username: string;
    email: string;
    address: string;
    contact_number: string;
};

// const handleErrors = (response) => {
//     if(!response.ok){
//         throw new Error('Network Error!')
//     }
//     return response.data;
// }

export const citizenProfile = async (): Promise<UserDataType> => {
    const keys = ['username', 'email', 'address', 'contact_number'];

    const userData = await Promise.all(
        keys.map(async (key) => {
            const value = await SecureStore.getItemAsync(key);
            return [key, value];  // Return key-value pair
        })
    );

    return Object.fromEntries(userData) as UserDataType; // Specify return type
};

