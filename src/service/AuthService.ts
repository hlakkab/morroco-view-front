import axios from 'axios';

const API_URL = 'https://agence.mview.ma/api';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up request');
    }
  }
}; 