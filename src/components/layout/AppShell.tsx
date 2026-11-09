import React from 'react';
import { TopBar, TopBarProps } from './TopBar';
import { Sidebar, WorkbenchView } from './Sidebar';

export interface AppShellProps {
  topBarProps: TopBarProps;
  currentView: WorkbenchView;
  onViewChange: (view: WorkbenchView) => void;
  engineName?: string | null;
  memoryUsage?: string | null;
  children: React.ReactNode;
  assistantPanel?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  topBarProps,
  currentView,
  onViewChange,
  engineName,
  memoryUsage,
  children,
  assistantPanel,
}) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-surface text-ink overflow-hidden">
      {/* Top Bar */}
      <TopBar {...topBarProps} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Workbench Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={onViewChange}
          engineName={engineName}
          memoryUsage={memoryUsage}
        />

        {/* Center Workspace Area: Internal scrolling only */}
        <main
          className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col min-w-0"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Right Assistant Panel: Distinct tint background */}
        {assistantPanel && (
          <aside
            className="w-96 border-l border-tint bg-tint/40 flex flex-col shrink-0 overflow-hidden"
            aria-label="Data Assistant Panel"
          >
            {assistantPanel}
          </aside>
        )}
      </div>
    </div>
  );
};

