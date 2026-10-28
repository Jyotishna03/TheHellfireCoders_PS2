import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegistryPage } from './pages/RegistryPage';
import { UploadFDRPage } from './pages/UploadFDRPage';
import { FDRDetailsPage } from './pages/FDRDetailsPage';
import { OCRReviewPage } from './pages/OCRReviewPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';
import { FraudReviewPage } from './pages/FraudReviewPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { MaturityCalendarPage } from './pages/MaturityCalendarPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="registry" element={<RegistryPage />} />
              <Route path="upload" element={<UploadFDRPage />} />
              <Route path="fdr/:id" element={<FDRDetailsPage />} />
              <Route path="ocr-review" element={<OCRReviewPage />} />
              <Route path="verification-queue" element={<VerificationQueuePage />} />
              <Route path="fraud-review" element={<FraudReviewPage />} />
              <Route path="institutions" element={<InstitutionsPage />} />
              <Route path="maturity-calendar" element={<MaturityCalendarPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

