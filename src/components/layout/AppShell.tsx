import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export interface AppShellProps {
  pageTitle: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeDatasetName?: string | null;
  activeDatasetSize?: string | null;
  isMockMode?: boolean;
  onOpenUpload?: () => void;
  onOpenSwitcher?: () => void;
  engineName?: string | null;
  memoryUsage?: string | null;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  pageTitle,
  searchQuery = '',
  onSearchChange = () => {},
  activeDatasetName,
  activeDatasetSize,
  isMockMode = false,
  onOpenUpload,
  onOpenSwitcher,
  engineName,
  memoryUsage,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('datatalk_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('datatalk_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="h-screen w-screen flex bg-page text-main overflow-hidden text-body">
      {/* Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        engineName={engineName}
        memoryUsage={memoryUsage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          pageTitle={pageTitle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          activeDatasetName={activeDatasetName}
          activeDatasetSize={activeDatasetSize}
          isMockMode={isMockMode}
          onOpenUpload={onOpenUpload}
          onOpenSwitcher={onOpenSwitcher}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Viewport content with internal scrolling only */}
        <main
          className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-7 min-w-0 relative"
          id="main-app-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
