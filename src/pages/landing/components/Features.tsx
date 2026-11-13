import React from 'react';
import {
  Database,
  FileCode2,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  SunMoon,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const Features: React.FC = () => {
  const featureList = [
    {
      title: 'Works with any dataset',
      desc: 'Connect CSV files, multi-sheet Excel workbooks, or multi-table SQLite databases. Automatic schema inference maps data types without manual configuration.',
      icon: <Database className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      title: 'SQL you can see',
      desc: 'No black-box answers. Inspect the exact syntax-highlighted SQL generated for your question, complete with table joins, filters, and aggregations.',
      icon: <FileCode2 className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      title: 'Safe read-only execution',
      desc: 'Built-in security guardrails enforce strictly read-only queries. Commands attempting write operations, drops, or table mutations are blocked before execution.',
      icon: <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      title: 'Tables and charts',
      desc: 'Every result pairs bounded tabular rows with interactive Plotly visualizations chosen automatically from the structure of the analytical query.',
      icon: <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      title: 'Honest answers',
      desc: 'When a question asks for columns or concepts missing from your active dataset schema, DataTalk AI clearly explains why and suggests schema-relevant queries.',
      icon: <HelpCircle className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      title: 'Light and dark themes',
      desc: 'Thoughtfully designed light and dark palettes conforming to WCAG AA contrast standards. Switch instantly with no jarring flashes or style resets.',
      icon: <SunMoon className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <Badge variant="tint" size="md">
          Platform capabilities
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          Built for clarity, trust, and speed
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
            className="flex flex-col justify-between space-y-4 border-border/80"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary-tint border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                {f.icon}
              </div>
              <h3 className="text-title-card font-semibold text-main tracking-tight">
                {f.title}
              </h3>
              <p className="text-body text-secondary leading-relaxed">
                {f.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

