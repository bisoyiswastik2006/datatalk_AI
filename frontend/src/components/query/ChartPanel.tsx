import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { BarChart3 } from 'lucide-react';
import { ChartHint } from '../../types/query';
import { useTheme } from '../../context/ThemeContext';

export interface ChartPanelProps {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  chartHint?: ChartHint | null;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ columns, rows, chartHint }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartType = chartHint?.type || 'bar';
  const chartTitle = chartHint?.title || 'Data visualization';

  // Strict palette series order according to specification:
  // Dark mode:  #00B8FC, #FFFF00, #FD3500, #FFFFFF
  // Light mode: #0058FD, #00B8FC, #FD3500, #000000
  const seriesColors = isDark
    ? ['#00B8FC', '#FFFF00', '#FD3500', '#FFFFFF']
    : ['#0058FD', '#00B8FC', '#FD3500', '#000000'];

  const textColor = isDark ? '#A8B0BD' : '#4A5361';
  const headingColor = isDark ? '#FFFFFF' : '#000000';
  const gridColor = isDark ? '#232833' : '#D9DEE7';
  const hoverBgColor = isDark ? '#0F1115' : '#FFFFFF';

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
      data = [
        {
          type: 'bar',
          orientation: 'h',
          x: xVals,
          y: yVals,
          marker: {
            color: seriesColors[0],
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
            colors: seriesColors,
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
          line: { color: seriesColors[0], width: 2.5 },
          marker: { color: seriesColors[1], size: 7 },
        },
      ];
    } else {
      data = [
        {
          type: 'bar',
          x: xVals,
          y: yVals,
          marker: {
            color: seriesColors[0],
          },
        },
      ];
    }

    const layout: any = {
      autosize: true,
      margin: { l: 110, r: 24, t: 25, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: '"Nohemi", system-ui, -apple-system, sans-serif',
        size: 14,
        color: textColor,
      },
      showlegend: false,
      hoverlabel: {
        bgcolor: hoverBgColor,
        bordercolor: gridColor,
        font: {
          family: '"Nohemi", system-ui, -apple-system, sans-serif',
          color: headingColor,
          size: 14,
        },
      },
      xaxis: {
        showgrid: true,
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        tickfont: { family: 'ui-monospace, monospace', size: 13, color: textColor },
      },
      yaxis: {
        showgrid: chartType !== 'horizontal_bar',
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        tickfont: { family: 'ui-monospace, monospace', size: 13, color: textColor },
      },
    };

    return { plotData: data, plotLayout: layout };
  }, [columns, rows, chartHint, chartType, theme, isDark, seriesColors, textColor, headingColor, gridColor, hoverBgColor]);

  if (!columns || !rows || rows.length === 0) {
    return (
      <div className="flex flex-col h-full rounded-lg border border-border bg-card p-6 items-center justify-center text-secondary text-body">
        <span>No chart data available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      {/* Chart Title Header */}
      <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between shrink-0 select-none min-h-[48px]">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-title-card font-semibold text-main">
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
