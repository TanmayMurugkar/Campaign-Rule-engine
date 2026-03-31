import type { Campaign } from '@/types/campaign.types';
import { validateCampaignDates } from '@/utils/validators';

/** Step 1: name, type, dates (incl. start >= today, end > start), description max 500 */
export function isCampaignWizardStep1Valid(campaign: Partial<Campaign>): boolean {
  return getCampaignWizardStep1Error(campaign) === null;
}

export function getCampaignWizardStep1Error(campaign: Partial<Campaign>): string | null {
  const name = campaign.name?.trim() ?? '';
  if (!name) return 'Enter a campaign name.';
  if (name.length > 100) return 'Campaign name must be 100 characters or less.';

  const desc = campaign.description ?? '';
  if (desc.length > 500) return 'Description must be 500 characters or less.';

  if (!campaign.type) return 'Select a campaign type.';

  if (!campaign.startDate || !campaign.endDate) return 'Choose both a start date and an end date.';

  const dates = validateCampaignDates(campaign.startDate, campaign.endDate, true);
  if (!dates.valid) return dates.error ?? 'Invalid campaign dates.';

  return null;
}

/** Step 2: hierarchy has at least one selection, or Excel has at least one agent */
export function isCampaignWizardStep2Valid(campaign: Partial<Campaign>): boolean {
  return getCampaignWizardStep2Error(campaign) === null;
}

export function getCampaignWizardStep2Error(campaign: Partial<Campaign>): string | null {
  const t = campaign.targeting;
  if (!t) return 'Choose a targeting mode and configure targeting.';

  if (t.mode === 'hierarchy') {
    const h = t.hierarchy;
    const channels = h?.channels?.length ?? 0;
    const subChannels = h?.subChannels?.length ?? 0;
    const designations = h?.designations?.length ?? 0;
    if (channels + subChannels + designations === 0) {
      return 'Select at least one channel, sub-channel, or designation.';
    }
    return null;
  }

  const n = t.uploadedAgents?.length ?? 0;
  if (n === 0) return 'Upload a file with at least one valid agent row.';
  return null;
}
