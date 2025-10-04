/**
 * Corporate Card Matching Component
 * UI for matching corporate card transactions with expenses
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  Building,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface CorporateCardTransaction {
  _id: string;
  externalId: string;
  cardNumber: string;
  cardholder: string;
  transactionDate: string;
  amount: number;
  currency: string;
  merchant: {
    name: string;
    category: string;
    location?: {
      city: string;
      state: string;
      country: string;
    };
  };
  description: string;
  status: 'pending' | 'matched' | 'unmatched' | 'disputed';
  matchedExpense?: {
    _id: string;
    description: string;
    amount: number;
    date: string;
    user: {
      name: string;
      email: string;
    };
  };
  matchConfidence: number;
  matchCriteria: {
    amountMatch: boolean;
    dateMatch: boolean;
    merchantMatch: boolean;
    categoryMatch: boolean;
  };
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
}

const CorporateCardMatching: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<CorporateCardTransaction | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<string>('');
  
  const queryClient = useQueryClient();

  // Fetch corporate card transactions
  const { data: transactionsData, isLoading, refetch } = useQuery({
    queryKey: ['corporate-card-transactions'],
    queryFn: () => api.get('/integrations/corporate-card/matches'),
  });

  const transactions: CorporateCardTransaction[] = transactionsData?.data?.transactions || [];

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.cardholder.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Match transaction to expense mutation
  const matchMutation = useMutation({
    mutationFn: ({ transactionId, expenseId }: { transactionId: string; expenseId: string }) =>
      api.post(`/integrations/corporate-card/match/${transactionId}/${expenseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-card-transactions'] });
      toast.success('Transaction matched successfully');
      setIsMatchDialogOpen(false);
      setSelectedTransaction(null);
      setSelectedExpense('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to match transaction');
    },
  });

  // Sync transactions mutation
  const syncMutation = useMutation({
    mutationFn: () => api.post('/integrations/corporate-card/sync'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-card-transactions'] });
      toast.success('Transactions synced successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync transactions');
    },
  });

  const handleMatchTransaction = (transaction: CorporateCardTransaction) => {
    setSelectedTransaction(transaction);
    setIsMatchDialogOpen(true);
  };

  const handleConfirmMatch = () => {
    if (selectedTransaction && selectedExpense) {
      matchMutation.mutate({
        transactionId: selectedTransaction._id,
        expenseId: selectedExpense
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unmatched':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Corporate Card Matching</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Match corporate card transactions with employee expenses
          </p>
        </div>
        
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Sync Transactions</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Transactions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by merchant, description, or cardholder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Matched</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'matched').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Unmatched</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'unmatched').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Disputed</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'disputed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Confidence: <span className={getConfidenceColor(transaction.matchConfidence)}>
                            {Math.round(transaction.matchConfidence * 100)}%
                          </span>
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{transaction.merchant.name}</h3>
                        <p className="text-gray-600">{transaction.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{transaction.currency} {transaction.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(transaction.transactionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span>{transaction.cardholder}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span>****{transaction.cardNumber.slice(-4)}</span>
                        </div>
                      </div>
                      
                      {/* Match Criteria */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(transaction.matchCriteria).map(([key, value]) => (
                          <Badge
                            key={key}
                            variant={value ? 'default' : 'secondary'}
                            className={value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                          >
                            {key.replace('Match', '')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      {transaction.status === 'pending' && (
                        <Button
                          onClick={() => handleMatchTransaction(transaction)}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Match</span>
                        </Button>
                      )}
                      
                      {transaction.matchedExpense && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Matched with:</p>
                          <p>{transaction.matchedExpense.description}</p>
                          <p className="text-xs">{transaction.matchedExpense.user.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Match Transaction to Expense</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Merchant</p>
                    <p className="font-medium">{selectedTransaction.merchant.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-medium">
                      {selectedTransaction.currency} {selectedTransaction.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(selectedTransaction.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cardholder</p>
                    <p className="font-medium">{selectedTransaction.cardholder}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="expense-select">Select Expense to Match</Label>
                <Select value={selectedExpense} onValueChange={setSelectedExpense}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an expense..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* This would be populated with actual expenses */}
                    <SelectItem value="expense1">Business Lunch - $45.00</SelectItem>
                    <SelectItem value="expense2">Taxi Ride - $23.50</SelectItem>
                    <SelectItem value="expense3">Hotel Stay - $150.00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsMatchDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmMatch}
                  disabled={!selectedExpense || matchMutation.isPending}
                >
                  {matchMutation.isPending ? 'Matching...' : 'Confirm Match'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CorporateCardMatching;
