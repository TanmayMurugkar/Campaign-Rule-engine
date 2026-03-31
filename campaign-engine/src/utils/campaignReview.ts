import type { Campaign, RuleVersion } from '@/types/campaign.types';
import { validateCampaignDates, validateVersionCoverage, validateVersionOverlap } from '@/utils/validators';

export interface CampaignReviewResult {
  errors: string[];
  warnings: string[];
}

function hasAnyPayoutDefined(v: RuleVersion): boolean {
  const s = v.payoutStructure;
  if (!s) return false;
  if (s.kpis?.length) return true;
  return false;
}

export function reviewCampaignDraft(campaign: Partial<Campaign>): CampaignReviewResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Step 1-ish
  const name = campaign.name?.trim() ?? '';
  if (!name) errors.push('Campaign name is required.');
  if ((campaign.description?.length ?? 0) > 500) errors.push('Description must be 500 characters or less.');
  if (!campaign.type) errors.push('Campaign type is required.');

  if (!campaign.startDate || !campaign.endDate) {
    errors.push('Campaign period (start and end date) is required.');
  } else {
    const d = validateCampaignDates(campaign.startDate, campaign.endDate, true);
    if (!d.valid) errors.push(d.error ?? 'Campaign dates are invalid.');
  }

  // Step 2-ish
  const t = campaign.targeting;
  if (!t) {
    errors.push('Targeting is required.');
  } else if (t.mode === 'hierarchy') {
    const h = t.hierarchy;
    const count =
      (h?.channels?.length ?? 0) + (h?.subChannels?.length ?? 0) + (h?.designations?.length ?? 0);
    if (count === 0) errors.push('Select at least one hierarchy target (channel/sub-channel/designation).');
  } else {
    if ((t.uploadedAgents?.length ?? 0) === 0) errors.push('Upload an agent file with at least one valid agent row.');
  }

  const versions = campaign.ruleVersions ?? [];
  if (versions.length === 0) {
    warnings.push('No rule versions defined yet. Add at least one version for full coverage.');
  }

  if (campaign.startDate && campaign.endDate && versions.length > 0) {
    const overlap = validateVersionOverlap(
      versions.map((v) => ({ id: v.id, startDate: v.startDate, endDate: v.endDate }))
    );
    if (!overlap.valid) errors.push('Rule version date overlap detected.');

    const coverage = validateVersionCoverage(
      campaign.startDate,
      campaign.endDate,
      versions.map((v) => ({ startDate: v.startDate, endDate: v.endDate }))
    );
    if (!coverage.valid) warnings.push(`Rule version coverage gaps: ${coverage.gaps.join('; ')}`);
  }

  // Payout warnings per version
  for (const v of versions) {
    if (!hasAnyPayoutDefined(v)) warnings.push(`No payout defined for version: ${v.label}`);
  }

  return { errors, warnings };
}

