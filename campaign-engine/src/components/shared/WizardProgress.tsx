import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  key: string;
  label: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number; // 1-based
  maxStepReached: number; // 1-based
  onStepClick?: (step: number) => void;
}

export default function WizardProgress({
  steps,
  currentStep,
  maxStepReached,
  onStepClick,
}: WizardProgressProps) {
  return (
    <div className="card-base px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isClickable = stepNumber <= maxStepReached && !!onStepClick;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                className={cn(
                  'group flex items-center gap-3 w-full text-left rounded-lg px-2 py-2 transition-colors',
                  isClickable ? 'hover:bg-black/[0.04]' : 'cursor-default'
                )}
                onClick={() => (isClickable ? onStepClick?.(stepNumber) : undefined)}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    isCompleted && 'border-transparent',
                    isActive && 'border-transparent',
                    !isCompleted && !isActive && 'border'
                  )}
                  style={{
                    backgroundColor: isCompleted
                      ? 'rgba(201,162,39,0.15)'
                      : isActive
                        ? 'rgba(156,29,38,0.15)'
                        : 'transparent',
                    borderColor: isCompleted || isActive ? 'transparent' : 'var(--border)',
                    color: isCompleted
                      ? 'var(--accent-secondary)'
                      : isActive
                        ? 'var(--accent-primary)'
                        : 'var(--text-secondary)',
                  }}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>

                <div className="min-w-0">
                  <div
                    className={cn(
                      'text-sm font-medium truncate',
                      isActive ? 'text-foreground' : 'text-foreground/80'
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    Step {stepNumber} of {steps.length}
                  </div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden md:block flex-1 px-2">
                  <div
                    className="h-[2px] rounded-full"
                    style={{
                      backgroundColor:
                        stepNumber < currentStep ? 'rgba(201,162,39,0.35)' : 'var(--border)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

