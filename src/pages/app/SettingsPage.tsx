import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Shield,
  Database,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { config } from '../../config';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [motionReduced, setMotionReduced] = useState(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const handleSystemTheme = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pr-1 pb-8">
      {/* Page Header */}
      <div className="pb-2 border-b border-border shrink-0">
        <h2 className="text-title-page font-semibold tracking-tight text-main">
          Settings
        </h2>
        <p className="text-body text-secondary mt-1">
          Customize interface appearance, display density, and review engine execution boundaries.
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Appearance & Theme Section */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-title-card font-semibold text-main flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              <span>Theme and appearance</span>
            </h3>
            <p className="text-caption text-secondary">
              Select your preferred color theme or match your operating system settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode Card */}
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-card border-primary ring-2 ring-primary shadow-sm'
                  : 'bg-card/60 hover:bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-primary" />
                {theme === 'light' && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <h4 className="text-body font-semibold text-main mt-3">Light theme</h4>
              <p className="text-caption text-secondary mt-1">
                Bright background with crisp high-contrast text and blue brand accents.
              </p>
            </button>

            {/* Dark Mode Card */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-card border-primary ring-2 ring-primary shadow-sm'
                  : 'bg-card/60 hover:bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-primary" />
                {theme === 'dark' && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <h4 className="text-body font-semibold text-main mt-3">Dark theme</h4>
              <p className="text-caption text-secondary mt-1">
                Deep obsidian canvas with neon cyan highlights, optimized for low-light environments.
              </p>
            </button>

            {/* System Preference Card */}
            <button
              onClick={handleSystemTheme}
              className="p-4 rounded-xl border bg-card/60 hover:bg-card border-border text-left transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Laptop className="w-5 h-5 text-secondary" />
                <Badge variant="outline" size="sm">
                  System
                </Badge>
              </div>
              <h4 className="text-body font-semibold text-main mt-3">Match system</h4>
              <p className="text-caption text-secondary mt-1">
                Automatically synchronize with your operating system light/dark preference.
              </p>
            </button>
          </div>
        </section>

        {/* Display & Density Preferences */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-title-card font-semibold text-main flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <span>Display and accessibility</span>
            </h3>
            <p className="text-caption text-secondary">
              Control spacing, motion behavior, and table layout density.
            </p>
          </div>

          <Card variant="default" padded="md" className="space-y-4 divide-y divide-border">
            {/* Density Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-body font-medium text-main block">
                  Table row density
                </span>
                <span className="text-caption text-secondary">
                  Adjust row padding in dataset preview and analytical query results.
                </span>
              </div>
              <div className="flex items-center gap-2 bg-page p-1 rounded-lg border border-border">
                <button
                  onClick={() => setDensity('comfortable')}
                  className={`px-3 py-1.5 rounded-md text-caption font-medium transition-colors cursor-pointer ${
                    density === 'comfortable'
                      ? 'bg-card text-main shadow-xs'
                      : 'text-secondary hover:text-main'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  onClick={() => setDensity('compact')}
                  className={`px-3 py-1.5 rounded-md text-caption font-medium transition-colors cursor-pointer ${
                    density === 'compact'
                      ? 'bg-card text-main shadow-xs'
                      : 'text-secondary hover:text-main'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Motion Preferences */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <div>
                <span className="text-body font-medium text-main block">
                  Animation & motion effects
                </span>
                <span className="text-caption text-secondary">
                  Disable slow floats, ambient glows, and pulse effects across cards and charts.
                </span>
              </div>
              <button
                onClick={() => setMotionReduced(!motionReduced)}
                className={`min-h-[38px] px-4 py-1.5 rounded-lg border text-caption font-medium transition-colors cursor-pointer ${
                  motionReduced
                    ? 'bg-primary text-primary-text border-primary'
                    : 'bg-page border-border text-main hover:bg-card'
                }`}
              >
                {motionReduced ? 'Reduced motion enabled' : 'Full animations'}
              </button>
            </div>
          </Card>
        </section>

        {/* Read-Only Configuration & Execution Boundaries */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-title-card font-semibold text-main flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Execution boundaries and safety</span>
            </h3>
            <p className="text-caption text-secondary">
              Strict parameters governing local execution, dataset parsing, and query guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" padded="md" className="space-y-3">
              <div className="flex items-center gap-2 text-caption font-semibold text-main">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span>Upload boundaries</span>
              </div>
              <div className="space-y-2 text-caption text-secondary">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Maximum file size</span>
                  <span className="font-mono text-main font-medium">{config.maxFileSizeMb} MB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Permitted extensions</span>
                  <span className="font-mono text-main font-medium">.csv, .xlsx, .sqlite, .db</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Data transfer policy</span>
                  <span className="text-main font-medium">Client memory only</span>
                </div>
              </div>
            </Card>

            <Card variant="glass" padded="md" className="space-y-3">
              <div className="flex items-center gap-2 text-caption font-semibold text-main">
                <Database className="w-4 h-4 text-primary" />
                <span>Database engine limits</span>
              </div>
              <div className="space-y-2 text-caption text-secondary">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Query dialect</span>
                  <span className="font-mono text-main font-medium">DuckDB ANSI-92</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Execution mode</span>
                  <span className="text-main font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Strictly read-only
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Execution timeout</span>
                  <span className="font-mono text-main font-medium">30 seconds</span>
                </div>
              </div>
            </Card>

            <Card variant="glass" padded="md" className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-caption font-semibold text-main">
                <Zap className="w-4 h-4 text-primary" />
                <span>Environment information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption text-secondary">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>API Base URL</span>
                  <span className="font-mono text-main">{config.apiBaseUrl}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Runtime mode</span>
                  <span className="text-main font-medium">
                    {config.useMocks ? 'Mock demonstration mode' : 'Live backend connected'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};
