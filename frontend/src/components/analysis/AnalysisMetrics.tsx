import React from 'react';
import {
  Activity,
  Percent,
  Layers,
  Maximize2,
  Cpu,
  Compass,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';
import { getIntensityBadgeStyle, formatNumber } from '../../utils/formatters';

interface AnalysisMetricsProps {
  result: AnalysisResponse;
}

export const AnalysisMetrics: React.FC<AnalysisMetricsProps> = ({ result }) => {
  const stats = result.statistics;
  const alignment = result.alignment;
  const dims = result.comparison_dimensions;
  const badgeStyle = getIntensityBadgeStyle(stats.intensity_category);

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Changed Surface Percentage */}
        <div className="p-4 rounded-2xl bg-space-900 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Surface Altered</span>
            <Percent className="w-4 h-4 text-mint-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {stats.changed_percentage.toFixed(2)}%
            </div>
            <div className="mt-1 flex items-center space-x-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                {stats.intensity_category} Impact
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Changed Pixels */}
        <div className="p-4 rounded-2xl bg-space-900 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Pixel Divergence</span>
            <Activity className="w-4 h-4 text-coral-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {formatNumber(stats.changed_pixels)}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              of {formatNumber(stats.total_pixels)} total px
            </div>
          </div>
        </div>

        {/* KPI 3: Retained Regions */}
        <div className="p-4 rounded-2xl bg-space-900 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Retained Regions</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {stats.retained_regions_count}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              {stats.filtered_noise_count} noise clusters filtered
            </div>
          </div>
        </div>

        {/* KPI 4: Largest Single Region */}
        <div className="p-4 rounded-2xl bg-space-900 border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Largest Cluster</span>
            <Maximize2 className="w-4 h-4 text-mint-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {stats.largest_region_percentage.toFixed(2)}%
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              {formatNumber(stats.largest_region_pixels)} px area
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Meta Bar: Alignment & Frame Geometry */}
      <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {alignment.status === 'aligned' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
          <span className="text-slate-300">
            Registration: <strong className="text-slate-100">{alignment.method}</strong> ({alignment.status.toUpperCase()})
          </span>
          {alignment.inliers > 0 && (
            <span className="text-slate-500">
              • {alignment.inliers} inliers ({alignment.matches_found} matches)
            </span>
          )}
        </div>

        <div className="text-slate-400">
          Geometry: <span className="text-slate-200">{dims.width} × {dims.height} px</span> | Sensitivity: <span className="text-mint-accent capitalize">{result.sensitivity}</span>
        </div>
      </div>
    </div>
  );
};
