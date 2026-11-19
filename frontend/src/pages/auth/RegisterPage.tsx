import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  User,
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
import { registerUser } from '../../services/backendApi';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    try {
        const response = await registerUser({
            name: fullName.trim(),
            email: email.trim(),
            password: password,
        });

        // Save authentication details
localStorage.setItem('datatalk_token', response.access_token);

localStorage.setItem(
    'datatalk_user',
    JSON.stringify(response.user)
);

showToast(
    'Account created successfully! Welcome to DataTalk AI.',
    'success'
);

navigate('/app');

    } catch (error) {
        showToast(
            error instanceof Error
                ? error.message
                : 'Registration failed. Please try again.',
            'error'
        );
    } finally {
        setIsSubmitting(false);
    }
};
  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-primary/20 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-brand opacity-15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float-slow"
        aria-hidden="true"
      />

      {/* Brand Logo Header */}
      <div className="mb-6 text-center space-y-2">
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

      {/* Main Registration Card */}
      <Card variant="glass" padded="lg" className="w-full max-w-md border-border/80 shadow-card space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-main">
              Create Account
            </h1>
            <Badge variant="tint" size="sm">
              Instant Access
            </Badge>
          </div>
          <p className="text-caption text-secondary">
            Get started with conversational dataset analytics in seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-caption font-medium text-main" htmlFor="fullname-input">
              Full name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Jane Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-page border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors ${
                  errors.fullName ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-caption font-medium text-main" htmlFor="reg-email-input">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="jane@company.com"
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

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-caption font-medium text-main" htmlFor="reg-password-input">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="At least 8 characters"
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-caption font-medium text-main" htmlFor="reg-confirm-input">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-confirm-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-page border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors ${
                  errors.confirmPassword ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="w-8 h-8 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-main cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
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
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Demo Notice */}
        <div className="p-3 rounded-xl bg-page/70 border border-border flex items-start gap-2.5 text-xs text-secondary">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Your account is securely created and your password is protected.
          </span>
        </div>

        {/* Link to Login */}
        <div className="text-center pt-2 border-t border-border/60 text-caption text-secondary">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
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
