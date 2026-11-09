import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { BarChart3 } from 'lucide-react';
import { ChartHint } from '../../types/query';

export interface ChartPanelProps {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  chartHint?: ChartHint | null;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ columns, rows, chartHint }) => {
  const chartType = chartHint?.type || 'bar';
  const chartTitle = chartHint?.title || 'Data visualization';

  // Palette colors defined strictly in UI_DESIGN.md
  const themeColors = {
    primary: '#3368A0',
    secondary: '#66A3BF',
    ink: '#14283D',
    tint: '#C8DFDB',
    surface: '#F2EFE7',
    grid: '#D9D5CC',
  };

  const { plotData, plotLayout } = useMemo(() => {
    if (!columns || !rows || rows.length === 0) {
      return { plotData: [], plotLayout: {} };
    }

    // Determine column indices for x and y
    const xColName = chartHint?.x || columns[0];
    const yColName = Array.isArray(chartHint?.y) ? chartHint?.y[0] : chartHint?.y || columns[1] || columns[0];

    const xIdx = columns.findIndex((c) => c.toLowerCase() === xColName.toLowerCase());
    const yIdx = columns.findIndex((c) => c.toLowerCase() === yColName.toLowerCase());

    const actualXIdx = xIdx !== -1 ? xIdx : 0;
    const actualYIdx = yIdx !== -1 ? yIdx : Math.min(1, columns.length - 1);

    const parseVal = (v: any) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const clean = v.replace(/[$,%]/g, '').trim();
        const num = parseFloat(clean);
        return isNaN(num) ? v : num;
      }
      return v;
    };

    const xVals = rows.map((r) => parseVal(r[actualXIdx]));
    const yVals = rows.map((r) => parseVal(r[actualYIdx]));

    let data: any[] = [];

    if (chartType === 'horizontal_bar') {
      // Horizontal bar: y-axis is category, x-axis is numeric metric
      data = [
        {
          type: 'bar',
          orientation: 'h',
          x: xVals,
          y: yVals,
          marker: {
            color: themeColors.primary,
          },
          hoverinfo: 'x+y',
        },
      ];
    } else if (chartType === 'pie') {
      data = [
        {
          type: 'pie',
          labels: yVals,
          values: xVals,
          marker: {
            colors: [themeColors.primary, themeColors.secondary, themeColors.ink, themeColors.tint],
          },
          textinfo: 'label+percent',
        },
      ];
    } else if (chartType === 'line') {
      data = [
        {
          type: 'scatter',
          mode: 'lines+markers',
          x: xVals,
          y: yVals,
          line: { color: themeColors.primary, width: 2.5 },
          marker: { color: themeColors.ink, size: 6 },
        },
      ];
    } else {
      // Standard vertical bar
      data = [
        {
          type: 'bar',
          x: xVals,
          y: yVals,
          marker: {
            color: themeColors.primary,
          },
        },
      ];
    }

    const layout: any = {
      autosize: true,
      margin: { l: 80, r: 24, t: 30, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: '"Nohemi", system-ui, -apple-system, sans-serif',
        size: 11,
        color: themeColors.ink,
      },
      showlegend: false,
      xaxis: {
        showgrid: true,
        gridcolor: themeColors.grid,
        zerolinecolor: themeColors.grid,
        tickfont: { family: 'ui-monospace, monospace', size: 10, color: '#4A5F73' },
      },
      yaxis: {
        showgrid: chartType !== 'horizontal_bar',
        gridcolor: themeColors.grid,
        zerolinecolor: themeColors.grid,
        tickfont: { family: 'ui-monospace, monospace', size: 10, color: '#4A5F73' },
      },
    };

    return { plotData: data, plotLayout: layout };
  }, [columns, rows, chartHint, chartType]);

  if (!columns || !rows || rows.length === 0) {
    return (
      <div className="flex flex-col h-full rounded-lg border border-tint bg-surface p-6 items-center justify-center text-ink-muted text-xs">
        <span>No chart data available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg border border-tint bg-surface shadow-subtle overflow-hidden">
      {/* Chart Title Header */}
      <div className="px-4 py-2.5 bg-surface border-b border-tint flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-ink">
            {chartTitle}
          </span>
        </div>
      </div>

      {/* Plotly Container */}
      <div className="flex-1 min-h-[220px] p-2 flex items-center justify-center">
        <Plot
          data={plotData}
          layout={plotLayout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

