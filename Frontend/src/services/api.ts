// API service for backend communication
const API_BASE_URL = 'https://odooxiitg-1.onrender.com/api';

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

// Integration API
export const integrationAPI = {
  // Corporate Card Integration
  corporateCard: {
    syncTransactions: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/integrations/corporate-card/sync', {
        method: 'POST',
      });
      return response.data!;
    },

    getMatches: async (params?: any): Promise<any> => {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiRequest<{ data: any }>(`/integrations/corporate-card/matches${queryParams}`);
      return response.data!;
    },

    matchTransaction: async (transactionId: string, expenseId: string): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/integrations/corporate-card/match/${transactionId}/${expenseId}`, {
        method: 'POST',
      });
      return response.data!;
    },
  },

  // Accounting System Integration
  accounting: {
    syncGLAccounts: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/integrations/accounting/sync-gl-accounts', {
        method: 'POST',
      });
      return response.data!;
    },

    createGLMapping: async (mappingData: any): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/integrations/accounting/gl-mappings', {
        method: 'POST',
        body: JSON.stringify(mappingData),
      });
      return response.data!;
    },

    getGLMappings: async (params?: any): Promise<any> => {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiRequest<{ data: any }>(`/integrations/accounting/gl-mappings${queryParams}`);
      return response.data!;
    },

    updateGLMapping: async (id: string, mappingData: any): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/integrations/accounting/gl-mappings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mappingData),
      });
      return response.data!;
    },

    deleteGLMapping: async (id: string): Promise<void> => {
      await apiRequest(`/integrations/accounting/gl-mappings/${id}`, {
        method: 'DELETE',
      });
    },

    syncExpenseToAccounting: async (expenseId: string, glAccountId: string): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/integrations/accounting/sync-expense/${expenseId}`, {
        method: 'POST',
        body: JSON.stringify({ glAccountId }),
      });
      return response.data!;
    },
  },

  // Travel Integration
  travel: {
    fetchBookings: async (params?: any): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/integrations/travel/fetch-bookings', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return response.data!;
    },

    getBookings: async (params?: any): Promise<any> => {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiRequest<{ data: any }>(`/integrations/travel/bookings${queryParams}`);
      return response.data!;
    },

    prePopulateExpenses: async (bookingId: string): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/integrations/travel/pre-populate/${bookingId}`, {
        method: 'POST',
      });
      return response.data!;
    },
  },

  // Integration Status
  getStatus: async (): Promise<any> => {
    const response = await apiRequest<{ data: any }>('/integrations/status');
    return response.data!;
  },
};

// Smart Finance API
export const smartFinanceAPI = {
  // Reimbursement Batch Operations
  reimbursementBatches: {
    createBatch: async (batchData: any): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/reimbursement-batches', {
        method: 'POST',
        body: JSON.stringify(batchData),
      });
      return response.data!;
    },

    getBatches: async (params?: any): Promise<any> => {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiRequest<{ data: any }>(`/smart-finance/reimbursement-batches${queryParams}`);
      return response.data!;
    },

    generatePaymentData: async (batchId: string, format: string): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/smart-finance/reimbursement-batches/${batchId}/generate-payment`, {
        method: 'POST',
        body: JSON.stringify({ format }),
      });
      return response.data!;
    },
  },

  // Currency Rate Locking Operations
  currency: {
    lockRate: async (rateData: any): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/currency/lock-rate', {
        method: 'POST',
        body: JSON.stringify(rateData),
      });
      return response.data!;
    },

    getRateLock: async (expenseId: string): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/smart-finance/currency/rate-lock/${expenseId}`);
      return response.data!;
    },

    convertAmount: async (expenseId: string, amount: number): Promise<any> => {
      const response = await apiRequest<{ data: any }>(`/smart-finance/currency/convert/${expenseId}`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      return response.data!;
    },
  },

  // Employee Wallet Operations
  wallet: {
    getWallet: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/wallet');
      return response.data!;
    },

    getCompanyWallets: async (params?: any): Promise<any> => {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiRequest<{ data: any }>(`/smart-finance/wallets${queryParams}`);
      return response.data!;
    },

    updateWallet: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/wallet/update', {
        method: 'PUT',
      });
      return response.data!;
    },

    getAnalytics: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/wallet/analytics');
      return response.data!;
    },

    getCurrencyBreakdown: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/wallet/currency-breakdown');
      return response.data!;
    },

    getNotifications: async (): Promise<any> => {
      const response = await apiRequest<{ data: any }>('/smart-finance/wallet/notifications');
      return response.data!;
    },
  },
};

// Real-time API
export const realtimeAPI = {
  // Emit real-time events
  emitExpenseUpdate: (expenseId: string, action: string): void => {
    console.log(`Emitting expense update: ${expenseId} - ${action}`);
    // This would typically be handled by the real-time service
  },

  emitApprovalUpdate: (expenseId: string, approverId: string, action: string): void => {
    console.log(`Emitting approval update: ${expenseId} - ${action} by ${approverId}`);
  },

  emitNotification: (userId: string, notification: any): void => {
    console.log(`Emitting notification to user: ${userId}`, notification);
  },

  // Request real-time sync
  requestSync: (integrationType: string, params?: any): void => {
    console.log(`Requesting sync for: ${integrationType}`, params);
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
  integrationAPI,
  smartFinanceAPI,
  realtimeAPI,
};
