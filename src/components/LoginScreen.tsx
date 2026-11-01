import React, { useState } from 'react';
import { Shield, Sparkles, User, ArrowRight, AlertCircle, Info, Lock } from 'lucide-react';
import { AvatarConfig, UserSession } from '../types';
import { signInWithGoogle, getUserProfile, createUserProfile } from '../services/firebase';

interface LoginScreenProps {
  avatar: AvatarConfig;
  onLoginSuccess: (session: UserSession) => void;
  onPickDifferentDetective: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  avatar,
  onLoginSuccess,
  onPickDifferentDetective,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'create'>('signin');
  const [detectiveName, setDetectiveName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'info';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Sign In with Google
  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const user = await signInWithGoogle();
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        setActiveTab('create');
        setStatusMessage({
          type: 'info',
          text: 'No profile found. Create one first.',
        });
      } else {
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Authentication failed. You can proceed with Guest mode below.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Create Profile with Google
  const handleCreateProfileWithGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = detectiveName.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setNameError('Detective name must be between 2 and 30 characters.');
      return;
    }
    setNameError(null);
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const user = await signInWithGoogle();
      const profile = await createUserProfile(user.uid, trimmed, avatar.id);
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Create profile error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Profile creation failed. You can proceed with Guest mode below.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Play as Guest handler
  const handlePlayAsGuest = () => {
    const guestSession: UserSession = {
      uid: `guest-${Date.now()}`,
      displayName: 'Guest Detective',
      avatar: avatar.id,
      xp: 0,
      badges: [],
      casesClosed: 0,
      createdAt: new Date().toISOString(),
      isGuest: true,
    };
    onLoginSuccess(guestSession);
  };

  return (
    <div className="min-h-[calc(100vh-70px)] paper-pattern flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Top Warning Banner / Caution Tape */}
      <div className="w-full max-w-xl mx-auto mb-6 brutal-border-4 brutal-shadow rounded-xl overflow-hidden bg-yellow-300">
        <div className="caution-ribbon h-3 w-full" />
        <div className="py-2 px-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#18181B]">
          <span className="flex items-center gap-1.5">
            🚨 Classified Docket Gate // Case File Clearance
          </span>
          <span className="bg-[#18181B] text-yellow-300 px-2 py-0.5 rounded text-[10px]">
            Security Level: Alpha
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-xl bg-white brutal-border-4 brutal-shadow-xl rounded-3xl p-6 sm:p-10">
        {/* Decorative pins */}
        <div className="absolute -top-3 -right-3 detective-pin" />
        <div className="absolute -top-3 -left-3 detective-pin" />

        {/* Agency Stamp */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 brutal-border brutal-shadow-sm rounded-full text-xs font-extrabold text-stone-800 uppercase tracking-wider mb-5">
          <Shield className="w-3.5 h-3.5 text-stone-800" />
          <span>Special Investigations Division</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight leading-tight mb-2">
          Operation Dark Spot
        </h1>
        <p className="text-sm sm:text-base font-semibold text-stone-600 mb-6">
          Uncovering hidden omissions, conflicting citations, and obsolete rules in research documents.
        </p>

        {/* Avatar Speech Bubble Preview */}
        <div className="relative mb-6">
          <div
            className="p-4 sm:p-5 brutal-border-4 brutal-shadow rounded-2xl relative mb-3"
            style={{ backgroundColor: avatar.cardBg, borderColor: '#18181B' }}
          >
            <div className="bubble-pointer-bottom" />
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl p-1 bg-white brutal-border rounded-xl">
                {avatar.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: avatar.inkColor }}
                  >
                    {avatar.name}
                  </span>
                  <span className="text-xs font-bold text-stone-500">says:</span>
                </div>
                <p className="font-display text-base sm:text-lg font-bold text-[#18181B] italic">
                  "{avatar.quotes.login}"
                </p>
              </div>
            </div>
          </div>

          {/* Pick a different detective link (replaces old change character button) */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onPickDifferentDetective}
              className="text-xs font-bold text-stone-700 underline hover:text-[#18181B] flex items-center gap-1 brutal-btn"
            >
              <span>Pick a different detective</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Status / Alert Message */}
        {statusMessage && (
          <div
            className={`p-3.5 mb-5 rounded-xl brutal-border text-xs font-bold flex items-start gap-2.5 ${
              statusMessage.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-500'
                : 'bg-blue-50 text-blue-900 border-blue-500'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Two Tabs: "Sign in" & "Create profile" */}
        <div className="flex rounded-xl brutal-border overflow-hidden mb-6 bg-stone-100 p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-[#18181B] brutal-shadow-sm font-black'
                : 'text-stone-600 hover:text-[#18181B]'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white text-[#18181B] brutal-shadow-sm font-black'
                : 'text-stone-600 hover:text-[#18181B]'
            }`}
          >
            Create profile
          </button>
        </div>

        {/* Tab 1: Sign in for returning users */}
        {activeTab === 'signin' && (
          <div className="space-y-4">
            <p className="text-xs font-medium text-stone-600">
              Returning detectives can sign in with Google to load their saved case files and XP.
            </p>
            <button
              type="button"
              onClick={handleSignInWithGoogle}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl font-display font-extrabold text-base text-[#18181B] bg-white brutal-border-3 brutal-shadow brutal-btn flex items-center justify-center gap-3 hover:bg-stone-50 disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Create profile */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateProfileWithGoogle} className="space-y-4">
            <div>
              <label
                htmlFor="detective-name"
                className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Detective Name <span className="text-red-600">*</span>
              </label>
              <input
                id="detective-name"
                type="text"
                value={detectiveName}
                onChange={(e) => {
                  setDetectiveName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. Inspector Shinnosuke"
                maxLength={30}
                required
                className="w-full px-4 py-3 rounded-xl brutal-border text-sm font-bold text-[#18181B] bg-[#FFFDF0] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] font-medium text-stone-500">2-30 characters</span>
                <span className="text-[11px] font-bold text-stone-500">{detectiveName.length}/30</span>
              </div>
              {nameError && (
                <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Chosen Avatar display */}
            <div className="p-3 bg-stone-50 brutal-border rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600">Selected Detective:</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-lg brutal-border flex items-center justify-center text-base"
                  style={{ backgroundColor: avatar.accentColor }}
                >
                  {avatar.emoji}
                </span>
                <span className="text-xs font-extrabold text-[#18181B]">{avatar.name}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || detectiveName.trim().length < 2}
              className="w-full py-3.5 px-6 rounded-2xl font-display font-extrabold text-base text-[#18181B] bg-white brutal-border-3 brutal-shadow brutal-btn flex items-center justify-center gap-3 hover:bg-stone-50 disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Creating Profile...' : 'Continue with Google'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-xs font-black uppercase text-stone-400">
            or temporary clearance
          </span>
        </div>

        {/* Play as guest option */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handlePlayAsGuest}
            className="w-full py-3.5 px-6 rounded-2xl font-display font-extrabold text-base text-[#18181B] brutal-border-3 brutal-shadow brutal-btn flex items-center justify-center gap-3 transition-transform"
            style={{ backgroundColor: avatar.accentColor }}
          >
            <User className="w-5 h-5 text-[#18181B]" />
            <span>Play as Guest</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
          <p className="text-[11px] text-center text-stone-500 font-medium">
            (Guest mode: progress is not saved across sessions)
          </p>
        </div>

        {/* Feature pillars */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-8 pt-6 border-t-2 border-stone-200 text-center">
          <div className="p-2 bg-[#FFFDF0] brutal-border rounded-xl">
            <span className="text-lg">🔍</span>
            <p className="text-xs font-extrabold text-[#18181B] mt-1">Sniff Out Gaps</p>
            <p className="text-[10px] text-stone-500 font-medium">Missing policy rules</p>
          </div>
          <div className="p-2 bg-[#FFFDF0] brutal-border rounded-xl">
            <span className="text-lg">⚖️</span>
            <p className="text-xs font-extrabold text-[#18181B] mt-1">Spot Conflicts</p>
            <p className="text-[10px] text-stone-500 font-medium">Side-by-side quotes</p>
          </div>
          <div className="p-2 bg-[#FFFDF0] brutal-border rounded-xl">
            <span className="text-lg">📅</span>
            <p className="text-xs font-extrabold text-[#18181B] mt-1">Catch Outdated</p>
            <p className="text-[10px] text-stone-500 font-medium">Stale year stamps</p>
          </div>
        </div>
      </div>
    </div>
  );
};
