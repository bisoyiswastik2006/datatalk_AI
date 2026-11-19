import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Sarah Lin',
      role: 'Lead Data Architect',
      company: 'FinVantage Labs',
      comment:
        'DataTalk AI eliminated our ad-hoc query backlog overnight. Our non-technical product managers and finance leads can interrogate 50,000-row models in plain English with zero SQL learning curve.',
      avatar: 'SL',
      verified: true,
    },
    {
      name: 'Marcus Holloway',
      role: 'VP of Analytics',
      company: 'HyperScale Commerce',
      comment:
        'The combination of instant conversational answers and visible, syntax-highlighted SQL builds immense trust. Knowing all computation executes client-side with DuckDB gives us enterprise-grade data privacy.',
      avatar: 'MH',
      verified: true,
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Business Intelligence',
      company: 'Synthetix Dynamics',
      comment:
        'The What-If Scenario Simulator and AI Insights Studio completely changed how we run weekly executive forecasting. We went from manual spreadsheets to automated predictive scenarios in 5 minutes.',
      avatar: 'ER',
      verified: true,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2">
          <Badge variant="tint" size="md">
            Community validation
          </Badge>
          <span className="text-[11px] font-mono font-medium text-secondary bg-page px-2 py-0.5 rounded border border-border">
            Illustrative Demo Testimonials
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          Trusted by analysts, trusted by leaders
        </h2>
        <p className="text-body text-secondary text-lg leading-relaxed">
          See how forward-thinking data engineers and analytics teams accelerate time-to-insight with conversational analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {reviews.map((r, i) => (
          <Card
            key={i}
            variant="glass"
            padded="lg"
            className="flex flex-col justify-between space-y-6 border-border/80 hover:border-primary/50 transition-all hover:shadow-glow"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-secondary/30" />
              </div>

              <p className="text-body text-secondary leading-relaxed italic">
                "{r.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-semibold text-caption shrink-0 shadow-sm">
                {r.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-main text-caption">
                  <span>{r.name}</span>
                  {r.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <p className="text-xs text-secondary truncate">
                  {r.role} · <span className="font-medium text-main">{r.company}</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

