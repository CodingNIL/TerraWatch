import React, { useState } from 'react';
import {
  Layers,
  Crosshair,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';
import { RegionDetail } from '../../types/analysis';
import { formatNumber } from '../../utils/formatters';

interface RegionListProps {
  regions: RegionDetail[];
  activeRegionId: number | null;
  onSelectRegion: (id: number | null) => void;
}

export const RegionList: React.FC<RegionListProps> = ({
  regions,
  activeRegionId,
  onSelectRegion,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'area' | 'id' | 'intensity'>('area');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredRegions = regions.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const idStr = `reg-${r.id.toString().padStart(3, '0')}`.toLowerCase();
    return idStr.includes(term) || r.id.toString().includes(term);
  });

  const sortedRegions = [...filteredRegions].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'area') diff = a.area_pixels - b.area_pixels;
    if (sortBy === 'id') diff = a.id - b.id;
    if (sortBy === 'intensity') diff = a.mean_intensity - b.mean_intensity;
    return sortAsc ? diff : -diff;
  });

  return (
    <div className="rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-mint-accent" />
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono">
              Detected Change Clusters
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 border border-slate-700 text-slate-300">
              {regions.length} regions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a region below to locate and focus on the spatial visualization
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by REG ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-44 bg-space-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-mint-500/50"
          />
        </div>
      </div>

      {/* Table Container */}
      {sortedRegions.length === 0 ? (
        <div className="text-center py-8 text-xs font-mono text-slate-500">
          No regions matched your criteria or met the minimum area threshold.
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-space-950/60 divide-y divide-slate-850">
          {sortedRegions.map((region) => {
            const isSelected = region.id === activeRegionId;
            const regCode = `REG-${region.id.toString().padStart(3, '0')}`;

            return (
              <div
                key={region.id}
                onClick={() => onSelectRegion(isSelected ? null : region.id)}
                className={`p-3 text-xs font-mono transition-all flex items-center justify-between cursor-pointer hover:bg-space-800/60 ${
                  isSelected
                    ? 'bg-space-800/90 border-l-4 border-l-mint-accent text-slate-100'
                    : 'text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] border ${
                      isSelected
                        ? 'bg-mint-500/20 text-mint-accent border-mint-500/40'
                        : 'bg-space-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    #{region.id}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span>{regCode}</span>
                      {isSelected && (
                        <span className="text-[10px] text-mint-accent bg-mint-500/10 px-1.5 py-0.2 rounded border border-mint-500/30">
                          Active Target
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      BBox: [{region.bbox.x}, {region.bbox.y}, {region.bbox.width}, {region.bbox.height}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      {formatNumber(region.area_pixels)} px
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {region.area_percentage.toFixed(2)}% of frame
                    </span>
                  </div>

                  <div className="hidden sm:flex flex-col">
                    <span className="text-slate-400">Mean Δ: {region.mean_intensity}</span>
                    <span className="text-[10px] text-slate-500">
                      ({region.centroid_x.toFixed(0)}, {region.centroid_y.toFixed(0)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRegion(isSelected ? null : region.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-mint-500 text-space-950 border-mint-400'
                        : 'bg-space-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-space-800'
                    }`}
                    title={isSelected ? 'Deselect region' : 'Locate region'}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
