/**
 * Currency Rate Display Component
 * Shows locked conversion rate and final converted amount for expense submission
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { 
  RefreshCw,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calculator,
  Info
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface CurrencyRateDisplayProps {
  expenseId?: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  onRateLocked?: (rateData: any) => void;
  onAmountConverted?: (convertedAmount: number) => void;
  className?: string;
}

interface RateLockData {
  exchangeRate: number;
  convertedAmount: number;
  expiresAt: string;
  isValid: boolean;
  fromCurrency: string;
  toCurrency: string;
  lockedAt: string;
}

const CurrencyRateDisplay: React.FC<CurrencyRateDisplayProps> = ({
  expenseId,
  fromCurrency,
  toCurrency,
  amount,
  onRateLocked,
  onAmountConverted,
  className
}) => {
  const [rateLockData, setRateLockData] = useState<RateLockData | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Lock exchange rate mutation
  const lockRateMutation = useMutation({
    mutationFn: (data: any) => api.post('/smart-finance/currency/lock-rate', data),
    onSuccess: (response) => {
      const data = response.data;
      setRateLockData(data);
      setIsLocked(true);
      onRateLocked?.(data);
      toast.success('Exchange rate locked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to lock exchange rate');
    },
  });

  // Convert amount mutation
  const convertAmountMutation = useMutation({
    mutationFn: ({ expenseId, amount }: { expenseId: string; amount: number }) =>
      api.post(`/smart-finance/currency/convert/${expenseId}`, { amount }),
    onSuccess: (response) => {
      const data = response.data;
      onAmountConverted?.(data.convertedAmount);
      toast.success('Amount converted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to convert amount');
    },
  });

  // Get existing rate lock
  const getRateLockMutation = useMutation({
    mutationFn: (expenseId: string) => api.get(`/smart-finance/currency/rate-lock/${expenseId}`),
    onSuccess: (response) => {
      const data = response.data;
      setRateLockData(data);
      setIsLocked(data.isValid);
    },
    onError: () => {
      // No existing rate lock, this is normal for new expenses
    },
  });

  // Handle rate locking
  const handleLockRate = () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    lockRateMutation.mutate({
      expenseId: expenseId || 'temp',
      fromCurrency,
      toCurrency,
      amount
    }).finally(() => {
      setIsLoading(false);
    });
  };

  // Handle amount conversion
  const handleConvertAmount = () => {
    if (!expenseId || !rateLockData) {
      toast.error('No valid rate lock found');
      return;
    }

    convertAmountMutation.mutate({
      expenseId,
      amount
    });
  };

  // Calculate time remaining
  useEffect(() => {
    if (!rateLockData?.expiresAt) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(rateLockData.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setIsLocked(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [rateLockData]);

  // Load existing rate lock on mount
  useEffect(() => {
    if (expenseId) {
      getRateLockMutation.mutate(expenseId);
    }
  }, [expenseId]);

  // Calculate converted amount when rate changes
  useEffect(() => {
    if (rateLockData && amount > 0) {
      const convertedAmount = amount * rateLockData.exchangeRate;
      onAmountConverted?.(convertedAmount);
    }
  }, [rateLockData, amount, onAmountConverted]);

  const getRateTrend = () => {
    // This would typically compare with historical rates
    // For now, we'll show a neutral trend
    return 'neutral';
  };

  const getRateTrendIcon = () => {
    const trend = getRateTrend();
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Currency Conversion</h3>
            </div>
            
            {isLocked && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Rate Locked</span>
              </Badge>
            )}
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">From</p>
              <p className="font-bold text-lg">{fromCurrency}</p>
              <p className="text-sm text-gray-500">{amount.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              {getRateTrendIcon()}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">To</p>
              <p className="font-bold text-lg">{toCurrency}</p>
              <p className="text-sm text-gray-500">
                {rateLockData ? (amount * rateLockData.exchangeRate).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          {/* Exchange Rate Display */}
          {rateLockData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600">Exchange Rate</p>
                  <p className="font-bold text-lg text-blue-800">
                    1 {fromCurrency} = {rateLockData.exchangeRate.toFixed(4)} {toCurrency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Locked At</p>
                  <p className="text-sm text-blue-800">
                    {new Date(rateLockData.lockedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Expires in:</span>
                </div>
                <span className={`text-sm font-medium ${
                  timeRemaining === 'Expired' ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {timeRemaining}
                </span>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            {!isLocked ? (
              <Button
                onClick={handleLockRate}
                disabled={isLoading || !amount || amount <= 0}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Locking Rate...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Exchange Rate
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleConvertAmount}
                disabled={!expenseId || !rateLockData}
                className="flex-1"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Convert Amount
              </Button>
            )}
          </div>

          {/* Information Alert */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Exchange rates are locked for 24 hours to protect against currency fluctuations. 
              The rate will be applied when you submit the expense.
            </AlertDescription>
          </Alert>

          {/* Status Messages */}
          <AnimatePresence>
            {lockRateMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Failed to lock exchange rate. Please try again.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  Exchange rate locked successfully. You can now submit the expense with confidence.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyRateDisplay;
