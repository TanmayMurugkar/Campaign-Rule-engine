import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Rocket, X } from 'lucide-react';
import WizardProgress from '@/components/shared/WizardProgress';
import { Button } from '@/components/ui/button';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { useCampaignListStore } from '@/store/campaignListStore';
import Step1_CampaignDetails from '@/components/campaign/wizard/Step1_CampaignDetails';
import Step2_Targeting from '@/components/campaign/wizard/Step2_Targeting';
import Step3_QualifyingRules from '@/components/campaign/wizard/Step3_QualifyingRules';
import Step4_PayoutStructure from '@/components/campaign/wizard/Step4_PayoutStructure';
import Step5_ReviewSubmit from '@/components/campaign/wizard/Step5_ReviewSubmit';
import type { Campaign } from '@/types/campaign.types';
import {
  isCampaignWizardStep1Valid,
  isCampaignWizardStep2Valid,
  getCampaignWizardStep1Error,
  getCampaignWizardStep2Error,
} from '@/utils/campaignWizardGuards';
import { reviewCampaignDraft } from '@/utils/campaignReview';

const WIZARD_STEPS = [
  { key: 'details', label: 'Campaign Details' },
  { key: 'targeting', label: 'Targeting' },
  { key: 'rules', label: 'Qualifying Rules' },
  { key: 'payout', label: 'Payout Structure' },
  { key: 'review', label: 'Review & Submit' },
];

function useStepValid(campaign: Partial<Campaign>) {
  return useMemo(() => {
    const step1Valid = isCampaignWizardStep1Valid(campaign);
    const step2Valid = isCampaignWizardStep2Valid(campaign);
    const step3Valid = true;
    const step4Valid = true;

    return [step1Valid, step2Valid, step3Valid, step4Valid, true] as const;
  }, [campaign]);
}

function buildCampaignFromWizard(
  campaign: Partial<Campaign>,
  editingId: string | null,
  listCampaigns: Campaign[],
  status: Campaign['status']
): Campaign {
  const now = new Date().toISOString();
  const existing = editingId ? listCampaigns.find((c) => c.id === editingId) : undefined;
  return {
    id: campaign.id ?? `campaign-${Date.now()}`,
    name: campaign.name ?? 'Untitled Campaign',
    description: campaign.description ?? '',
    type: campaign.type ?? 'points',
    status,
    startDate: campaign.startDate ?? '',
    endDate: campaign.endDate ?? '',
    targeting: campaign.targeting ?? { mode: 'hierarchy' },
    ruleVersions: campaign.ruleVersions ?? [],
    createdAt: existing?.createdAt ?? campaign.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? campaign.createdBy,
  };
}

export interface CampaignWizardProps {
  pageTitle: string;
  /** When set, Discard navigates here instead of /campaigns */
  discardTo?: string;
}

export default function CampaignWizard({ pageTitle, discardTo }: CampaignWizardProps) {
  const navigate = useNavigate();
  const { currentStep, campaign, setStep, resetWizard, editingCampaignId } = useCampaignWizardStore();
  const addCampaign = useCampaignListStore((s) => s.addCampaign);
  const updateCampaign = useCampaignListStore((s) => s.updateCampaign);
  const listCampaigns = useCampaignListStore((s) => s.campaigns);

  const stepValid = useStepValid(campaign);
  const activationBlocked = useMemo(() => reviewCampaignDraft(campaign).errors.length > 0, [campaign]);

  const maxStepReached = useMemo(() => {
    if (!stepValid[0]) return 1;
    if (!stepValid[1]) return 2;
    return WIZARD_STEPS.length;
  }, [stepValid]);

  const canGoNext = stepValid[currentStep - 1] ?? false;
  const isLastStep = currentStep === WIZARD_STEPS.length;
  const isFirstStep = currentStep === 1;

  const currentStepHint = useMemo(() => {
    if (isLastStep) return null;
    if (currentStep === 1 && !stepValid[0]) return getCampaignWizardStep1Error(campaign);
    if (currentStep === 2 && !stepValid[1]) return getCampaignWizardStep2Error(campaign);
    return null;
  }, [isLastStep, currentStep, stepValid, campaign]);

  const afterSaveNavigate = editingCampaignId ? `/campaigns/${editingCampaignId}` : '/campaigns';

  const handleNext = useCallback(() => {
    if (isLastStep || !canGoNext) return;
    setStep(currentStep + 1);
  }, [isLastStep, canGoNext, currentStep, setStep]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) setStep(currentStep - 1);
  }, [isFirstStep, currentStep, setStep]);

  const handleSaveDraft = useCallback(() => {
    if (!campaign.name) return;
    const full = buildCampaignFromWizard(campaign, editingCampaignId, listCampaigns, 'draft');
    if (editingCampaignId) {
      updateCampaign(editingCampaignId, full);
    } else {
      addCampaign(full);
    }
    resetWizard();
    navigate(afterSaveNavigate);
  }, [
    campaign,
    editingCampaignId,
    listCampaigns,
    addCampaign,
    updateCampaign,
    resetWizard,
    navigate,
    afterSaveNavigate,
  ]);

  const handleActivate = useCallback(() => {
    if (!campaign.name) return;
    const full = buildCampaignFromWizard(campaign, editingCampaignId, listCampaigns, 'active');
    if (editingCampaignId) {
      updateCampaign(editingCampaignId, full);
    } else {
      addCampaign(full);
    }
    resetWizard();
    navigate(afterSaveNavigate);
  }, [
    campaign,
    editingCampaignId,
    listCampaigns,
    addCampaign,
    updateCampaign,
    resetWizard,
    navigate,
    afterSaveNavigate,
  ]);

  const handleDiscard = useCallback(() => {
    if (confirm('Discard this campaign draft? All progress will be lost.')) {
      resetWizard();
      navigate(discardTo ?? '/campaigns');
    }
  }, [resetWizard, navigate, discardTo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{pageTitle}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {campaign.name ? `"${campaign.name}"` : 'New campaign'}
            {' · '}Step {currentStep} of {WIZARD_STEPS.length}
          </p>
        </div>
        <button
          onClick={handleDiscard}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-black/[0.06] transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="h-3.5 w-3.5" />
          Discard
        </button>
      </div>

      <WizardProgress
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        maxStepReached={maxStepReached}
        onStepClick={setStep}
      />

      <div className="min-h-[400px]">
        {currentStep === 1 && <Step1_CampaignDetails />}
        {currentStep === 2 && <Step2_Targeting />}
        {currentStep === 3 && <Step3_QualifyingRules />}
        {currentStep === 4 && <Step4_PayoutStructure />}
        {currentStep === 5 && <Step5_ReviewSubmit />}
      </div>

      {currentStepHint && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(245, 158, 11, 0.35)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: 'var(--accent-warning)',
          }}
          role="status"
        >
          {currentStepHint}
        </div>
      )}

      <div
        className="sticky bottom-0 flex flex-col gap-3 rounded-xl border px-6 py-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" onClick={handleBack} disabled={isFirstStep} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {campaign.name && (
              <Button variant="ghost" onClick={handleSaveDraft} className="gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            )}

            {isLastStep ? (
              <Button
                onClick={handleActivate}
                disabled={activationBlocked}
                className="gap-2"
                style={{ backgroundColor: 'var(--accent-secondary)', color: '#fff' }}
              >
                <Rocket className="h-4 w-4" />
                Activate Campaign
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className="gap-2"
                style={{
                  backgroundColor: canGoNext ? 'var(--accent-primary)' : undefined,
                  color: canGoNext ? '#fff' : undefined,
                }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
