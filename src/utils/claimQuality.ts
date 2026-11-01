/**
 * Claim quality, sanitization, and relevance utilities.
 * Enforces:
 * 1. Never show internal claim IDs (S\d+-C\d+) in any visible text.
 * 2. Rule 2: Reject quotes with < 8 words OR > 50% capitalized words.
 * 3. Question relevance scoring for source card previews (preferring deadline, eligibility, amount, documents, process).
 */

export function stripClaimIds(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Replace phrases like "cited in [S1-C12]" or "according to (S2-C4)" with "in the source"
    .replace(/\b(?:in|according to|cited in|from|per)\s+[\(\[\{“"']*S\d+[-_]C\d+[\)\]\}”"']*/gi, 'in the source')
    // Remove bracketed or quoted claim IDs e.g. [S1-C12], "S1-C12", (S1-C12)
    .replace(/[\(\[\{“"']*S\d+[-_]C\d+[\)\]\}”"']*/gi, '')
    // Remove standalone S\d+-C\d+
    .replace(/\bS\d+[-_]C\d+\b/gi, '')
    // Clean up whitespace & spacing before punctuation
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Noise filter check:
 * Reject any claim whose quote has fewer than 4 words OR where more than 50% of words start with a capital letter.
 */
export function passesRule2(quote: string): boolean {
  if (!quote || typeof quote !== 'string') return false;
  const words = quote.trim().split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;

  const capWords = words.filter((w) => /^[A-Z]/.test(w));
  if (capWords.length / words.length > 0.5) return false;

  return true;
}

export const passesNoiseFilter = passesRule2;

/**
 * Score claim relevance against target question with priority keywords.
 * Preferred topics: deadline, eligibility, amount, documents, process.
 */
export function scoreClaimRelevance(
  claim: { claim: string; quote: string; topic?: string },
  question: string
): number {
  let score = 0;
  const combined = `${claim.topic || ''} ${claim.claim} ${claim.quote}`.toLowerCase();

  const priorityKeywords = [
    'deadline',
    'due date',
    'expiry',
    'expiration',
    'valid until',
    'submission date',
    'eligib',
    'qualif',
    'income',
    'threshold',
    'salary',
    'amount',
    'yen',
    'usd',
    'eur',
    'fee',
    'cost',
    'document',
    'certificate',
    'passport',
    'insurance',
    'process',
    'procedure',
    'application',
    'apply',
    'dependant',
    'spouse',
  ];

  for (const kw of priorityKeywords) {
    if (combined.includes(kw)) {
      score += 6;
    }
  }

  // Check matching significant words from question
  if (question) {
    const qWords = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'have', 'from', 'with', 'about'
    ]);

    for (const qw of qWords) {
      if (!stopWords.has(qw) && combined.includes(qw)) {
        score += 4;
      }
    }
  }

  // Bonus for ideal quote length
  if (claim.quote.length >= 45 && claim.quote.length <= 190) {
    score += 3;
  }

  return score;
}
