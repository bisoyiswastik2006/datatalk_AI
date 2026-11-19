import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="border-t border-border bg-card/60 pt-16 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 font-semibold text-main text-title-card select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-sm">
                <Database className="w-5 h-5" aria-hidden="true" />
              </div>
              <span>DataTalk AI</span>
            </Link>
            <p className="text-caption text-secondary leading-relaxed">
              Your Data. Your Questions. Intelligent Answers.
            </p>
            <p className="text-xs text-secondary leading-relaxed">
              Dataset-independent conversational analytics powered by Python, FastAPI, Groq API, MySQL, and SQLGlot.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-caption font-semibold uppercase tracking-wider text-main font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-caption text-secondary">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => handleScrollClick(e, '#hero')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleScrollClick(e, '#how-it-works')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  onClick={(e) => handleScrollClick(e, '#demo')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Live Demo
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleScrollClick(e, '#about')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Features */}
          <div className="space-y-3">
            <h4 className="text-caption font-semibold uppercase tracking-wider text-main font-mono">
              Features
            </h4>
            <ul className="space-y-2 text-caption text-secondary">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Natural Language to SQL
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Smart Dataset Upload
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Automatic Schema Detection
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Safe SQL Validation
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Interactive Data Visualization
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollClick(e, '#features')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  AI-Powered Insights
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Access */}
          <div className="space-y-3">
            <h4 className="text-caption font-semibold uppercase tracking-wider text-main font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-caption text-secondary">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Register Account
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-primary font-semibold hover:underline">
                  Open Analytics Workspace
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-page border border-border text-xs text-secondary space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-main">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Client-Side Privacy</span>
                </div>
                <p className="text-[11px] leading-tight">
                  Zero telemetry. Your tabular records are processed in-memory.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary font-mono">
          <div>
            © {currentYear} DataTalk AI. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Read-Only SQL Architecture</span>
            <span>•</span>
            <span>WCAG AA Accessible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
