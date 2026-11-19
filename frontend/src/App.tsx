import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import { DatasetProvider, useDataset } from './context/DatasetContext';
import { QueryProvider } from './context/QueryContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OverviewPage } from './pages/app/OverviewPage';
import { DatasetExplorerPage } from './pages/app/DatasetExplorerPage';
import { AskYourDataPage } from './pages/app/AskYourDataPage';
import { ReportsPage } from './pages/app/ReportsPage';
import { SettingsPage } from './pages/app/SettingsPage';
import { AiInsightsPage } from './pages/app/AiInsightsPage';
import { WhatIfSimulatorPage } from './pages/app/WhatIfSimulatorPage';
import { PredictiveAnalyticsPage } from './pages/app/PredictiveAnalyticsPage';
import { DatasetPreviewModal } from './components/dataset/DatasetPreviewModal';
import { DatasetSwitcher } from './components/dataset/DatasetSwitcher';
import { config } from './config';
import { DatasetDetail } from './types/dataset';
import { MOCK_SCHEMAS, MOCK_PREVIEWS } from './services/mocks/mockData';
// Protect dashboard routes from unauthenticated access
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('datatalk_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
// Wrapper component for authenticated /app routes with AppShell
const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    datasets,
    activeDataset,
    activeSchema,
    activePreview,
    selectDataset,
    deleteDataset,
    refreshActivePreview,
  } = useDataset();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [pendingPreviewDataset, setPendingPreviewDataset] = useState<DatasetDetail | null>(null);

  // Compute page title from route path
  const getPageTitle = (path: string) => {
    if (path.includes('/app/datasets')) return 'Dataset Explorer';
    if (path.includes('/app/ask')) return 'Ask Your Data';
    if (path.includes('/app/reports')) return 'Reports & Summaries';
    if (path.includes('/app/settings')) return 'Settings';
    if (path.includes('/app/insights')) return 'AI Insights Studio';
    if (path.includes('/app/simulator')) return 'What-If Simulator';
    if (path.includes('/app/predictive')) return 'Predictive Analytics';
    return 'Overview';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <>
      <AppShell
        pageTitle={pageTitle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeDatasetName={activeDataset?.name || null}
        activeDatasetSize={activeDataset?.formatted_size || null}
        isMockMode={config.useMocks}
        onOpenUpload={() => navigate('/app/datasets?upload=true')}
        onOpenSwitcher={() => setIsSwitcherOpen(true)}
        engineName={activeDataset?.metadata?.engine || null}
        memoryUsage={
          activeDataset?.metadata?.memory_mb
            ? `${(activeDataset.metadata.memory_mb / 1024).toFixed(1)} GB / 4 GB`
            : null
        }
      >
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="datasets" element={<DatasetExplorerPage />} />
          <Route path="ask" element={<AskYourDataPage />} />
          <Route path="insights" element={<AiInsightsPage />} />
          <Route path="simulator" element={<WhatIfSimulatorPage />} />
          <Route path="predictive" element={<PredictiveAnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AppShell>

      {/* Dataset Preview Modal */}
      {(pendingPreviewDataset || (isUploadModalOpen && activeDataset)) && (
        <DatasetPreviewModal
          isOpen={Boolean(pendingPreviewDataset || isUploadModalOpen)}
          onClose={() => {
            setPendingPreviewDataset(null);
            setIsUploadModalOpen(false);
          }}
          dataset={pendingPreviewDataset || activeDataset!}
          schema={activeSchema || (pendingPreviewDataset ? MOCK_SCHEMAS[pendingPreviewDataset.id] : null)}
          preview={activePreview || (pendingPreviewDataset ? MOCK_PREVIEWS[pendingPreviewDataset.id] : null)}
          onConfirm={() => {
            setPendingPreviewDataset(null);
            setIsUploadModalOpen(false);
          }}
          onSelectTable={(table) => refreshActivePreview(table)}
        />
      )}

      {/* Dataset Switcher Modal */}
      <DatasetSwitcher
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        datasets={datasets}
        activeDatasetId={activeDataset?.id}
        onSelectDataset={(id) => selectDataset(id)}
        onDeleteDataset={(id) => deleteDataset(id)}
        onOpenUpload={() => navigate('/app/datasets?upload=true')}
      />
    </>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DatasetProvider>
          <QueryProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Authentication Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Application Dashboard */}
                <Route
  path="/app/*"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
/>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </QueryProvider>
        </DatasetProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
