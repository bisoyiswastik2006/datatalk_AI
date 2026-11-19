import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  CheckCircle2,
  Database,
  Copy,
  Check,
  Table,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const LiveDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sampleSql = `SELECT 
  category, 
  ROUND(AVG(profit_margin) * 100, 2) AS avg_margin_pct,
  SUM(sales_amount) AS total_revenue
FROM sales_orders 
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY category 
ORDER BY avg_margin_pct DESC 
LIMIT 4;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleRows = [
    { category: 'Technology', margin: '42.1%', revenue: '$1,428,900', share: '38.4%' },
    { category: 'Office Supplies', margin: '31.5%', revenue: '$890,200', share: '24.0%' },
    { category: 'Furniture', margin: '22.8%', revenue: '$782,100', share: '21.0%' },
    { category: 'Industrial Hardware', margin: '18.4%', revenue: '$623,100', share: '16.6%' },
  ];

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2">
          <Badge variant="tint" size="md">
            Interactive Product Demo
          </Badge>
          <span className="text-[11px] font-mono font-medium text-warning bg-warning-tint px-2 py-0.5 rounded border border-warning/40">
            Demo Data
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-main">
          Watch natural language turn into verifiable SQL
        </h2>
        <p className="text-body text-secondary text-lg leading-relaxed">
          Ask conversational questions and inspect the transparent code and interactive visualization computed client-side.
        </p>
      </div>

      {/* Main Interactive Demo Container */}
      <Card variant="glass" padded="none" className="overflow-hidden border-border/80 shadow-card max-w-5xl mx-auto">
        {/* Window Title Bar */}
        <div className="p-4 sm:p-5 border-b border-border bg-page/80 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary font-mono text-caption font-semibold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-main text-control">sales_orders.csv</div>
              <div className="text-caption text-secondary font-mono">24,810 rows · 14 attributes detected</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Schema Verified
            </Badge>
            <span className="text-[11px] font-mono font-medium text-secondary bg-page px-2 py-1 rounded border border-border">
              Illustrative Mock
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* User Question Bubble */}
          <div className="flex justify-end">
            <div className="bg-primary text-primary-text px-5 py-3 rounded-2xl rounded-br-none text-body font-medium max-w-lg shadow-sm">
              "Which product category generated the highest profit margin in 2024?"
            </div>
          </div>

          {/* AI Synthesized Answer Card */}
          <div className="p-4 rounded-xl bg-page border border-border space-y-2">
            <div className="flex items-center justify-between text-caption text-secondary">
              <span className="flex items-center gap-1.5 font-semibold text-primary">
                <Sparkles className="w-4 h-4" />
                Synthesized Answer
              </span>
              <span className="font-mono text-xs">Latency: 38ms · 4 rows</span>
            </div>
            <p className="text-body text-main leading-relaxed">
              <strong>Technology</strong> led all product categories with a peak profit margin of <strong>42.1%</strong>, generating <strong>$1,428,900</strong> in net revenue across 2024. Office Supplies followed at 31.5% margin.
            </p>
          </div>

          {/* Generated SQL Code Box */}
          <div className="p-4 rounded-xl bg-sql-bg border border-sql-border space-y-2 font-mono text-caption">
            <div className="flex items-center justify-between text-secondary pb-2 border-b border-border/40">
              <span className="font-medium text-main flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                Generated SQL (DuckDB ANSI-92)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-main px-2 py-1 rounded bg-page/60 border border-border cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="text-code font-mono overflow-x-auto custom-scrollbar whitespace-pre-wrap leading-relaxed text-sql-text">
              <span className="text-primary font-semibold">SELECT</span> category, <br />
              &nbsp;&nbsp;<span className="text-primary font-semibold">ROUND</span>(<span className="text-primary font-semibold">AVG</span>(profit_margin) * 100, 2) <span className="text-primary font-semibold">AS</span> avg_margin_pct, <br />
              &nbsp;&nbsp;<span className="text-primary font-semibold">SUM</span>(sales_amount) <span className="text-primary font-semibold">AS</span> total_revenue <br />
              <span className="text-primary font-semibold">FROM</span> sales_orders <br />
              <span className="text-primary font-semibold">WHERE</span> order_date <span className="text-primary font-semibold">BETWEEN</span> '2024-01-01' <span className="text-primary font-semibold">AND</span> '2024-12-31' <br />
              <span className="text-primary font-semibold">GROUP BY</span> category <br />
              <span className="text-primary font-semibold">ORDER BY</span> avg_margin_pct <span className="text-primary font-semibold">DESC LIMIT</span> 4;
            </pre>
          </div>

          {/* Tabular Results + Visual Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Table */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-1.5 text-caption font-semibold text-secondary">
                <Table className="w-4 h-4 text-primary" />
                <span>Computed Results Table</span>
              </div>
              <div className="overflow-x-auto custom-scrollbar border border-border rounded-xl">
                <table className="w-full text-left text-table-cell">
                  <thead className="bg-page border-b border-border text-secondary font-mono text-xs uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Margin</th>
                      <th className="py-2.5 px-3">Revenue</th>
                      <th className="py-2.5 px-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono text-caption">
                    {sampleRows.map((r, i) => (
                      <tr key={i} className="hover:bg-page/50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-main">{r.category}</td>
                        <td className="py-2 px-3 text-cyan-400 font-semibold">{r.margin}</td>
                        <td className="py-2 px-3 text-secondary">{r.revenue}</td>
                        <td className="py-2 px-3 text-right text-secondary">{r.share}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Bar representation */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-page border border-border flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-caption font-semibold text-secondary">
                <span className="flex items-center gap-1.5 text-main">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span>Margin Breakdown</span>
                </span>
                <span className="text-xs font-mono text-primary">Plotly Preview</span>
              </div>

              <div className="space-y-2.5 flex-1 justify-center flex flex-col">
                {sampleRows.map((r, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-secondary">{r.category}</span>
                      <span className="text-main font-semibold">{r.margin}</span>
                    </div>
                    <div className="w-full bg-card h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: r.margin }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-secondary text-center pt-2 border-t border-border/50">
                Data generated in-browser using client-side in-memory mock engine.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-card border-t border-border flex items-center justify-between text-caption px-6">
          <span className="text-secondary font-mono text-xs">
            * All figures shown are illustrative demo values for interactive evaluation.
          </span>
          <Link to="/app" className="text-primary hover:underline font-semibold flex items-center gap-1 text-xs">
            <span>Try with your own data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>
    </section>
  );
};

