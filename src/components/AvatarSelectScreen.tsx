import React from 'react';
import { Check, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { AVATAR_LIST } from '../config/avatars';
import { AvatarConfig, AvatarId } from '../types';

interface AvatarSelectScreenProps {
  currentAvatar: AvatarConfig;
  onSelectAvatar: (avatarId: AvatarId) => void;
  onConfirm: () => void;
}

export const AvatarSelectScreen: React.FC<AvatarSelectScreenProps> = ({
  currentAvatar,
  onSelectAvatar,
  onConfirm,
}) => {
  return (
    <div className="min-h-[calc(100vh-70px)] paper-pattern py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-300 brutal-border brutal-shadow-sm rounded-full text-xs font-black uppercase tracking-wider text-[#18181B] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Detective Roster Dossier</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Choose Your Lead Investigator
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base font-semibold text-stone-600 mt-2">
            Each detective comes with their own signature specialty, investigation strategy,
            accent colors, forensic tips, and default docket tab.
          </p>
        </div>

        {/* 5 Avatar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {AVATAR_LIST.map((char) => {
            const isSelected = currentAvatar.id === char.id;

            return (
              <div
                key={char.id}
                onClick={() => onSelectAvatar(char.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAvatar(char.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                className={`relative group rounded-3xl p-5 brutal-border-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'brutal-shadow-xl scale-[1.02] bg-white ring-4 ring-[#18181B]'
                    : 'brutal-shadow bg-[#FFFDF0] hover:bg-white hover:-translate-y-1'
                }`}
                style={{
                  borderColor: '#18181B',
                }}
              >
                {/* Pin in top corner */}
                <div className="absolute -top-2.5 -right-2.5 detective-pin" />

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute -top-3.5 left-4 px-3 py-0.5 bg-[#18181B] text-yellow-300 brutal-border rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Active Investigator</span>
                  </div>
                )}

                {/* Character Avatar Top Section */}
                <div className="flex items-center gap-4 mb-4 mt-1">
                  <div
                    className="w-16 h-16 rounded-2xl brutal-border-4 flex items-center justify-center text-3xl shrink-0 brutal-shadow-sm group-hover:rotate-3 transition-transform"
                    style={{ backgroundColor: char.accentColor }}
                  >
                    {char.emoji}
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-[#18181B] flex items-center gap-2">
                      {char.name}
                    </h2>
                    <p className="text-xs font-bold text-stone-600 line-clamp-1">{char.title}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: char.inkColor }}
                      >
                        Tab: {char.defaultTab.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Speech Bubble */}
                <div
                  className="p-3.5 rounded-xl brutal-border text-xs mb-3 font-medium text-stone-900"
                  style={{ backgroundColor: char.cardBg }}
                >
                  <p className="font-bold text-[#18181B] italic">"{char.quotes.newCase}"</p>
                </div>

                {/* Forensic Tip Excerpt */}
                <div className="p-3 bg-stone-50 brutal-border rounded-xl mb-4">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-stone-500 mb-1">
                    <Compass className="w-3 h-3" />
                    <span>Specialty Forensic Tip</span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800">"{char.quotes.tip}"</p>
                </div>

                {/* Select / Assign Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAvatar(char.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-display font-extrabold text-sm brutal-border brutal-btn flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'text-white bg-[#18181B] shadow-sm'
                      : 'text-[#18181B] bg-white hover:bg-stone-100 brutal-shadow-sm'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Selected as Lead</span>
                    </>
                  ) : (
                    <span>Assign {char.name}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom confirmation Bar */}
        <div className="bg-white brutal-border-4 brutal-shadow-xl rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div
              className="w-12 h-12 rounded-2xl brutal-border flex items-center justify-center text-2xl"
              style={{ backgroundColor: currentAvatar.accentColor }}
            >
              {currentAvatar.emoji}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Ready for Assignment
              </p>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#18181B]">
                Investigator {currentAvatar.name} ({currentAvatar.title})
              </h3>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl font-display font-extrabold text-base text-[#18181B] brutal-border-4 brutal-shadow brutal-btn flex items-center justify-center gap-3 transition-transform"
            style={{ backgroundColor: currentAvatar.accentColor }}
          >
            <span>Proceed to New Case</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
