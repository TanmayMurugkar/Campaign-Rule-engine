import type { RuleGroup } from '@/types/rule.types';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import RuleGroupContainer from './RuleGroupContainer';
import { formatRuleGroupHumanReadable } from '@/utils/ruleEvaluator';

export default function RuleSetBuilder() {
  const campaign = useCampaignWizardStore((s) => s.campaign);
  const activeVersionIndex = useCampaignWizardStore((s) => s.activeVersionIndex);
  const updateRuleVersion = useCampaignWizardStore((s) => s.updateRuleVersion);

  const versions = campaign.ruleVersions ?? [];
  const rv = versions[activeVersionIndex];
  if (!rv) return null;

  const onChange = (next: RuleGroup) => {
    updateRuleVersion(activeVersionIndex, { qualifyingRules: next });
  };

  return (
    <div className="space-y-4">
      <RuleGroupContainer group={rv.qualifyingRules} onChange={onChange} depth={0} />

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Preview
        </p>
        <pre className="rule-preview text-xs whitespace-pre-wrap overflow-x-auto">
          {formatRuleGroupHumanReadable(rv.qualifyingRules)}
        </pre>
      </div>
    </div>
  );
}
