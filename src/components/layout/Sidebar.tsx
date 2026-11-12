import React from 'react';
import { Terminal, Table2, GitBranch, Bookmark, Cpu } from 'lucide-react';

export type WorkbenchView = 'query-studio' | 'data-explorer' | 'schema-models' | 'saved-notebooks';

export interface SidebarProps {
  currentView: WorkbenchView;
  onViewChange: (view: WorkbenchView) => void;
  engineName?: string | null;
  memoryUsage?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  engineName,
  memoryUsage,
}) => {
  const navItems: { id: WorkbenchView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'query-studio',
      label: 'Query studio',
      icon: <Terminal className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'data-explorer',
      label: 'Data explorer',
      icon: <Table2 className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'schema-models',
      label: 'Schema models',
      icon: <GitBranch className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'saved-notebooks',
      label: 'Saved notebooks',
      icon: <Bookmark className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
  ];

  return (
    <aside className="w-full lg:w-60 border-b lg:border-b-0 lg:border-r border-border bg-card flex flex-col justify-between shrink-0 select-none">
      <div className="p-3.5">
        <div className="px-3.5 py-2 text-caption font-medium text-secondary">
          Workbench
        </div>
        <nav className="space-y-1.5" aria-label="Workbench Navigation">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg min-h-[42px] text-control font-medium transition-colors cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-primary-text font-semibold'
                    : 'text-main hover:bg-page hover:text-main'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Execution context footer */}
      {(engineName || memoryUsage) && (
        <div className="p-3.5 border-t border-border text-caption space-y-1.5 text-secondary">
          <div className="flex items-center gap-2 font-medium text-caption text-main">
            <Cpu className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Execution context</span>
          </div>
          {engineName && (
            <div className="flex justify-between text-caption">
              <span>Engine</span>
              <span className="font-mono text-main font-medium">{engineName}</span>
            </div>
          )}
          {memoryUsage && (
            <div className="flex justify-between text-caption">
              <span>Memory</span>
              <span className="font-mono text-main font-medium">{memoryUsage}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
