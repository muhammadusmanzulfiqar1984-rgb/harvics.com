import React from 'react';
import Link from 'next/link';
import { Bell, UserCircle } from 'lucide-react';
import { HarvicsAIPanel } from '../../ui/crm/HarvicsAIPanel';
import type { AISuggestion } from '../../ui/crm/HarvicsCard';

interface CRMPageLayoutProps {
  domainName: string;
  breadcrumbs: { label: string; href?: string }[];
  children: React.ReactNode;
  aiSuggestions?: AISuggestion[];
  aiLoading?: boolean;
  onAskAI?: (query: string) => void;
  aiActions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export const CRMPageLayout: React.FC<CRMPageLayoutProps> = ({
  domainName,
  breadcrumbs,
  children,
  aiSuggestions = [],
  aiLoading = false,
  onAskAI,
  aiActions,
  primaryAction,
}) => {
  return (
    <div className="min-h-screen bg-[#050816] text-[#e2e8f0] font-['DM_Sans'] p-4 flex flex-col">
      {/* Element 1: Header Bar */}
      <header className="h-[48px] bg-[#0f172a]/97 border-b border-[rgba(75,85,99,0.3)] sticky top-0 z-50 flex items-center justify-between px-4 rounded-t-[10px]">
        {/* Left: Domain & AI Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-medium">{domainName}</h1>
            <span 
              className={`w-2 h-2 rounded-full ${aiLoading ? 'bg-[#f59e0b] animate-pulse' : aiSuggestions.length > 0 ? 'bg-[#22c55e]' : 'bg-gray-500'}`}
              title={aiLoading ? "AI Processing..." : aiSuggestions.length > 0 ? "AI Suggestions Ready" : "AI Idle"}
            />
          </div>
        </div>

        {/* Center: Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[12px] text-[#94a3b8]">
          <span className="text-[#475569]">Harvics OS</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-[#475569]">›</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-white">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right: Icons & Primary Action */}
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#f97316] rounded-full border border-[#0f172a]"></span>
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <UserCircle size={18} />
          </button>
          {primaryAction && (
            primaryAction.href ? (
              <Link 
                href={primaryAction.href}
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#050816] text-[12px] font-bold py-1.5 px-4 rounded-full transition-all shadow-[0_0_12px_rgba(251,191,36,0.2)] hover:shadow-[0_0_12px_rgba(251,191,36,0.35)]"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <button 
                onClick={primaryAction.onClick}
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#050816] text-[12px] font-bold py-1.5 px-4 rounded-full transition-all shadow-[0_0_12px_rgba(251,191,36,0.2)] hover:shadow-[0_0_12px_rgba(251,191,36,0.35)]"
              >
                {primaryAction.label}
              </button>
            )
          )}
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex flex-1 mt-4 gap-4 overflow-hidden">
        {/* Elements 2 & 3: Main Content Area */}
        <main className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          {children}
        </main>

        {/* Element 4: AI Alerts Panel */}
        <aside className="w-[240px] flex-shrink-0 flex flex-col gap-4">
          <HarvicsAIPanel 
            suggestions={aiSuggestions} 
            loading={aiLoading} 
            onAsk={onAskAI}
            actions={aiActions}
          />
        </aside>
      </div>
    </div>
  );
};
