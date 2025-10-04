import { motion } from "framer-motion";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";

const EmployeeDashboard = () => {
  const [showForm, setShowForm] = useState(false);

  const stats = [
    {
      title: "Total Submitted",
      value: "$12,450",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Pending",
      value: "$2,340",
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      count: "5 items",
    },
    {
      title: "Approved",
      value: "$8,920",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      count: "23 items",
    },
    {
      title: "Rejected",
      value: "$1,190",
      icon: XCircle,
      color: "from-red-500 to-red-600",
      count: "2 items",
    },
  ];

  const recentExpenses = [
    { id: 1, title: "Business Lunch", amount: 125.50, date: "2024-01-15", status: "pending", category: "Meals" },
    { id: 2, title: "Flight Tickets", amount: 890.00, date: "2024-01-14", status: "approved", category: "Travel" },
    { id: 3, title: "Hotel Stay", amount: 450.00, date: "2024-01-13", status: "approved", category: "Accommodation" },
    { id: 4, title: "Office Supplies", amount: 67.80, date: "2024-01-12", status: "pending", category: "Supplies" },
  ];

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
            Welcome Back! 👋
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
              {recentExpenses.map((expense, index) => (
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
                        {expense.category[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{expense.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {expense.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
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
              ))}
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
