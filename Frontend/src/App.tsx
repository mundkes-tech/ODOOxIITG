import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import Layout from "./components/Layout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MyExpenses from "./pages/employee/MyExpenses";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ApprovalsQueue from "./pages/manager/ApprovalsQueue";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole: string }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealtimeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Employee Routes */}
              <Route path="/employee" element={
                <ProtectedRoute requiredRole="employee">
                  <Layout role="employee"><EmployeeDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/employee/expenses" element={
                <ProtectedRoute requiredRole="employee">
                  <Layout role="employee"><MyExpenses /></Layout>
                </ProtectedRoute>
              } />
              
              {/* Manager Routes */}
              <Route path="/manager" element={
                <ProtectedRoute requiredRole="manager">
                  <Layout role="manager"><ManagerDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/manager/approvals" element={
                <ProtectedRoute requiredRole="manager">
                  <Layout role="manager"><ApprovalsQueue /></Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout role="admin"><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout role="admin"><UsersManagement /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout role="admin"><SystemSettings /></Layout>
                </ProtectedRoute>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RealtimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
