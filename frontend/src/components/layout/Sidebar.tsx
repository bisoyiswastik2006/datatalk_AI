import React from 'react';
import {
  LayoutDashboard,
  Database,
  MessageSquareQuote,
  FileText,
  Settings,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Cpu,
} from 'lucide-react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Tooltip } from '../common/Tooltip';
import { Badge } from '../common/Badge';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  engineName?: string | null;
  memoryUsage?: string | null;
}

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  engineName,
  memoryUsage,
}) => {
  const coreNavItems: NavItemConfig[] = [
    {
      to: '/app',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      to: '/app/datasets',
      label: 'Dataset Explorer',
      icon: <Database className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      to: '/app/ask',
      label: 'Ask Your Data',
      icon: <MessageSquareQuote className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
  ];

  const intelligenceNavItems: NavItemConfig[] = [
    {
      to: '/app/insights',
      label: 'AI Insights Studio',
      icon: <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      to: '/app/simulator',
      label: 'What-If Simulator',
      icon: <SlidersHorizontal className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      to: '/app/predictive',
      label: 'Predictive Analytics',
      icon: <TrendingUp className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
  ];

  const manageNavItems: NavItemConfig[] = [
    {
      to: '/app/reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      to: '/app/settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
  ];

  const renderNavLinks = (items: NavItemConfig[]) => {
    return items.map((item) => {
      const linkContent = (
        <RouterNavLink
          key={item.to}
          to={item.to}
          end={item.to === '/app'}
          onClick={() => {
            if (isMobileOpen) onCloseMobile();
          }}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-150 select-none min-h-[44px] text-control ${
              isActive
                ? 'bg-primary text-primary-text font-semibold shadow-sm'
                : 'text-secondary hover:text-main hover:bg-page'
            } ${isCollapsed ? 'justify-center px-0' : ''}`
          }
        >
          {item.icon}
          {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
          {!isCollapsed && item.isComingSoon && (
            <Badge variant="coming-soon" size="sm" className="ml-auto">
              Soon
            </Badge>
          )}
        </RouterNavLink>
      );

      if (isCollapsed) {
        return (
          <Tooltip key={item.to} content={item.label} position="right">
            {linkContent}
          </Tooltip>
        );
      }

      return linkContent;
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-card border-r border-border select-none overflow-hidden">
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <RouterNavLink
            to="/"
            className="flex items-center gap-3 font-semibold text-primary tracking-tight text-title-card"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shrink-0 shadow-sm">
              <Database className="w-5 h-5" aria-hidden="true" />
            </div>
            {!isCollapsed && <span className="text-main font-semibold">DataTalk AI</span>}
          </RouterNavLink>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:text-main hover:bg-page"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Core Analytics workspace links */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary/80">
                Core Workspace
              </div>
            )}
            <nav className="space-y-1">{renderNavLinks(coreNavItems)}</nav>
          </div>

          {/* AI Intelligence Group */}
          <div className="space-y-1 pt-2 border-t border-border/50">
            {!isCollapsed && (
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary/80 flex items-center justify-between">
                <span>AI Intelligence</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">v2.0</span>
              </div>
            )}
            <nav className="space-y-1">{renderNavLinks(intelligenceNavItems)}</nav>
          </div>

          {/* Operations & Settings Group */}
          <div className="space-y-1 pt-2 border-t border-border/50">
            {!isCollapsed && (
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary/80">
                Management
              </div>
            )}
            <nav className="space-y-1">{renderNavLinks(manageNavItems)}</nav>
          </div>
        </div>
      </div>

      {/* Footer & Collapse toggle */}
      <div className="p-3 border-t border-border bg-card/50 space-y-2">
        {/* Execution context info (only when expanded) */}
        {!isCollapsed && (engineName || memoryUsage) && (
          <div className="px-3 py-2 rounded-lg bg-page border border-border text-caption space-y-1 text-secondary">
            <div className="flex items-center gap-2 font-medium text-main">
              <Cpu className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Execution context</span>
            </div>
            {engineName && (
              <div className="flex justify-between font-mono">
                <span>Engine</span>
                <span className="text-main font-medium">{engineName}</span>
              </div>
            )}
            {memoryUsage && (
              <div className="flex justify-between font-mono">
                <span>Memory</span>
                <span className="text-main font-medium">{memoryUsage}</span>
              </div>
            )}
          </div>
        )}

        {/* Collapse Button (Desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-secondary hover:text-main hover:bg-page transition-colors cursor-pointer min-h-[40px] text-caption font-medium"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-card z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
