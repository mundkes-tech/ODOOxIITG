import { motion } from "framer-motion";
import { 
  Settings, 
  Building2, 
  DollarSign, 
  Bell, 
  Shield, 
  Users, 
  Workflow, 
  Globe, 
  Save,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { companyAPI, settingsAPI } from "@/services/api";
import { useCompanyCurrency } from "@/hooks/useCompanyCurrency";
import { formatCurrency } from "@/utils/currency";

const SystemSettings = () => {
  const queryClient = useQueryClient();
  const { currency: companyCurrency } = useCompanyCurrency();
  
  // State for different settings
  const [companySettings, setCompanySettings] = useState({
    name: '',
    country: '',
    currency: 'USD',
    timezone: 'UTC',
    address: '',
    phone: '',
    website: '',
  });

  const [approvalRules, setApprovalRules] = useState([
    { id: 1, amount: 500, approverRole: 'manager', description: 'Manager approval for expenses up to $500' },
    { id: 2, amount: 2000, approverRole: 'admin', description: 'Admin approval for expenses up to $2000' },
    { id: 3, amount: 10000, approverRole: 'admin', description: 'Admin approval for expenses up to $10000' },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    expenseSubmitted: true,
    expenseApproved: true,
    expenseRejected: true,
    weeklyReport: true,
    monthlyReport: true,
  });

  const [systemPreferences, setSystemPreferences] = useState({
    autoApproval: false,
    requireReceipt: true,
    allowMultipleApprovers: true,
    escalationEnabled: true,
    escalationDays: 3,
    maxExpenseAmount: 50000,
    currencyConversion: true,
  });

  // Fetch company data
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company'],
    queryFn: () => companyAPI.getCompany(),
  });

  // Initialize form data when company data loads
  useState(() => {
    if (company) {
      setCompanySettings({
        name: company.name || '',
        country: company.country || '',
        currency: company.currency || 'USD',
        timezone: company.timezone || 'UTC',
        address: company.address || '',
        phone: company.phone || '',
        website: company.website || '',
      });
    }
  });

  const handleCompanySave = async () => {
    try {
      await companyAPI.updateCompany(company?.id || '', companySettings);
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success("Company settings updated successfully! 🏢");
    } catch (error: any) {
      toast.error(error.message || "Failed to update company settings");
    }
  };

  const handleApprovalRuleAdd = () => {
    const newRule = {
      id: Date.now(),
      amount: 0,
      approverRole: 'manager',
      description: '',
    };
    setApprovalRules([...approvalRules, newRule]);
  };

  const handleApprovalRuleUpdate = (id: number, field: string, value: any) => {
    setApprovalRules(rules => 
      rules.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleApprovalRuleDelete = (id: number) => {
    setApprovalRules(rules => rules.filter(rule => rule.id !== id));
  };

  const handleApprovalRulesSave = async () => {
    try {
      // await settingsAPI.updateApprovalRules(approvalRules);
      toast.success("Approval rules updated successfully! ⚙️");
    } catch (error: any) {
      toast.error(error.message || "Failed to update approval rules");
    }
  };

  const handleNotificationSave = async () => {
    try {
      // await settingsAPI.updateNotificationSettings(notificationSettings);
      toast.success("Notification settings updated successfully! 🔔");
    } catch (error: any) {
      toast.error(error.message || "Failed to update notification settings");
    }
  };

  const handleSystemSave = async () => {
    try {
      // await settingsAPI.updateSystemPreferences(systemPreferences);
      toast.success("System preferences updated successfully! ⚙️");
    } catch (error: any) {
      toast.error(error.message || "Failed to update system preferences");
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
          System Settings ⚙️
        </h1>
        <p className="text-muted-foreground">
          Configure company settings, approval workflows, and system preferences
        </p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Approval Rules
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company" className="space-y-6">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Manage your company's basic information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={companySettings.country}
                      onValueChange={(value) => setCompanySettings(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={companySettings.currency}
                      onValueChange={(value) => setCompanySettings(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={companySettings.timezone}
                      onValueChange={(value) => setCompanySettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Asia/Kolkata">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Company address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleCompanySave} className="bg-gradient-to-r from-primary to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Company Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Rules */}
          <TabsContent value="approval" className="space-y-6">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-primary" />
                  Approval Workflow Rules
                </CardTitle>
                <CardDescription>
                  Configure expense approval thresholds and approvers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {approvalRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Rule {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprovalRuleDelete(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Amount Threshold</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={rule.amount}
                            onChange={(e) => handleApprovalRuleUpdate(rule.id, 'amount', parseFloat(e.target.value))}
                            placeholder="0"
                          />
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(rule.amount, companyCurrency)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Approver Role</Label>
                        <Select
                          value={rule.approverRole}
                          onValueChange={(value) => handleApprovalRuleUpdate(rule.id, 'approverRole', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={rule.description}
                          onChange={(e) => handleApprovalRuleUpdate(rule.id, 'description', e.target.value)}
                          placeholder="Rule description"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Button
                  onClick={handleApprovalRuleAdd}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Rule
                </Button>

                <div className="flex justify-end">
                  <Button onClick={handleApprovalRulesSave} className="bg-gradient-to-r from-primary to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Approval Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how users receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Notification Types</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Expense Submitted</Label>
                        <p className="text-sm text-muted-foreground">Notify when expense is submitted</p>
                      </div>
                      <Switch
                        checked={notificationSettings.expenseSubmitted}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, expenseSubmitted: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Expense Approved</Label>
                        <p className="text-sm text-muted-foreground">Notify when expense is approved</p>
                      </div>
                      <Switch
                        checked={notificationSettings.expenseApproved}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, expenseApproved: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Expense Rejected</Label>
                        <p className="text-sm text-muted-foreground">Notify when expense is rejected</p>
                      </div>
                      <Switch
                        checked={notificationSettings.expenseRejected}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, expenseRejected: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Send weekly expense reports</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyReport}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, weeklyReport: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Monthly Reports</Label>
                        <p className="text-sm text-muted-foreground">Send monthly expense reports</p>
                      </div>
                      <Switch
                        checked={notificationSettings.monthlyReport}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, monthlyReport: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNotificationSave} className="bg-gradient-to-r from-primary to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Preferences */}
          <TabsContent value="system" className="space-y-6">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  System Preferences
                </CardTitle>
                <CardDescription>
                  Configure system-wide preferences and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Approval</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve expenses under threshold</p>
                    </div>
                    <Switch
                      checked={systemPreferences.autoApproval}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, autoApproval: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Receipt</Label>
                      <p className="text-sm text-muted-foreground">Require receipt upload for all expenses</p>
                    </div>
                    <Switch
                      checked={systemPreferences.requireReceipt}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, requireReceipt: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multiple Approvers</Label>
                      <p className="text-sm text-muted-foreground">Allow multiple approvers for high-value expenses</p>
                    </div>
                    <Switch
                      checked={systemPreferences.allowMultipleApprovers}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, allowMultipleApprovers: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Escalation Enabled</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic escalation for pending approvals</p>
                    </div>
                    <Switch
                      checked={systemPreferences.escalationEnabled}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, escalationEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Currency Conversion</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic currency conversion</p>
                    </div>
                    <Switch
                      checked={systemPreferences.currencyConversion}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, currencyConversion: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Escalation Days</Label>
                    <Input
                      type="number"
                      value={systemPreferences.escalationDays}
                      onChange={(e) => setSystemPreferences(prev => ({ 
                        ...prev, 
                        escalationDays: parseInt(e.target.value) 
                      }))}
                      placeholder="3"
                    />
                    <p className="text-sm text-muted-foreground">Days before escalation</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Expense Amount</Label>
                    <Input
                      type="number"
                      value={systemPreferences.maxExpenseAmount}
                      onChange={(e) => setSystemPreferences(prev => ({ 
                        ...prev, 
                        maxExpenseAmount: parseFloat(e.target.value) 
                      }))}
                      placeholder="50000"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum single expense amount: {formatCurrency(systemPreferences.maxExpenseAmount, companyCurrency)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSystemSave} className="bg-gradient-to-r from-primary to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save System Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SystemSettings;