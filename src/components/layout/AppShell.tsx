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
    <div className="h-screen w-screen flex flex-col bg-page text-main overflow-hidden text-body">
      {/* Top Bar */}
      <TopBar {...topBarProps} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Workbench Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={onViewChange}
          engineName={engineName}
          memoryUsage={memoryUsage}
        />

        {/* Center Workspace Area: Internal scrolling only */}
        <main
          className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col min-w-0"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Right Assistant Panel */}
        {assistantPanel && (
          <aside
            className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col shrink-0 overflow-hidden max-h-[50vh] lg:max-h-full"
            aria-label="Data Assistant Panel"
          >
            {assistantPanel}
          </aside>
        )}
      </div>
    </div>
  );
};
