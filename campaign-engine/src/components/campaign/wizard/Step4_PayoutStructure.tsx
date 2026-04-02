import { Coins } from 'lucide-react';
import PayoutBuilder from '@/components/campaign/payout/PayoutBuilder';
import PayoutEquationPreview from '@/components/campaign/payout/PayoutEquationPreview';

export default function Step4_PayoutStructure() {
  return (
    <div className="space-y-6">
      <div className="card-base p-6">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Payout Structure</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Configure payout logic for this rule version.
            </p>
          </div>
        </div>
      </div>

      <div className="card-base p-6">
        <PayoutBuilder />
      </div>

      <div className="card-base p-6">
        <PayoutEquationPreview />
      </div>
    </div>
  );
}

