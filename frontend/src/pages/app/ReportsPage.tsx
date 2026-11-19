import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  Clock,
  Terminal,
  Table,
  Calendar,
} from 'lucide-react';
import { useQuery } from '../../context/QueryContext';
import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ChartPanel } from '../../components/query/ChartPanel';
import { useToast } from '../../components/common/Toast';
import { QueryResponse } from '../../types/query';

interface ReportModel {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  author: string;
  fileSize: string;
  status: 'Ready' | 'Archived';
  response: QueryResponse;
}

export const ReportsPage: React.FC = () => {
  const { queryResult } = useQuery();
  const { activeDataset } = useDataset();
  const { showToast } = useToast();

  const datasetName = activeDataset?.name || 'sales_orders.csv';

  // Default curated executive reports
  const defaultReports: ReportModel[] = useMemo(() => [
    {
      id: 'rep-q3-rev',
      title: 'Q3 Regional Revenue & Margin Audit',
      category: 'Financial Performance',
      timestamp: 'Today, 10:14 AM',
      author: 'DuckDB Engine v0.9.2',
      fileSize: '420 KB',
      status: 'Ready',
      response: {
        query_id: 'q-rep-1',
        status: 'success',
        answer: 'European regional performance generated $1,428,900 across 4,210 orders, leading North America by 14.2% in net sales volume. Tech hardware categories delivered 42.1% blended margin.',
        sql: `SELECT region, SUM(order_total) AS total_revenue, COUNT(order_id) AS orders, ROUND(SUM(order_total) / 3724300 * 100, 1) AS share\nFROM sales_orders\nWHERE order_date BETWEEN '2024-07-01' AND '2024-09-30'\nGROUP BY region\nORDER BY total_revenue DESC;`,
        row_count: 4,
        execution_ms: 38,
        columns: ['Region', 'Total Revenue ($)', 'Orders', 'Share (%)'],
        rows: [
          ['Europe', 1428900, 4210, 38.4],
          ['North America', 1251400, 3890, 33.6],
          ['Asia-Pacific', 782100, 2415, 21.0],
          ['Latin America', 261300, 890, 7.0],
        ],
        chart: {
          type: 'horizontal_bar',
          x: 'Total Revenue ($)',
          y: 'Region',
          title: 'Q3 Regional Revenue Distribution (USD)',
        },
      },
    },
    {
      id: 'rep-discount',
      title: 'Discount Elasticity & Customer Retention Diagnostic',
      category: 'Pricing Strategy',
      timestamp: 'Yesterday, 4:45 PM',
      author: 'AI Insights Studio',
      fileSize: '1.2 MB',
      status: 'Ready',
      response: {
        query_id: 'q-rep-2',
        status: 'success',
        answer: 'Promotions exceeding 20% discount failed to generate repeat transaction velocity. Capping discounts at 15% preserves $340k annual gross margin without dampening order volume.',
        sql: `SELECT discount_tier, AVG(repeat_orders_90d) AS avg_repeat_rate, SUM(margin_amount) AS total_margin\nFROM sales_orders\nGROUP BY discount_tier\nORDER BY avg_repeat_rate DESC;`,
        row_count: 3,
        execution_ms: 44,
        columns: ['Discount Tier', '90-Day Repeat Rate (%)', 'Margin Realized ($)'],
        rows: [
          ['0% - 10% (Standard)', 42.5, 890000],
          ['11% - 20% (Promo)', 38.2, 540000],
          ['21%+ (Deep Discount)', 24.1, 190000],
        ],
        chart: {
          type: 'bar',
          x: 'Discount Tier',
          y: '90-Day Repeat Rate (%)',
          title: 'Repeat Purchase Rate vs Discount Intensity',
        },
      },
    },
    {
      id: 'rep-shipping',
      title: 'Supply Chain & Fulfillment Latency Digest',
      category: 'Operations',
      timestamp: 'Nov 12, 2026',
      author: 'Data Architect',
      fileSize: '680 KB',
      status: 'Archived',
      response: {
        query_id: 'q-rep-3',
        status: 'success',
        answer: 'Average dispatch latency improved from 4.8 days to 2.4 days in EMEA logistics centers, boosting customer retention by 18 points.',
        sql: `SELECT fulfillment_hub, AVG(dispatch_days) AS avg_days, COUNT(*) AS volume\nFROM logistics_metrics\nGROUP BY fulfillment_hub\nORDER BY avg_days ASC;`,
        row_count: 3,
        execution_ms: 29,
        columns: ['Fulfillment Hub', 'Average Dispatch Days', 'Volume Handled'],
        rows: [
          ['EMEA Central', 2.4, 11400],
          ['Americas East', 3.1, 9800],
          ['APAC Regional', 3.8, 6200],
        ],
        chart: {
          type: 'bar',
          x: 'Fulfillment Hub',
          y: 'Average Dispatch Days',
          title: 'Dispatch Latency by Fulfillment Hub',
        },
      },
    },
  ], []);

  // Merge session queries if available
  const allReports: ReportModel[] = useMemo(() => {
    const list: ReportModel[] = [];

    // Add session query if exists
    if (queryResult && queryResult.answer) {
      list.push({
        id: queryResult.query_id || 'curr-query',
        title: 'Active Session Query Digest',
        category: 'Ad-Hoc Session',
        timestamp: 'Just now',
        author: 'Current User',
        fileSize: '180 KB',
        status: 'Ready',
        response: queryResult,
      });
    }

    return [...list, ...defaultReports];
  }, [queryResult, defaultReports]);

  const [selectedReportId, setSelectedReportId] = useState<string>(allReports[0].id);
  const activeReport = allReports.find((r) => r.id === selectedReportId) || allReports[0];

  const handleExportCsv = (report: ReportModel) => {
    const { columns, rows } = report.response;
    if (!columns || !rows || rows.length === 0) {
      showToast('No row data available to export', 'warning');
      return;
    }

    const header = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
    const body = rows
      .map((r) =>
        r
          .map((v) => (v !== null && v !== undefined ? `"${String(v).replace(/"/g, '""')}"` : '""'))
          .join(',')
      )
      .join('\n');

    const csvContent = `${header}\n${body}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV export downloaded successfully.', 'success');
  };

  const handlePrintPdf = () => {
    window.print();
    showToast('Print dialog launched. Select "Save as PDF" to export.', 'info');
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in-50 duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border shrink-0 no-print">
        <div>
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-mono text-primary font-medium">{datasetName}</span>
            <span>/</span>
            <span className="text-main font-medium">Reports</span>
          </div>
          <h2 className="text-title-page font-semibold tracking-tight text-main mt-1 flex items-center gap-2">
            <span>Executive Reports & Summaries</span>
            <Badge variant="tint" size="sm">
              Publication Ready
            </Badge>
          </h2>
          <p className="text-body text-secondary mt-1">
            Generated insights, SQL queries, and tabular data formatted for stakeholder presentation and PDF/CSV download.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPdf}
            icon={<Printer className="w-4 h-4" />}
          >
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExportCsv(activeReport)}
            icon={<Download className="w-4 h-4" />}
          >
            Download CSV
          </Button>
        </div>
      </div>

      {/* Main Split: Report Selector & Active Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        {/* Left Column: Report History / Preview Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 no-print">
          <div className="flex items-center justify-between text-caption font-semibold uppercase tracking-wider text-secondary px-1">
            <span>Report History ({allReports.length})</span>
            <span className="text-xs font-mono">Select to preview</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {allReports.map((item) => {
              const isSelected = item.id === activeReport.id;
              return (
                <Card
                  key={item.id}
                  variant="glass"
                  padded="md"
                  hoverable
                  onClick={() => setSelectedReportId(item.id)}
                  className={`cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 shadow-glow'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono font-semibold text-secondary">
                      {item.category}
                    </span>
                    <Badge variant={item.status === 'Ready' ? 'tint' : 'outline'} size="sm">
                      {item.status}
                    </Badge>
                  </div>

                  <h4 className="font-semibold text-main text-caption leading-snug">
                    {item.title}
                  </h4>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-secondary font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.timestamp}
                    </span>
                    <span>{item.fileSize}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Summary & Generated Insights (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <Card variant="glass" padded="lg" className="space-y-6">
            {/* Report Title Bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-caption text-secondary">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{activeReport.timestamp}</span>
                  <span>•</span>
                  <span className="font-mono text-primary">{activeReport.author}</span>
                </div>
                <h3 className="text-2xl font-semibold text-main tracking-tight">
                  {activeReport.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 no-print">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportCsv(activeReport)}
                  icon={<Download className="w-4 h-4" />}
                >
                  CSV
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handlePrintPdf}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Visual Summary of Generated Insights */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-caption font-semibold text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Executive Insight Synthesis</span>
              </div>
              <div className="p-4 rounded-xl bg-page border border-border text-body text-main leading-relaxed">
                {activeReport.response.answer}
              </div>
            </div>

            {/* SQL Audit Box */}
            {activeReport.response.sql && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-caption text-secondary">
                  <span className="flex items-center gap-1.5 font-medium text-main">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span>Dialect-Compliant SQL Logic</span>
                  </span>
                  <span className="font-mono text-xs">{activeReport.response.execution_ms}ms execution</span>
                </div>
                <pre className="p-4 rounded-xl bg-sql-bg border border-sql-border font-mono text-code text-sql-text overflow-x-auto custom-scrollbar">
                  {activeReport.response.sql}
                </pre>
              </div>
            )}

            {/* Embedded Visualization */}
            {activeReport.response.chart && activeReport.response.columns && activeReport.response.rows && (
              <div className="h-[340px]">
                <ChartPanel
                  columns={activeReport.response.columns}
                  rows={activeReport.response.rows}
                  chartHint={activeReport.response.chart}
                />
              </div>
            )}

            {/* Tabular Rows Preview */}
            {activeReport.response.columns && activeReport.response.rows && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-caption font-medium text-secondary">
                  <span className="flex items-center gap-1.5 text-main">
                    <Table className="w-4 h-4 text-primary" />
                    <span>Tabular Results Sample</span>
                  </span>
                  <span className="font-mono text-xs">{activeReport.response.row_count} records returned</span>
                </div>

                <div className="overflow-x-auto custom-scrollbar border border-border rounded-xl">
                  <table className="w-full text-left text-table-cell">
                    <thead className="bg-page border-b border-border text-secondary font-mono text-xs uppercase">
                      <tr>
                        {activeReport.response.columns.map((c) => (
                          <th key={c} className="py-2.5 px-4 font-medium">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {activeReport.response.rows.map((r, ri) => (
                        <tr key={ri} className="hover:bg-page/50 transition-colors font-mono">
                          {r.map((cell, ci) => (
                            <td key={ci} className="py-2.5 px-4 text-main">
                              {cell === null ? 'null' : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
