import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const ApprovalsQueue = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all expenses for approval
  const { data: allExpenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['allExpenses'],
    queryFn: () => expenseAPI.getUserExpenses(), // This will need to be updated to get all company expenses
  });

  // Filter expenses by status
  const pendingExpenses = allExpenses.filter(expense => expense.status === 'pending');
  const approvedExpenses = allExpenses.filter(expense => expense.status === 'approved');
  const rejectedExpenses = allExpenses.filter(expense => expense.status === 'rejected');

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

  const ExpenseCard = ({ expense, showActions = false }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
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
          {showActions && (
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
          )}
        </div>
      </div>
    </motion.div>
  );

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
          Review and manage expense approvals
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="glass-card p-1 w-full md:w-auto">
            <TabsTrigger value="pending" className="flex-1 md:flex-none">
              Pending ({pendingExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 md:flex-none">
              Approved ({approvedExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 md:flex-none">
              Rejected ({rejectedExpenses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
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
                    pendingExpenses.map((expense) => (
                      <ExpenseCard key={expense.id} expense={expense} showActions />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-2xl">Approved Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedExpenses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No approved expenses yet.</p>
                    </div>
                  ) : (
                    approvedExpenses.map((expense) => (
                      <ExpenseCard key={expense.id} expense={expense} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-2xl">Rejected Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectedExpenses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No rejected expenses yet.</p>
                    </div>
                  ) : (
                    rejectedExpenses.map((expense) => (
                      <ExpenseCard key={expense.id} expense={expense} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ApprovalsQueue;
