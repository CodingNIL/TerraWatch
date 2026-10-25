import React, { useState } from 'react';
import {
  Eye,
  Sliders,
  Square,
  Crosshair,
  Download,
  AlertCircle
} from 'lucide-react';
import { AnalysisResponse, RegionDetail } from '../../types/analysis';

interface ChangeOverlayProps {
  result: AnalysisResponse;
  activeRegionId: number | null;
  onSelectRegion: (id: number | null) => void;
}

export const ChangeOverlay: React.FC<ChangeOverlayProps> = ({
  result,
  activeRegionId,
  onSelectRegion,
}) => {
  const [opacity, setOpacity] = useState<number>(85); // 0 to 100
  const [showBoxes, setShowBoxes] = useState<boolean>(true);

  const baseImage = result.aligned_after_data_url || result.change_overlay_data_url;
  const overlayImage = result.change_overlay_data_url;

  const activeRegion = result.regions.find((r) => r.id === activeRegionId);
  const dims = result.comparison_dimensions;

  return (
    <div className="rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono flex items-center space-x-2">
              <Eye className="w-4 h-4 text-coral-400" />
              <span>Coral Change Overlay</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coral-500/15 border border-coral-500/40 text-coral-400 font-bold">
              {result.statistics.changed_percentage.toFixed(2)}% Altered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Translucent coral-red highlights delineate confirmed surface divergence regions
          </p>
        </div>

        {/* Overlay Controls */}
        <div className="flex items-center space-x-4">
          {/* Opacity Slider */}
          <div className="flex items-center space-x-2 bg-space-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-mono text-slate-400">Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
              className="w-20 accent-coral-500 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-300 w-7">{opacity}%</span>
          </div>

          {/* Show Bounding Boxes Toggle */}
          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              showBoxes
                ? 'bg-space-800 text-mint-accent border-mint-500/30'
                : 'bg-space-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Boxes</span>
          </button>
        </div>
      </div>

      {/* Viewport Canvas with Dynamic Highlighting */}
      <div className="relative aspect-video rounded-xl bg-space-950 border border-slate-800 overflow-hidden select-none">
        {/* Underlay: Aligned Base Image */}
        {result.aligned_after_data_url && (
          <img
            src={result.aligned_after_data_url}
            alt="Base Comparison"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay: Coral Highlight blended with opacity */}
        <img
          src={overlayImage}
          alt="Coral Change Highlight"
          style={{ opacity: opacity / 100 }}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
        />

        {/* SVG Vector Layer for Precise Bounding Boxes & Active Region Highlight */}
        <svg
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {showBoxes &&
            result.regions.map((reg) => {
              const isSelected = reg.id === activeRegionId;
              return (
                <g key={reg.id} className="pointer-events-auto cursor-pointer" onClick={() => onSelectRegion(reg.id)}>
                  <rect
                    x={reg.bbox.x}
                    y={reg.bbox.y}
                    width={reg.bbox.width}
                    height={reg.bbox.height}
                    fill={isSelected ? 'rgba(0, 245, 155, 0.15)' : 'none'}
                    stroke={isSelected ? '#00f59b' : 'rgba(255, 71, 87, 0.65)'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={isSelected ? 'none' : '4 2'}
                  />
                  {isSelected && (
                    <text
                      x={reg.bbox.x}
                      y={Math.max(16, reg.bbox.y - 6)}
                      fill="#00f59b"
                      fontSize="14"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      REG-{reg.id.toString().padStart(3, '0')} ({reg.area_percentage.toFixed(2)}%)
                    </text>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Active Region Focus Pill */}
        {activeRegion && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-space-900/90 backdrop-blur border border-mint-500/40 text-xs font-mono text-slate-200 flex items-center space-x-2 shadow-lg">
            <Crosshair className="w-4 h-4 text-mint-accent animate-spin" />
            <span>
              Target: <strong className="text-mint-accent">REG-{activeRegion.id.toString().padStart(3, '0')}</strong> • Area: {activeRegion.area_pixels.toLocaleString()} px ({activeRegion.area_percentage.toFixed(2)}%)
            </span>
            <button
              onClick={() => onSelectRegion(null)}
              className="text-slate-400 hover:text-slate-100 ml-2"
              title="Clear selection"
            >
              ×
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-space-950/80 backdrop-blur border border-slate-700/80 flex items-center space-x-2 text-[10px] font-mono text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-coral-500 inline-block"></span>
          <span>Divergence Highlight (Coral)</span>
        </div>
      </div>
    </div>
  );
};
