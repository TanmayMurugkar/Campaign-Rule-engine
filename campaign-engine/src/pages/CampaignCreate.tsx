import { useEffect } from 'react';
import CampaignWizard from '@/components/campaign/CampaignWizard';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';

export default function CampaignCreate() {
  const resetWizard = useCampaignWizardStore((s) => s.resetWizard);

  useEffect(() => {
    resetWizard();
  }, [resetWizard]);

  return <CampaignWizard pageTitle="Create Campaign" />;
}
