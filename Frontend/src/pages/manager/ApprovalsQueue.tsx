import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";

const ApprovalsQueue = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, employee: "John Doe", title: "Business Lunch", amount: 125.50, date: "2024-01-15", category: "Meals", status: "pending" },
    { id: 2, employee: "Jane Smith", title: "Flight Tickets", amount: 890.00, date: "2024-01-14", category: "Travel", status: "pending" },
    { id: 3, employee: "Mike Johnson", title: "Hotel Stay", amount: 450.00, date: "2024-01-13", category: "Accommodation", status: "pending" },
  ]);

  const [approved] = useState([
    { id: 4, employee: "Sarah Williams", title: "Office Supplies", amount: 67.80, date: "2024-01-12", category: "Supplies", status: "approved" },
    { id: 5, employee: "Tom Brown", title: "Conference", amount: 599.00, date: "2024-01-11", category: "Events", status: "approved" },
  ]);

  const [rejected] = useState([
    { id: 6, employee: "Lisa Davis", title: "Personal Item", amount: 45.00, date: "2024-01-10", category: "Other", status: "rejected" },
  ]);

  const handleApprove = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
    toast.success("Expense approved successfully! ✅");
  };

  const handleReject = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
    toast.error("Expense rejected");
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
              {expense.employee.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{expense.title}</h4>
              <p className="text-sm text-muted-foreground">
                {expense.employee} • {expense.category} • {expense.date}
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
          Approvals Queue 📋
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
              Pending ({expenses.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 md:flex-none">
              Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 md:flex-none">
              Rejected ({rejected.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-2xl">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <ExpenseCard key={expense.id} expense={expense} showActions />
                  ))}
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
                  {approved.map((expense) => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))}
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
                  {rejected.map((expense) => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))}
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
