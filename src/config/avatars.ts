import { AvatarConfig, AvatarId } from '../types';

export const AVATARS: Record<AvatarId, AvatarConfig> = {
  shinchan: {
    id: 'shinchan',
    name: 'Shinchan',
    emoji: '🕵️',
    title: 'Junior Detective & Chocobi Specialist',
    accentColor: '#FFD21F', // Bright cheerful detective yellow
    inkColor: '#E03A3A', // Vibrant comic red ink
    cardBg: '#FFFBEA',
    defaultTab: 'gaps',
    quotes: {
      login: 'Sign in to save your case files!',
      newCase: "Give me the question and some links. I'll sniff out what's missing!",
      tip: 'Add sources from different websites to catch conflicts.',
      dashboardGreeting: 'Hehe! Look at these suspicious dark spots. Someone forgot to finish the paperwork!',
    },
    personalityNote: 'Specializes in uncovering obvious omissions and overlooked details with sheer curiosity.',
  },
  misae: {
    id: 'misae',
    name: 'Misae',
    emoji: '👩',
    title: 'Chief Inspector & Household Auditor',
    accentColor: '#F7B3B0', // Soft coral pink
    inkColor: '#B3261E', // Crimson authority ink
    cardBg: '#FFF0F0',
    defaultTab: 'checklist',
    quotes: {
      login: 'Sign in first. Then we check every document.',
      newCase: 'Question first, then the links. I want every detail checked.',
      tip: 'Always confirm deadlines on the official page.',
      dashboardGreeting: 'Pay attention! We have receipts to audit and checklists to clear before dinner.',
    },
    personalityNote: 'Leaves no clause unread. Demands verified dates, exact fees, and signed checklists.',
  },
  kazama: {
    id: 'kazama',
    name: 'Kazama',
    emoji: '🤓',
    title: 'Honor Scholar & Forensic Analyst',
    accentColor: '#BFD9FF', // Scholarly baby blue
    inkColor: '#1F3A8A', // Deep navy ink
    cardBg: '#F0F6FF',
    defaultTab: 'conflicts',
    quotes: {
      login: 'Sign in so your evidence record stays organised.',
      newCase: 'State the question clearly and cite proper sources.',
      tip: 'Official pages beat forums when two sources disagree.',
      dashboardGreeting: 'According to my comparative analysis, these contradictory clauses cannot both be true.',
    },
    personalityNote: 'Detects semantic discrepancies and cross-references contradictory citations.',
  },
  masao: {
    id: 'masao',
    name: 'Masao',
    emoji: '😰',
    title: 'Cautious Eyewitness & Archive Sentinel',
    accentColor: '#DDD6C6', // Warm vintage parchment
    inkColor: '#1B7F79', // Teal cautionary ink
    cardBg: '#F5F2EB',
    defaultTab: 'outdated',
    quotes: {
      login: "S-sign in so we don't lose our clues!",
      newCase: "I'm nervous, but I'll check these links.",
      tip: 'Undated pages are risky. Look for a date first.',
      dashboardGreeting: 'Oh no... what if this article is from five years ago and completely invalid today?!',
    },
    personalityNote: 'Hypersensitive to expired circulars, obsolete tax years, and stale timestamps.',
  },
  shiro: {
    id: 'shiro',
    name: 'Shiro',
    emoji: '🐶',
    title: 'Scent Hound & Buried Evidence Tracker',
    accentColor: '#FFE3C2', // Warm peach-cream
    inkColor: '#E07B00', // Amber orange ink
    cardBg: '#FFF7EC',
    defaultTab: 'outdated',
    quotes: {
      login: "Woof! Sign in and I'll remember where the clues are buried.",
      newCase: 'Give me a scent. A question and some links!',
      tip: 'Old cycle years hide in the small print.',
      dashboardGreeting: 'Sniff sniff! Something smells dusty and expired at the bottom of page four!',
    },
    personalityNote: 'Sniffs out buried footnotes, discontinued programs, and silent policy revisions.',
  },
};

export const AVATAR_LIST: AvatarConfig[] = Object.values(AVATARS);
