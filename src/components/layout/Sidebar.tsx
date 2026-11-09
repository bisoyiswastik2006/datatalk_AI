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
    <aside className="w-56 border-r border-tint bg-surface/50 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3">
        <div className="px-3 py-2 text-[11px] font-semibold text-ink-muted tracking-wider uppercase">
          Workbench
        </div>
        <nav className="space-y-1" aria-label="Workbench Navigation">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-ink hover:bg-tint/30 hover:text-ink'
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

      {/* Execution context footer - displayed only when provided */}
      {(engineName || memoryUsage) && (
        <div className="p-3 border-t border-tint/80 text-[11px] space-y-1 text-ink-muted">
          <div className="flex items-center gap-1.5 uppercase tracking-wider font-semibold text-[10px]">
            <Cpu className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Execution Context</span>
          </div>
          {engineName && (
            <div className="flex justify-between">
              <span>Engine</span>
              <span className="font-mono text-ink font-medium">{engineName}</span>
            </div>
          )}
          {memoryUsage && (
            <div className="flex justify-between">
              <span>Memory</span>
              <span className="font-mono text-ink font-medium">{memoryUsage}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

