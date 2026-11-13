import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="border-t border-border bg-card/60 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-main text-control">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <span>DataTalk AI</span>
          </Link>
          <span className="hidden sm:inline text-secondary">·</span>
          <span className="text-caption text-secondary">
            Your Data. Your Questions. Intelligent Answers.
          </span>
        </div>

        {/* Section Navigation Links Only */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-caption text-secondary font-medium">
          <a href="#" className="hover:text-main transition-colors">
            Home
          </a>
          <a href="#features" className="hover:text-main transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-main transition-colors">
            How it works
          </a>
          <a href="#preview" className="hover:text-main transition-colors">
            Preview
          </a>
          <Link to="/app" className="hover:text-main transition-colors text-primary font-semibold">
            Open workspace
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border/40 text-center text-caption text-secondary">
        <span>Dataset-independent natural language analytical workspace. Built with DuckDB ANSI-92 engine.</span>
      </div>
    </footer>
  );
};

