import React from 'react';
import {
  MessageSquareQuote,
  UploadCloud,
  Layers,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const Features: React.FC = () => {
  const featureList = [
    {
      title: 'Natural Language to SQL',
      desc: 'Ask questions in plain English and receive accurate, syntactically verified ANSI SQL queries generated in milliseconds.',
      icon: <MessageSquareQuote className="w-6 h-6 text-primary" aria-hidden="true" />,
      tag: 'Core Engine',
    },
    {
      title: 'Smart Dataset Upload',
      desc: 'Connect tabular files seamlessly. Full support for CSV, multi-sheet Excel (.xlsx), and standalone SQLite databases.',
      icon: <UploadCloud className="w-6 h-6 text-cyan-400" aria-hidden="true" />,
      tag: 'Multi-Format',
    },
    {
      title: 'Automatic Schema Detection',
      desc: 'Instant type inference, nullability tracking, primary/foreign key discovery, and distinct cardinality profiling.',
      icon: <Layers className="w-6 h-6 text-violet-400" aria-hidden="true" />,
      tag: 'Intelligent Typing',
    },
    {
      title: 'Safe SQL Validation',
      desc: 'Strict AST parse trees and read-only guardrails guarantee no unauthorized data alterations, drops, or table writes.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />,
      tag: 'Security First',
    },
    {
      title: 'Interactive Data Visualization',
      desc: 'Every query automatically pairs bounded row previews with responsive Plotly charts, bar graphs, and trendlines.',
      icon: <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />,
      tag: 'Dynamic Plotly',
    },
    {
      title: 'AI-Powered Insights',
      desc: 'Autonomous discovery of statistical outliers, trend shifts, and correlation matrices without authoring manual formulas.',
      icon: <Sparkles className="w-6 h-6 text-amber-400" aria-hidden="true" />,
      tag: 'Autonomous AI',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <Badge variant="tint" size="md">
          Platform Capabilities
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          Built for clarity, trust, and analytical speed
        </h2>
        <p className="text-body text-secondary text-lg leading-relaxed">
          Everything you need to interrogate structured data without writing complex query syntax or compromising database security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {featureList.map((f, idx) => (
          <Card
            key={idx}
            variant="glass"
            padded="lg"
            hoverable
            className="flex flex-col justify-between space-y-4 border-border/80 hover:border-primary/50 transition-all hover:shadow-glow"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  {f.icon}
                </div>
                <span className="text-[11px] font-mono font-medium text-secondary bg-page px-2 py-0.5 rounded border border-border">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-title-card font-semibold text-main tracking-tight">
                {f.title}
              </h3>
              <p className="text-body text-secondary leading-relaxed text-caption sm:text-body">
                {f.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
