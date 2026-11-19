import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight, Sun, Moon, Menu, X, LogIn } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Demo', href: '#demo' },
    { label: 'About', href: '#about' },
  ];

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-title-card text-main select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-sm">
            <Database className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-tight text-main">DataTalk AI</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-control text-secondary font-medium select-none">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollClick(e, link.href)}
              className="hover:text-main hover:text-primary transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions: Theme Toggle + Login + Get Started */}
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

          <Link to="/login" className="hidden sm:inline-flex">
            <Button
              variant="ghost"
              size="md"
              icon={<LogIn className="w-4 h-4" />}
              aria-label="Sign in"
            >
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button
              variant="gradient"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              aria-label="Get Started"
            >
              Get Started
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border text-secondary hover:text-main cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollClick(e, link.href)}
              className="block px-3 py-2 rounded-lg text-secondary hover:text-main hover:bg-page font-medium cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary hover:text-main hover:bg-page font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-brand text-white font-semibold text-center shadow-sm"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
