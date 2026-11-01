import { SourceInput } from '../types';

/**
 * Top-level SAMPLE_CASE configuration used by "Load sample case".
 * Contains realistic sources with pre-filled text fallback if network is restricted.
 */
export const SAMPLE_CASE: {
  title: string;
  question: string;
  sources: SourceInput[];
} = {
  title: 'HDFC Bank Parivartan ECSS Scholarship 2026-27 Verification Docket',
  question: 'What should I verify before applying for the HDFC Bank Parivartan ECSS scholarship 2026-27?',
  sources: [
    {
      url: 'https://www.parivartanecss.com/',
      type: 'official',
      pastedText: `HDFC Bank Parivartan Educational Crisis Support Scholarship (ECSS) Programme 2026-27.
Official Programme Portal and Guidelines Notification. Published: January 12, 2026.
1. Eligibility Norms:
The scholarship is open exclusively to Indian nationals studying in Class 1 through Class 12, diploma, undergraduate, and postgraduate programs.
Applicants must have passed the previous qualifying examination with a minimum of 55% marks.
The annual family income of the applicant must be less than or equal to INR 2,50,000 (INR 2.5 Lakhs) per annum from all verifiable sources.
2. Crisis Support Category:
Applicants must have faced an unforeseen personal or financial crisis within the past three years, including the death of an earning parent or severe medical emergency.
3. Zero Application Fee:
The application process is completely free of charge. HDFC Bank does not charge any processing fee or service fee at any stage.
4. Scholarship Quantum & Disbursement:
Financial aid up to INR 75,000 per annum is awarded based on educational level.
All scholarship funds are credited directly into the verified bank account of the student via Direct Benefit Transfer (DBT).
5. Mandatory Supporting Documents:
Applicants must submit marksheets from the previous qualifying year, government identity card, current admission proof, income certificate issued by a competent government authority, and authentic crisis proof.`
    },
    {
      url: 'https://www.buddy4study.com/article/hdfc-bank-parivartan-ecss-programme-faqs-guide',
      type: 'third-party',
      pastedText: `Buddy4Study Comprehensive Guide - HDFC Bank Parivartan ECSS Programme 2026-27 FAQs.
Published: January 20, 2026. Updated: February 5, 2026.
Key procedural requirements:
All applicants must maintain an active bank passbook or cancelled cheque copy in their own name, or joint account with legal guardians for minors.
Family annual income must be validated by an income certificate issued by a Tehsildar, BDO, or Executive Magistrate; informal self-declarations or local pradhan slips are strictly unacceptable.
Eligible candidates must have scored at least 55% marks in their preceding qualifying semester or examination.
All shortlist interviews and document audit verifications are coordinated exclusively through the Buddy4Study verification team.`
    },
    {
      url: 'https://school.careers360.com/articles/hdfc-parivartan-ecss-programme-2026',
      type: 'third-party',
      pastedText: `Careers360 Education Desk - HDFC Parivartan ECSS Programme 2026 Eligibility & Application Process.
Published: February 8, 2026.
Reporting on student queries:
While several regional educational portals mistakenly reported a 60% minimum cutoff for higher education streams, official bank directives establish a uniform 55% academic threshold for all categories.
Students holding concurrent state or central government merit scholarships remain eligible, provided their total family income stays under INR 2,50,000.
The tentative deadline for submitting applications for the 2026-27 academic session is notified as March 31, 2026.`
    },
    {
      url: 'https://www.indiascholarships.in/scholarships/hdfc-bank-parivartan-ecss-scholarship',
      type: 'third-party',
      pastedText: `IndiaScholarships Portal - HDFC Bank Parivartan ECSS Scholarship Notification & Critical Dates.
Published: December 28, 2025.
Important advisory:
Beware of unauthorized private consultancies demanding a registration fee of INR 500 to submit files, as the official application remains totally free.
Certain community groups claim an increased income ceiling of INR 6,00,000 for technical degree candidates, but the official foundation limits total household income strictly to INR 2,50,000 across all streams.
Applicants are advised to confirm the active IFSC code of their bank account before filing.`
    },
    {
      url: 'https://www.dtnext.in/news/tamilnadu/dt-next-campus-applications-open-for-parivartan-ecss-programme-2026-27-here-is-how-you-can-apply',
      type: 'third-party',
      pastedText: `DT Next - Applications open for Parivartan ECSS Programme 2026-27: Here is how you can apply.
Published: February 14, 2026. By Bureau Reporter.
The Parivartan ECSS initiative continues to extend immediate financial relief to meritorious scholars navigating domestic crises.
Selected awardees receive direct assistance ranging from INR 15,000 to INR 75,000 directly into their bank accounts to guarantee continuity of studies.
Applicants are required to provide verifiable documentation of medical or financial crises to qualify under the crisis quota.`
    }
  ]
};
