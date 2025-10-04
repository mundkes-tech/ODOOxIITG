import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  role: "employee" | "manager" | "admin";
}

const Layout = ({ children, role }: LayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = {
    employee: [
      { name: "Dashboard", href: "/employee", icon: LayoutDashboard },
      { name: "My Expenses", href: "/employee/expenses", icon: Receipt },
    ],
    manager: [
      { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
      { name: "Approvals", href: "/manager/approvals", icon: Receipt },
    ],
    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  };

  const navItems = navigation[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={cn(
            "glass-card border-r transition-all duration-300 flex flex-col",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <div className="p-6 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="font-bold text-xl gradient-text">ExpenseHub</span>
              )}
            </motion.div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span className="font-medium">{item.name}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                  {role[0].toUpperCase()}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      user@expensehub.com
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
