import { motion } from "framer-motion";
import { Users, Settings, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { userAPI, analyticsAPI, companyAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyCurrency } from "@/hooks/useCompanyCurrency";
import { formatCurrency } from "@/utils/currency";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { currency: companyCurrency } = useCompanyCurrency();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getUsers(),
  });

  // Fetch analytics
  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getDashboardAnalytics(),
  });

  // Fetch company info
  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => companyAPI.getCompany(),
  });

  // Calculate stats from real data
  const totalUsers = users.length;
  const managers = users.filter(u => u.role === 'manager').length;
  const employees = users.filter(u => u.role === 'employee').length;
  const totalAmount = analytics.summary?.totalAmount || 0;
  const pendingAmount = analytics.summary?.pendingAmount || 0;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "from-blue-500 to-blue-600",
      change: `${employees} employees`,
    },
    {
      title: "Active Managers",
      value: managers.toString(),
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      change: "Managing teams",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalAmount, companyCurrency),
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      change: `${formatCurrency(pendingAmount, companyCurrency)} pending`,
    },
    {
      title: "Company",
      value: company?.name || "Loading...",
      icon: Settings,
      color: "from-pink-500 to-rose-600",
      change: company?.currency || "USD",
    },
  ];

  // Use real analytics data or fallback to mock data
  const monthlyData = analytics.expensesByMonth || [
    { month: "Jan", amount: 0 },
    { month: "Feb", amount: 0 },
    { month: "Mar", amount: 0 },
    { month: "Apr", amount: 0 },
    { month: "May", amount: 0 },
    { month: "Jun", amount: 0 },
  ];

  const categoryData = analytics.expensesByCategory || [
    { name: "Travel", value: 0, color: "#8B5CF6" },
    { name: "Meals", value: 0, color: "#EC4899" },
    { name: "Accommodation", value: 0, color: "#3B82F6" },
    { name: "Supplies", value: 0, color: "#10B981" },
  ];

  // Get recent users (last 4)
  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome, {user?.name || 'Admin'}! 🎯
        </h1>
        <p className="text-muted-foreground">
          Manage users, settings, and monitor system performance
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
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Monthly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="amount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading users...</p>
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found.</p>
                </div>
              ) : (
                recentUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.role} • {user.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Active
                    </span>
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

export default AdminDashboard;
