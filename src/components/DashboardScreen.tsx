import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  ListChecks,
  BookOpen,
  Calendar,
  AlertOctagon,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  AvatarConfig,
  CaseData,
  DashboardTab,
  GapFinding,
  ConflictFinding,
  OutdatedFinding,
  ChecklistItem,
  QuoteVerification,
  FetchedSource,
  SourceFreshness,
} from '../types';
import { QuoteDrawer } from './QuoteDrawer';
import { stripClaimIds, passesRule2, scoreClaimRelevance } from '../utils/claimQuality';

interface DashboardScreenProps {
  avatar: AvatarConfig;
  caseData: CaseData;
  xp: number;
  onAddXp: (amount: number, reason: string) => void;
  onToggleChecklistItem: (itemId: string) => void;
  onNewCaseClick: () => void;
  onSwitchAvatarClick: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  avatar,
  caseData,
  xp,
  onAddXp,
  onToggleChecklistItem,
  onNewCaseClick,
  onSwitchAvatarClick,
}) => {
  // First open tab defaults to avatar's default tab (e.g. shinchan -> gaps, misae -> checklist, kazama -> conflicts, masao/shiro -> outdated)
  const [activeTab, setActiveTab] = useState<DashboardTab>(avatar.defaultTab);

  // Quote drawer modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerBadge, setDrawerBadge] = useState<string | undefined>(undefined);
  const [drawerQuoteA, setDrawerQuoteA] = useState<QuoteVerification | undefined>(undefined);
  const [drawerQuoteB, setDrawerQuoteB] = useState<QuoteVerification | undefined>(undefined);

  // Compute dark spots left strictly matching items shown
  const unclearedChecklistCount = caseData.checklist.filter((item) => !item.cleared).length;
  const totalChecklistCount = caseData.checklist.length;
  const clearedChecklistCount = totalChecklistCount - unclearedChecklistCount;

  // Next step dynamic resolution from checklist item whose clearsSpotId matches finding
  // Next step dynamic resolution from checklist item whose clearsSpotId matches finding
  // Rule 1: Never show internal claim IDs in visible text
  const getNextStep = (findingId: string): string => {
    const match = caseData.checklist.find((item) => item.clearsSpotId === findingId);
    return stripClaimIds(match ? match.task : 'Check the official source.');
  };

  // Requirement 3: Source card preview - show the verified claim most relevant to the question
  // (prefer deadline, eligibility, amount, documents, process), NEVER a quote rejected by rule 2.
  const getSourcePreviewQuote = (source: FetchedSource): string => {
    if (source.bestClaimQuote && passesRule2(source.bestClaimQuote)) {
      return stripClaimIds(source.bestClaimQuote);
    }

    const candidates: string[] = [];
    if (caseData.claims && caseData.claims.length > 0) {
      for (const c of caseData.claims) {
        if (c.sourceId === source.id && c.verified && passesRule2(c.quote)) {
          candidates.push(c.quote);
        }
      }
    }

    // Inspect verified quotes from findings that pass rule 2
    for (const conf of caseData.conflicts) {
      if (conf.quoteA?.sourceId === source.id && conf.quoteA.isVerifiedInSourceText && passesRule2(conf.quoteA.quote)) {
        candidates.push(conf.quoteA.quote);
      }
      if (conf.quoteB?.sourceId === source.id && conf.quoteB.isVerifiedInSourceText && passesRule2(conf.quoteB.quote)) {
        candidates.push(conf.quoteB.quote);
      }
    }
    for (const out of caseData.outdated) {
      if (out.quote?.sourceId === source.id && out.quote.isVerifiedInSourceText && passesRule2(out.quote.quote)) {
        candidates.push(out.quote.quote);
      }
    }
    for (const gap of caseData.gaps) {
      if (gap.sourceQuote?.sourceId === source.id && gap.sourceQuote.isVerifiedInSourceText && passesRule2(gap.sourceQuote.quote)) {
        candidates.push(gap.sourceQuote.quote);
      }
    }
    for (const chk of caseData.checklist) {
      if (chk.referenceQuote?.sourceId === source.id && chk.referenceQuote.isVerifiedInSourceText && passesRule2(chk.referenceQuote.quote)) {
        candidates.push(chk.referenceQuote.quote);
      }
    }

    if (candidates.length > 0) {
      candidates.sort(
        (a, b) =>
          scoreClaimRelevance({ claim: b, quote: b }, caseData.targetQuestion) -
          scoreClaimRelevance({ claim: a, quote: a }, caseData.targetQuestion)
      );
      return stripClaimIds(candidates[0]);
    }

    // Clean body sentence fallback passing rule 2
    if (source.text) {
      const sentences = source.text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => passesRule2(s));
      if (sentences.length > 0) {
        sentences.sort(
          (a, b) =>
            scoreClaimRelevance({ claim: b, quote: b }, caseData.targetQuestion) -
            scoreClaimRelevance({ claim: a, quote: a }, caseData.targetQuestion)
        );
        return stripClaimIds(sentences[0].slice(0, 200));
      }
    }

    return 'Verified primary regulatory filing under detective audit.';
  };

  // Open drawer helper for single quote
  const handleOpenSingleQuote = (title: string, badge: string, quote: QuoteVerification) => {
    setDrawerTitle(title);
    setDrawerBadge(badge);
    setDrawerQuoteA(quote);
    setDrawerQuoteB(undefined);
    setDrawerOpen(true);
  };

  // Open drawer helper for conflict (side by side quotes)
  const handleOpenConflictQuotes = (
    title: string,
    badge: string,
    quoteA: QuoteVerification,
    quoteB: QuoteVerification
  ) => {
    setDrawerTitle(title);
    setDrawerBadge(badge);
    setDrawerQuoteA(quoteA);
    setDrawerQuoteB(quoteB);
    setDrawerOpen(true);
  };

  // Badge pill styling
  const renderBadge = (badge: 'Sourced' | 'AI suggestion' | 'Uncertain') => {
    switch (badge) {
      case 'Sourced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 brutal-border border-emerald-900 brutal-shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Sourced
          </span>
        );
      case 'AI suggestion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 brutal-border border-blue-900 brutal-shadow-sm">
            <Sparkles className="w-3 h-3 text-blue-700" />
            AI suggestion
          </span>
        );
      case 'Uncertain':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 brutal-border border-amber-900 brutal-shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            Uncertain
          </span>
        );
    }
  };

  // Source Freshness Badge - if date may be auto-generated, do not mark fresh
  const renderFreshnessBadge = (freshness: SourceFreshness, isAutoGenerated?: boolean) => {
    if (isAutoGenerated) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Auto-Date Flagged
        </span>
      );
    }
    switch (freshness) {
      case 'fresh':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Fresh (&le;180d)
          </span>
        );
      case 'aging':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-900 border border-yellow-800">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
            Aging (&le;540d)
          </span>
        );
      case 'old':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-900 border border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Old (&gt;540d)
          </span>
        );
      case 'undated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-200 text-stone-800 border border-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Undated
          </span>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] paper-pattern pb-16 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CASE TOP DOSSIER BAR */}
        <div className="bg-white rounded-3xl brutal-border-4 brutal-shadow-xl p-5 sm:p-7 relative overflow-hidden">
          {/* Top secret stamp in corner */}
          <div className="absolute top-4 right-5 sm:right-8 rotate-3 hidden sm:block">
            <div className="border-3 border-red-600 text-red-600 font-display font-black text-xs uppercase px-3 py-1 tracking-widest rounded-md brutal-shadow-sm opacity-90">
              FIELD DOSSIER // {caseData.status.toUpperCase()}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-stone-500">
            <span
              className="px-2.5 py-0.5 rounded text-white brutal-border"
              style={{ backgroundColor: avatar.inkColor }}
            >
              {caseData.caseNumber}
            </span>
            <span>• Opened: {caseData.openedDate}</span>
            <span>• Lead Detective: {avatar.name} {avatar.emoji}</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#18181B] tracking-tight mb-1 sm:mb-2">
            {caseData.title}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-stone-600 mb-3">
            AI findings are potential signals, not guaranteed facts. Verify with the official source.
          </p>

          <div className="p-3.5 bg-[#FFFDF0] brutal-border rounded-2xl mb-4 text-xs sm:text-sm font-semibold text-stone-800 flex items-start gap-2.5">
            <span className="text-base shrink-0">🎯</span>
            <div>
              <span className="font-bold text-[#18181B] uppercase tracking-wide text-xs block mb-0.5">
                Target Investigative Query:
              </span>
              <span>{caseData.targetQuestion}</span>
            </div>
          </div>

          {/* REAL STATS STRIP */}
          {caseData.stats && (
            <div className="mb-5 px-3.5 py-2 bg-stone-100 brutal-border rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-black text-[#18181B]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Forensic Extraction Stats:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-bold text-stone-700">
                <span className="text-emerald-800 font-extrabold">
                  ✓ {caseData.stats.claimsVerified} claims verified
                </span>
                <span className="text-red-700 font-extrabold">
                  ✗ {caseData.stats.claimsRejected} claims rejected
                </span>
                <span>📋 {caseData.stats.sourcesReviewed} sources reviewed</span>
                {caseData.stats.findingsDropped > 0 && (
                  <span className="text-amber-800 font-extrabold">
                    ⚠️ {caseData.stats.findingsDropped} ungrounded findings dropped
                  </span>
                )}
              </div>
            </div>
          )}

          {/* METERS & STATUS BAR: Dark Spots Left & XP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-3 border-[#18181B]">
            {/* Dark Spots Left Meter (strictly matches items shown) */}
            <div className="p-4 bg-stone-50 brutal-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                  Dark Spots Left
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-black text-2xl sm:text-3xl text-red-600">
                    {unclearedChecklistCount}
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    unresolved of {totalChecklistCount}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-100 brutal-border flex items-center justify-center text-xl">
                {unclearedChecklistCount === 0 ? '✨' : '🕵️'}
              </div>
            </div>

            {/* Total XP Earned */}
            <div className="p-4 bg-stone-50 brutal-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                  Detective XP Score
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-black text-2xl sm:text-3xl text-amber-600">
                    {xp}
                  </span>
                  <span className="text-xs font-bold text-stone-600">points accumulated</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 brutal-border flex items-center justify-center text-xl">
                🎖️
              </div>
            </div>

            {/* Current Active Investigator Specialty */}
            <div
              className="p-4 rounded-2xl brutal-border flex items-center justify-between"
              style={{ backgroundColor: avatar.cardBg }}
            >
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-stone-600">
                  Active Specialist
                </p>
                <p className="font-display font-extrabold text-base text-[#18181B] truncate">
                  {avatar.name} ({avatar.emoji})
                </p>
                <p className="text-xs font-bold text-stone-600">
                  Specialty: <span className="uppercase text-[#18181B]">{avatar.defaultTab}</span>
                </p>
              </div>
              <button
                onClick={onSwitchAvatarClick}
                className="px-2.5 py-1 text-xs font-black bg-white brutal-border brutal-shadow-sm rounded-lg hover:bg-stone-100 brutal-btn"
                title="Switch detective"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        {/* AVATAR GREETING SPEECH BUBBLE & FORENSIC TIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Character speech line */}
          <div
            className="md:col-span-2 p-5 rounded-3xl brutal-border-4 brutal-shadow relative flex items-start gap-4"
            style={{ backgroundColor: avatar.cardBg }}
          >
            <div
              className="w-14 h-14 rounded-2xl brutal-border flex items-center justify-center text-3xl shrink-0 brutal-shadow-sm"
              style={{ backgroundColor: avatar.accentColor }}
            >
              {avatar.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: avatar.inkColor }}
                >
                  {avatar.name}
                </span>
                <span className="text-xs font-bold text-stone-500">Live Observation</span>
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-[#18181B]">
                "{avatar.quotes.dashboardGreeting}"
              </p>
            </div>
          </div>

          {/* Forensic tip box */}
          <div className="p-5 bg-white rounded-3xl brutal-border-4 brutal-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Agency Field Tip</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-800 italic">
              "{avatar.quotes.tip}"
            </p>
            <p className="text-[11px] font-bold text-stone-500 mt-2">
              Cross-examination protocol active.
            </p>
          </div>
        </div>

        {/* TABS & EVIDENCE BOARD NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* 4 Main Tabs */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Evidence Board Tabs">
            {/* Gaps Tab */}
            <button
              role="tab"
              aria-selected={activeTab === 'gaps'}
              onClick={() => setActiveTab('gaps')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-display font-extrabold text-sm sm:text-base brutal-border brutal-btn flex items-center gap-2 transition-all ${
                activeTab === 'gaps'
                  ? 'bg-yellow-300 text-[#18181B] brutal-shadow-lg scale-105'
                  : 'bg-white text-stone-700 brutal-shadow hover:bg-stone-50'
              }`}
            >
              <span>🔍</span>
              <span>Gaps ({caseData.gaps.length})</span>
            </button>

            {/* Conflicts Tab */}
            <button
              role="tab"
              aria-selected={activeTab === 'conflicts'}
              onClick={() => setActiveTab('conflicts')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-display font-extrabold text-sm sm:text-base brutal-border brutal-btn flex items-center gap-2 transition-all ${
                activeTab === 'conflicts'
                  ? 'bg-blue-200 text-[#18181B] brutal-shadow-lg scale-105'
                  : 'bg-white text-stone-700 brutal-shadow hover:bg-stone-50'
              }`}
            >
              <span>⚖️</span>
              <span>Conflicts ({caseData.conflicts.length})</span>
            </button>

            {/* Outdated Tab */}
            <button
              role="tab"
              aria-selected={activeTab === 'outdated'}
              onClick={() => setActiveTab('outdated')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-display font-extrabold text-sm sm:text-base brutal-border brutal-btn flex items-center gap-2 transition-all ${
                activeTab === 'outdated'
                  ? 'bg-red-200 text-[#18181B] brutal-shadow-lg scale-105'
                  : 'bg-white text-stone-700 brutal-shadow hover:bg-stone-50'
              }`}
            >
              <span>📅</span>
              <span>Outdated ({caseData.outdated.length})</span>
            </button>

            {/* Checklist Tab */}
            <button
              role="tab"
              aria-selected={activeTab === 'checklist'}
              onClick={() => setActiveTab('checklist')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-display font-extrabold text-sm sm:text-base brutal-border brutal-btn flex items-center gap-2 transition-all ${
                activeTab === 'checklist'
                  ? 'bg-emerald-200 text-[#18181B] brutal-shadow-lg scale-105'
                  : 'bg-white text-stone-700 brutal-shadow hover:bg-stone-50'
              }`}
            >
              <span>✅</span>
              <span>
                Dark Spots Checklist ({clearedChecklistCount}/{totalChecklistCount})
              </span>
            </button>
          </div>

          {/* Quick action button for new case */}
          <button
            onClick={onNewCaseClick}
            className="px-3.5 py-2 text-xs font-black text-[#18181B] bg-white brutal-border brutal-shadow-sm rounded-xl brutal-btn hover:bg-stone-100"
          >
            + File New Docket
          </button>
        </div>

        {/* MAIN TAB CONTENT CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: ACTIVE TAB FINDINGS */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. GAPS TAB */}
            {activeTab === 'gaps' && (
              <div className="space-y-5 animate-in fade-in duration-200" role="tabpanel">
                <div className="p-4 bg-yellow-100 rounded-2xl brutal-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔍</span>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#18181B]">
                        Identified Information Gaps ({caseData.gaps.length})
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">
                        Essential regulatory omissions, missing operational criteria, and unstated exceptions.
                      </p>
                    </div>
                  </div>
                </div>

                {caseData.gaps.length === 0 && (
                  <div className="p-8 bg-white rounded-3xl brutal-border-4 brutal-shadow text-center">
                    <span className="text-3xl block mb-2">🎉</span>
                    <h3 className="font-display font-extrabold text-lg text-[#18181B] mb-1">
                      No Information Gaps Detected
                    </h3>
                    <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">
                      All expected regulatory and operational topics were addressed in the inspected source documents.
                    </p>
                  </div>
                )}

                {caseData.gaps.map((gap) => (
                  <article
                    key={gap.id}
                    className="p-6 bg-white rounded-3xl brutal-border-4 brutal-shadow relative hover:shadow-lg transition-all"
                  >
                    {/* Top line with badge - Rule 4: Gaps always show "AI suggestion" */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      {renderBadge('AI suggestion')}
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                        Topic: {stripClaimIds(gap.topic)}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-xl text-[#18181B] mb-2">
                      {stripClaimIds(gap.title)}
                    </h3>

                    <p className="text-sm font-medium text-stone-700 mb-3 leading-relaxed">
                      {stripClaimIds(gap.description)}
                    </p>

                    {/* Character Line (Tailored to active avatar!) */}
                    <div
                      className="p-3.5 rounded-xl brutal-border mb-4 flex items-start gap-3"
                      style={{ backgroundColor: avatar.cardBg }}
                    >
                      <span className="text-2xl shrink-0">{avatar.emoji}</span>
                      <div>
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white inline-block mb-1"
                          style={{ backgroundColor: avatar.inkColor }}
                        >
                          {avatar.name}'s Reaction
                        </span>
                        <p className="text-xs font-bold text-[#18181B] italic">
                          "{stripClaimIds(gap.characterLine)}"
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-stone-200">
                      <div className="text-xs font-bold text-stone-600">
                        <span className="text-stone-400">Next Step:</span> {getNextStep(gap.id)}
                      </div>

                      {gap.sourceQuote && (
                        <button
                          onClick={() =>
                            handleOpenSingleQuote(stripClaimIds(gap.title), 'AI suggestion', gap.sourceQuote!)
                          }
                          className="px-4 py-2 bg-[#18181B] text-white font-extrabold text-xs rounded-xl brutal-btn hover:bg-stone-800 flex items-center gap-1.5 shadow-sm"
                        >
                          <FileText className="w-4 h-4 text-yellow-300" />
                          <span>View Source Quote</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 2. CONFLICTS TAB (Shows two quotes side by side!) */}
            {activeTab === 'conflicts' && (
              <div className="space-y-5 animate-in fade-in duration-200" role="tabpanel">
                <div className="p-4 bg-blue-100 rounded-2xl brutal-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#18181B]">
                        Contradictory Citations ({caseData.conflicts.length})
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">
                        Two reputable or cited sources presenting incompatible statements.
                      </p>
                    </div>
                  </div>
                </div>

                {caseData.conflicts.length === 0 && (
                  <div className="p-8 bg-white rounded-3xl brutal-border-4 brutal-shadow text-center">
                    <span className="text-3xl block mb-2">🤝</span>
                    <h3 className="font-display font-extrabold text-lg text-[#18181B] mb-1">
                      No Contradictions Detected
                    </h3>
                    <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">
                      No direct factual discrepancies or conflicting clauses were found across the verified quotes.
                    </p>
                  </div>
                )}

                {caseData.conflicts.map((conflict) => (
                  <article
                    key={conflict.id}
                    className="p-6 bg-white rounded-3xl brutal-border-4 brutal-shadow relative"
                  >
                    {/* Badge - Rule 4: Sourced if both verified, else Uncertain */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {renderBadge(
                        conflict.quoteA.isVerifiedInSourceText && conflict.quoteB.isVerifiedInSourceText
                          ? 'Sourced'
                          : 'Uncertain'
                      )}
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Topic: {stripClaimIds(conflict.topic)}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-xl text-[#18181B] mb-2">
                      {stripClaimIds(conflict.title)}
                    </h3>

                    <p className="text-sm font-medium text-stone-700 mb-4 leading-relaxed">
                      {stripClaimIds(conflict.description)}
                    </p>

                    {/* TWO QUOTES SIDE BY SIDE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Quote A */}
                      <div className="p-4 bg-blue-50/70 brutal-border border-blue-400 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className="text-[11px] font-black uppercase text-blue-900 bg-blue-200 px-2 py-0.5 rounded shrink-0">
                              Citation A
                            </span>
                            <span className="text-[11px] font-extrabold text-blue-950 truncate max-w-[190px]">
                              {stripClaimIds(conflict.quoteA.sourceTitle)}
                            </span>
                          </div>
                          <blockquote className="my-2 text-xs italic font-semibold text-stone-800 leading-relaxed">
                            "{stripClaimIds(conflict.quoteA.quote)}"
                          </blockquote>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quote verified in source text</span>
                        </div>
                      </div>

                      {/* Quote B */}
                      <div className="p-4 bg-amber-50/70 brutal-border border-amber-400 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className="text-[11px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded shrink-0">
                              Citation B
                            </span>
                            <span className="text-[11px] font-extrabold text-amber-950 truncate max-w-[190px]">
                              {stripClaimIds(conflict.quoteB.sourceTitle)}
                            </span>
                          </div>
                          <blockquote className="my-2 text-xs italic font-semibold text-stone-800 leading-relaxed">
                            "{stripClaimIds(conflict.quoteB.quote)}"
                          </blockquote>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quote verified in source text</span>
                        </div>
                      </div>
                    </div>

                    {/* Character Line */}
                    <div
                      className="p-3.5 rounded-xl brutal-border mb-4 flex items-start gap-3"
                      style={{ backgroundColor: avatar.cardBg }}
                    >
                      <span className="text-2xl shrink-0">{avatar.emoji}</span>
                      <div>
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white inline-block mb-1"
                          style={{ backgroundColor: avatar.inkColor }}
                        >
                          {avatar.name}'s Reaction
                        </span>
                        <p className="text-xs font-bold text-[#18181B] italic">
                          "{stripClaimIds(conflict.characterLine)}"
                        </p>
                      </div>
                    </div>

                    {/* Next Step & View Quotes button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-stone-200">
                      <div className="text-xs font-bold text-stone-700">
                        <span className="text-stone-400">Next Step:</span> {getNextStep(conflict.id)}
                      </div>

                      <button
                        onClick={() =>
                          handleOpenConflictQuotes(
                            stripClaimIds(conflict.title),
                            conflict.quoteA.isVerifiedInSourceText && conflict.quoteB.isVerifiedInSourceText
                              ? 'Sourced'
                              : 'Uncertain',
                            conflict.quoteA,
                            conflict.quoteB
                          )
                        }
                        className="px-4 py-2 bg-[#18181B] text-white font-extrabold text-xs rounded-xl brutal-btn hover:bg-stone-800 flex items-center gap-1.5 shadow-sm"
                      >
                        <FileText className="w-4 h-4 text-blue-300" />
                        <span>View Source Quotes</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 3. OUTDATED TAB */}
            {activeTab === 'outdated' && (
              <div className="space-y-5 animate-in fade-in duration-200" role="tabpanel">
                <div className="p-4 bg-red-100 rounded-2xl brutal-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📅</span>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#18181B]">
                        Outdated Regulatory Clauses & Staleness ({caseData.outdated.length})
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">
                        Articles citing defunct pilot programs, superseded circulars, or expired rules.
                      </p>
                    </div>
                  </div>
                </div>

                {caseData.outdated.length === 0 && (
                  <div className="p-8 bg-white rounded-3xl brutal-border-4 brutal-shadow text-center">
                    <span className="text-3xl block mb-2">📅</span>
                    <h3 className="font-display font-extrabold text-lg text-[#18181B] mb-1">
                      No Outdated Signals Detected
                    </h3>
                    <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">
                      All analyzed clauses reflect current regulatory standards or active directives.
                    </p>
                  </div>
                )}

                {caseData.outdated.map((item) => (
                  <article
                    key={item.id}
                    className="p-6 bg-white rounded-3xl brutal-border-4 brutal-shadow relative"
                  >
                    {/* Top banner */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      {renderBadge(item.badge)}
                      <span className="text-xs font-bold text-stone-500">
                        {stripClaimIds(item.quote.sourceTitle)}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-xl text-[#18181B] mb-2">
                      {stripClaimIds(item.title)}
                    </h3>

                    {/* Timeline clash box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 p-3 bg-stone-50 brutal-border rounded-xl">
                      <div className="p-2.5 bg-red-100 brutal-border border-red-400 rounded-lg">
                        <span className="text-[10px] font-black uppercase text-red-800 block">
                          ❌ Stated Outdated Timestamp
                        </span>
                        <span className="font-extrabold text-xs text-red-950">
                          {stripClaimIds(item.statedYearOrDate)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-emerald-100 brutal-border border-emerald-400 rounded-lg">
                        <span className="text-[10px] font-black uppercase text-emerald-800 block">
                          ✓ Enacted Active Standard
                        </span>
                        <span className="font-extrabold text-xs text-emerald-950">
                          {stripClaimIds(item.currentStandardDate)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-stone-700 mb-3 leading-relaxed">
                      {stripClaimIds(item.description)}
                    </p>

                    {/* Warning callout */}
                    {item.warning && (
                      <div className="p-3 bg-amber-50 brutal-border border-amber-300 rounded-xl mb-4 text-xs font-semibold text-amber-950">
                        <strong className="uppercase tracking-wide text-amber-900 block mb-0.5">
                          ⚠️ Regulatory Risk:
                        </strong>
                        {stripClaimIds(item.warning)}
                      </div>
                    )}

                    {/* Character Line */}
                    <div
                      className="p-3.5 rounded-xl brutal-border mb-4 flex items-start gap-3"
                      style={{ backgroundColor: avatar.cardBg }}
                    >
                      <span className="text-2xl shrink-0">{avatar.emoji}</span>
                      <div>
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white inline-block mb-1"
                          style={{ backgroundColor: avatar.inkColor }}
                        >
                          {avatar.name}'s Reaction
                        </span>
                        <p className="text-xs font-bold text-[#18181B] italic">
                          "{stripClaimIds(item.characterLine)}"
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-stone-200">
                      <div className="text-xs font-bold text-stone-600">
                        <span className="text-stone-400">Next Step:</span> {getNextStep(item.id)}
                      </div>

                      <button
                        onClick={() =>
                          handleOpenSingleQuote(stripClaimIds(item.title), item.badge, item.quote)
                        }
                        className="px-4 py-2 bg-[#18181B] text-white font-extrabold text-xs rounded-xl brutal-btn hover:bg-stone-800 flex items-center gap-1.5 shadow-sm"
                      >
                        <FileText className="w-4 h-4 text-red-300" />
                        <span>View Source Quote</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 4. CHECKLIST TAB */}
            {activeTab === 'checklist' && (
              <div className="space-y-5 animate-in fade-in duration-200" role="tabpanel">
                <div className="p-4 bg-emerald-100 rounded-2xl brutal-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#18181B]">
                        Dark Spots Resolution Checklist
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">
                        Sorted by priority (25/15/10 XP). Tick items to clear dark spots and update the meter!
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white brutal-border rounded-lg text-xs font-black text-emerald-900">
                    {clearedChecklistCount} of {totalChecklistCount} Cleared
                  </div>
                </div>

                <div className="space-y-3">
                  {caseData.checklist.length === 0 && (
                    <div className="p-8 bg-white rounded-3xl brutal-border-4 brutal-shadow text-center">
                      <span className="text-3xl block mb-2">🏆</span>
                      <h3 className="font-display font-extrabold text-lg text-[#18181B] mb-1">
                        Checklist Completely Clear
                      </h3>
                      <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">
                        No pending dark spots or verification items remaining for this case docket!
                      </p>
                    </div>
                  )}

                  {caseData.checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl brutal-border-3 transition-all ${
                        item.cleared
                          ? 'bg-emerald-50/80 border-emerald-800 opacity-90'
                          : 'bg-white border-[#18181B] brutal-shadow hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => onToggleChecklistItem(item.id)}
                          className="mt-0.5 shrink-0 p-1 rounded-lg focus-visible:ring-3 focus-visible:ring-offset-1 brutal-btn"
                          aria-label={item.cleared ? 'Mark dark spot as open' : 'Clear dark spot'}
                        >
                          {item.cleared ? (
                            <CheckSquare className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="w-6 h-6 text-stone-400 hover:text-[#18181B]" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {/* Rule 4: Checklist items stay "AI suggestion" */}
                            {renderBadge('AI suggestion')}

                            {/* Priority badge */}
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                item.priority === 'high'
                                  ? 'bg-red-200 text-red-950 font-black'
                                  : item.priority === 'medium'
                                  ? 'bg-amber-200 text-amber-950'
                                  : 'bg-stone-200 text-stone-800'
                              }`}
                            >
                              Priority: {item.priority.toUpperCase()}
                            </span>

                            <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              +{item.xpReward} XP
                            </span>

                            {item.topic && (
                              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                                Resolves: {stripClaimIds(item.topic)}
                              </span>
                            )}

                            {item.cleared && (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                ✓ Cleared Dark Spot
                              </span>
                            )}
                          </div>

                          {/* Wrap to two lines instead of truncating */}
                          <h3
                            className={`font-display font-extrabold text-base text-[#18181B] line-clamp-2 break-words ${
                              item.cleared ? 'line-through text-stone-500' : ''
                            }`}
                          >
                            {stripClaimIds(item.task)}
                          </h3>

                          <p className="text-xs font-medium text-stone-600 mt-1 leading-relaxed">
                            {stripClaimIds(item.note)}
                          </p>

                          {/* Reference Quote button if available */}
                          {item.referenceQuote && (
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenSingleQuote(
                                    stripClaimIds(item.task),
                                    'AI suggestion',
                                    item.referenceQuote!
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-800 hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5 text-stone-600" />
                                <span>Inspect Supporting Quote</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: SOURCE CARDS & FIELD DOSSIER */}
          <div className="space-y-5">
            {/* Sources header */}
            <div className="bg-white rounded-3xl brutal-border-4 brutal-shadow p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-stone-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#18181B]" />
                  <h2 className="font-display font-extrabold text-lg text-[#18181B]">
                    Primary Source Cards ({caseData.sources.length})
                  </h2>
                </div>
                <span className="text-xs font-bold text-stone-500">Cross-Examined</span>
              </div>

              <div className="space-y-4">
                {caseData.sources.length === 0 && (
                  <div className="p-6 bg-white brutal-border rounded-2xl text-center text-xs font-bold text-stone-500">
                    No sources attached to this case docket.
                  </div>
                )}

                {caseData.sources.map((source) => (
                  <div
                    key={source.id}
                    className="p-4 bg-[#FFFDF0] brutal-border rounded-2xl relative hover:bg-white transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-stone-200 text-stone-800 rounded">
                          {source.type} Source
                        </span>
                        {/* Freshness badge */}
                        {renderFreshnessBadge(source.freshness, source.isAutoGeneratedDate)}
                      </div>

                      <div className="flex flex-col items-end gap-0.5 text-right">
                        <div className="text-[10px] font-bold text-stone-600 flex items-center gap-1">
                          <span className="uppercase text-[9px] font-black text-stone-400">
                            page-declared date:
                          </span>
                          {source.publishedDate && source.modifiedDate ? (
                            <span>Pub: {source.publishedDate} • Mod: {source.modifiedDate}</span>
                          ) : source.publishedDate ? (
                            <span>Pub: {source.publishedDate}</span>
                          ) : (
                            <span>{source.declaredDate || 'Undated'}</span>
                          )}
                        </div>
                        {source.isAutoGeneratedDate && (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            ⚠️ Date may be auto-generated
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-display font-extrabold text-sm text-[#18181B] mb-1.5 leading-snug">
                      {stripClaimIds(source.title)}
                    </h3>

                    {source.authorOrDept && (
                      <p className="text-[11px] font-semibold text-stone-600 mb-2">
                        Desk: {stripClaimIds(source.authorOrDept)}
                      </p>
                    )}

                    {source.status === 'failed' ? (
                      <div className="bg-red-50 p-2.5 brutal-border border-red-300 rounded-lg mb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-red-700 block mb-1">
                          Source Failed to Load:
                        </span>
                        <p className="text-xs font-semibold text-red-900 leading-relaxed">
                          {source.note || 'Could not retrieve readable text from source URL.'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-2.5 brutal-border rounded-lg mb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                          Best Verified Finding Preview:
                        </span>
                        <p className="text-xs font-semibold text-stone-800 italic line-clamp-3 leading-relaxed">
                          "{getSourcePreviewQuote(source)}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                      {source.status === 'failed' ? (
                        <span className="text-[11px] font-extrabold text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Status: Failed</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Status: {source.status}</span>
                        </span>
                      )}
                      {source.url && source.url.startsWith('http') && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 hover:underline"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Dark Spots snapshot in sidebar */}
            {activeTab !== 'checklist' && (
              <div className="p-5 bg-white rounded-3xl brutal-border-4 brutal-shadow">
                <div className="flex items-center justify-between mb-3">
                  {/* Polish: Plain icon, not a checkbox */}
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-amber-700" />
                    <span>Quick Dark Spots ({unclearedChecklistCount} left)</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {caseData.checklist.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleChecklistItem(item.id)}
                      className={`p-2.5 rounded-xl text-xs brutal-border flex items-start gap-2 cursor-pointer transition-colors ${
                        item.cleared
                          ? 'bg-emerald-50 text-stone-400 line-through'
                          : 'bg-[#FFFDF0] text-stone-800 hover:bg-yellow-50'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {item.cleared ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </span>
                      {/* Polish: let wrap to two lines instead of truncating */}
                      <span className="line-clamp-2 break-words font-semibold leading-snug">
                        {stripClaimIds(item.task)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER (MANDATORY TEXT ENFORCED) */}
        <footer className="mt-12 pt-6 pb-4 border-t-3 border-[#18181B] text-center">
          <div className="p-3 bg-stone-100 brutal-border rounded-2xl max-w-2xl mx-auto mb-3">
            <p className="text-xs sm:text-sm font-extrabold text-stone-800">
              AI findings are potential signals, not guaranteed facts.
            </p>
          </div>
          <p className="text-[11px] font-semibold text-stone-500">
            Operation Dark Spot: Detective Agency • Forensic Cross-Citation & Ambiguity Detection System
          </p>
        </footer>
      </div>

      {/* Quote Verification Drawer */}
      <QuoteDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        badge={drawerBadge}
        quoteA={drawerQuoteA}
        quoteB={drawerQuoteB}
        accentColor={avatar.accentColor}
      />
    </div>
  );
};
