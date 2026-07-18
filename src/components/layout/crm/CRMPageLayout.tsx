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
    <div className="min-h-screen bg-harvics-burgundy text-harvics-cream font-sans p-4 flex flex-col">
      {/* Header */}
      <header className="h-12 bg-harvics-burgundy/95 border-b border-harvics-goldDivider sticky top-0 z-50 flex items-center justify-between px-4 rounded-t-xl">
        {/* Left: Domain & AI Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-semibold text-harvics-cream">{domainName}</h1>
            <span
              className={`w-2 h-2 rounded-full ${
                aiLoading
                  ? 'bg-amber-400 animate-pulse'
                  : aiSuggestions.length > 0
                  ? 'bg-emerald-400'
                  : 'bg-harvics-muted'
              }`}
              title={aiLoading ? 'AI Processing…' : aiSuggestions.length > 0 ? 'AI Suggestions Ready' : 'AI Idle'}
            />
          </div>
        </div>

        {/* Centre: Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-[12px] text-harvics-muted">
          <span className="text-harvics-muted/60">Harvics OS</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-harvics-gold/50">›</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-harvics-cream transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-harvics-cream">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right: Icons & Primary Action */}
        <div className="flex items-center gap-4">
          <button className="text-harvics-muted hover:text-harvics-cream transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-harvics-gold rounded-full border border-harvics-burgundy" />
          </button>
          <button className="text-harvics-muted hover:text-harvics-cream transition-colors">
            <UserCircle size={18} />
          </button>
          {primaryAction && (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="bg-harvics-gold hover:bg-harvics-goldMuted text-harvics-burgundy text-[12px] font-bold py-1.5 px-4 rounded-full transition-all shadow-[0_0_12px_rgba(195, 163, 94,0.2)] hover:shadow-[0_0_12px_rgba(195, 163, 94,0.35)]"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <button
                onClick={primaryAction.onClick}
                className="bg-harvics-gold hover:bg-harvics-goldMuted text-harvics-burgundy text-[12px] font-bold py-1.5 px-4 rounded-full transition-all shadow-[0_0_12px_rgba(195, 163, 94,0.2)] hover:shadow-[0_0_12px_rgba(195, 163, 94,0.35)]"
              >
                {primaryAction.label}
              </button>
            )
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 mt-4 gap-4 overflow-hidden">
        <main className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
          {children}
        </main>
        <aside className="w-60 flex-shrink-0 flex flex-col gap-4">
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
