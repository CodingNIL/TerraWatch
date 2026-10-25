import React from 'react';
import { Binary, Shield, Filter, Info } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';

interface ChangeMaskViewerProps {
  result: AnalysisResponse;
}

export const ChangeMaskViewer: React.FC<ChangeMaskViewerProps> = ({ result }) => {
  const stats = result.statistics;
  const dims = result.comparison_dimensions;

  return (
    <div className="rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono flex items-center space-x-2">
              <Binary className="w-4 h-4 text-mint-accent" />
              <span>Binary Difference Mask</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 border border-slate-700 text-slate-300">
              {dims.width} × {dims.height} px
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cartographic raster mask isolating morphed connected components above {result.min_region_size} px
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 bg-space-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#141821] border border-slate-700 inline-block"></span>
            <span className="text-slate-400">Stable Surface</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-coral-500 inline-block"></span>
            <span className="text-coral-400 font-medium">Altered Signal</span>
          </div>
        </div>
      </div>

      {/* Difference Mask Canvas */}
      <div className="relative aspect-video rounded-xl bg-space-950 border border-slate-800 overflow-hidden select-none">
        <img
          src={result.difference_mask_data_url}
          alt="Binary Difference Mask"
          className="w-full h-full object-cover"
        />

        {/* Bottom Metadata bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300 px-3 py-1.5 rounded-lg bg-space-950/85 backdrop-blur border border-slate-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-mint-accent" />
            <span>
              Noise Rejected: <strong className="text-slate-100">{stats.filtered_noise_count}</strong> micro-components (&lt; {result.min_region_size} px)
            </span>
          </div>
          <div className="hidden sm:block text-slate-400">
            Retained Clusters: <strong className="text-mint-accent">{stats.retained_regions_count}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
