import { useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import RuleSetBuilder from '@/components/campaign/rule-builder/RuleSetBuilder';
import { createDefaultRuleVersion } from '@/utils/ruleEvaluator';

export default function Step3_QualifyingRules() {
  const campaign = useCampaignWizardStore((s) => s.campaign);
  const addRuleVersion = useCampaignWizardStore((s) => s.addRuleVersion);

  useEffect(() => {
    const c = useCampaignWizardStore.getState().campaign;
    if ((c.ruleVersions?.length ?? 0) > 0) return;
    addRuleVersion(createDefaultRuleVersion(c));
  }, [campaign.ruleVersions?.length, addRuleVersion]);

  const ready = (campaign.ruleVersions?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="card-base p-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Qualifying Rules</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Build nested AND/OR conditions. Leave empty to qualify all transactions.
            </p>
          </div>
        </div>
      </div>

      {!ready ? (
        <div className="card-base p-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Preparing your first rule version…
        </div>
      ) : (
        <div className="card-base p-6">
          <RuleSetBuilder />
        </div>
      )}
    </div>
  );
}
