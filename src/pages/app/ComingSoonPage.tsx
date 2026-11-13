import React from 'react';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Sparkles, SlidersHorizontal, TrendingUp, Layers } from 'lucide-react';

export interface ComingSoonPageProps {
  feature: 'insights' | 'simulator' | 'predictive';
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ feature }) => {
  const configs = {
    insights: {
      title: 'AI Insights Studio',
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      description:
        'Automated discovery of statistical anomalies, trend shifts, and correlation clusters directly inferred from your active database tables without manual query authoring.',
    },
    simulator: {
      title: 'What-If Scenario Simulator',
      icon: <SlidersHorizontal className="w-8 h-8 text-primary" />,
      description:
        'Simulate multi-variable changes and parameterized sensitivity analyses across tabular metrics while preserving your original underlying dataset integrity.',
    },
    predictive: {
      title: 'Predictive Analytics Engine',
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      description:
        'Time-series forecasting, seasonality decomposition, and trend projections powered by local statistical models and historical event windows.',
    },
  };

  const current = configs[feature] || configs.insights;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in-50 duration-200">
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Badge variant="coming-soon" size="md">
            Coming soon
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-main">{current.title}</h1>
        <p className="text-body text-secondary text-lg leading-relaxed max-w-2xl">
          {current.description}
        </p>
      </div>

      {/* Tasteful Concept Illustration (no invented numbers or charts) */}
      <Card variant="glass" padded="lg" className="border-border">
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-tint border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-sm">
            {current.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-title-card font-semibold text-main">Concept preview</h3>
            <p className="text-caption text-secondary font-mono max-w-md mx-auto">
              This module is scheduled for future release. Architecture and backend endpoints are currently under design.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-center gap-2 text-caption text-secondary">
            <Layers className="w-4 h-4 text-primary" />
            <span>Read-only prototype architecture</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

