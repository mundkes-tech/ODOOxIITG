/**
 * Real-time Service
 * Handles WebSocket connections and real-time data streaming
 */

import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface RealtimeServiceConfig {
  url: string;
  options?: {
    auth?: {
      token: string;
    };
    transports?: string[];
  };
}

interface RealtimeEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onExpenseUpdated?: (data: any) => void;
  onApprovalUpdated?: (data: any) => void;
  onNotification?: (data: any) => void;
  onIntegrationSynced?: (data: any) => void;
  onTransactionMatched?: (data: any) => void;
  onGLMappingCreated?: (data: any) => void;
  onTravelBookingsSynced?: (data: any) => void;
  onTravelExpensesPrePopulated?: (data: any) => void;
}

class RealtimeService {
  private socket: Socket | null = null;
  private config: RealtimeServiceConfig;
  private eventHandlers: RealtimeEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: RealtimeServiceConfig) {
    this.config = config;
  }

  connect(userId: string, companyId: string, role: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.config.url, {
      ...this.config.options,
      auth: {
        ...this.config.options?.auth,
        userId,
        companyId,
        role
      }
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to real-time service');
      this.reconnectAttempts = 0;
      this.eventHandlers.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from real-time service:', reason);
      this.eventHandlers.onDisconnect?.();
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.eventHandlers.onError?.(error);
      this.handleReconnect();
    });

    // Business events
    this.socket.on('expense-updated', (data) => {
      console.log('Expense updated:', data);
      this.eventHandlers.onExpenseUpdated?.(data);
      
      // Show toast notification
      toast.success('Expense updated', {
        description: `Expense ${data.expense.description} has been updated`,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to expense details
            window.location.href = `/expenses/${data.expense._id}`;
          }
        }
      });
    });

    this.socket.on('approval-updated', (data) => {
      console.log('Approval updated:', data);
      this.eventHandlers.onApprovalUpdated?.(data);
      
      toast.success('Approval updated', {
        description: `Expense ${data.expense.description} has been ${data.action}`,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/expenses/${data.expense._id}`;
          }
        }
      });
    });

    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      this.eventHandlers.onNotification?.(data);
      
      toast.info(data.notification.title, {
        description: data.notification.message,
        duration: 5000
      });
    });

    this.socket.on('integration-synced', (data) => {
      console.log('Integration synced:', data);
      this.eventHandlers.onIntegrationSynced?.(data);
      
      toast.success('Integration synced', {
        description: `${data.integrationType} integration has been synced successfully`
      });
    });

    this.socket.on('transaction-matched', (data) => {
      console.log('Transaction matched:', data);
      this.eventHandlers.onTransactionMatched?.(data);
      
      toast.success('Transaction matched', {
        description: `Transaction ${data.transactionId} has been matched with expense ${data.expenseId}`
      });
    });

    this.socket.on('gl-mapping-created', (data) => {
      console.log('GL mapping created:', data);
      this.eventHandlers.onGLMappingCreated?.(data);
      
      toast.success('GL mapping created', {
        description: `GL mapping for ${data.expenseCategory} has been created`
      });
    });

    this.socket.on('travel-bookings-synced', (data) => {
      console.log('Travel bookings synced:', data);
      this.eventHandlers.onTravelBookingsSynced?.(data);
      
      toast.success('Travel bookings synced', {
        description: `${data.bookingCount} travel bookings have been synced`
      });
    });

    this.socket.on('travel-expenses-pre-populated', (data) => {
      console.log('Travel expenses pre-populated:', data);
      this.eventHandlers.onTravelExpensesPrePopulated?.(data);
      
      toast.success('Expense suggestions generated', {
        description: `${data.suggestionCount} expense suggestions have been generated`
      });
    });

    // Initial data events
    this.socket.on('initial-data', (data) => {
      console.log('Initial data received:', data);
      // Handle initial data loading
    });

    this.socket.on('company-data', (data) => {
      console.log('Company data received:', data);
      // Handle company-wide data updates
    });

    this.socket.on('integration-status', (data) => {
      console.log('Integration status received:', data);
      // Handle integration status updates
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Connection lost', {
        description: 'Unable to reconnect to real-time service. Please refresh the page.'
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, delay);
  }

  // Public methods for event handling
  setEventHandlers(handlers: RealtimeEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Emit events to server
  emitExpenseUpdate(data: any): void {
    this.socket?.emit('expense-updated', data);
  }

  emitApprovalUpdate(data: any): void {
    this.socket?.emit('approval-updated', data);
  }

  emitNotification(data: any): void {
    this.socket?.emit('notification-sent', data);
  }

  emitSyncRequest(data: any): void {
    this.socket?.emit('request-sync', data);
  }

  // Join rooms
  joinCompanyRoom(companyId: string): void {
    this.socket?.emit('join-company', { companyId });
  }

  joinUserRoom(userId: string): void {
    this.socket?.emit('join-user', { userId });
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.eventHandlers = {};
  }
}

// Create singleton instance
const realtimeService = new RealtimeService({
  url: import.meta.env.VITE_REALTIME_URL || 'http://localhost:5000',
  options: {
    transports: ['websocket', 'polling']
  }
});

export default realtimeService;
