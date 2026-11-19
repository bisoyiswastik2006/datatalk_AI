import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, Sparkles } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <Card
        variant="glass"
        padded="lg"
        className="relative overflow-hidden text-center py-16 px-6 sm:px-12 border-border/80 shadow-card"
      >
        {/* Subtle background ambient blur */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-brand opacity-15 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow"
          aria-hidden="true"
        />

        <div className="max-w-2xl mx-auto space-y-6">
          <Badge variant="tint" size="md">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
            Your Data. Your Questions. Intelligent Answers.
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-main leading-tight">
            Ready to stop writing queries?
          </h2>

          <p className="text-body text-secondary text-lg leading-relaxed">
            Connect your datasets in seconds. Ask questions in natural language, review verifiable SQL, and make high-confidence decisions.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button
                variant="gradient"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                aria-label="Get Started with DataTalk AI"
              >
                Get Started
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="secondary"
                size="lg"
                icon={<LogIn className="w-4 h-4" />}
                aria-label="Login to your account"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
};

