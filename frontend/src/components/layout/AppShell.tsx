import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewAnalysis: () => void;
  onLoadSample: (sampleId: string) => void;
  isAnalyzing: boolean;
  hasResults: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  onNewAnalysis,
  onLoadSample,
  isAnalyzing,
  hasResults,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-space-950 text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hasResults={hasResults}
      />

      {/* Main Execution Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          onNewAnalysis={onNewAnalysis}
          onLoadSample={onLoadSample}
          isAnalyzing={isAnalyzing}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
