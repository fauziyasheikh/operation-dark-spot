/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AVATARS } from './config/avatars';
import { INITIAL_CASE } from './data/sampleCase';
import { AvatarConfig, AvatarId, CaseData, UserSession } from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { AvatarSelectScreen } from './components/AvatarSelectScreen';
import { NewCaseScreen } from './components/NewCaseScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { logoutUser, updateUserXp } from './services/firebase';

export default function App() {
  // Navigation: login | avatar-select | new-case | dashboard
  const [currentScreen, setCurrentScreen] = useState<
    'login' | 'avatar-select' | 'new-case' | 'dashboard'
  >('login');

  // User session: null when unauthenticated, or UserSession
  const [session, setSession] = useState<UserSession | null>(null);

  // Chosen avatar state (Single source of truth)
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarId>('shinchan');
  const activeAvatar: AvatarConfig = AVATARS[selectedAvatarId];

  // Case data state
  const [currentCase, setCurrentCase] = useState<CaseData>(INITIAL_CASE);

  // Detective XP score - strictly starts at 0 for any new profile, guest or case
  const [xp, setXp] = useState<number>(0);

  // Floating notification / toast for XP & Dark Spot clearance
  const [notification, setNotification] = useState<{
    message: string;
    xpBonus?: number;
    type: 'success' | 'info';
  } | null>(null);

  // Route guard: New Case and Dashboard need a session (signed in or guest); otherwise redirect to login
  useEffect(() => {
    if (!session && (currentScreen === 'new-case' || currentScreen === 'dashboard')) {
      setCurrentScreen('login');
    }
  }, [session, currentScreen]);

  const showNotification = (message: string, xpBonus?: number) => {
    setNotification({ message, xpBonus, type: 'success' });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Add XP helper
  const handleAddXp = (amount: number, reason: string) => {
    setXp((prev) => prev + amount);
    if (session && !session.isGuest) {
      updateUserXp(session.uid, amount);
    }
    showNotification(`+${amount} XP: ${reason}`, amount);
  };

  // Ticking a checklist item clears its dark spot, adds XP, and updates the "Dark Spots left" meter
  const handleToggleChecklistItem = (itemId: string) => {
    setCurrentCase((prevCase) => {
      const updatedChecklist = prevCase.checklist.map((item) => {
        if (item.id === itemId) {
          const nextCleared = !item.cleared;
          const delta = nextCleared ? item.xpReward : -item.xpReward;

          setXp((prev) => Math.max(0, prev + delta));
          if (session && !session.isGuest) {
            updateUserXp(session.uid, delta);
          }

          if (nextCleared) {
            showNotification(`Dark spot resolved! +${item.xpReward} XP awarded!`, item.xpReward);
          } else {
            showNotification(`Dark spot reopened (-${item.xpReward} XP)`);
          }

          return {
            ...item,
            cleared: nextCleared,
            clearedAt: nextCleared
              ? `Cleared on ${new Date().toLocaleDateString()}`
              : undefined,
          };
        }
        return item;
      });

      return {
        ...prevCase,
        checklist: updatedChecklist,
      };
    });
  };

  // Successful login (Google sign-in, Google create-profile, or Guest)
  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    setSelectedAvatarId(userSession.avatar);
    setXp(userSession.xp || 0);
    // As specified: creates/loads profile then opens New Case
    setCurrentScreen('new-case');
    showNotification(
      userSession.isGuest
        ? 'Welcome, Guest Detective! Progress will not be saved.'
        : `Welcome back, ${userSession.displayName}!`
    );
  };

  // Log out button clicked
  const handleLogout = async () => {
    await logoutUser();
    setSession(null);
    setCurrentCase(INITIAL_CASE);
    setXp(0);
    setCurrentScreen('login');
    showNotification('Signed out of Operation Dark Spot.');
  };

  // Select Avatar screen handlers
  const handleSelectAvatar = (id: AvatarId) => {
    setSelectedAvatarId(id);
    if (session) {
      setSession((prev) => (prev ? { ...prev, avatar: id } : null));
    }
  };

  const handleConfirmAvatar = () => {
    // If user was on login page picking a detective before creating profile/guest
    if (!session) {
      setCurrentScreen('login');
    } else {
      // Return to new case or dashboard
      setCurrentScreen('new-case');
    }
  };

  // Launch investigation from New Case
  const handleLaunchInvestigation = (updatedCase: CaseData) => {
    setCurrentCase(updatedCase);
    setCurrentScreen('dashboard');
    showNotification(`Case docket loaded for Investigator ${activeAvatar.name}!`);
  };

  const unresolvedDarkSpotsCount = currentCase.checklist.filter((i) => !i.cleared).length;
  const totalDarkSpotsCount = currentCase.checklist.length;

  return (
    <div
      className="min-h-screen flex flex-col transition-colors selection:bg-yellow-300 selection:text-black"
      style={
        {
          '--avatar-accent': activeAvatar.accentColor,
          '--avatar-ink': activeAvatar.inkColor,
        } as React.CSSProperties
      }
    >
      {/* Header bar: visible once session exists, or on evidence screens */}
      {session && (
        <Header
          currentScreen={currentScreen}
          avatar={activeAvatar}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLogout={handleLogout}
          xp={xp}
          unresolvedCount={unresolvedDarkSpotsCount}
          totalChecklistCount={totalDarkSpotsCount}
          userName={session.displayName}
          isGuest={session.isGuest}
        />
      )}

      {/* Main Content Screens */}
      <main className="flex-1">
        {currentScreen === 'login' && (
          <LoginScreen
            avatar={activeAvatar}
            onLoginSuccess={handleLoginSuccess}
            onPickDifferentDetective={() => setCurrentScreen('avatar-select')}
          />
        )}

        {currentScreen === 'avatar-select' && (
          <AvatarSelectScreen
            currentAvatar={activeAvatar}
            onSelectAvatar={handleSelectAvatar}
            onConfirm={handleConfirmAvatar}
          />
        )}

        {currentScreen === 'new-case' && (
          <NewCaseScreen
            avatar={activeAvatar}
            currentCase={currentCase}
            onLaunchInvestigation={handleLaunchInvestigation}
            onBackToAvatars={() => setCurrentScreen('avatar-select')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            avatar={activeAvatar}
            caseData={currentCase}
            xp={xp}
            onAddXp={handleAddXp}
            onToggleChecklistItem={handleToggleChecklistItem}
            onNewCaseClick={() => setCurrentScreen('new-case')}
            onSwitchAvatarClick={() => setCurrentScreen('avatar-select')}
          />
        )}
      </main>

      {/* Floating XP / Dark Spot Clearance Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-500">
          <div className="px-5 py-3.5 bg-[#18181B] text-white brutal-border-4 brutal-shadow-xl rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-[#18181B] flex items-center justify-center font-black text-sm">
              ✨
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
                Agency Clearance Alert
              </p>
              <p className="text-sm font-extrabold text-white">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
