import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    accountNumber: string;
    balance: number;
  };
}

interface UserUpdateData {
  name?: string;
  email?: string;
  settings?: {
    biometricLogin?: boolean;
    twoFactorAuth?: boolean;
    notifications?: {
      email?: boolean;
      push?: boolean;
      transactions?: boolean;
      promotions?: boolean;
    };
    appearance?: {
      theme?: string;
    };
  };
}

interface TransactionData {
  type: 'send' | 'receive' | 'withdraw' | 'exchange';
  amount: number;
  recipient: string;
}

export const authService = {
  register: (userData: object) => api.post<AuthResponse>('/auth/register', userData),
  login: (credentials: object) => api.post<AuthResponse>('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const userService = {
  updateProfile: (data: UserUpdateData) => api.put('/user/profile', data),
  toggleCardStatus: (cardId: string) => api.put(`/user/cards/${cardId}`),
  updateSettings: (data: object) => api.put('/user/settings', data),
  addTransaction: (data: TransactionData) => api.post('/user/transactions', data),
};

export default api;
