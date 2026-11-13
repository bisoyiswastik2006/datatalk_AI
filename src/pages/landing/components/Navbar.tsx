import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-title-card text-main select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-sm">
            <Database className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-tight">DataTalk AI</span>
        </Link>

        {/* Section Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-control text-secondary font-medium select-none">
          <a href="#features" className="hover:text-main transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-main transition-colors">
            How it works
          </a>
          <a href="#preview" className="hover:text-main transition-colors">
            Preview
          </a>
          <a href="#about" className="hover:text-main transition-colors">
            About
          </a>
        </nav>

        {/* Actions: Theme Toggle + Get Started */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 min-h-[40px] flex items-center justify-center rounded-xl border border-border bg-card text-main hover:text-primary hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-main" aria-hidden="true" />
            )}
          </button>

          <Link to="/app">
            <Button
              variant="gradient"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              aria-label="Open workspace"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

