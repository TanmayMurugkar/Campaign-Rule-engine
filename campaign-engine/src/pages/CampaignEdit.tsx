import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CampaignWizard from '@/components/campaign/CampaignWizard';
import { useCampaignListStore } from '@/store/campaignListStore';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';

export default function CampaignEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loadCampaignForEdit = useCampaignWizardStore((s) => s.loadCampaignForEdit);
  const resetWizard = useCampaignWizardStore((s) => s.resetWizard);

  useEffect(() => {
    if (!id) {
      navigate('/campaigns', { replace: true });
      return;
    }

    const tryLoadOrExit = (): boolean => {
      const campaigns = useCampaignListStore.getState().campaigns;
      const c = campaigns.find((x) => x.id === id);
      if (c) {
        loadCampaignForEdit(c);
        return true;
      }
      if (campaigns.length > 0) {
        navigate('/campaigns', { replace: true });
        return true;
      }
      return false;
    };

    if (tryLoadOrExit()) {
      return () => resetWizard();
    }

    const unsub = useCampaignListStore.subscribe(
      (state) => state.campaigns,
      () => {
        if (tryLoadOrExit()) unsub();
      }
    );

    return () => {
      unsub();
      resetWizard();
    };
  }, [id, loadCampaignForEdit, resetWizard, navigate]);

  if (!id) return null;

  return (
    <div className="space-y-6">
      <Link
        to={`/campaigns/${id}`}
        className="inline-flex items-center gap-2 text-sm rounded-lg px-1 py-1 -ml-1 hover:bg-black/[0.06] transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaign
      </Link>
      <CampaignWizard pageTitle="Edit Campaign" discardTo={`/campaigns/${id}`} />
    </div>
  );
}
