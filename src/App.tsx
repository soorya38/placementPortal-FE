
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout/Layout";
import LoginPage from "@/components/Auth/LoginPage";
// import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import Users from "@/pages/Users";
import Approvals from "@/pages/Approvals";
import Reports from "@/pages/Reports";
import Calendar from "@/pages/Calendar";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/companies" replace />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/companies" element={<Companies />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute roles={['Admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute roles={['Admin', 'Manager']}>
              <Approvals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute roles={['Admin', 'Manager']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
