import React from 'react';
import { Sparkles, FolderPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { AvatarConfig } from '../types';

interface HeaderProps {
  currentScreen: 'login' | 'avatar-select' | 'new-case' | 'dashboard';
  avatar: AvatarConfig;
  onNavigate: (screen: 'login' | 'avatar-select' | 'new-case' | 'dashboard') => void;
  onLogout: () => void;
  xp: number;
  unresolvedCount: number;
  totalChecklistCount: number;
  userName?: string;
  isGuest?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  avatar,
  onNavigate,
  onLogout,
  xp,
  unresolvedCount,
  totalChecklistCount,
  userName,
  isGuest,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF0] border-b-3 border-[#18181B] brutal-shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 text-left brutal-btn group focus-visible:ring-3 focus-visible:ring-offset-2"
          aria-label="Operation Dark Spot Detective Agency Home"
        >
          <div
            className="w-10 h-10 rounded-xl brutal-border brutal-shadow-sm flex items-center justify-center text-xl transition-transform group-hover:rotate-6"
            style={{ backgroundColor: avatar.accentColor }}
          >
            🕵️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#18181B] tracking-tight">
                OPERATION DARK SPOT
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-md">
                TOP SECRET
              </span>
            </div>
            <p className="text-xs font-semibold text-stone-600 -mt-0.5">
              Detective Agency • Special Findings Unit
            </p>
          </div>
        </button>

        {/* Status meters & Navigation buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Active Avatar Badge with Switch button */}
          <button
            onClick={() => onNavigate('avatar-select')}
            title="Switch your active investigator"
            className="flex items-center gap-2 px-3 py-1.5 bg-white brutal-border brutal-shadow-sm rounded-full brutal-btn text-xs font-extrabold text-[#18181B] hover:bg-stone-50"
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm brutal-border"
              style={{ backgroundColor: avatar.accentColor }}
            >
              {avatar.emoji}
            </span>
            <span className="hidden xs:inline">
              {userName ? `${userName} (${avatar.name})` : avatar.name}
            </span>
            <span className="text-[10px] text-stone-500 font-bold hidden md:inline">
              (Switch)
            </span>
          </button>

          {/* XP Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 brutal-border brutal-shadow-sm rounded-full text-xs font-black text-[#18181B]"
            title={`Investigator XP: ${xp}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
            <span>{xp} XP</span>
          </div>

          {/* Dark spots counter pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white brutal-border rounded-full text-xs font-black"
            title="Unresolved Dark Spots Remaining"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>
              {unresolvedCount} Dark Spot{unresolvedCount !== 1 ? 's' : ''} left
            </span>
          </div>

          {/* Screen quick toggles + Log out */}
          <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l-2 border-stone-300">
            {currentScreen !== 'dashboard' && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#18181B] bg-white brutal-border brutal-shadow-sm rounded-lg brutal-btn hover:bg-stone-100"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Evidence Board</span>
              </button>
            )}

            {currentScreen !== 'new-case' && (
              <button
                onClick={() => onNavigate('new-case')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#18181B] brutal-border brutal-shadow-sm rounded-lg brutal-btn hover:opacity-95"
                style={{ backgroundColor: avatar.accentColor }}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">New Case</span>
              </button>
            )}

            {/* Log out button (shown on New Case and Dashboard) */}
            {(currentScreen === 'new-case' || currentScreen === 'dashboard') && (
              <button
                onClick={onLogout}
                title={isGuest ? 'End Guest Session' : 'Sign out of Firebase'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-red-700 bg-red-50 border-2 border-red-300 brutal-shadow-sm rounded-lg brutal-btn hover:bg-red-100"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>Log out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
