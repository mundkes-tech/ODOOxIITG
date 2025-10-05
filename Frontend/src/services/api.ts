// API service for backend communication
// API_BASE_URL will be 'http://localhost:5000/api' or 'https://odooxiitg-1.onrender.com/api'
import { API_BASE_URL } from '../utils/apiConfig';

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

/**
 * Generic API request function
 */
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

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);
        const text = await response.text(); 
        
        // Handle no-content responses (e.g., DELETE returns 204)
        const data = text ? JSON.parse(text) : { success: response.ok, data: undefined };

        if (!response.ok) {
            // Throw a more informative error that includes the backend's message
            const errorMessage = data.error || data.message || `HTTP error! status: ${response.status} ${response.statusText}`;
            console.error(`[API Error] ${endpoint} failed with status ${response.status}:`, data);
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        // Log "Failed to fetch" errors with the full URL to ensure it's not a CORS/URL issue
        console.error(`[API Request Failed] Endpoint: ${endpoint}, URL: ${url}`, error);
        
        // Ensure error is re-thrown for calling functions to catch
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown network or API error occurred.');
    }
};

// --- Expense Response Mapping Helper ---
// Standardize the expense object, converting backend IDs (like _id) and nested user objects
const mapExpenseResponse = (expense: any): Expense => {
    if (!expense) throw new Error("Cannot map null or undefined expense data.");
    
    // Helper to extract ID from potentially nested user/manager object
    const resolveId = (field: any): string => {
        if (typeof field === 'object' && field !== null) {
            return field._id || field.id;
        }
        return field;
    };

    const mappedExpense: Expense = {
        ...expense,
        id: expense._id || expense.id, 
        // Ensure submittedBy is a string ID
        submittedBy: resolveId(expense.submittedBy),
        // Ensure approvedBy is a string ID or undefined
        approvedBy: expense.approvedBy ? resolveId(expense.approvedBy) : undefined,
    };
    
    // Clean up MongoDB _id field that can be confusing on the frontend
    delete (mappedExpense as any)._id;
    
    return mappedExpense;
};
// ---------------------------------------

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
        // Cast to AuthResponse as it returns top-level token (not nested in 'data')
        const response = await apiRequest<AuthResponse>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        }) as AuthResponse;
        
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
        }) as AuthResponse;
        
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
        const response = await apiRequest<{ data: { token: string } }>('/auth/refresh-token', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
        
        const tokenData = response.data;
        
        if (tokenData && tokenData.token) {
            setAuthToken(tokenData.token);
            return tokenData;
        }
        
        throw new Error('Failed to refresh token: Missing token in response.');
    },
};

// User API
export const userAPI = {
    // Get all users
    getUsers: async (): Promise<User[]> => {
        const response = await apiRequest<{ data: User[] }>('/users/');
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
        timezone?: string;
        address?: string;
        phone?: string;
        website?: string;
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

// Settings API
export const settingsAPI = {
    // Get all settings
    getSettings: async (): Promise<any> => {
        const response = await apiRequest<{ data: any }>('/settings');
        return response.data!;
    },

    // Update approval rules
    updateApprovalRules: async (rules: any[]): Promise<void> => {
        await apiRequest('/settings/approval-rules', {
            method: 'PUT',
            body: JSON.stringify({ rules }),
        });
    },

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

    // Update notification settings
    updateNotificationSettings: async (settings: any): Promise<void> => {
        await apiRequest('/settings/notifications', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    // Update system preferences
    updateSystemPreferences: async (preferences: any): Promise<void> => {
        await apiRequest('/settings/system', {
            method: 'PUT',
            body: JSON.stringify(preferences),
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
        const response = await apiRequest<{ data: any }>('/expenses/', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });
        return mapExpenseResponse(response.data!);
    },

    // Get user expenses
    getUserExpenses: async (status?: string): Promise<Expense[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await apiRequest<{ data: any[] }>(`/expenses${params}`);
        return response.data!.map(mapExpenseResponse);
    },

    // Get company expenses (Manager/Admin)
    getCompanyExpenses: async (status?: string, submittedBy?: string): Promise<Expense[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (submittedBy) params.append('submittedBy', submittedBy);
        const queryString = params.toString();
        const url = `/expenses/company${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiRequest<{ data: any[] }>(url);
        
        return response.data!.map(mapExpenseResponse);
    },

    // Get expense by ID
    getExpense: async (id: string): Promise<Expense> => {
        const response = await apiRequest<{ data: any }>(`/expenses/${id}`);
        return mapExpenseResponse(response.data!);
    },

    // Update expense
    updateExpense: async (id: string, expenseData: {
        amount?: number;
        category?: string;
        description?: string;
        date?: string;
    }): Promise<Expense> => {
        const response = await apiRequest<{ data: any }>(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
        });
        return mapExpenseResponse(response.data!);
    },

    // Delete expense
    deleteExpense: async (id: string): Promise<void> => {
        await apiRequest(`/expenses/${id}`, {
            method: 'DELETE',
        });
    },

    // Approve expense
    approveExpense: async (id: string, comment?: string, percentage?: number): Promise<Expense> => {
        if (!id) {
            throw new Error('Expense ID is required for approval');
        }
        
        const response = await apiRequest<{ data: any }>(`/expenses/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ comment, approvalPercentage: percentage }),
        });
        
        return mapExpenseResponse(response.data!);
    },

    // Reject expense
    rejectExpense: async (id: string, comment?: string): Promise<Expense> => {
        const response = await apiRequest<{ data: any }>(`/expenses/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ comment }),
        });
        return mapExpenseResponse(response.data!);
    },


    // Escalate expense
    escalateExpense: async (id: string, comment: string, escalateTo: string): Promise<Expense> => {
        const response = await apiRequest<{ data: any }>(`/expenses/${id}/escalate`, {
            method: 'PUT',
            body: JSON.stringify({ comment, escalateTo }),
        });
        return mapExpenseResponse(response.data!);
    },

    // Get expense history
    getExpenseHistory: async (userId: string): Promise<Expense[]> => {
        const response = await apiRequest<{ data: any[] }>(`/expenses/history?userId=${userId}`);
        return response.data!.map(mapExpenseResponse);
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
        const response = await apiRequest<{ data: any[] }>(`/notifications${params}`);
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