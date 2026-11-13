import React from 'react';
import { FileSpreadsheet, ShieldCheck, FileCode2 } from 'lucide-react';
import { Card } from '../../../components/common/Card';

export const FactsStrip: React.FC = () => {
  const facts = [
    {
      stat: '3 supported formats',
      label: 'CSV, Excel (.xlsx), and SQLite (.sqlite/.db) files are processed in-memory.',
      icon: <FileSpreadsheet className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      stat: 'Read-only SQL',
      label: 'Strict execution guardrails prevent table writes, drops, or modifications.',
      icon: <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      stat: 'SQL shown with every answer',
      label: 'Transparent dialect-compliant code is verified and visible for every query.',
      icon: <FileCode2 className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
  ];

  return (
    <section className="py-12 border-y border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {facts.map((fact, i) => (
            <Card
              key={i}
              variant="glass"
              padded="md"
              className="flex items-start gap-4 border-border/80"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-tint border border-primary/30 flex items-center justify-center shrink-0">
                {fact.icon}
              </div>
              <div className="space-y-1">
                <div className="text-title-card font-semibold text-main tracking-tight">
                  {fact.stat}
                </div>
                <p className="text-caption text-secondary leading-relaxed">
                  {fact.label}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

