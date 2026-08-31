import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscribePage from './pages/SubscribePage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import QuotersList from './pages/dashboard/QuotersList';
import QuoterEditor from './pages/dashboard/QuoterEditor';
import LeadsDashboard from './pages/dashboard/LeadsDashboard';
import AnalyticsDashboard from './pages/dashboard/AnalyticsDashboard';
import SettingsPage from './pages/dashboard/SettingsPage';
import EmbedPreview from './pages/EmbedPreview';
import type { ReactNode } from 'react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function SubscribedRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subLoading } = useSubscription();

  if (authLoading || subLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!isSubscribed) return <Navigate to="/subscribe" />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
      <Route path="/embed/:slug" element={<EmbedPreview />} />
      <Route path="/dashboard" element={<SubscribedRoute><DashboardLayout /></SubscribedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="quoters" element={<QuotersList />} />
        <Route path="quoters/new" element={<QuoterEditor />} />
        <Route path="quoters/:id" element={<QuoterEditor />} />
        <Route path="leads" element={<LeadsDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <AppRoutes />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
