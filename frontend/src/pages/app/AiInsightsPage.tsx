import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Zap,
  Flame,
  ChevronRight,
  RefreshCw,
  Share2,
} from 'lucide-react';

import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ChartPanel } from '../../components/query/ChartPanel';
import { useToast } from '../../components/common/Toast';

import {
  executeBackendInsights,
  BackendInsightsResponse,
} from '../../services/backendApi';

export const AiInsightsPage: React.FC = () => {
  const { activeDataset } = useDataset();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'revenue' | 'retention' | 'anomalies'
  >('all');

  const [selectedInsightId, setSelectedInsightId] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [insightsData, setInsightsData] =
    useState<BackendInsightsResponse | null>(null);

  const [isLoadingInsights, setIsLoadingInsights] =
    useState(false);

  const [insightsError, setInsightsError] =
    useState<string | null>(null);

  const datasetName = activeDataset?.name || 'No dataset selected';

  // --------------------------------------------------
  // FETCH REAL BACKEND INSIGHTS
  // --------------------------------------------------

  const fetchInsights = useCallback(async (): Promise<boolean> => {
    if (!activeDataset?.id) {
      setInsightsData(null);
      setSelectedInsightId('');
      return false;
    }

    try {
      setIsLoadingInsights(true);
      setInsightsError(null);

      const response = await executeBackendInsights(
        activeDataset.id
      );

      setInsightsData(response);

      setSelectedInsightId(
        response.findings?.[0]?.id ||
        (response.outliers?.[0]
          ? `anomaly-${response.outliers[0].id}`
          : '')
      );

      return true;

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to generate insights.';

      setInsightsError(message);
      showToast(message, 'error');

      return false;

    } finally {
      setIsLoadingInsights(false);
    }
  }, [activeDataset?.id, showToast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // --------------------------------------------------
  // DYNAMIC KEY FINDINGS
  // --------------------------------------------------

  const backendFindings = insightsData?.findings ?? [];

  // Convert detected outliers into selectable anomaly findings.
  const anomalyFindings = (insightsData?.outliers ?? []).map(
    (outlier) => ({
      id: `anomaly-${outlier.id}`,
      category: 'anomalies',
      title: `Unusual ${outlier.metric} detected`,
      impact: outlier.value,
      confidence: `${outlier.score} deviation`,
      type: 'warning',
      summary: `${outlier.metric} has an observed value of ${outlier.value}, compared with the normal range of ${outlier.normalRange}.`,
      recommendation: `Review this unusual ${outlier.metric} observation. Status: ${outlier.status}.`,
    })
  );

  const keyFindings = [
    ...backendFindings,
    ...anomalyFindings,
  ];

  const filteredFindings = keyFindings.filter((item) => {
    if (activeFilter === 'all') return true;

    return item.category.toLowerCase() === activeFilter;
  });

  const selectedFinding =
    keyFindings.find(
      (item) => item.id === selectedInsightId
    ) || keyFindings[0];

  // --------------------------------------------------
  // DYNAMIC TREND ANALYSIS
  // --------------------------------------------------

  const trendChartData = insightsData?.trend;

  // --------------------------------------------------
  // DYNAMIC CORRELATION DATA
  // --------------------------------------------------

  const correlationData = insightsData?.correlations ?? [];

  // --------------------------------------------------
  // DYNAMIC OUTLIER DATA
  // --------------------------------------------------

  const outliersList = insightsData?.outliers ?? [];

  // --------------------------------------------------
  // REFRESH INSIGHTS
  // --------------------------------------------------

  const handleRefreshInsights = async () => {
    setIsRefreshing(true);

    const success = await fetchInsights();

    setIsRefreshing(false);

    if (success) {
      showToast(
        `Analysis refreshed for ${datasetName}.`,
        'success'
      );
    }
  };

  // --------------------------------------------------
  // SHARE REAL INSIGHTS
  // --------------------------------------------------

  const handleShareBrief = async () => {
    if (!insightsData) {
      showToast('No insights available to share.', 'error');
      return;
    }

    const brief = [
      `DataTalk AI - Insights Brief`,
      `Dataset: ${datasetName}`,
      `Total Records: ${insightsData.row_count}`,
      '',
      'KEY FINDINGS',
      ...keyFindings.map(
        (item, index) =>
          `${index + 1}. ${item.title}\n${item.summary}\nRecommendation: ${item.recommendation}`
      ),
      '',
      'CORRELATIONS',
      ...correlationData.map(
        (item) =>
          `${item.metricA} vs ${item.metricB}: ${item.score} (${item.strength})`
      ),
    ].join('\n\n');

    try {
      await navigator.clipboard.writeText(brief);

      showToast(
        'Actual insight brief copied to clipboard.',
        'success'
      );
    } catch {
      showToast(
        'Unable to copy the insight brief.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span>Workspace</span>
            <span>/</span>

            <span className="font-mono text-primary font-medium">
              {datasetName}
            </span>

            <span>/</span>

            <span className="text-main font-medium">
              AI Insights Studio
            </span>
          </div>

          <h2 className="text-title-page font-semibold tracking-tight text-main mt-1 flex items-center gap-2">
            <span>Autonomous AI Insights Studio</span>

            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              In-Memory AI Engine
            </span>
          </h2>

          <p className="text-body text-secondary mt-1">
            Automated discovery of statistical anomalies, trend shifts, and correlation clusters directly inferred from your active tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshInsights}
            disabled={isRefreshing || isLoadingInsights}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            }
          >
            Re-run Analysis
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleShareBrief}
            icon={<Share2 className="w-4 h-4" />}
          >
            Share Brief
          </Button>
        </div>
      </div>

      {/* Backend Status */}
      {isLoadingInsights && (
        <div className="text-caption text-secondary">
          Analyzing your uploaded dataset...
        </div>
      )}

      {insightsData && !isLoadingInsights && (
        <div className="text-caption text-secondary">
          {keyFindings.length} insights generated from{' '}
          {insightsData.row_count} dataset records.
        </div>
      )}

      {insightsError && (
        <div className="text-caption text-destructive">
          {insightsError}
        </div>
      )}

      {/* Filter Category Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <span className="text-caption font-medium text-secondary mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>

        {[
          {
            id: 'all',
            label: `All Insights (${keyFindings.length})`,
          },
          {
            id: 'revenue',
            label: `Revenue & Growth (${keyFindings.filter((item) => item.category.toLowerCase() === 'revenue').length})`,
          },
          {
            id: 'retention',
            label: `Customer Dynamics (${keyFindings.filter((item) => item.category.toLowerCase() === 'retention').length})`,
          },
          {
            id: 'anomalies',
            label: `Statistical Anomalies (${anomalyFindings.length})`,
          },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() =>
              setActiveFilter(
                btn.id as typeof activeFilter
              )
            }
            className={`px-3 py-1.5 rounded-xl text-caption font-medium transition-all cursor-pointer ${
              activeFilter === btn.id
                ? 'bg-primary text-primary-text font-semibold shadow-sm'
                : 'bg-page border border-border text-secondary hover:text-main hover:border-primary/50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Key Findings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {filteredFindings.map((finding) => {
          const isSelected =
            finding.id === selectedInsightId;

          return (
            <Card
              key={finding.id}
              variant="glass"
              padded="md"
              hoverable
              onClick={() =>
                setSelectedInsightId(finding.id)
              }
              className={`flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-primary border-primary shadow-glow'
                  : 'hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-semibold text-secondary tracking-wider">
                  {finding.category}
                </span>

                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                    finding.type === 'positive'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : finding.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {finding.impact}
                </span>
              </div>

              <h4 className="font-semibold text-main text-caption leading-snug line-clamp-2">
                {finding.title}
              </h4>

              <p className="text-xs text-secondary line-clamp-2">
                {finding.summary}
              </p>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-secondary font-mono">
                <span>{finding.confidence}</span>

                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </Card>
          );
        })}

        {!isLoadingInsights && filteredFindings.length === 0 && (
          <div className="col-span-full text-center py-10 text-caption text-secondary">
            No insights found for this category in the selected dataset.
          </div>
        )}
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Trend Analysis Chart */}
        <div className="lg:col-span-8 h-[380px]">
          {trendChartData ? (
            <ChartPanel
              columns={trendChartData.columns}
              rows={trendChartData.rows}
              chartHint={trendChartData.chartHint}
            />
          ) : (
            <Card
              variant="glass"
              padded="lg"
              className="h-full flex items-center justify-center"
            >
              <p className="text-caption text-secondary">
                No trend data available for this dataset.
              </p>
            </Card>
          )}
        </div>

        {/* Insight Summary */}
        <div className="lg:col-span-4">
          <Card
            variant="glass"
            padded="lg"
            className="h-full flex flex-col justify-between space-y-4"
          >
            {selectedFinding ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
                      <Sparkles className="w-4 h-4" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-main text-caption">
                        Autonomous Synthesis
                      </h3>

                      <span className="text-xs text-secondary font-mono">
                        {selectedFinding.confidence}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-page border border-border space-y-2">
                    <div className="text-xs uppercase font-mono font-semibold text-primary">
                      Key Discovery
                    </div>

                    <h4 className="font-semibold text-main text-sm leading-snug">
                      {selectedFinding.title}
                    </h4>

                    <p className="text-caption text-secondary leading-relaxed">
                      {selectedFinding.summary}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-brand-subtle border border-primary/20 space-y-2">
                    <div className="text-xs uppercase font-mono font-semibold text-primary flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Prescribed Action
                    </div>

                    <p className="text-caption text-main font-medium leading-relaxed">
                      {selectedFinding.recommendation}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  icon={<ArrowUpRight className="w-4 h-4" />}
                  onClick={() => {
                    showToast(
                      'Recommendation selected. Automated rule execution is not connected yet.',
                      'success'
                    );
                  }}
                >
                  Apply Prescribed Rule
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-caption text-secondary">
                No insight selected or available.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Correlation Heatmap */}
        <div className="lg:col-span-6">
          <Card
            variant="glass"
            padded="md"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />

                <h3 className="font-semibold text-title-card text-main">
                  Correlation Heatmap
                </h3>
              </div>

              <Badge variant="outline" size="sm">
                Pearson r · Dataset
              </Badge>
            </div>

            <p className="text-caption text-secondary">
              Statistical relationships identified between numeric columns in your selected dataset.
            </p>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-caption">
                <thead>
                  <tr className="border-b border-border text-secondary text-xs font-mono uppercase">
                    <th className="pb-2.5 font-medium">
                      Dimension A
                    </th>

                    <th className="pb-2.5 font-medium">
                      Dimension B
                    </th>

                    <th className="pb-2.5 font-medium text-right">
                      Coefficient
                    </th>

                    <th className="pb-2.5 font-medium text-right">
                      Strength
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {correlationData.map((corr, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-page/50 transition-colors"
                    >
                      <td className="py-2.5 font-mono text-main font-medium">
                        {corr.metricA}
                      </td>

                      <td className="py-2.5 font-mono text-secondary">
                        {corr.metricB}
                      </td>

                      <td className="py-2.5 font-mono font-semibold text-right">
                        <span className={`px-2 py-0.5 rounded ${corr.color}`}>
                          {corr.score}
                        </span>
                      </td>

                      <td className="py-2.5 text-secondary text-right text-xs">
                        {corr.strength}
                      </td>
                    </tr>
                  ))}

                  {correlationData.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-secondary"
                      >
                        No correlation data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Outlier Detection */}
        <div className="lg:col-span-6">
          <Card
            variant="glass"
            padded="md"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />

                <h3 className="font-semibold text-title-card text-main">
                  Outlier & Anomaly Detection
                </h3>
              </div>

              <Badge variant="outline" size="sm">
                Z-Score &gt; 3.0σ
              </Badge>
            </div>

            <p className="text-caption text-secondary">
              Unusual observations detected in your dataset that may require further review.
            </p>

            <div className="space-y-2.5">
              {outliersList.map((outlier) => (
                <div
                  key={outlier.id}
                  className="p-3 rounded-xl bg-page border border-border flex items-center justify-between gap-3 text-caption"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs font-semibold">
                      !
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-main">
                          {outlier.id}
                        </span>

                        <span className="text-xs text-secondary">
                          ({outlier.metric})
                        </span>
                      </div>

                      <div className="text-xs text-secondary">
                        Observed:{' '}
                        <strong className="text-main font-mono">
                          {outlier.value}
                        </strong>{' '}
                        vs expected {outlier.normalRange}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold bg-destructive/10 text-destructive">
                      {outlier.score}
                    </span>

                    <div className="text-[11px] text-secondary mt-0.5">
                      {outlier.status}
                    </div>
                  </div>
                </div>
              ))}

              {outliersList.length === 0 && (
                <div className="text-center py-8 text-caption text-secondary">
                  No significant outliers detected in this dataset.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};