/**
 * Reimbursement Batch Manager Component
 * Admin interface for managing reimbursement batches and payment data generation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Checkbox,
} from '@/components/ui/checkbox';
import { 
  Calendar,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  FileSpreadsheet,
  FileCode,
  FileJson
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface ReimbursementBatch {
  _id: string;
  batchNumber: string;
  name: string;
  description: string;
  status: 'draft' | 'ready' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: string;
  processedDate?: string;
  expenses: Array<{
    _id: string;
    amount: number;
    currency: string;
    description: string;
    user: {
      name: string;
      email: string;
    };
  }>;
  totalAmount: number;
  currency: string;
  paymentData: {
    format: string;
    fileName?: string;
    fileSize?: number;
    checksum?: string;
  };
  metadata: {
    expenseCount: number;
    averageAmount: number;
    processingTime?: number;
    errorLog: Array<{
      message: string;
      timestamp: string;
      severity: string;
    }>;
  };
  createdBy: {
    name: string;
    email: string;
  };
}

interface Expense {
  _id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
}

const ReimbursementBatchManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Fetch approved expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['approved-expenses'],
    queryFn: () => api.get('/expenses?status=approved'),
  });

  const expenses: Expense[] = expensesData?.data?.expenses || [];

  // Fetch reimbursement batches
  const { data: batchesData, isLoading: batchesLoading, refetch } = useQuery({
    queryKey: ['reimbursement-batches'],
    queryFn: () => api.get('/smart-finance/reimbursement-batches'),
  });

  const batches: ReimbursementBatch[] = batchesData?.data?.batches || [];

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    const matchesDate = !dateFilter || batch.scheduledDate.startsWith(dateFilter);
    return matchesStatus && matchesDate;
  });

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: (data: any) => api.post('/smart-finance/reimbursement-batches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursement-batches'] });
      toast.success('Reimbursement batch created successfully');
      setIsCreateDialogOpen(false);
      setSelectedExpenses([]);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create batch');
    },
  });

  // Generate payment data mutation
  const generatePaymentMutation = useMutation({
    mutationFn: ({ batchId, format }: { batchId: string; format: string }) =>
      api.post(`/smart-finance/reimbursement-batches/${batchId}/generate-payment`, { format }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reimbursement-batches'] });
      toast.success('Payment data generated successfully');
      
      // Trigger download if file path is provided
      if (response.data.filePath) {
        const link = document.createElement('a');
        link.href = response.data.filePath;
        link.download = response.data.batch.paymentData.fileName;
        link.click();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate payment data');
    },
  });

  const handleCreateBatch = (data: any) => {
    if (selectedExpenses.length === 0) {
      toast.error('Please select at least one expense');
      return;
    }

    createBatchMutation.mutate({
      ...data,
      expenseIds: selectedExpenses
    });
  };

  const handleExpenseSelection = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    } else {
      setSelectedExpenses(selectedExpenses.filter(id => id !== expenseId));
    }
  };

  const handleSelectAllExpenses = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(filteredExpenses.map(expense => expense._id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'ach':
        return <FileText className="w-4 h-4" />;
      case 'xml':
        return <FileCode className="w-4 h-4" />;
      case 'json':
        return <FileJson className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Reimbursement Batch Manager</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage reimbursement batches for approved expenses
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Batch</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Reimbursement Batch</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(handleCreateBatch)} className="space-y-6">
                {/* Batch Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Batch Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Batch name is required' })}
                      placeholder="e.g., Q1 2024 Reimbursements"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      {...register('scheduledDate', { required: 'Scheduled date is required' })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Optional description for this batch"
                  />
                </div>
                
                <div>
                  <Label htmlFor="format">Payment Format</Label>
                  <Select onValueChange={(value) => setValue('format', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expense Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Select Expenses ({selectedExpenses.length} selected)</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedExpenses.length === filteredExpenses.length}
                        onCheckedChange={handleSelectAllExpenses}
                      />
                      <Label htmlFor="select-all">Select All</Label>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.map((expense) => (
                          <TableRow key={expense._id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedExpenses.includes(expense._id)}
                                onCheckedChange={(checked) => 
                                  handleExpenseSelection(expense._id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell>{expense.user.name}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>
                              {expense.currency} {expense.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {new Date(expense.date).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBatchMutation.isPending || selectedExpenses.length === 0}
                  >
                    {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Batches</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by batch name or number..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="date-filter">Date Filter</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {batches.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">
                  ${batches.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Expenses</p>
                <p className="text-2xl font-bold">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {batchesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reimbursement batches found</p>
            </CardContent>
          </Card>
        ) : (
          filteredBatches.map((batch) => (
            <motion.div
              key={batch._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
                        <span className="font-semibold text-lg">{batch.name}</span>
                        <span className="text-sm text-gray-500">#{batch.batchNumber}</span>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">{batch.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(batch.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{batch.currency} {batch.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{batch.metadata.expenseCount} expenses</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(batch.paymentData.format)}
                          <span>{batch.paymentData.format.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      {batch.processedDate && (
                        <div className="text-sm text-gray-600">
                          <p>Processed: {new Date(batch.processedDate).toLocaleString()}</p>
                        </div>
                      )}
                      
                      {batch.metadata.errorLog.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800">Errors:</p>
                          {batch.metadata.errorLog.map((error, index) => (
                            <p key={index} className="text-xs text-red-600">
                              {error.message} ({error.severity})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      {batch.status === 'ready' && (
                        <Button
                          onClick={() => generatePaymentMutation.mutate({ 
                            batchId: batch._id, 
                            format: batch.paymentData.format 
                          })}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Generate</span>
                        </Button>
                      )}
                      
                      {batch.paymentData.fileName && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">File:</p>
                          <p>{batch.paymentData.fileName}</p>
                          <p className="text-xs">
                            {(batch.paymentData.fileSize / 1024).toFixed(1)} KB
                          </p>
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
    </div>
  );
};

export default ReimbursementBatchManager;
