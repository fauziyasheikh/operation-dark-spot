import { CaseData } from '../types';
import { SAMPLE_CASE } from './sampleCaseConfig';

export const INITIAL_CASE: CaseData = {
  id: 'case-hdfc-ecss-2026',
  caseNumber: 'CASE #814-HD',
  title: SAMPLE_CASE.title,
  targetQuestion: SAMPLE_CASE.question,
  targetSources: SAMPLE_CASE.sources,
  openedDate: 'FEB 18, 2026',
  status: 'Investigating',
  sources: [
    {
      id: 'S1',
      title: 'HDFC Bank Parivartan - ECSS Official Programme Portal',
      domain: 'hdfcbank.com',
      url: 'https://www.parivartanecss.com/',
      declaredDate: 'January 12, 2026',
      publishedDate: '2026-01-12',
      freshness: 'fresh',
      type: 'official',
      status: 'success',
      authorOrDept: 'HDFC Bank CSR Foundation Bureau',
      text: SAMPLE_CASE.sources[0].pastedText || '',
      bestClaimQuote:
        'The annual family income of the applicant must be less than or equal to INR 2,50,000 (INR 2.5 Lakhs) per annum from all verifiable sources.',
    },
    {
      id: 'S2',
      title: 'Buddy4Study - ECSS FAQs & Application Handbook',
      domain: 'buddy4study.com',
      url: 'https://www.buddy4study.com/article/hdfc-bank-parivartan-ecss-programme-faqs-guide',
      declaredDate: 'January 20, 2026',
      publishedDate: '2026-01-20',
      modifiedDate: '2026-02-05',
      freshness: 'fresh',
      type: 'third-party',
      status: 'success',
      authorOrDept: 'Editorial Verification Desk',
      text: SAMPLE_CASE.sources[1].pastedText || '',
      bestClaimQuote:
        'Family annual income must be validated by an income certificate issued by a Tehsildar, BDO, or Executive Magistrate; informal self-declarations or local pradhan slips are strictly unacceptable.',
    },
    {
      id: 'S3',
      title: 'Careers360 - ECSS Programme Eligibility & Process',
      domain: 'school.careers360.com',
      url: 'https://school.careers360.com/articles/hdfc-parivartan-ecss-programme-2026',
      declaredDate: 'February 8, 2026',
      publishedDate: '2026-02-08',
      freshness: 'fresh',
      type: 'third-party',
      status: 'success',
      authorOrDept: 'Higher Education Research Group',
      text: SAMPLE_CASE.sources[2].pastedText || '',
      bestClaimQuote:
        'The tentative deadline for submitting applications for the 2026-27 academic session is notified as March 31, 2026.',
    },
    {
      id: 'S4',
      title: 'IndiaScholarships - ECSS Application Advisory',
      domain: 'indiascholarships.in',
      url: 'https://www.indiascholarships.in/scholarships/hdfc-bank-parivartan-ecss-scholarship',
      declaredDate: 'December 28, 2025',
      publishedDate: '2025-12-28',
      freshness: 'fresh',
      type: 'third-party',
      status: 'success',
      authorOrDept: 'Scholarship Audit Portal',
      text: SAMPLE_CASE.sources[3].pastedText || '',
      bestClaimQuote:
        'Beware of unauthorized private consultancies demanding a registration fee of INR 500 to submit files, as the official application remains totally free.',
    },
    {
      id: 'S5',
      title: 'DT Next - Parivartan ECSS Application Notice',
      domain: 'dtnext.in',
      url: 'https://www.dtnext.in/news/tamilnadu/dt-next-campus-applications-open-for-parivartan-ecss-programme-2026-27-here-is-how-you-can-apply',
      declaredDate: 'February 14, 2026',
      publishedDate: '2026-02-14',
      freshness: 'fresh',
      type: 'third-party',
      status: 'success',
      authorOrDept: 'State Bureau Reporters',
      text: SAMPLE_CASE.sources[4].pastedText || '',
      bestClaimQuote:
        'Selected awardees receive direct assistance ranging from INR 15,000 to INR 75,000 directly into their bank accounts to guarantee continuity of studies.',
    },
  ],
  gaps: [
    {
      id: 'gap-1',
      title: 'Missing Guidelines for Candidates with Incomplete Previous Year Grade Sheets',
      topic: 'Academic Eligibility',
      badge: 'AI suggestion',
      description:
        'The official notice requires 55% marks in the preceding exam, but specific fallback protocols for students awaiting re-evaluation marksheets were not found in the sources reviewed.',
      impact:
        'Students whose university results are withheld or awaiting supplementary results risk missing the application deadline without provisional documentation guidance.',
      characterLine:
        'Hey! If school results got delayed in the mail, do they still get to play detective? Check with the desk!',
      sourceQuote: {
        quote:
          'Applicants must have passed the previous qualifying examination with a minimum of 55% marks.',
        sourceId: 'S1',
        sourceTitle: 'the official programme page',
        sourceUrl: 'https://www.parivartanecss.com/',
        pageOrSection: 'Section 1: Eligibility Norms',
        dateCited: 'January 2026',
        isVerifiedInSourceText: true,
      },
      recommendedAction:
        'Submit a provisional Bonafide certificate countersigned by the college principal confirming semester marks.',
    },
    {
      id: 'gap-2',
      title: 'Specification for Multi-Sibling Household Quota Missing in Portal Guidelines',
      topic: 'Family Quota',
      badge: 'AI suggestion',
      description:
        'The documents do not state whether two siblings from the same crisis-impacted household can both apply concurrently (not found in the sources reviewed).',
      impact:
        'Families with multiple school-going children may have one application silently discarded due to duplicate household income certificates.',
      characterLine:
        'Wait! What if Shiro and I both want school pocket money? Can two siblings apply? Nobody wrote it down!',
      sourceQuote: {
        quote:
          'The annual family income of the applicant must be less than or equal to INR 2,50,000 (INR 2.5 Lakhs) per annum from all verifiable sources.',
        sourceId: 'S1',
        sourceTitle: 'the official programme page',
        sourceUrl: 'https://www.parivartanecss.com/',
        pageOrSection: 'Section 1: Eligibility Norms',
        dateCited: 'January 2026',
        isVerifiedInSourceText: true,
      },
      recommendedAction:
        'Verify with the official programme helpline whether sibling co-applications require separate income affidavits.',
    },
  ],
  conflicts: [
    {
      id: 'conf-1',
      title: 'Academic Eligibility Cutoff Discrepancy (55% vs 60%)',
      topic: 'Academic Cutoff',
      badge: 'Sourced',
      description:
        'The official portal mandates a minimum of 55% marks, whereas external aggregator bulletins reported a 60% cutoff for degree students. The official programme page is the official source—confirm the requirements directly with it.',
      claimIdA: 'S1-C1',
      claimIdB: 'S3-C1',
      quoteA: {
        quote:
          'Applicants must have passed the previous qualifying examination with a minimum of 55% marks.',
        sourceId: 'S1',
        sourceTitle: 'the official programme page',
        sourceUrl: 'https://www.parivartanecss.com/',
        dateCited: 'January 2026 (Official Portal)',
        isVerifiedInSourceText: true,
      },
      quoteB: {
        quote:
          'While several regional educational portals mistakenly reported a 60% minimum cutoff for higher education streams, official bank directives establish a uniform 55% academic threshold for all categories.',
        sourceId: 'S3',
        sourceTitle: 'the Careers360 guide',
        sourceUrl: 'https://school.careers360.com/articles/hdfc-parivartan-ecss-programme-2026',
        dateCited: 'February 2026 (Careers360 Article)',
        isVerifiedInSourceText: true,
      },
      characterLine:
        'Aha! One paper claims 60% marks and the official paper says 55%! Always trust the bank boss paper!',
      resolutionNote:
        'The official programme page is the official source—confirm all current cutoff criteria directly with it.',
    },
    {
      id: 'conf-2',
      title: 'Family Income Ceiling Discrepancy (INR 2.5 Lakhs vs INR 6 Lakhs)',
      topic: 'Income Ceiling',
      badge: 'Sourced',
      description:
        'The official guideline strictly enforces a 2.5 Lakh family income cap, while social media circulations claimed an expanded INR 6 Lakh threshold. The official programme page is the official source—confirm the requirements directly with it.',
      claimIdA: 'S1-C2',
      claimIdB: 'S4-C1',
      quoteA: {
        quote:
          'The annual family income of the applicant must be less than or equal to INR 2,50,000 (INR 2.5 Lakhs) per annum from all verifiable sources.',
        sourceId: 'S1',
        sourceTitle: 'the official programme page',
        sourceUrl: 'https://www.parivartanecss.com/',
        dateCited: 'January 2026 (Official Policy)',
        isVerifiedInSourceText: true,
      },
      quoteB: {
        quote:
          'Certain community groups claim an increased income ceiling of INR 6,00,000 for technical degree candidates, but the official foundation limits total household income strictly to INR 2,50,000 across all streams.',
        sourceId: 'S4',
        sourceTitle: 'the IndiaScholarships advisory',
        sourceUrl: 'https://www.indiascholarships.in/scholarships/hdfc-bank-parivartan-ecss-scholarship',
        dateCited: 'December 2025 (Audit Advisory)',
        isVerifiedInSourceText: true,
      },
      characterLine:
        'Do not let fake internet rumors trick your wallet! The real cap is 2.5 Lakhs!',
      resolutionNote:
        'The official programme page is the official source—confirm the requirements directly with it.',
    },
  ],
  outdated: [
    {
      id: 'out-1',
      title: 'Unauthorized Intermediary Registration Fees vs Official Free Application Norm',
      topic: 'Application Fee',
      badge: 'AI suggestion',
      statedYearOrDate: 'Uncertified Broker Notices',
      currentStandardDate: 'January 2026 Official Policy',
      description:
        'Third-party portals warn of broker ads demanding INR 500 processing fees, which directly violates HDFC Bank zero-fee policy.',
      warning:
        'Never pay any agent or website for filing; applications submitted via paid touts are disqualified.',
      characterLine:
        'Action Kamen says anyone asking for money to submit free scholarship forms is a villain!',
      quote: {
        quote:
          'Beware of unauthorized private consultancies demanding a registration fee of INR 500 to submit files, as the official application remains totally free.',
        sourceId: 'S4',
        sourceTitle: 'the IndiaScholarships advisory',
        sourceUrl: 'https://www.indiascholarships.in/scholarships/hdfc-bank-parivartan-ecss-scholarship',
        dateCited: 'December 2025',
        isVerifiedInSourceText: true,
      },
    },
  ],
  checklist: [
    {
      id: 'chk-1',
      task: 'Obtain government income certificate issued by Tehsildar or BDO verifying family income under 2.5 Lakhs',
      category: 'conflicts',
      priority: 'high',
      cleared: false,
      xpReward: 25,
      note: 'Informal receipts or local panchayat self-declarations are rejected; must be from an authorized executive officer.',
      clearsSpotId: 'conf-2',
      topic: 'Income Ceiling',
      referenceQuote: {
        quote:
          'Family annual income must be validated by an income certificate issued by a Tehsildar, BDO, or Executive Magistrate; informal self-declarations or local pradhan slips are strictly unacceptable.',
        sourceId: 'S2',
        sourceTitle: 'the Buddy4Study guide',
        sourceUrl: 'https://www.buddy4study.com/article/hdfc-bank-parivartan-ecss-programme-faqs-guide',
        isVerifiedInSourceText: true,
      },
    },
    {
      id: 'chk-2',
      task: 'Verify previous year marksheet satisfies official 55% academic eligibility criteria',
      category: 'conflicts',
      priority: 'high',
      cleared: false,
      xpReward: 25,
      note: 'Confirm overall percentage meets the 55% standard rather than the rumored 60% figure.',
      clearsSpotId: 'conf-1',
      topic: 'Academic Cutoff',
      referenceQuote: {
        quote:
          'Applicants must have passed the previous qualifying examination with a minimum of 55% marks.',
        sourceId: 'S1',
        sourceTitle: 'the official programme page',
        sourceUrl: 'https://www.parivartanecss.com/',
        isVerifiedInSourceText: true,
      },
    },
    {
      id: 'chk-3',
      task: 'Confirm zero-fee direct online submission through official portal without intermediaries',
      category: 'outdated',
      priority: 'medium',
      cleared: false,
      xpReward: 15,
      note: 'HDFC Bank does not charge any processing fee; avoid paid consultancy traps.',
      clearsSpotId: 'out-1',
      topic: 'Application Fee',
      referenceQuote: {
        quote:
          'The application process is completely free of charge. HDFC Bank does not charge any processing fee or service fee at any stage.',
        sourceId: 'S1',
        sourceTitle: 'the official programme page',
        sourceUrl: 'https://www.parivartanecss.com/',
        isVerifiedInSourceText: true,
      },
    },
    {
      id: 'chk-4',
      task: 'Validate bank account details (IFSC and passbook in applicant name) for direct DBT disbursement',
      category: 'gaps',
      priority: 'medium',
      cleared: false,
      xpReward: 15,
      note: 'Account must belong to applicant or joint with guardian for minors to avoid transfer failure.',
      clearsSpotId: 'gap-1',
      topic: 'Disbursement',
      referenceQuote: {
        quote:
          'All applicants must maintain an active bank passbook or cancelled cheque copy in their own name, or joint account with legal guardians for minors.',
        sourceId: 'S2',
        sourceTitle: 'the Buddy4Study guide',
        sourceUrl: 'https://www.buddy4study.com/article/hdfc-bank-parivartan-ecss-programme-faqs-guide',
        isVerifiedInSourceText: true,
      },
    },
  ],
  stats: {
    sourcesReviewed: 5,
    claimsUsed: 8,
    claimsRejected: 1,
    findingsDropped: 0,
    totalClaimsExtracted: 9,
    claimsVerified: 8,
  },
  expectedTopics: [
    'Academic Eligibility Cutoff',
    'Family Annual Income Ceiling',
    'Crisis Support Documentation',
    'Zero Application Fee Policy',
    'Direct Benefit Transfer (DBT) Bank Account',
    'Application Deadline & Verification Desk',
  ],
};
