import React from 'react';
import {
  UploadCloud,
  MessageSquare,
  FileCode2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload Dataset',
      desc: 'Drop in your CSV, Excel workbook, or SQLite database. Schemas and data types are parsed instantly in-memory.',
      icon: <UploadCloud className="w-5 h-5 text-primary" aria-hidden="true" />,
    },
    {
      num: '02',
      title: 'Ask Questions',
      desc: 'Type natural questions in plain English—ask for totals, regional comparisons, growth rates, or top categories.',
      icon: <MessageSquare className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
    },
    {
      num: '03',
      title: 'Generate SQL',
      desc: 'Our semantic translation layer constructs dialect-accurate ANSI SQL complete with joins, group-bys, and filters.',
      icon: <FileCode2 className="w-5 h-5 text-violet-400" aria-hidden="true" />,
    },
    {
      num: '04',
      title: 'Validate and Execute',
      desc: 'SQLGlot validates read-only AST safety before high-performance execution runs against your local data engine.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
    },
    {
      num: '05',
      title: 'Discover Insights',
      desc: 'Review formatted answer cards, inspect interactive Plotly charts, and export data with a single click.',
      icon: <TrendingUp className="w-5 h-5 text-amber-400" aria-hidden="true" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <Badge variant="tint" size="md">
          Simple Workflow
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          From raw spreadsheet to trusted answers in 5 steps
        </h2>
        <p className="text-body text-secondary text-lg leading-relaxed">
          Five transparent steps ensure you never have to author complicated query syntax or wonder how an answer was computed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((s, idx) => (
          <Card
            key={idx}
            variant="glass"
            padded="md"
            className="relative flex flex-col justify-between space-y-4 border-border/80 hover:border-primary/50 transition-all hover:shadow-glow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary-tint border border-primary/20 flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
                <span className="font-mono text-xl font-bold text-secondary/40">
                  {s.num}
                </span>
              </div>
              <h3 className="text-caption sm:text-base font-semibold text-main tracking-tight">
                {s.title}
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                {s.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
