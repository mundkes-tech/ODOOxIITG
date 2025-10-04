import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, TrendingUp, Eye, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseAPI, analyticsAPI, Expense } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCurrency } from "@/hooks/useCompanyCurrency";
import { formatCurrency } from "@/utils/currency";
import ExpenseApprovalModal from "@/components/ExpenseApprovalModal";
import ApprovalAnalytics from "@/components/ApprovalAnalytics";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currency: companyCurrency } = useCompanyCurrency();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all expenses for approval (manager can see all company expenses)
  const { data: allExpenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['companyExpenses'],
    queryFn: () => expenseAPI.getCompanyExpenses(),
  });

  // Fetch analytics data
  const { data: analytics = {} } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getDashboardAnalytics(),
  });

  // Filter expenses based on status and search
  const filteredExpenses = allExpenses.filter(expense => {
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.submittedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingExpenses = allExpenses.filter(expense => expense.status === 'pending');
  const approvedExpenses = allExpenses.filter(expense => expense.status === 'approved');
  const rejectedExpenses = allExpenses.filter(expense => expense.status === 'rejected');

  const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const rejectedAmount = rejectedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      title: "Pending Approval",
      value: pendingExpenses.length,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      amount: formatCurrency(pendingAmount, companyCurrency),
    },
    {
      title: "Approved Today",
      value: approvedExpenses.length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      amount: formatCurrency(approvedAmount, companyCurrency),
    },
    {
      title: "Rejected Today",
      value: rejectedExpenses.length,
      icon: XCircle,
      color: "from-red-500 to-red-600",
      amount: formatCurrency(rejectedAmount, companyCurrency),
    },
    {
      title: "Total Processed",
      value: allExpenses.length,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      amount: formatCurrency(approvedAmount + rejectedAmount, companyCurrency),
    },
  ];

  const handleApprove = async (expenseId: string, comment?: string, percentage?: number) => {
    try {
      console.log('🔍 Approving expense with ID:', expenseId);
      console.log('🔍 Comment:', comment);
      console.log('🔍 Percentage:', percentage);
      
      if (!expenseId) {
        throw new Error('Expense ID is required');
      }
      
      await expenseAPI.approveExpense(expenseId, comment || "Approved by manager", percentage);
      queryClient.invalidateQueries({ queryKey: ['companyExpenses'] });
      toast.success("Expense approved successfully! ✅");
    } catch (error: any) {
      console.error('❌ Approval error:', error);
      toast.error(error.message || "Failed to approve expense");
    }
  };

  const handleReject = async (expenseId: string, comment?: string) => {
    try {
      await expenseAPI.rejectExpense(expenseId, comment || "Rejected by manager");
      queryClient.invalidateQueries({ queryKey: ['companyExpenses'] });
      toast.success("Expense rejected successfully! ❌");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject expense");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome, {user?.name || 'Manager'}! 📋
        </h1>
        <p className="text-muted-foreground">
          Review and approve expense requests
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="glass-card border-none overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.amount}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Approval Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ApprovalAnalytics expenses={allExpenses} currency={companyCurrency} />
      </motion.div>

      {/* Expense Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Expense Management</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No expenses found matching your filters.' 
                      : 'No expenses to review! 🎉'
                    }
                  </p>
                </div>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-6 rounded-xl glass-card hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                            {expense.category[0]?.toUpperCase() || 'E'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">{expense.description}</h4>
                              <Badge className={
                                expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {expense.category} • {new Date(expense.date).toLocaleDateString()} • 
                              Submitted by {expense.submittedBy?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-2xl">{formatCurrency(expense.amount, expense.currency || companyCurrency)}</p>
                          {expense.approvedBy && (
                            <p className="text-xs text-muted-foreground">
                              {expense.status === 'approved' ? 'Approved' : 'Rejected'} by {expense.approvedBy.name}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExpense(expense);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense Approval Modal */}
      {selectedExpense && (
        <ExpenseApprovalModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
