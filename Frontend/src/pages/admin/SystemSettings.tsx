import { motion } from "framer-motion";
import { Settings, Workflow, DollarSign, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const SystemSettings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully! ⚙️");
  };

  const approvalRules = [
    { level: 1, approver: "Direct Manager", threshold: "$0 - $500" },
    { level: 2, approver: "Department Head", threshold: "$501 - $2,000" },
    { level: 3, approver: "Finance Director", threshold: "$2,001 - $10,000" },
    { level: 4, approver: "CFO", threshold: "$10,000+" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">
          System Settings ⚙️
        </h1>
        <p className="text-muted-foreground">
          Configure approval workflows and system preferences
        </p>
      </motion.div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <DollarSign className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                <Select defaultValue="jan">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">January</SelectItem>
                    <SelectItem value="apr">April</SelectItem>
                    <SelectItem value="jul">July</SelectItem>
                    <SelectItem value="oct">October</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email updates for expense status changes
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Auto-Approve Small Expenses</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve expenses under $50
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Approval Workflow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              Approval Workflow Rules
            </CardTitle>
            <CardDescription>Configure multi-level approval thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvalRules.map((rule, index) => (
                <motion.div
                  key={rule.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-xl glass-card relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-purple-600" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                        {rule.level}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{rule.approver}</h4>
                        <p className="text-sm text-muted-foreground">
                          Threshold: {rule.threshold}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Rule
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                className="w-full border-dashed border-2"
              >
                <Workflow className="mr-2 h-4 w-4" />
                Add New Rule
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Manage notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Expense Submitted</Label>
                <p className="text-sm text-muted-foreground">
                  Notify managers when new expenses are submitted
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Approval Status Changed</Label>
                <p className="text-sm text-muted-foreground">
                  Notify employees about approval status
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Send daily summary of pending approvals
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleSave}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg transition-all"
        >
          <Shield className="mr-2 h-5 w-5" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
};

export default SystemSettings;
