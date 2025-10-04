import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Percent,
  DollarSign,
  Users,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface ApprovalAnalyticsProps {
  expenses: any[];
  currency: string;
}

const ApprovalAnalytics = ({ expenses, currency }: ApprovalAnalyticsProps) => {
  // Calculate analytics
  const totalExpenses = expenses.length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected');

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = approvedExpenses.reduce((sum, e) => sum + (e.approvedAmount || e.amount), 0);
  const rejectedAmount = rejectedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const approvalRate = totalExpenses > 0 ? (approvedExpenses.length / totalExpenses) * 100 : 0;
  const rejectionRate = totalExpenses > 0 ? (rejectedExpenses.length / totalExpenses) * 100 : 0;
  const pendingRate = totalExpenses > 0 ? (pendingExpenses.length / totalExpenses) * 100 : 0;

  // Average approval percentage for partially approved expenses
  const partialApprovals = approvedExpenses.filter(e => e.approvalPercentage < 100);
  const avgApprovalPercentage = partialApprovals.length > 0 
    ? partialApprovals.reduce((sum, e) => sum + e.approvalPercentage, 0) / partialApprovals.length 
    : 100;

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentExpenses = expenses.filter(e => new Date(e.createdAt) >= sevenDaysAgo);

  // Category breakdown
  const categoryStats = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { count: 0, amount: 0, approved: 0, rejected: 0, pending: 0 };
    }
    acc[category].count++;
    acc[category].amount += expense.amount;
    if (expense.status === 'approved') acc[category].approved++;
    else if (expense.status === 'rejected') acc[category].rejected++;
    else acc[category].pending++;
    return acc;
  }, {} as Record<string, any>);

  const stats = [
    {
      title: "Total Expenses",
      value: totalExpenses,
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      amount: formatCurrency(totalAmount, currency),
    },
    {
      title: "Pending Review",
      value: pendingExpenses.length,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      amount: formatCurrency(pendingAmount, currency),
    },
    {
      title: "Approved",
      value: approvedExpenses.length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      amount: formatCurrency(approvedAmount, currency),
    },
    {
      title: "Rejected",
      value: rejectedExpenses.length,
      icon: XCircle,
      color: "from-red-500 to-red-600",
      amount: formatCurrency(rejectedAmount, currency),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-none hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.amount}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Approval Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Approval Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Approval Rate</span>
                <span className="text-sm font-bold text-green-600">{approvalRate.toFixed(1)}%</span>
              </div>
              <Progress value={approvalRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Rejection Rate</span>
                <span className="text-sm font-bold text-red-600">{rejectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={rejectionRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Pending Rate</span>
                <span className="text-sm font-bold text-yellow-600">{pendingRate.toFixed(1)}%</span>
              </div>
              <Progress value={pendingRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Approval Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Approval %</span>
              <Badge variant="outline" className="text-green-600">
                {avgApprovalPercentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Partial Approvals</span>
              <Badge variant="outline" className="text-blue-600">
                {partialApprovals.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recent Activity (7d)</span>
              <Badge variant="outline" className="text-purple-600">
                {recentExpenses.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats], index) => {
              const approvalRate = stats.count > 0 ? (stats.approved / stats.count) * 100 : 0;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{category}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {stats.count} expenses
                        </Badge>
                        <Badge variant="outline" className="text-xs text-green-600">
                          {approvalRate.toFixed(0)}% approved
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total: {formatCurrency(stats.amount, currency)}</span>
                      <div className="flex gap-4">
                        <span className="text-green-600">✓ {stats.approved}</span>
                        <span className="text-red-600">✗ {stats.rejected}</span>
                        <span className="text-yellow-600">⏳ {stats.pending}</span>
                      </div>
                    </div>
                    <Progress value={approvalRate} className="h-1 mt-2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalAnalytics;
