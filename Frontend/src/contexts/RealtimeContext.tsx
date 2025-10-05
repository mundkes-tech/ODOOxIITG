/**
 * Realtime Context
 * Provides real-time data and WebSocket connection management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import realtimeService from '@/services/realtimeService';
import { toast } from 'sonner';

interface RealtimeContextType {
  isConnected: boolean;
  connectionState: string;
  connect: () => void;
  disconnect: () => void;
  emitExpenseUpdate: (data: any) => void;
  emitApprovalUpdate: (data: any) => void;
  emitNotification: (data: any) => void;
  emitSyncRequest: (data: any) => void;
  realtimeData: {
    notifications: any[];
    pendingTasks: any[];
    recentActivity: any[];
    companyStats: any;
    integrationStatus: any;
  };
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [realtimeData, setRealtimeData] = useState({
    notifications: [],
    pendingTasks: [],
    recentActivity: [],
    companyStats: {},
    integrationStatus: {}
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  const connect = () => {
    if (!user) return;

    // Set up event handlers
    realtimeService.setEventHandlers({
      onConnect: () => {
        setIsConnected(true);
        setConnectionState('connected');
        console.log('Real-time service connected');
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        console.log('Real-time service disconnected');
      },
      onError: (error) => {
        console.error('Real-time service error:', error);
        toast.error('Connection Error', {
          description: 'Unable to maintain real-time connection'
        });
      },
      onExpenseUpdated: (data) => {
        // Update local state with new expense data
        setRealtimeData(prev => ({
          ...prev,
          recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
        }));
      },
      onApprovalUpdated: (data) => {
        // Update approval status
        setRealtimeData(prev => ({
          ...prev,
          recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
        }));
      },
      onNotification: (data) => {
        // Add new notification
        setRealtimeData(prev => ({
          ...prev,
          notifications: [data.notification, ...prev.notifications.slice(0, 19)]
        }));
      },
      onIntegrationSynced: (data) => {
        // Update integration status
        setRealtimeData(prev => ({
          ...prev,
          integrationStatus: {
            ...prev.integrationStatus,
            [data.integrationType]: {
              ...prev.integrationStatus[data.integrationType],
              lastSync: new Date().toISOString(),
              status: 'synced'
            }
          }
        }));
      },
      onTransactionMatched: (data) => {
        // Update transaction matching status
        toast.success('Transaction Matched', {
          description: `Transaction has been successfully matched with expense`
        });
      },
      onGLMappingCreated: (data) => {
        // Update GL mapping status
        toast.success('GL Mapping Created', {
          description: `New GL mapping for ${data.expenseCategory} has been created`
        });
      },
      onTravelBookingsSynced: (data) => {
        // Update travel bookings
        toast.success('Travel Bookings Synced', {
          description: `${data.bookingCount} travel bookings have been synced`
        });
      },
      onTravelExpensesPrePopulated: (data) => {
        // Update expense suggestions
        toast.success('Expense Suggestions Generated', {
          description: `${data.suggestionCount} expense suggestions have been generated`
        });
      }
    });

    // Connect to real-time service
    realtimeService.connect(user._id, user.companyId, user.role);
    
    // Join company room
    realtimeService.joinCompanyRoom(user.companyId);
    realtimeService.joinUserRoom(user._id);
  };

  const disconnect = () => {
    realtimeService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  };

  const emitExpenseUpdate = (data: any) => {
    realtimeService.emitExpenseUpdate(data);
  };

  const emitApprovalUpdate = (data: any) => {
    realtimeService.emitApprovalUpdate(data);
  };

  const emitNotification = (data: any) => {
    realtimeService.emitNotification(data);
  };

  const emitSyncRequest = (data: any) => {
    realtimeService.emitSyncRequest(data);
  };

  const value: RealtimeContextType = {
    isConnected,
    connectionState,
    connect,
    disconnect,
    emitExpenseUpdate,
    emitApprovalUpdate,
    emitNotification,
    emitSyncRequest,
    realtimeData
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export default RealtimeContext;
