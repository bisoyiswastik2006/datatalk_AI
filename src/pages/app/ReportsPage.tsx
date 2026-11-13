import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Clock,
  Terminal,
  Table,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useQuery } from '../../context/QueryContext';
import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ChartPanel } from '../../components/query/ChartPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { QueryResponse } from '../../types/query';

interface SessionReportItem {
  id: string;
  question: string;
  timestamp: string;
  response: QueryResponse;
}

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, queryResult } = useQuery();
  const { activeDataset } = useDataset();
  const { showToast } = useToast();

  // Extract all successful query responses from session chat history
  const sessionReports: SessionReportItem[] = React.useMemo(() => {
    const list: SessionReportItem[] = [];

    // Find question-answer pairs from messages
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        const nextMsg = messages[i + 1];
        if (nextMsg && nextMsg.role === 'assistant' && nextMsg.queryResult) {
          list.push({
            id: nextMsg.id || `rep-${i}`,
            question: msg.content,
            timestamp: msg.timestamp,
            response: nextMsg.queryResult,
          });
        }
      }
    }

    // Fallback: if list is empty but queryResult exists, include current queryResult
    if (list.length === 0 && queryResult && queryResult.answer) {
      list.push({
        id: queryResult.query_id || 'curr-query',
        question: 'Current analytical query',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: queryResult,
      });
    }

    return list;
  }, [messages, queryResult]);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    sessionReports.length > 0 ? sessionReports[0].id : null
  );

  const activeReport = sessionReports.find((r) => r.id === selectedReportId) || sessionReports[0] || null;

  // Client-side CSV export of the actual rows returned
  const handleExportCsv = (report: SessionReportItem) => {
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
    link.setAttribute('download', `datatalk_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV export downloaded (actual rows returned)', 'success');
  };

  // PDF generation via standard browser print dialog + print stylesheet
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border shrink-0 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-title-page font-semibold tracking-tight text-main">
              Reports & Summaries
            </h2>
            <Badge variant="tint" size="sm">
              Session history
            </Badge>
          </div>
          <p className="text-body text-secondary">
            Generated insights, SQL queries, and tabular data formatted for export and presentation.
          </p>
        </div>

        {/* Global Print / PDF Action */}
        {sessionReports.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrintPdf}
              icon={<Printer className="w-4 h-4" />}
            >
              Print / Save as PDF
            </Button>
          </div>
        )}
      </div>

      {/* Main Body */}
      {sessionReports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card variant="glass" padded="lg" className="max-w-md w-full text-center">
            <EmptyState
              icon={<FileText className="w-10 h-10 text-primary" />}
              title="No session reports yet"
              description="Run analytical questions in Ask Your Data to generate printable session summaries, SQL audit logs, and downloadable CSV exports."
              actionText="Ask a question"
              onAction={() => navigate('/app/ask')}
            />
          </Card>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Left Column: Report List (Hidden in print) */}
          <div className="lg:col-span-4 flex flex-col min-h-0 space-y-3 no-print">
            <div className="flex items-center justify-between text-caption font-medium text-secondary px-1">
              <span>Session queries ({sessionReports.length})</span>
              <span>Click to view</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
              {sessionReports.map((item, idx) => {
                const isSelected = item.id === (activeReport?.id || selectedReportId);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedReportId(item.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-card border-primary ring-1 ring-primary shadow-sm'
                        : 'bg-card/50 hover:bg-card border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-caption font-semibold text-primary font-mono">
                        #{idx + 1}
                      </span>
                      <span className="text-caption text-secondary font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-body font-medium text-main mt-1.5 line-clamp-2 leading-snug">
                      {item.question}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-caption text-secondary">
                      <span>{item.response.row_count ?? 0} rows</span>
                      <span>•</span>
                      <span>{item.response.execution_ms ?? 0}ms</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Report View / Print Container */}
          <div className="lg:col-span-8 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {activeReport && (
              <div className="space-y-6">
                {/* Printable Report Header */}
                <Card variant="glass" padded="lg" className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-caption text-secondary">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Generated on {new Date().toLocaleDateString()}</span>
                        {activeDataset && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{activeDataset.name}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-title-page font-semibold text-main tracking-tight leading-tight">
                        {activeReport.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleExportCsv(activeReport)}
                        icon={<Download className="w-4 h-4" />}
                      >
                        Download CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrintPdf}
                        icon={<Printer className="w-4 h-4" />}
                      >
                        Print
                      </Button>
                    </div>
                  </div>

                  {/* Synthesized Executive Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-caption font-semibold text-primary">
                      <Sparkles className="w-4 h-4" />
                      <span>Executive answer</span>
                    </div>
                    <p className="text-title-card font-medium text-main leading-relaxed">
                      {activeReport.response.answer || activeReport.response.message}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-4 text-caption text-secondary pt-2">
                    {activeReport.response.confidence && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Confidence: {(activeReport.response.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-primary" />
                      {activeReport.response.row_count ?? 0} rows returned
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-secondary" />
                      {activeReport.response.execution_ms ?? 0}ms execution budget
                    </span>
                  </div>
                </Card>

                {/* SQL Audit Block */}
                {activeReport.response.sql && (
                  <Card variant="default" padded="md" className="space-y-2">
                    <div className="flex items-center justify-between text-caption font-medium text-secondary">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-main">Audit SQL statement</span>
                      </div>
                      <span className="font-mono">DuckDB ANSI-92</span>
                    </div>
                    <pre className="p-4 rounded-lg bg-page border border-border text-control font-mono text-main overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {activeReport.response.sql}
                    </pre>
                  </Card>
                )}

                {/* Tabular Data Preview */}
                {activeReport.response.columns && activeReport.response.rows && (
                  <Card variant="default" padded="none" className="overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-caption font-semibold text-main">
                        <Table className="w-4 h-4 text-primary" />
                        <span>Query tabular results (actual rows returned)</span>
                      </div>
                      <span className="text-caption text-secondary font-mono">
                        {activeReport.response.rows.length} rows
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                      <table className="w-full border-collapse text-left" role="table">
                        <thead className="bg-page/70 sticky top-0 border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4 text-table-header font-medium text-secondary whitespace-nowrap">
                              #
                            </th>
                            {activeReport.response.columns.map((c, i) => (
                              <th
                                key={i}
                                className="py-2.5 px-4 text-table-header font-medium text-secondary whitespace-nowrap"
                              >
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {activeReport.response.rows.map((r, ri) => (
                            <tr key={ri} className="hover:bg-page/40 transition-colors">
                              <td className="py-2 px-4 text-table-cell font-mono text-secondary whitespace-nowrap">
                                {ri + 1}
                              </td>
                              {r.map((v, ci) => (
                                <td
                                  key={ci}
                                  className="py-2 px-4 text-table-cell font-mono text-main whitespace-nowrap"
                                >
                                  {v !== null && v !== undefined ? String(v) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Visualization Preview */}
                {activeReport.response.columns && activeReport.response.rows && (
                  <div className="h-[340px]">
                    <ChartPanel
                      columns={activeReport.response.columns}
                      rows={activeReport.response.rows}
                      chartHint={activeReport.response.chart}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
