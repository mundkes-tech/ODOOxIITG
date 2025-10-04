/**
 * Employee Wallet Dashboard Component
 * Visualizes total amounts due to employee segmented by financial status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { 
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Bell,
  BellOff,
  Info,
  AlertCircle,
  Calendar,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface WalletSummary {
  totalAmountDue: number;
  financialSummary: {
    pendingApproval: {
      count: number;
      totalAmount: number;
      currency: string;
    };
    approved: {
      count: number;
      totalAmount: number;
      currency: string;
    };
    readyForPayment: {
      count: number;
      totalAmount: number;
      currency: string;
    };
    paid: {
      count: number;
      totalAmount: number;
      currency: string;
    };
    rejected: {
      count: number;
      totalAmount: number;
      currency: string;
    };
  };
  currencyBreakdown: Array<{
    currency: string;
    amounts: {
      pendingApproval: number;
      approved: number;
      readyForPayment: number;
      paid: number;
      rejected: number;
    };
  }>;
  lastUpdated: string;
  metadata: {
    totalExpenses: number;
    averageExpenseAmount: number;
    lastExpenseDate?: string;
    firstExpenseDate?: string;
    preferredCurrency: string;
  };
}

interface WalletNotification {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

const EmployeeWalletDashboard: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [notifications, setNotifications] = useState<WalletNotification[]>([]);

  // Fetch wallet summary
  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['employee-wallet'],
    queryFn: () => api.get('/smart-finance/wallet'),
  });

  // Fetch wallet notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['wallet-notifications'],
    queryFn: () => api.get('/smart-finance/wallet/notifications'),
  });

  // Update wallet mutation
  const updateWalletMutation = useMutation({
    mutationFn: () => api.put('/smart-finance/wallet/update'),
    onSuccess: () => {
      refetch();
      toast.success('Wallet updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update wallet');
    },
  });

  const wallet: WalletSummary = walletData?.data || {
    totalAmountDue: 0,
    financialSummary: {
      pendingApproval: { count: 0, totalAmount: 0, currency: 'USD' },
      approved: { count: 0, totalAmount: 0, currency: 'USD' },
      readyForPayment: { count: 0, totalAmount: 0, currency: 'USD' },
      paid: { count: 0, totalAmount: 0, currency: 'USD' },
      rejected: { count: 0, totalAmount: 0, currency: 'USD' }
    },
    currencyBreakdown: [],
    lastUpdated: new Date().toISOString(),
    metadata: {
      totalExpenses: 0,
      averageExpenseAmount: 0,
      preferredCurrency: 'USD'
    }
  };

  // Update notifications when data changes
  useEffect(() => {
    if (notificationsData?.data) {
      setNotifications(notificationsData.data);
    }
  }, [notificationsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendingApproval':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-blue-600 bg-blue-100';
      case 'readyForPayment':
        return 'text-green-600 bg-green-100';
      case 'paid':
        return 'text-gray-600 bg-gray-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendingApproval':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'readyForPayment':
        return <CreditCard className="w-4 h-4" />;
      case 'paid':
        return <DollarSign className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Bell className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const calculateProgressPercentage = () => {
    const total = wallet.financialSummary.pendingApproval.totalAmount + 
                  wallet.financialSummary.approved.totalAmount + 
                  wallet.financialSummary.readyForPayment.totalAmount + 
                  wallet.financialSummary.paid.totalAmount;
    
    if (total === 0) return 0;
    
    return (wallet.financialSummary.paid.totalAmount / total) * 100;
  };

  const getTotalExpenses = () => {
    return Object.values(wallet.financialSummary).reduce((sum, status) => sum + status.count, 0);
  };

  const getTotalAmount = () => {
    return Object.values(wallet.financialSummary).reduce((sum, status) => sum + status.totalAmount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>My Wallet</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Track your expense reimbursements and payment status
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => updateWalletMutation.mutate()}
            disabled={updateWalletMutation.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${updateWalletMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
          >
            {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert className={getSeverityColor(notification.severity)}>
                {getSeverityIcon(notification.severity)}
                <AlertDescription>
                  {notification.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Amount Due */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Total Amount Due</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold text-green-600"
                >
                  ${wallet.totalAmountDue.toFixed(2)}
                </motion.div>
                <p className="text-gray-600 mt-2">Ready for reimbursement</p>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment Progress</span>
                  <span>{calculateProgressPercentage().toFixed(1)}%</span>
                </div>
                <Progress value={calculateProgressPercentage()} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pending</span>
                  <span>Paid</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getTotalExpenses()}
              </div>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${wallet.metadata.averageExpenseAmount.toFixed(0)}
              </div>
              <p className="text-sm text-gray-600">Average Amount</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {wallet.financialSummary.readyForPayment.count}
              </div>
              <p className="text-sm text-gray-600">Ready for Payment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(wallet.financialSummary).map(([status, data]) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {status.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-gray-500">{data.count} expenses</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">
                    ${data.totalAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">{data.currency}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currency Breakdown */}
                {wallet.currencyBreakdown.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">By Currency</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wallet.currencyBreakdown.map((currencyData) => (
                        <div key={currencyData.currency} className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">{currencyData.currency}</h5>
                          <div className="space-y-1 text-sm">
                            {Object.entries(currencyData.amounts).map(([status, amount]) => (
                              <div key={status} className="flex justify-between">
                                <span className="capitalize">
                                  {status.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="font-medium">
                                  {amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h4 className="font-semibold mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(wallet.lastUpdated).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Currency:</span>
                      <span>{wallet.metadata.preferredCurrency}</span>
                    </div>
                    {wallet.metadata.lastExpenseDate && (
                      <div className="flex justify-between">
                        <span>Last Expense:</span>
                        <span>{new Date(wallet.metadata.lastExpenseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {wallet.metadata.firstExpenseDate && (
                      <div className="flex justify-between">
                        <span>First Expense:</span>
                        <span>{new Date(wallet.metadata.firstExpenseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Statement</span>
        </Button>
        
        <Button variant="outline" className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Payment History</span>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWalletDashboard;
