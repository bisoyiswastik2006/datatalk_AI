import React from 'react';
import { FileSpreadsheet, FileCode2, Zap, Database } from 'lucide-react';
import { Card } from '../../../components/common/Card';

export const FactsStrip: React.FC = () => {
  const stats = [
    {
      stat: '100% In-Memory',
      metric: '0 KB Server Footprint',
      label: 'Zero raw records leave your browser. Pure client-side analytical isolation.',
      icon: <Database className="w-5 h-5 text-cyan-400" />,
    },
    {
      stat: '<40ms Query Speed',
      metric: 'DuckDB ANSI-92 Engine',
      label: 'Vectorized columnar execution outperforms traditional SQL databases.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      stat: 'Multi-Format Ingestion',
      metric: 'CSV · XLSX · SQLite',
      label: 'Instant schema typing, null verification, and relationship detection.',
      icon: <FileSpreadsheet className="w-5 h-5 text-primary" />,
    },
    {
      stat: 'Transparent SQL',
      metric: 'Zero Black-Box Logic',
      label: 'Every AI answer is paired with fully inspectable, dialect-accurate SQL code.',
      icon: <FileCode2 className="w-5 h-5 text-violet-400" />,
    },
  ];

  const demoPartners = [
    'FINVANTAGE LABS',
    'HYPERSCALE COMMERCE',
    'SYNTHETIX AI',
    'DATASPHERE CLOUD',
    'QUANTUM ANALYTICS',
    'MATRIX CORP',
  ];

  return (
    <section className="py-14 border-y border-border bg-card/30 space-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Trusted By Strip */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase font-mono font-semibold tracking-widest text-secondary">
            Engineered for modern analytical workflows · Illustrative Partner Teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-65 grayscale hover:grayscale-0 transition-all">
            {demoPartners.map((partner, idx) => (
              <span
                key={idx}
                className="font-mono text-xs sm:text-sm font-bold tracking-wider text-secondary hover:text-primary transition-colors"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>

        {/* 4 Illustrative Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <Card
              key={i}
              variant="glass"
              padded="md"
              className="flex flex-col justify-between space-y-3 border-border/80 hover:border-primary/50 transition-all hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary-tint border border-primary/20 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <span className="text-[11px] font-mono font-medium text-secondary bg-page px-2 py-0.5 rounded border border-border">
                  {s.metric}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-main tracking-tight font-mono">
                  {s.stat}
                </div>
                <p className="text-caption text-secondary leading-relaxed">
                  {s.label}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
