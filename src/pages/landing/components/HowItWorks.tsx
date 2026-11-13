import React from 'react';
import { UploadCloud, MessageSquare, ShieldCheck, LineChart } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Connect a CSV, Excel sheet, or SQLite database. Schemas, column nullability, and distinct values are parsed in-memory.',
      icon: <UploadCloud className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      num: '02',
      title: 'Ask',
      desc: 'Type questions in everyday English. Ask for comparisons, trend shifts, date ranges, or top-performing categories.',
      icon: <MessageSquare className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      num: '03',
      title: 'Verify',
      desc: 'Review the generated SQL query and execution time. Ensure the exact logic aligns with your analytical intent before sharing.',
      icon: <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
    {
      num: '04',
      title: 'Visualize',
      desc: 'Explore responsive data tables and charts automatically rendered from the query output. Export records to CSV with one click.',
      icon: <LineChart className="w-6 h-6 text-primary" aria-hidden="true" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <Badge variant="tint" size="md">
          Simple workflow
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          From raw spreadsheet to trusted answers in seconds
        </h2>
        <p className="text-body text-secondary text-lg leading-relaxed">
          Four clear steps ensure you never have to wrestle with query syntax or wonder how an answer was derived.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <Card
            key={idx}
            variant="glass"
            padded="lg"
            className="relative flex flex-col justify-between space-y-4 border-border/80 hover:border-primary/50 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-tint border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                  {s.icon}
                </div>
                <span className="font-mono text-2xl font-semibold text-secondary/40">
                  {s.num}
                </span>
              </div>
              <h3 className="text-title-card font-semibold text-main tracking-tight">
                {s.title}
              </h3>
              <p className="text-body text-secondary leading-relaxed">
                {s.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

