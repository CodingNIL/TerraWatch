import React from 'react';
import {
  Info,
  Cpu,
  Layers,
  ShieldCheck,
  Code2,
  Binary,
  Compass,
  FileCheck2
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-mint-accent text-xs font-mono mb-1">
          <Info className="w-4 h-4" />
          <span>TECHNICAL SPECIFICATIONS & METHODOLOGY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-mono">
          About TerraWatch
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Architectural overview, computer vision algorithms, and physical sensor limitations
        </p>
      </div>

      {/* Grid of Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CV Pipeline Card */}
        <div className="p-5 rounded-2xl bg-space-900 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-mint-accent">
            <Cpu className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-100 font-mono">
              Deterministic Computer Vision Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            TerraWatch uses classical, deterministic computer vision (OpenCV and NumPy) instead of black-box neural networks. This guarantees complete auditability, millisecond inference, and reproducible results on commodity hardware without GPUs.
          </p>
          <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-space-950 p-3 rounded-xl border border-slate-800">
            <div>• Feature Matching: ORB (Oriented FAST and Rotated BRIEF)</div>
            <div>• Registration: RANSAC 2D Affine Partial (Scale + Rotation + Shift)</div>
            <div>• Spectral Differencing: Weighted CIELAB + Grayscale absolute delta</div>
            <div>• Morphology: Dual-stage Open/Close structural kernels</div>
          </div>
        </div>

        {/* Stack & Design Card */}
        <div className="p-5 rounded-2xl bg-space-900 border border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-2 text-mint-accent">
            <Code2 className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-100 font-mono">
              Full-Stack Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modern decoupled architecture linking a high-performance Python FastAPI service to a responsive React/TypeScript geospatial workstation via REST contracts.
          </p>
          <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-space-950 p-3 rounded-xl border border-slate-800">
            <div>• Frontend: React 18, TypeScript, Vite, Tailwind CSS, Lucide</div>
            <div>• Backend: FastAPI, Uvicorn, OpenCV-headless, Pillow, Pydantic</div>
            <div>• Test Suite: Automated pytest test harness (100% passing)</div>
            <div>• Zero External Keys: Fully air-gapped local execution</div>
          </div>
        </div>
      </div>

      {/* Sensor Limitations Section */}
      <div className="p-6 rounded-2xl bg-space-900 border border-slate-800/80 space-y-4">
        <div className="flex items-center space-x-2 text-amber-400">
          <Layers className="w-4 h-4" />
          <h3 className="font-bold text-sm text-slate-100 font-mono uppercase tracking-wide">
            Understanding Satellite Radiometric Divergence
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Satellite sensors capture reflected electromagnetic radiation across optical and near-infrared bands. Several environmental and geometric phenomena can register as change signals even when ground features remain unchanged:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-space-950 border border-slate-850">
            <span className="text-mint-accent font-semibold block mb-1">Solar Zenith & Azimuth</span>
            <span className="text-slate-400 text-[11px] leading-relaxed block">
              Different time-of-day acquisitions cast varying mountain and structural shadows across the scene.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-slate-850">
            <span className="text-mint-accent font-semibold block mb-1">Phenological Cycles</span>
            <span className="text-slate-400 text-[11px] leading-relaxed block">
              Seasonal foliage leaf-out, grass browning, or crop harvest create large legitimate spectral shifts.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-slate-850">
            <span className="text-mint-accent font-semibold block mb-1">Atmospheric Scattering</span>
            <span className="text-slate-400 text-[11px] leading-relaxed block">
              Aerosols, thin cirrus haze, and humidity modulate surface reflectance contrast between passes.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-slate-850">
            <span className="text-mint-accent font-semibold block mb-1">Off-Nadir Parallax</span>
            <span className="text-slate-400 text-[11px] leading-relaxed block">
              Oblique sensor look angles view vertical structures (buildings, towers) with apparent displacement.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
