import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseAPI, analyticsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all expenses for approval (manager can see all company expenses)
  const { data: allExpenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['allExpenses'],
    queryFn: () => expenseAPI.getUserExpenses(), // This will need to be updated to get all company expenses
  });

  // Fetch analytics data
  const { data: analytics = {} } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getDashboardAnalytics(),
  });

  // Filter pending expenses
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
      amount: `$${pendingAmount.toFixed(2)}`,
    },
    {
      title: "Approved Today",
      value: approvedExpenses.length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      amount: `$${approvedAmount.toFixed(2)}`,
    },
    {
      title: "Rejected Today",
      value: rejectedExpenses.length,
      icon: XCircle,
      color: "from-red-500 to-red-600",
      amount: `$${rejectedAmount.toFixed(2)}`,
    },
    {
      title: "Total Processed",
      value: allExpenses.length,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      amount: `$${(approvedAmount + rejectedAmount).toFixed(2)}`,
    },
  ];

  const handleApprove = async (expenseId: string) => {
    try {
      await expenseAPI.approveExpense(expenseId, "Approved by manager");
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
      toast.success("Expense approved successfully! ✅");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve expense");
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      await expenseAPI.rejectExpense(expenseId, "Rejected by manager");
      queryClient.invalidateQueries({ queryKey: ['allExpenses'] });
      toast.error("Expense rejected");
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

      {/* Pending Approvals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading expenses...</p>
                </div>
              ) : pendingExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending expenses to review! 🎉</p>
                </div>
              ) : (
                pendingExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-6 rounded-xl glass-card hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                            {expense.category[0]?.toUpperCase() || 'E'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{expense.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {expense.category} • {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <p className="font-bold text-2xl">${expense.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleApprove(expense.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleReject(expense.id)}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
