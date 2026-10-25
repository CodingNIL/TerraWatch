import React from 'react';
import {
  Satellite,
  Compass,
  Layers,
  FileText,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export type NavTab = 'overview' | 'analysis' | 'reports' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasResults: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  hasResults,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: Compass,
      desc: 'Platform summary & workflow',
    },
    {
      id: 'analysis' as NavTab,
      label: 'Change Analysis',
      icon: Layers,
      desc: 'Image detection & metrics',
      badge: hasResults ? 'Active' : undefined,
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports Archive',
      icon: FileText,
      desc: 'Historical intelligence exports',
      planned: true,
    },
    {
      id: 'about' as NavTab,
      label: 'About & Methodology',
      icon: Info,
      desc: 'Sensor physics & limits',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-space-900 border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-space-800 border border-mint-500/30 text-mint-accent shadow-sm flex-shrink-0">
            <Satellite className="w-5 h-5 animate-pulse text-mint-accent" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint-500"></span>
            </span>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold tracking-tight text-slate-100 text-lg">TerraWatch</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-space-800 border border-slate-700 text-mint-accent font-semibold">
                  MVP
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">Satellite Change Intelligence</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center rounded-xl p-3 transition-all text-left group relative ${
                isActive
                  ? 'bg-space-800/90 text-mint-accent border border-mint-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/40'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-mint-accent' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium tracking-wide truncate">{item.label}</span>
                    <span className="text-[11px] text-slate-500 truncate">{item.desc}</span>
                  </div>

                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-mint-500/10 text-mint-accent border border-mint-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.planned && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Planned
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Engine Specs Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/80 bg-space-950/40 m-2 rounded-xl border">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-mint-accent" />
            <span>Edge CV Engine</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Pipeline:</span>
              <span className="text-slate-300">OpenCV + NumPy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registration:</span>
              <span className="text-slate-300">ORB RANSAC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max Sensor:</span>
              <span className="text-slate-300">10 MB / 16 MP</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center space-x-1.5 text-[10px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Air-gapped / Local execution</span>
          </div>
        </div>
      )}
    </aside>
  );
};
