import React, { useState, useRef, useCallback } from 'react';
import {
  Columns,
  SplitSquareVertical,
  Maximize2,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { UploadedImageState, AnalysisResponse } from '../../types/analysis';

interface ComparisonViewerProps {
  beforeImage: UploadedImageState;
  afterImage: UploadedImageState;
  result?: AnalysisResponse | null;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  beforeImage,
  afterImage,
  result,
}) => {
  const [mode, setMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // If alignment produced an aligned comparison image, use it for perfect pixel alignment in slider!
  const targetImageUrl = result?.aligned_after_data_url || afterImage.previewUrl;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging && e.type !== 'click') return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(pct);
    },
    [isDragging]
  );

  return (
    <div className="rounded-2xl bg-space-900 border border-slate-800/80 p-5 shadow-lg space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono flex items-center space-x-2">
            <Layers className="w-4 h-4 text-mint-accent" />
            <span>Multi-Temporal Comparison</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare earlier reference satellite acquisition with subsequent comparison image
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 p-1 bg-space-950 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('slider')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'slider'
                ? 'bg-space-800 text-mint-accent border border-mint-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('side-by-side')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'side-by-side'
                ? 'bg-space-800 text-mint-accent border border-mint-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Interactive Display Canvas */}
      {mode === 'slider' ? (
        <div className="flex flex-col space-y-2">
          {/* Split Slider Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleMouseMove}
            onClick={(e) => handleMouseMove(e as any)}
            className="relative w-full aspect-video rounded-xl bg-space-950 border border-slate-800 overflow-hidden select-none cursor-ew-resize group"
          >
            {/* Base Image (AFTER / COMPARISON) */}
            <img
              src={targetImageUrl}
              alt="Comparison Acquisition"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Overlaid Clipping Container (BEFORE / REFERENCE) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none border-r-2 border-mint-accent shadow-2xl"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeImage.previewUrl}
                alt="Reference Acquisition"
                className="absolute inset-y-0 left-0 h-full max-w-none object-cover"
                style={{
                  width: containerRef.current
                    ? `${containerRef.current.clientWidth}px`
                    : '100%',
                }}
              />
            </div>

            {/* Interactive Divider Handle */}
            <div
              className="absolute inset-y-0 pointer-events-none flex items-center justify-center -translate-x-1/2"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-mint-accent text-space-950 font-bold text-xs flex items-center justify-center shadow-lg border-2 border-space-950 transform group-hover:scale-110 transition-transform">
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Corner Badges */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-space-950/80 backdrop-blur border border-slate-700/80 text-[11px] font-mono text-mint-accent font-semibold pointer-events-none">
              BEFORE: {beforeImage.filename}
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-space-950/80 backdrop-blur border border-slate-700/80 text-[11px] font-mono text-slate-300 font-semibold pointer-events-none">
              AFTER: {afterImage.filename}
            </div>

            {/* Acquisition dates */}
            {(beforeImage.captureDate || afterImage.captureDate) && (
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-space-950/90 text-[10px] font-mono text-slate-400 border border-slate-800 pointer-events-none">
                Ref Date: {beforeImage.captureDate || 'N/A'} | Comp Date: {afterImage.captureDate || 'N/A'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
            <span>Drag slider or click anywhere to inspect surface divergence</span>
            <span>Split: {Math.round(sliderPosition)}% Reference / {100 - Math.round(sliderPosition)}% Comparison</span>
          </div>
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reference Image */}
          <div className="flex flex-col space-y-2">
            <div className="relative aspect-video rounded-xl bg-space-950 border border-slate-800 overflow-hidden group">
              <img
                src={beforeImage.previewUrl}
                alt="Reference (Before)"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-space-950/85 backdrop-blur border border-slate-700 text-[11px] font-mono text-mint-accent font-semibold">
                BEFORE (Reference)
              </div>
              {beforeImage.captureDate && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-space-950/85 text-[10px] font-mono text-slate-400 border border-slate-800">
                  Date: {beforeImage.captureDate}
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-slate-400 truncate">
              {beforeImage.filename} ({beforeImage.dimensions?.width}×{beforeImage.dimensions?.height} px)
            </div>
          </div>

          {/* Comparison Image */}
          <div className="flex flex-col space-y-2">
            <div className="relative aspect-video rounded-xl bg-space-950 border border-slate-800 overflow-hidden group">
              <img
                src={targetImageUrl}
                alt="Comparison (After)"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-space-950/85 backdrop-blur border border-slate-700 text-[11px] font-mono text-slate-200 font-semibold">
                AFTER (Comparison {result?.aligned_after_data_url ? '• Aligned' : ''})
              </div>
              {afterImage.captureDate && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-space-950/85 text-[10px] font-mono text-slate-400 border border-slate-800">
                  Date: {afterImage.captureDate}
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-slate-400 truncate">
              {afterImage.filename} ({afterImage.dimensions?.width}×{afterImage.dimensions?.height} px)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
