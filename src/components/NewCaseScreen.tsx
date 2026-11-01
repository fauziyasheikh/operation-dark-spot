import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Compass,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { AvatarConfig, CaseData, SourceInput } from '../types';
import { SAMPLE_CASE } from '../data/sampleCaseConfig';
import {
  fetchSources,
  extractAllClaimsInParallel,
  runForensicAnalysis,
  InvestigationProgress
} from '../services/api';

interface NewCaseScreenProps {
  avatar: AvatarConfig;
  currentCase: CaseData;
  onLaunchInvestigation: (updatedCase: CaseData) => void;
  onBackToAvatars: () => void;
}

export const NewCaseScreen: React.FC<NewCaseScreenProps> = ({
  avatar,
  currentCase,
  onLaunchInvestigation,
  onBackToAvatars,
}) => {
  const [caseTitle, setCaseTitle] = useState(currentCase.title || SAMPLE_CASE.title);
  const [targetQuestion, setTargetQuestion] = useState(currentCase.targetQuestion || SAMPLE_CASE.question);
  const [sourcesList, setSourcesList] = useState<SourceInput[]>(
    currentCase.targetSources && currentCase.targetSources.length > 0
      ? currentCase.targetSources
      : SAMPLE_CASE.sources
  );

  const [newUrlInput, setNewUrlInput] = useState('');
  const [newTypeInput, setNewTypeInput] = useState<'official' | 'third-party' | 'forum' | 'archive' | 'unknown'>('official');
  const [pastedTextInput, setPastedTextInput] = useState('');
  const [showPastedInput, setShowPastedInput] = useState(false);

  // Investigation progress state for 5-step overlay
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<InvestigationProgress>({
    step: 1,
    title: 'Initializing docket...',
    detail: 'Preparing forensic parser.',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load sample case from top-level SAMPLE_CASE constant
  const handleLoadSampleCase = () => {
    setCaseTitle(SAMPLE_CASE.title);
    setTargetQuestion(SAMPLE_CASE.question);
    setSourcesList(SAMPLE_CASE.sources);
    setErrorMessage(null);
  };

  const handleAddSource = () => {
    const trimmedUrl = newUrlInput.trim();
    const trimmedPasted = pastedTextInput.trim();

    if (!trimmedUrl && !trimmedPasted) return;

    setSourcesList([
      ...sourcesList,
      {
        url: trimmedUrl || 'pasted://text',
        type: newTypeInput,
        pastedText: trimmedPasted || undefined,
      },
    ]);

    setNewUrlInput('');
    setPastedTextInput('');
    setShowPastedInput(false);
  };

  const handleRemoveSource = (indexToRemove: number) => {
    setSourcesList(sourcesList.filter((_, idx) => idx !== indexToRemove));
  };

  // Run the full 5-step investigation
  const handleStartInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (sourcesList.length === 0) {
      setErrorMessage('Please include at least one source URL or pasted document.');
      return;
    }

    setIsInvestigating(true);

    try {
      // STEP 1: Fetching & sanitizing sources
      setCurrentStep(1);
      setProgressStatus({
        step: 1,
        title: 'Step 1 of 5: Fetching & Sanitizing Sources...',
        detail: `Connecting in parallel to ${sourcesList.length} sources with 5s timeout & Jina fallback.`,
      });

      const fetchedSources = await fetchSources(sourcesList);

      const successfulSources = fetchedSources.filter((s) => s.status === 'success');
      if (successfulSources.length === 0) {
        throw new Error(
          'All provided sources failed to fetch or contained insufficient readable text. Check URLs or use Pasted Text.'
        );
      }

      // STEP 2: Extracting explicit claims & verifying quotes in code
      setCurrentStep(2);
      setProgressStatus({
        step: 2,
        title: 'Step 2 of 5: Extracting Claims & Verifying Quotes...',
        detail: `Querying Gemini Flash in parallel per source; verifying exact quotes and 5-word n-grams in code.`,
      });

      const extractedClaims = await extractAllClaimsInParallel(targetQuestion, fetchedSources);
      const verifiedCount = extractedClaims.filter((c) => c.verified).length;

      if (verifiedCount === 0) {
        throw new Error(
          'Gemini could not verify quotes from the retrieved text against the target question. Ensure the source contains factual regulatory text.'
        );
      }

      // STEP 3: Cross-referencing verified claims & mapping conflicts
      setCurrentStep(3);
      setProgressStatus({
        step: 3,
        title: 'Step 3 of 5: Cross-Referencing Verified Claims...',
        detail: `Analyzing ${verifiedCount} verified claims for direct factual conflicts and topic coverage.`,
      });

      // STEP 4: Auditing dates, gaps & generating checklist
      setCurrentStep(4);
      setProgressStatus({
        step: 4,
        title: 'Step 4 of 5: Auditing Freshness, Gaps & Checklist...',
        detail: `Investigator ${avatar.name} is inspecting date staleness, identifying gaps, and assigning XP tasks.`,
      });

      const analysisResult = await runForensicAnalysis(
        targetQuestion,
        avatar.id,
        fetchedSources,
        extractedClaims
      );

      // STEP 5: Finalizing evidence dossier
      setCurrentStep(5);
      setProgressStatus({
        step: 5,
        title: 'Step 5 of 5: Finalizing Evidence Board...',
        detail: `Docket verified with ${analysisResult.stats.claimsUsed} claims used and ${analysisResult.gaps.length} gaps identified.`,
      });

      // Short delay for visual completion
      await new Promise((r) => setTimeout(r, 600));

      const updatedCase: CaseData = {
        id: `case-${Date.now()}`,
        caseNumber: `CASE #${Math.floor(100 + Math.random() * 900)}-${avatar.id.toUpperCase().slice(0, 2)}`,
        title: caseTitle || 'Untitled Investigative Case',
        targetQuestion: targetQuestion,
        targetSources: sourcesList,
        openedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase(),
        status: 'Investigating',
        sources: fetchedSources,
        gaps: analysisResult.gaps,
        conflicts: analysisResult.conflicts,
        outdated: analysisResult.outdated,
        checklist: analysisResult.checklist,
        stats: analysisResult.stats,
        expectedTopics: analysisResult.expectedTopics,
      };

      setIsInvestigating(false);
      onLaunchInvestigation(updatedCase);
    } catch (err: any) {
      console.error('Investigation error:', err);
      setIsInvestigating(false);
      setErrorMessage(err.message || 'An unexpected error occurred during investigation.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] paper-pattern py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Breadcrumb / Character Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-300 brutal-border brutal-shadow-sm rounded-full text-xs font-black uppercase text-[#18181B]">
              Step 3 // Case Intake Dossier
            </span>
            <span className="text-xs font-bold text-stone-500">
              Assigned Lead: {avatar.name} {avatar.emoji}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSampleCase}
              className="text-xs font-extrabold text-[#18181B] bg-yellow-200 brutal-border brutal-shadow-sm rounded-lg px-3 py-1.5 hover:bg-yellow-300 brutal-btn flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>Load sample case</span>
            </button>
            <button
              onClick={onBackToAvatars}
              className="text-xs font-extrabold text-[#18181B] bg-white brutal-border brutal-shadow-sm rounded-lg px-3 py-1.5 hover:bg-stone-100 brutal-btn"
            >
              ← Switch Detective
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 brutal-border-4 border-red-700 rounded-2xl flex items-start gap-3 brutal-shadow">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display font-extrabold text-sm text-red-950 uppercase tracking-wide">
                Investigation Encountered An Obstacle
              </h3>
              <p className="text-xs text-red-900 font-medium mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-black text-red-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Avatar Speech Bubble & Tip Box (Dynamic per chosen avatar) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Main speech bubble (2 cols) */}
          <div
            className="md:col-span-2 p-5 rounded-3xl brutal-border-4 brutal-shadow relative"
            style={{ backgroundColor: avatar.cardBg }}
          >
            <div className="flex items-start gap-4">
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
                    Investigator {avatar.name}
                  </span>
                  <span className="text-xs font-bold text-stone-500">Direct Briefing</span>
                </div>
                <p className="font-display text-lg sm:text-xl font-bold text-[#18181B] leading-snug">
                  "{avatar.quotes.newCase}"
                </p>
              </div>
            </div>
          </div>

          {/* Avatar Tip Box (1 col) */}
          <div className="p-5 bg-white rounded-3xl brutal-border-4 brutal-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 mb-2">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>Forensic Strategy Tip</span>
              </div>
              <p className="text-sm font-semibold text-stone-800 italic">"{avatar.quotes.tip}"</p>
            </div>
            <div className="mt-3 pt-2 border-t-2 border-stone-200 text-[11px] font-bold text-stone-500">
              Initial Docket Focus: <span className="uppercase text-[#18181B]">{avatar.defaultTab}</span>
            </div>
          </div>
        </div>

        {/* Case Intake Form */}
        <form
          onSubmit={handleStartInvestigation}
          className="bg-white rounded-3xl brutal-border-4 brutal-shadow-xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b-3 border-[#18181B]">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">
                Formal Investigation Filing
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#18181B]">
                New Case Specification
              </h1>
            </div>
            <div className="hidden sm:block px-3 py-1 bg-stone-100 brutal-border rounded-lg text-xs font-bold text-stone-700">
              Real-time AI Forensic Verification
            </div>
          </div>

          {/* Case Title Input */}
          <div className="mb-5">
            <label
              htmlFor="case-title"
              className="block font-display font-extrabold text-sm text-[#18181B] uppercase tracking-wider mb-2"
            >
              1. Case Title / Dossier Headline
            </label>
            <input
              id="case-title"
              type="text"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#FFFDF0] brutal-border rounded-xl font-bold text-base text-[#18181B] focus:bg-white focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
              placeholder="e.g. Digital Nomad Visa 2025 Regulations & Tax Exposure"
            />
          </div>

          {/* Target Question Textarea */}
          <div className="mb-6">
            <label
              htmlFor="target-question"
              className="block font-display font-extrabold text-sm text-[#18181B] uppercase tracking-wider mb-2"
            >
              2. Target Question (What should the agency verify?)
            </label>
            <textarea
              id="target-question"
              rows={3}
              value={targetQuestion}
              onChange={(e) => setTargetQuestion(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#FFFDF0] brutal-border rounded-xl font-medium text-sm sm:text-base text-[#18181B] focus:bg-white focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
              placeholder="State the exact question, policy ambiguity, or query to cross-reference..."
            />
          </div>

          {/* Target Source Links & Pasted Text */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="font-display font-extrabold text-sm text-[#18181B] uppercase tracking-wider">
                3. Reference Sources to Inspect ({sourcesList.length})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPastedInput(!showPastedInput)}
                  className="text-xs font-bold text-stone-700 underline hover:text-[#18181B]"
                >
                  {showPastedInput ? 'Hide Pasted Text' : '+ Paste Text / Offline Docket'}
                </button>
              </div>
            </div>

            {/* List of current sources */}
            <div className="space-y-2 mb-3">
              {sourcesList.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#FFFDF0] brutal-border rounded-xl gap-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs font-black text-stone-400 w-5">#{idx + 1}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                      {src.type || 'official'}
                    </span>
                    <LinkIcon className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span className="text-xs font-bold text-blue-800 truncate">
                      {src.url}
                    </span>
                    {src.pastedText && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Text Provided
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSource(idx)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Remove source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new source URL field */}
            <div className="space-y-2">
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <select
                  value={newTypeInput}
                  onChange={(e: any) => setNewTypeInput(e.target.value)}
                  className="px-3 py-2.5 bg-stone-100 brutal-border rounded-xl text-xs font-bold text-stone-800"
                >
                  <option value="official">Official Portal</option>
                  <option value="third-party">Third-Party News</option>
                  <option value="forum">Community Forum</option>
                  <option value="archive">Archive Docket</option>
                  <option value="unknown">Unknown</option>
                </select>

                <input
                  type="url"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-stone-50 brutal-border rounded-xl text-xs font-medium focus:bg-white focus-visible:ring-3 focus-visible:outline-none"
                  placeholder="https://example.gov.jp/circular or news link..."
                />

                <button
                  type="button"
                  onClick={handleAddSource}
                  className="px-4 py-2.5 bg-[#18181B] text-white font-extrabold text-xs rounded-xl brutal-btn hover:bg-stone-800 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Source</span>
                </button>
              </div>

              {/* Collapsible pasted text input */}
              {showPastedInput && (
                <div className="p-3 bg-stone-50 brutal-border rounded-xl mt-2 animate-in fade-in">
                  <label className="block text-xs font-extrabold text-stone-800 mb-1">
                    Paste Document Body (Optional bypass if URL is firewalled or requires login):
                  </label>
                  <textarea
                    rows={3}
                    value={pastedTextInput}
                    onChange={(e) => setPastedTextInput(e.target.value)}
                    placeholder="Paste full regulatory notice, article, or forum thread here..."
                    className="w-full p-2.5 bg-white brutal-border rounded-lg text-xs font-mono"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleAddSource}
                      className="px-3 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-lg brutal-btn hover:bg-emerald-800"
                    >
                      Add with Pasted Text
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit / Launch Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-stone-200">
            <p className="text-xs font-bold text-stone-500 text-center sm:text-left">
              Starts live parallel fetch &rarr; quote verification in code &rarr; Gemini Flash forensic analysis.
            </p>

            <button
              type="submit"
              disabled={isInvestigating}
              className={`w-full sm:w-auto py-4 px-8 rounded-2xl font-display font-extrabold text-base text-[#18181B] brutal-border-4 brutal-shadow brutal-btn flex items-center justify-center gap-3 transition-transform ${
                isInvestigating ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: avatar.accentColor }}
            >
              {isInvestigating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Investigating Docket...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#18181B]" />
                  <span>Start Investigation</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5-Step Progress Overlay Modal */}
      {isInvestigating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[#FFFDF0] brutal-border-4 brutal-shadow-xl rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl brutal-border flex items-center justify-center text-2xl"
                style={{ backgroundColor: avatar.accentColor }}
              >
                {avatar.emoji}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white bg-[#18181B]">
                  Live Forensic Intelligence
                </span>
                <h2 className="font-display font-extrabold text-xl text-[#18181B]">
                  Investigator {avatar.name} is on the Case
                </h2>
              </div>
            </div>

            {/* 5-Step Progress Indicators */}
            <div className="space-y-3 my-6">
              {[
                {
                  step: 1,
                  label: '1. Fetch & Sanitize Sources (5s Parallel / Jina Fallback)',
                },
                {
                  step: 2,
                  label: '2. Extract Explicit Claims & Code Quote Verification',
                },
                {
                  step: 3,
                  label: '3. Map Verified Claims & Detect Direct Conflicts',
                },
                {
                  step: 4,
                  label: '4. Audit Declared Dates & Generate XP Checklist',
                },
                {
                  step: 5,
                  label: '5. Assemble Dossier & Finalize Evidence Board',
                },
              ].map((s) => {
                const isDone = currentStep > s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-xl brutal-border flex items-center gap-3 transition-colors ${
                      isDone
                        ? 'bg-emerald-100 border-emerald-800 text-emerald-950'
                        : isCurrent
                        ? 'bg-yellow-200 border-[#18181B] text-[#18181B] font-bold shadow-sm'
                        : 'bg-white/60 border-stone-300 text-stone-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-[#18181B] animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-stone-300 flex items-center justify-center text-xs font-bold text-stone-400 shrink-0">
                        {s.step}
                      </div>
                    )}
                    <span className="text-xs font-extrabold">{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Status text */}
            <div className="p-3.5 bg-white brutal-border rounded-2xl text-center">
              <p className="font-display font-extrabold text-sm text-[#18181B]">
                {progressStatus.title}
              </p>
              <p className="text-xs text-stone-600 font-medium mt-1">
                {progressStatus.detail}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
