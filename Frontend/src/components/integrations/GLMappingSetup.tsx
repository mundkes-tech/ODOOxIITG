/**
 * GL Mapping Setup Component
 * UI for configuring General Ledger account mappings
 */

import React, { useState } from 'react';
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
  Calculator, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
  ArrowRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface GLAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
}

interface GLMapping {
  _id: string;
  expenseCategory: string;
  expenseSubcategory?: string;
  glAccount: GLAccount;
  mappingRules: Array<{
    condition: 'amount_range' | 'merchant_contains' | 'description_contains' | 'date_range';
    value: any;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  }>;
  isActive: boolean;
  priority: number;
  usageStats: {
    totalMappings: number;
    lastUsed?: string;
    successRate: number;
  };
}

interface MappingFormData {
  expenseCategory: string;
  expenseSubcategory: string;
  glAccountCode: string;
  mappingRules: Array<{
    condition: string;
    value: string;
    operator: string;
  }>;
  priority: number;
}

const GLMappingSetup: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<GLMapping | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MappingFormData>();

  // Fetch GL mappings
  const { data: mappingsData, isLoading } = useQuery({
    queryKey: ['gl-mappings'],
    queryFn: () => api.get('/integrations/accounting/gl-mappings'),
  });

  // Fetch GL accounts
  const { data: glAccountsData } = useQuery({
    queryKey: ['gl-accounts'],
    queryFn: () => api.get('/integrations/accounting/sync-gl-accounts'),
  });

  const mappings: GLMapping[] = mappingsData?.data?.mappings || [];
  const glAccounts: GLAccount[] = glAccountsData?.data?.accounts || [];

  // Filter mappings
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = mapping.expenseCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.glAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.glAccount.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || mapping.expenseCategory === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Create mapping mutation
  const createMappingMutation = useMutation({
    mutationFn: (data: MappingFormData) => {
      const glAccount = glAccounts.find(acc => acc.code === data.glAccountCode);
      if (!glAccount) throw new Error('GL Account not found');

      return api.post('/integrations/accounting/gl-mappings', {
        expenseCategory: data.expenseCategory,
        expenseSubcategory: data.expenseSubcategory,
        glAccount,
        mappingRules: data.mappingRules,
        priority: data.priority
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gl-mappings'] });
      toast.success('GL mapping created successfully');
      setIsCreateDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create GL mapping');
    },
  });

  // Update mapping mutation
  const updateMappingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MappingFormData> }) =>
      api.put(`/integrations/accounting/gl-mappings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gl-mappings'] });
      toast.success('GL mapping updated successfully');
      setIsEditDialogOpen(false);
      setEditingMapping(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update GL mapping');
    },
  });

  // Delete mapping mutation
  const deleteMappingMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/integrations/accounting/gl-mappings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gl-mappings'] });
      toast.success('GL mapping deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete GL mapping');
    },
  });

  const handleCreateMapping = (data: MappingFormData) => {
    createMappingMutation.mutate(data);
  };

  const handleEditMapping = (mapping: GLMapping) => {
    setEditingMapping(mapping);
    setValue('expenseCategory', mapping.expenseCategory);
    setValue('expenseSubcategory', mapping.expenseSubcategory || '');
    setValue('glAccountCode', mapping.glAccount.code);
    setValue('priority', mapping.priority);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMapping = (data: MappingFormData) => {
    if (editingMapping) {
      updateMappingMutation.mutate({ id: editingMapping._id, data });
    }
  };

  const handleDeleteMapping = (id: string) => {
    if (confirm('Are you sure you want to delete this GL mapping?')) {
      deleteMappingMutation.mutate(id);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-green-100 text-green-800';
      case 'liability':
        return 'bg-red-100 text-red-800';
      case 'equity':
        return 'bg-blue-100 text-blue-800';
      case 'revenue':
        return 'bg-purple-100 text-purple-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span>GL Mapping Setup</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Configure General Ledger account mappings for expense categories
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Mapping</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create GL Mapping</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(handleCreateMapping)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expenseCategory">Expense Category</Label>
                  <Input
                    id="expenseCategory"
                    {...register('expenseCategory', { required: 'Category is required' })}
                    placeholder="e.g., Travel, Meals, Office Supplies"
                  />
                  {errors.expenseCategory && (
                    <p className="text-red-500 text-sm mt-1">{errors.expenseCategory.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="expenseSubcategory">Subcategory (Optional)</Label>
                  <Input
                    id="expenseSubcategory"
                    {...register('expenseSubcategory')}
                    placeholder="e.g., Airfare, Hotel, Restaurant"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="glAccountCode">GL Account</Label>
                <Select onValueChange={(value) => setValue('glAccountCode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GL Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {glAccounts.map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.glAccountCode && (
                  <p className="text-red-500 text-sm mt-1">GL Account is required</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  {...register('priority', { valueAsNumber: true })}
                  placeholder="0"
                  defaultValue={0}
                />
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
                  disabled={createMappingMutation.isPending}
                >
                  {createMappingMutation.isPending ? 'Creating...' : 'Create Mapping'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Mappings</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by category, GL account, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="category-filter">Category Filter</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Mappings</p>
                <p className="text-2xl font-bold">{mappings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Mappings</p>
                <p className="text-2xl font-bold">
                  {mappings.filter(m => m.isActive).length}
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
                <p className="text-sm text-gray-600">GL Accounts</p>
                <p className="text-2xl font-bold">{glAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mappings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMappings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No GL mappings found</p>
            </CardContent>
          </Card>
        ) : (
          filteredMappings.map((mapping) => (
            <motion.div
              key={mapping._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={mapping.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {mapping.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={getAccountTypeColor(mapping.glAccount.type)}>
                          {mapping.glAccount.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Priority: {mapping.priority}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">
                          {mapping.expenseCategory}
                          {mapping.expenseSubcategory && (
                            <span className="text-gray-600 ml-2">- {mapping.expenseSubcategory}</span>
                          )}
                        </h3>
                        <p className="text-gray-600">
                          Maps to: {mapping.glAccount.code} - {mapping.glAccount.name}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Mappings</p>
                          <p className="font-medium">{mapping.usageStats.totalMappings}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className={`font-medium ${getSuccessRateColor(mapping.usageStats.successRate)}`}>
                            {mapping.usageStats.successRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Used</p>
                          <p className="font-medium">
                            {mapping.usageStats.lastUsed 
                              ? new Date(mapping.usageStats.lastUsed).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Mapping Rules */}
                      {mapping.mappingRules.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Mapping Rules:</p>
                          <div className="flex flex-wrap gap-2">
                            {mapping.mappingRules.map((rule, index) => (
                              <Badge key={index} variant="secondary">
                                {rule.condition}: {rule.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      <Button
                        onClick={() => handleEditMapping(mapping)}
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      
                      <Button
                        onClick={() => handleDeleteMapping(mapping._id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit GL Mapping</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleUpdateMapping)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-expenseCategory">Expense Category</Label>
                <Input
                  id="edit-expenseCategory"
                  {...register('expenseCategory', { required: 'Category is required' })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-expenseSubcategory">Subcategory</Label>
                <Input
                  id="edit-expenseSubcategory"
                  {...register('expenseSubcategory')}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-glAccountCode">GL Account</Label>
              <Select onValueChange={(value) => setValue('glAccountCode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select GL Account" />
                </SelectTrigger>
                <SelectContent>
                  {glAccounts.map((account) => (
                    <SelectItem key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Input
                id="edit-priority"
                type="number"
                {...register('priority', { valueAsNumber: true })}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMappingMutation.isPending}
              >
                {updateMappingMutation.isPending ? 'Updating...' : 'Update Mapping'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GLMappingSetup;
