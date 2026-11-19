import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { loginUser } from '../../services/backendApi';
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    try {
        const response = await loginUser({
            email: email.trim(),
            password: password,
        });

        // Save authentication token
        localStorage.setItem(
            'datatalk_token',
            response.access_token
        );

        // Save logged-in user details
        localStorage.setItem(
            'datatalk_user',
            JSON.stringify(response.user)
        );

        showToast(
            'Welcome back! Login successful.',
            'success'
        );

        navigate('/app');

    } catch (error) {
        showToast(
            error instanceof Error
                ? error.message
                : 'Login failed. Please check your credentials.',
            'error'
        );
    } finally {
        setIsSubmitting(false);
    }
};

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('Demo Mode: Password reset instructions dispatched to your email address.', 'info');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-primary/20 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-brand opacity-15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float-slow"
        aria-hidden="true"
      />

      {/* Brand Logo Header */}
      <div className="mb-8 text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-3 font-semibold text-title-card text-main select-none group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6" aria-hidden="true" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-main">DataTalk AI</span>
        </Link>
        <p className="text-caption text-secondary">
          Your Data. Your Questions. Intelligent Answers.
        </p>
      </div>

      {/* Main Login Card */}
      <Card variant="glass" padded="lg" className="w-full max-w-md border-border/80 shadow-card space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-main">
              Sign in
            </h1>
            <Badge variant="tint" size="sm">
              Secure Access
            </Badge>
          </div>
          <p className="text-caption text-secondary">
            Enter your credentials to access your analytics workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-caption font-medium text-main" htmlFor="email-input">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-page border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors ${
                  errors.email ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-caption font-medium text-main" htmlFor="password-input">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-page border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors ${
                  errors.password ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="w-8 h-8 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-main cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="text-caption text-secondary">Remember me for 30 days</span>
            </label>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isSubmitting}
              className="w-full justify-center"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in to Workspace'}
            </Button>
          </div>
        </form>

        {/* Demo Notification Box */}
        <div className="p-3 rounded-xl bg-page/70 border border-border flex items-start gap-2.5 text-xs text-secondary">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Your credentials are securely verified by the DataTalk AI backend.
          </span>
        </div>

        {/* Link to Registration */}
        <div className="text-center pt-2 border-t border-border/60 text-caption text-secondary">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </Card>

      {/* Back to Home Link */}
      <div className="mt-6 text-center">
        <Link to="/" className="text-caption text-secondary hover:text-main transition-colors">
          ← Back to DataTalk AI home
        </Link>
      </div>
    </div>
  );
};
