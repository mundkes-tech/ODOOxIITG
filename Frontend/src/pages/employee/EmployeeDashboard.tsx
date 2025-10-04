import { motion } from "framer-motion";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ExpenseForm from "@/components/ExpenseForm";
import { expenseAPI, analyticsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCompanyCurrency } from "@/hooks/useCompanyCurrency";
import { formatCurrency } from "@/utils/currency";

const EmployeeDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency: companyCurrency } = useCompanyCurrency();

  // Fetch user expenses
  const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
    queryKey: ['userExpenses'],
    queryFn: () => expenseAPI.getUserExpenses(),
  });

  // Calculate stats from real data
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(expense => expense.status === 'pending');
  const approvedExpenses = expenses.filter(expense => expense.status === 'approved');
  const rejectedExpenses = expenses.filter(expense => expense.status === 'rejected');

  const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const rejectedAmount = rejectedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      title: "Total Submitted",
      value: formatCurrency(totalAmount, companyCurrency),
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      change: `${expenses.length} items`,
    },
    {
      title: "Pending",
      value: formatCurrency(pendingAmount, companyCurrency),
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      count: `${pendingExpenses.length} items`,
    },
    {
      title: "Approved",
      value: formatCurrency(approvedAmount, companyCurrency),
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      count: `${approvedExpenses.length} items`,
    },
    {
      title: "Rejected",
      value: formatCurrency(rejectedAmount, companyCurrency),
      icon: XCircle,
      color: "from-red-500 to-red-600",
      count: `${rejectedExpenses.length} items`,
    },
  ];

  // Get recent expenses (last 5)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome Back, {user?.name || 'Employee'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Track and manage your expenses effortlessly
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Expense
          </Button>
        </motion.div>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change || stat.count}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading expenses...</p>
                </div>
              ) : recentExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No expenses found. Create your first expense!</p>
                </div>
              ) : (
                recentExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                          {expense.category[0]?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <h4 className="font-semibold">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(expense.amount, expense.currency || companyCurrency)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          statusColors[expense.status as keyof typeof statusColors]
                        }`}
                      >
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense Form Modal */}
      {showForm && <ExpenseForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default EmployeeDashboard;
