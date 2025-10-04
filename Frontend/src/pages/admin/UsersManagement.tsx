import { motion } from "framer-motion";
import { Plus, Search, UserPlus, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const UsersManagement = () => {
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@company.com", role: "employee", department: "Sales", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@company.com", role: "manager", department: "Marketing", status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@company.com", role: "employee", department: "IT", status: "active" },
    { id: 4, name: "Sarah Williams", email: "sarah@company.com", role: "manager", department: "Finance", status: "active" },
    { id: 5, name: "Tom Brown", email: "tom@company.com", role: "employee", department: "HR", status: "active" },
    { id: 6, name: "Lisa Davis", email: "lisa@company.com", role: "admin", department: "Operations", status: "active" },
  ]);

  const roleColors = {
    employee: "bg-blue-100 text-blue-800 border-blue-200",
    manager: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-pink-100 text-pink-800 border-pink-200",
  };

  const handleInviteUser = () => {
    toast.success("Invitation sent successfully! 📧");
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
            User Management 👥
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleInviteUser}
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg transition-all"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Invite User
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-2xl">All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-6 rounded-xl glass-card hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                          <span>•</span>
                          <span>{user.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${
                          roleColors[user.role as keyof typeof roleColors]
                        }`}
                      >
                        <Shield className="w-3 h-3 inline mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
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

export default UsersManagement;
