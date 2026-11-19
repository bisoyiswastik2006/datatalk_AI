import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Terminal, CheckCircle2, Database } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const ProductPreview: React.FC = () => {
  return (
    <section id="preview" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <Badge variant="tint" size="md">
          Product interface
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          Designed for analytical rigor
        </h2>
        <p className="text-body text-secondary text-lg leading-relaxed">
          Every conversation pairs structured answers with verified SQL queries and clean visualizations.
        </p>
      </div>

      {/* Main Showcase Card */}
      <Card variant="glass" padded="none" className="overflow-hidden border-border/80 shadow-card max-w-5xl mx-auto">
        <div className="p-4 sm:p-5 border-b border-border bg-page/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary font-mono text-caption font-semibold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-main text-control">sales_orders.csv</div>
              <div className="text-caption text-secondary font-mono">24,810 rows · 14 columns</div>
            </div>
          </div>
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Schema verified
          </Badge>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-caption text-secondary font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Query Copilot</span>
            </div>
            <h3 className="text-title-page font-semibold text-main leading-tight">
              Which product category generated the highest profit margin in 2024?
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-page border border-border space-y-3 font-mono text-caption text-main">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-medium text-main flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                DuckDB ANSI-92 Query
              </span>
              <span>Execution budget: &lt; 50ms</span>
            </div>
            <pre className="text-code font-mono overflow-x-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
              <span className="text-primary font-semibold">SELECT</span> category, <span className="text-primary font-semibold">ROUND</span>(<span className="text-primary font-semibold">AVG</span>(profit_margin) * 100, 2) <span className="text-primary font-semibold">AS</span> avg_margin_pct <br />
              <span className="text-primary font-semibold">FROM</span> sales_orders <span className="text-primary font-semibold">WHERE</span> order_year = 2024 <br />
              <span className="text-primary font-semibold">GROUP BY</span> category <span className="text-primary font-semibold">ORDER BY</span> avg_margin_pct <span className="text-primary font-semibold">DESC</span> <span className="text-primary font-semibold">LIMIT</span> 5;
            </pre>
          </div>
        </div>
      </Card>

      {/* Final Call To Action Band */}
      <div className="mt-20">
        <Card
          variant="glass"
          padded="lg"
          className="relative overflow-hidden text-center py-14 px-6 sm:px-12 border-border/80 shadow-card"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-brand opacity-15 blur-[100px] rounded-full pointer-events-none -z-10"
            aria-hidden="true"
          />

          <div className="max-w-2xl mx-auto space-y-6">
            <Badge variant="tint" size="md">
              Your Data. Your Questions. Intelligent Answers.
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
              Ready to explore your data?
            </h2>

            <p className="text-body text-secondary text-lg leading-relaxed">
              Upload a spreadsheet or database file in seconds. No sign-up, no configuration, and zero data leaving your machine.
            </p>

            <div className="pt-2">
              <Link to="/app">
                <Button
                  variant="gradient"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Start exploring now
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
