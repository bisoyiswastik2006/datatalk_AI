import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Table, BarChart2, Sparkles, Check } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Card } from '../../../components/common/Card';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Subtle background ambient orbs (disabled with prefers-reduced-motion) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-brand opacity-15 blur-[120px] rounded-full pointer-events-none -z-10 animate-float-slow"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2">
            <Badge variant="tint" size="md">
              Your Data. Your Questions. Intelligent Answers.
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-main leading-[1.15]">
            Stop writing queries. <br />
            <span className="bg-gradient-brand bg-clip-text text-transparent">
              Start talking to your data.
            </span>
          </h1>

          <p className="text-body text-secondary text-lg sm:text-xl leading-relaxed max-w-xl">
            Turn complex datasets into meaningful insights through simple conversations. Safe read-only execution, transparent SQL, and instant visualizations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/app">
              <Button
                variant="gradient"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Start exploring
              </Button>
            </Link>

            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </a>
          </div>

          {/* Micro-bullet points */}
          <div className="pt-3 flex flex-wrap items-center gap-6 text-caption text-secondary font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>No SQL expertise required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>In-memory privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Multi-format support</span>
            </div>
          </div>
        </div>

        {/* Right Column: Illustrative Product Preview Card */}
        <div className="lg:col-span-6">
          <Card variant="glass" padded="none" className="overflow-hidden border-border/80 shadow-card">
            {/* Window titlebar */}
            <div className="px-4 py-3 bg-page/80 border-b border-border flex items-center justify-between text-caption font-medium select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-border inline-block" />
                <span className="w-3 h-3 rounded-full bg-border inline-block" />
                <span className="w-3 h-3 rounded-full bg-border inline-block" />
                <span className="ml-2 font-mono text-secondary">DataTalk Studio</span>
              </div>
              <Badge variant="outline" size="sm" className="font-mono">
                Illustrative preview
              </Badge>
            </div>

            {/* Illustrative workspace UI pattern */}
            <div className="p-5 sm:p-6 space-y-4 select-none">
              {/* Question bubble */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-text px-4 py-2.5 rounded-xl rounded-br-none text-caption font-medium max-w-sm shadow-sm">
                  Compare regional revenue for Q3 2024 and rank by highest sales.
                </div>
              </div>

              {/* Synthesized Answer Box */}
              <div className="p-4 rounded-xl bg-page/90 border border-border space-y-2">
                <div className="flex items-center justify-between text-caption text-secondary">
                  <div className="flex items-center gap-1.5 font-medium text-main">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Synthesized answer</span>
                  </div>
                  <span className="font-mono text-secondary">4 rows · 38ms</span>
                </div>
                <p className="text-title-card font-semibold text-main leading-snug">
                  Q3 regional revenue peaked in Europe at $1,428,900, outpacing North America by 14.2%.
                </p>
              </div>

              {/* SQL Snippet Block */}
              <div className="rounded-xl border border-border bg-page p-3 font-mono text-caption text-main space-y-1">
                <div className="flex items-center justify-between text-secondary pb-1 border-b border-border/60">
                  <div className="flex items-center gap-1.5 font-semibold text-main">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span>Generated SQL</span>
                  </div>
                  <span className="text-caption">DuckDB ANSI-92</span>
                </div>
                <div className="text-secondary text-caption pt-1 overflow-x-auto custom-scrollbar whitespace-nowrap">
                  <span className="text-primary font-semibold">SELECT</span> region, <span className="text-primary font-semibold">SUM</span>(order_total) <span className="text-primary font-semibold">AS</span> total_revenue <br />
                  <span className="text-primary font-semibold">FROM</span> sales_orders <span className="text-primary font-semibold">GROUP BY</span> region <span className="text-primary font-semibold">ORDER BY</span> total_revenue <span className="text-primary font-semibold">DESC</span>;
                </div>
              </div>

              {/* Table & Chart Side-by-Side Strip */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Mini Table */}
                <div className="rounded-xl border border-border bg-page/70 p-3 text-caption font-mono">
                  <div className="flex items-center gap-1.5 font-semibold text-main mb-2">
                    <Table className="w-3.5 h-3.5 text-primary" />
                    <span>Results</span>
                  </div>
                  <div className="space-y-1.5 text-secondary">
                    <div className="flex justify-between border-b border-border/60 pb-1 font-medium text-main">
                      <span>Region</span>
                      <span>Revenue</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-main">Europe</span>
                      <span>$1.43M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-main">North Am.</span>
                      <span>$1.25M</span>
                    </div>
                  </div>
                </div>

                {/* Mini Chart Mockup */}
                <div className="rounded-xl border border-border bg-page/70 p-3 text-caption">
                  <div className="flex items-center gap-1.5 font-semibold text-main mb-2">
                    <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    <span>Visualization</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="h-2 w-full bg-primary rounded-full" />
                    </div>
                    <div>
                      <div className="h-2 w-[85%] bg-primary/75 rounded-full" />
                    </div>
                    <div>
                      <div className="h-2 w-[55%] bg-primary/50 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
