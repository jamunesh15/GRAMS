import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PageTransition from './components/PageTransition';
import AppIntro from './components/AppIntro';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import LoginPageNew from './pages/LoginPageNew';
import RegisterPageNew from './pages/RegisterPageNew';
import OTPVerificationPage from './pages/OTPVerificationPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';

import TransparencyPage from './pages/TransparencyPage';
import OverdueIssuesPage from './pages/OverdueIssuesPage';
import GrievanceFormPage from './pages/GrievanceFormPage';
import CommunityPage from './pages/CommunityPage.jsx';
import BudgetTransparencyPage from './pages/BudgetTransparencyPage';
import TrackPage from './pages/TrackPage';
import PerformancePage from './pages/PerformancePage';
import StatusPage from './pages/StatusPage';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './admin/AdminDashboard';
import EngineerDashboard from './engineer/EngineerDashboard';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/transparency"
          element={
            <PageTransition>
              <TransparencyPage />
            </PageTransition>
          }
        />
        <Route
          path="/transparency/issues"
          element={
            <PageTransition>
              <OverdueIssuesPage />
            </PageTransition>
          }
        />
        <Route
          path="/transparency/budget"
          element={
            <PageTransition>
              <BudgetTransparencyPage />
            </PageTransition>
          }
        />
        <Route
          path="/file-grievance"
          element={
            <PageTransition>
              <GrievanceFormPage />
            </PageTransition>
          }
        />
        <Route
          path="/community"
          element={
            <PageTransition>
              <CommunityPage />
            </PageTransition>
          }
        />
        <Route
          path="/track"
          element={
            <PageTransition>
              <TrackPage />
            </PageTransition>
          }
        />
        <Route
          path="/track/:id"
          element={
            <PageTransition>
              <TrackPage />
            </PageTransition>
          }
        />
        <Route
          path="/performance"
          element={
            <PageTransition>
              <PerformancePage />
            </PageTransition>
          }
        />
        <Route
          path="/status"
          element={
            <PageTransition>
              <StatusPage />
            </PageTransition>
          }
        />
        <Route
          path="/help"
          element={
            <PageTransition>
              <HelpPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPageNew/>
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPageNew />
            </PageTransition>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PageTransition>
              <OTPVerificationPage />
            </PageTransition>
          }
        />
        <Route
          path="/complete-registration"
          element={
            <PageTransition>
              <CompleteRegistrationPage />
            </PageTransition>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PageTransition>
                <RoleBasedDashboard />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute>
              <PageTransition>
                <DashboardPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/engineer-dashboard"
          element={
            <PrivateRoute>
              <PageTransition>
                <EngineerDashboard />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <PageTransition>
                <NotificationsPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = React.useState(true);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppIntro show={showIntro} onDone={() => setShowIntro(false)} />
      <ConditionalLayout />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

function ConditionalLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEngineerRoute = location.pathname.startsWith('/engineer-dashboard');

  return (
    <div className="overflow-x-hidden w-full">
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      {!isAdminRoute && !isEngineerRoute && <Footer />}
    </div>
  );
}
