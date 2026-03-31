import { differenceInDays, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import type { RuleVersion } from '@/types/campaign.types';

/** Campaign dates: start < end, start >= today for new campaigns */
export function validateCampaignDates(
  startDate: string,
  endDate: string,
  isNew = true
): { valid: boolean; error?: string } {
  if (!startDate || !endDate) return { valid: false, error: 'Both dates are required' };

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNew && isBefore(start, today)) {
    return { valid: false, error: 'Start date must be today or later for new campaigns' };
  }
  if (!isAfter(end, start)) {
    return { valid: false, error: 'End date must be after start date' };
  }
  return { valid: true };
}

/** All campaign days must be covered by at least one version */
export function validateVersionCoverage(
  campaignStart: string,
  campaignEnd: string,
  versions: Pick<RuleVersion, 'startDate' | 'endDate'>[]
): { valid: boolean; gaps: string[] } {
  if (versions.length === 0) {
    return { valid: false, gaps: [`${campaignStart} to ${campaignEnd}`] };
  }

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const gaps: string[] = [];
  let currentDate = new Date(campaignStart);
  const endDate = new Date(campaignEnd);

  for (const version of sortedVersions) {
    const vStart = new Date(version.startDate);
    const vEnd = new Date(version.endDate);

    if (isBefore(currentDate, vStart)) {
      gaps.push(
        `${currentDate.toISOString().slice(0, 10)} to ${new Date(vStart.getTime() - 86400000).toISOString().slice(0, 10)}`
      );
    }
    currentDate = new Date(vEnd.getTime() + 86400000);
  }

  if (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
    gaps.push(`${currentDate.toISOString().slice(0, 10)} to ${campaignEnd}`);
  }

  return { valid: gaps.length === 0, gaps };
}

/** No two versions may share dates */
export function validateVersionOverlap(
  versions: Pick<RuleVersion, 'id' | 'startDate' | 'endDate'>[]
): { valid: boolean; overlaps: Array<[string, string]> } {
  const overlaps: Array<[string, string]> = [];

  for (let i = 0; i < versions.length; i++) {
    for (let j = i + 1; j < versions.length; j++) {
      const a = versions[i];
      const b = versions[j];
      const aStart = parseISO(a.startDate);
      const aEnd = parseISO(a.endDate);
      const bStart = parseISO(b.startDate);
      const bEnd = parseISO(b.endDate);

      const overlaps_ =
        (isAfter(aEnd, bStart) || isEqual(aEnd, bStart)) &&
        (isBefore(aStart, bEnd) || isEqual(aStart, bEnd));

      if (overlaps_) {
        overlaps.push([a.id, b.id]);
      }
    }
  }

  return { valid: overlaps.length === 0, overlaps };
}

/** No duplicate dimension combinations in payout tiers */
export function validatePayoutTiers(tiers: Array<{ id: string; dimensions: unknown[] }>): {
  valid: boolean;
  duplicates: string[];
} {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const tier of tiers) {
    const key = JSON.stringify(tier.dimensions);
    if (seen.has(key)) {
      duplicates.push(tier.id);
    } else {
      seen.set(key, tier.id);
    }
  }

  return { valid: duplicates.length === 0, duplicates };
}

/** Compute campaign duration in days */
export function getCampaignDuration(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}
