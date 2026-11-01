import React from 'react';
import { X, ExternalLink, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { QuoteVerification } from '../types';
import { stripClaimIds } from '../utils/claimQuality';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  quoteA?: QuoteVerification;
  quoteB?: QuoteVerification;
  accentColor: string;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  title,
  badge,
  quoteA,
  quoteB,
  accentColor,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFDF0] brutal-border-4 brutal-shadow-xl rounded-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top classified strip */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b-3 border-[#18181B]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#18181B] bg-yellow-300 brutal-border brutal-shadow-sm rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#18181B]" />
              Forensic Source Excerpt
            </span>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-bold text-white bg-[#18181B] rounded-full">
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#18181B] bg-white brutal-border brutal-shadow-sm rounded-full hover:bg-red-100 transition-colors brutal-btn"
            aria-label="Close source quote drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h2 id="drawer-title" className="text-xl md:text-2xl font-extrabold text-[#18181B] mb-4">
          {stripClaimIds(title)}
        </h2>

        {/* Side-by-side quotes if quoteB exists (conflict), or single quote */}
        {quoteB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Quote A */}
            <div className="flex flex-col justify-between p-4 bg-white brutal-border brutal-shadow rounded-xl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-xs font-extrabold text-blue-900 bg-blue-100 brutal-border brutal-shadow-sm rounded-md">
                    Source Citation A
                  </span>
                  {quoteA?.dateCited && (
                    <span className="text-xs font-medium text-stone-500">{quoteA.dateCited}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#18181B] mb-2">{stripClaimIds(quoteA?.sourceTitle || '')}</h3>
                <blockquote className="p-3 my-2 text-sm italic font-medium leading-relaxed bg-[#FFFDF0] brutal-border border-l-6 border-l-blue-600 rounded-lg text-stone-800">
                  "{stripClaimIds(quoteA?.quote || '')}"
                </blockquote>
                {quoteA?.pageOrSection && (
                  <p className="text-xs font-semibold text-stone-600 mt-2">
                    📍 {stripClaimIds(quoteA.pageOrSection)}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t-2 border-stone-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quote verified in source text</span>
                </div>
                {quoteA?.sourceUrl && (
                  <a
                    href={quoteA.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <span>Inspect external portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quote B */}
            <div className="flex flex-col justify-between p-4 bg-white brutal-border brutal-shadow rounded-xl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-xs font-extrabold text-amber-900 bg-amber-100 brutal-border brutal-shadow-sm rounded-md">
                    Source Citation B
                  </span>
                  {quoteB?.dateCited && (
                    <span className="text-xs font-medium text-stone-500">{quoteB.dateCited}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#18181B] mb-2">{stripClaimIds(quoteB?.sourceTitle || '')}</h3>
                <blockquote className="p-3 my-2 text-sm italic font-medium leading-relaxed bg-[#FFFDF0] brutal-border border-l-6 border-l-amber-500 rounded-lg text-stone-800">
                  "{stripClaimIds(quoteB?.quote || '')}"
                </blockquote>
                {quoteB?.pageOrSection && (
                  <p className="text-xs font-semibold text-stone-600 mt-2">
                    📍 {stripClaimIds(quoteB.pageOrSection)}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t-2 border-stone-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quote verified in source text</span>
                </div>
                {quoteB?.sourceUrl && (
                  <a
                    href={quoteB.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <span>Inspect external portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          quoteA && (
            <div className="p-5 bg-white brutal-border brutal-shadow rounded-xl mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold text-stone-800 bg-[#FFFDF0] brutal-border rounded-md">
                  <FileText className="w-3.5 h-3.5" />
                  Direct Source Record
                </span>
                {quoteA.dateCited && (
                  <span className="text-xs font-semibold text-stone-600">
                    Docket Date: {quoteA.dateCited}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-[#18181B] mb-3">{stripClaimIds(quoteA.sourceTitle)}</h3>

              <blockquote className="p-4 my-3 text-base md:text-lg italic font-medium leading-relaxed bg-[#FFFDF0] brutal-border border-l-8 border-l-[#18181B] rounded-lg text-stone-900">
                "{stripClaimIds(quoteA.quote)}"
              </blockquote>

              {quoteA.pageOrSection && (
                <p className="text-xs font-bold text-stone-600 mb-4">
                  📍 Section Reference: {stripClaimIds(quoteA.pageOrSection)}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-stone-200">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 brutal-border border-emerald-600 rounded-full font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quote verified in source text</span>
                </div>

                {quoteA.sourceUrl && (
                  <a
                    href={quoteA.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-[#18181B] rounded-full brutal-btn shadow-sm hover:bg-stone-800"
                  >
                    <span>Open Original Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )
        )}

        {/* Verification seal note */}
        <div className="p-3 bg-stone-100 brutal-border rounded-xl flex items-center justify-between text-xs text-stone-600 font-medium">
          <span>Official Agency Archival Record — Verified by Operation Dark Spot Field Protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white brutal-border text-stone-900 font-bold rounded-lg brutal-btn"
          >
            Close Docket
          </button>
        </div>
      </div>
    </div>
  );
};
