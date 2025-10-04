import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MyExpenses from "./pages/employee/MyExpenses";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ApprovalsQueue from "./pages/manager/ApprovalsQueue";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/employee" replace />} />
          
          {/* Employee Routes */}
          <Route path="/employee" element={<Layout role="employee"><EmployeeDashboard /></Layout>} />
          <Route path="/employee/expenses" element={<Layout role="employee"><MyExpenses /></Layout>} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<Layout role="manager"><ManagerDashboard /></Layout>} />
          <Route path="/manager/approvals" element={<Layout role="manager"><ApprovalsQueue /></Layout>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout role="admin"><AdminDashboard /></Layout>} />
          <Route path="/admin/users" element={<Layout role="admin"><UsersManagement /></Layout>} />
          <Route path="/admin/settings" element={<Layout role="admin"><SystemSettings /></Layout>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
