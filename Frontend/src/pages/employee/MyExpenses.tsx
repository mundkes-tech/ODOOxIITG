import { motion } from "framer-motion";
import { Filter, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const MyExpenses = () => {
  const expenses = [
    { id: 1, title: "Business Lunch", amount: 125.50, date: "2024-01-15", status: "pending", category: "Meals" },
    { id: 2, title: "Flight Tickets", amount: 890.00, date: "2024-01-14", status: "approved", category: "Travel" },
    { id: 3, title: "Hotel Stay", amount: 450.00, date: "2024-01-13", status: "approved", category: "Accommodation" },
    { id: 4, title: "Office Supplies", amount: 67.80, date: "2024-01-12", status: "pending", category: "Supplies" },
    { id: 5, title: "Client Dinner", amount: 234.20, date: "2024-01-11", status: "approved", category: "Meals" },
    { id: 6, title: "Taxi Fare", amount: 45.00, date: "2024-01-10", status: "rejected", category: "Travel" },
    { id: 7, title: "Conference Registration", amount: 599.00, date: "2024-01-09", status: "approved", category: "Events" },
    { id: 8, title: "Software License", amount: 149.99, date: "2024-01-08", status: "pending", category: "Software" },
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const handleExport = () => {
    toast.success("Expenses exported successfully! 📊");
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
            My Expenses 💰
          </h1>
          <p className="text-muted-foreground">
            View and manage all your expense submissions
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleExport}
            variant="outline"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Export
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="This Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-2xl">All Expenses ({expenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
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
                      className={`px-3 py-1 rounded-full text-xs font-medium border min-w-[90px] text-center ${
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
    </div>
  );
};

export default MyExpenses;
