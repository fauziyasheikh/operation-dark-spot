import {
  AvatarId,
  FetchedSource,
  ExtractedClaim,
  SourceInput,
  CaseData,
  AnalysisStats,
} from '../types';

export interface InvestigationProgress {
  step: number; // 1 to 5
  title: string;
  detail: string;
}

export async function fetchSources(sources: SourceInput[]): Promise<FetchedSource[]> {
  const response = await fetch('/api/fetch-sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Source fetch failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.sources || [];
}

export async function extractClaimsForSource(
  question: string,
  source: FetchedSource
): Promise<ExtractedClaim[]> {
  const response = await fetch('/api/extract-claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, source }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Claims extraction failed for source ${source.id}`);
  }

  const data = await response.json();
  return data.claims || [];
}

export async function extractAllClaimsInParallel(
  question: string,
  sources: FetchedSource[]
): Promise<ExtractedClaim[]> {
  // Parallel extraction with Promise.allSettled per specification
  const validSources = sources.filter((s) => s.status === 'success');
  const results = await Promise.allSettled(
    validSources.map((source) => extractClaimsForSource(question, source))
  );

  const allClaims: ExtractedClaim[] = [];
  for (const res of results) {
    if (res.status === 'fulfilled') {
      allClaims.push(...res.value);
    } else {
      console.warn('Source claim extraction failed:', res.reason);
    }
  }

  return allClaims;
}

export async function runForensicAnalysis(
  question: string,
  avatar: AvatarId,
  sources: FetchedSource[],
  claims: ExtractedClaim[]
): Promise<{
  expectedTopics: string[];
  gaps: any[];
  conflicts: any[];
  outdated: any[];
  checklist: any[];
  stats: AnalysisStats;
}> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, avatar, sources, claims }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Analysis failed with status ${response.status}`);
  }

  return await response.json();
}
