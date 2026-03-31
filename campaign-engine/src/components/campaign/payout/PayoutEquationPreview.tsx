import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { formatPayoutStructureHumanReadable } from '@/utils/payoutCalculator';

export default function PayoutEquationPreview() {
  const campaign = useCampaignWizardStore((s) => s.campaign);
  const activeVersionIndex = useCampaignWizardStore((s) => s.activeVersionIndex);
  const rv = (campaign.ruleVersions ?? [])[activeVersionIndex];
  if (!rv) return null;

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        Payout preview
      </p>
      <pre className="rule-preview text-xs whitespace-pre-wrap overflow-x-auto">
        {formatPayoutStructureHumanReadable(rv.payoutStructure)}
      </pre>
    </div>
  );
}

