// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  companyId: string;
  isAdmin?: boolean;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  currency: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  submittedBy: string;
  companyId: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  approvalComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token
const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Sign up
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    country: string;
    currency: string;
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  // Login
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await apiRequest<{ data: User }>('/auth/me');
    return response.data!;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      removeAuthToken();
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiRequest<{ token: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.data) {
      setAuthToken(response.data.token);
    }
    
    return response.data!;
  },
};

// User API
export const userAPI = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await apiRequest<{ data: User[] }>('/users');
    return response.data!;
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await apiRequest<{ data: User }>(`/users/${id}`);
    return response.data!;
  },

  // Create user
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    managerId?: string;
  }): Promise<User> => {
    const response = await apiRequest<{ data: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data!;
  },

  // Update user
  updateUser: async (id: string, userData: {
    name?: string;
    role?: string;
    managerId?: string;
  }): Promise<User> => {
    const response = await apiRequest<{ data: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data!;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Company API
export const companyAPI = {
  // Get company details
  getCompany: async (): Promise<Company> => {
    const response = await apiRequest<{ data: Company }>('/company/');
    return response.data!;
  },

  // Update company
  updateCompany: async (id: string, companyData: {
    name?: string;
    currency?: string;
    country?: string;
  }): Promise<Company> => {
    const response = await apiRequest<{ data: Company }>(`/company/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
    return response.data!;
  },

  // Delete company
  deleteCompany: async (id: string): Promise<void> => {
    await apiRequest(`/company/${id}`, {
      method: 'DELETE',
    });
  },
};

// Expense API
export const expenseAPI = {
  // Submit expense
  submitExpense: async (expenseData: {
    amount: number;
    currency: string;
    category: string;
    description: string;
    date?: string;
    receiptUrl?: string;
  }): Promise<Expense> => {
    const response = await apiRequest<{ data: Expense }>('/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    return response.data!;
  },

  // Get user expenses
  getUserExpenses: async (status?: string): Promise<Expense[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiRequest<{ data: Expense[] }>(`/expenses/${params}`);
    return response.data!;
  },

  // Get expense by ID
  getExpense: async (id: string): Promise<Expense> => {
    const response = await apiRequest<{ data: Expense }>(`/expenses/${id}`);
    return response.data!;
  },

  // Update expense
  updateExpense: async (id: string, expenseData: {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
  }): Promise<Expense> => {
    const response = await apiRequest<{ data: Expense }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
    return response.data!;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    await apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Approve expense
  approveExpense: async (id: string, comment?: string): Promise<Expense> => {
    const response = await apiRequest<{ data: Expense }>(`/expenses/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
    return response.data!;
  },

  // Reject expense
  rejectExpense: async (id: string, comment: string): Promise<Expense> => {
    const response = await apiRequest<{ data: Expense }>(`/expenses/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
    return response.data!;
  },

  // Escalate expense
  escalateExpense: async (id: string, comment: string, escalateTo: string): Promise<Expense> => {
    const response = await apiRequest<{ data: Expense }>(`/expenses/${id}/escalate`, {
      method: 'PUT',
      body: JSON.stringify({ comment, escalateTo }),
    });
    return response.data!;
  },

  // Get expense history
  getExpenseHistory: async (userId: string): Promise<Expense[]> => {
    const response = await apiRequest<{ data: Expense[] }>(`/expenses/history?userId=${userId}`);
    return response.data!;
  },
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<any> => {
    const response = await apiRequest<{ data: any }>('/analytics/dashboard');
    return response.data!;
  },
};

// Notification API
export const notificationAPI = {
  // Get notifications
  getNotifications: async (isRead?: boolean): Promise<any[]> => {
    const params = isRead !== undefined ? `?isRead=${isRead}` : '';
    const response = await apiRequest<{ data: any[] }>(`/notifications/${params}`);
    return response.data!;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<any> => {
    const response = await apiRequest<{ data: any }>(`/notifications/mark-read/${id}`, {
      method: 'PUT',
    });
    return response.data!;
  },
};

// OCR API
export const ocrAPI = {
  // Upload receipt
  uploadReceipt: async (imageUrl: string): Promise<any> => {
    const response = await apiRequest<{ data: any }>('/ocr/upload', {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });
    return response.data!;
  },

  // Get OCR data
  getOCRData: async (id: string): Promise<any> => {
    const response = await apiRequest<{ data: any }>(`/ocr/${id}`);
    return response.data!;
  },
};

// Settings API
export const settingsAPI = {
  // Get approval rules
  getApprovalRules: async (): Promise<any[]> => {
    const response = await apiRequest<{ data: any[] }>('/settings/approval-rules');
    return response.data!;
  },

  // Add approval rule
  addApprovalRule: async (ruleData: any): Promise<any> => {
    const response = await apiRequest<{ data: any }>('/settings/approval-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
    return response.data!;
  },

  // Update approval rule
  updateApprovalRule: async (id: string, ruleData: any): Promise<any> => {
    const response = await apiRequest<{ data: any }>(`/settings/approval-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
    return response.data!;
  },

  // Delete approval rule
  deleteApprovalRule: async (id: string): Promise<void> => {
    await apiRequest(`/settings/approval-rules/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  authAPI,
  userAPI,
  companyAPI,
  expenseAPI,
  analyticsAPI,
  notificationAPI,
  ocrAPI,
  settingsAPI,
};
