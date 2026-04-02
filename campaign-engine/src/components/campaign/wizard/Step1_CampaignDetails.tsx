import { useEffect, useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Star,
  DollarSign,
  Gift,
  Layers,
  Calendar,
  Hash,
  FileText,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { CAMPAIGN_TYPES } from '@/constants/campaignTypes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CampaignType } from '@/types/campaign.types';

// ── Zod Schema ────────────────────────────────────────────────────────────────
const schema = z
  .object({
    name: z
      .string()
      .min(1, 'Campaign name is required')
      .max(100, 'Max 100 characters'),
    description: z.string().max(500, 'Max 500 characters').optional(),
    type: z.enum(['points', 'cash', 'voucher', 'mixed'] as const, {
      required_error: 'Select a campaign type',
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

// ── Icon map ──────────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<CampaignType, React.ElementType> = {
  points: Star,
  cash: DollarSign,
  voucher: Gift,
  mixed: Layers,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Step1_CampaignDetails() {
  const { campaign, updateCampaign } = useCampaignWizardStore();
  const formId = useId();

  // Generate a stable campaign ID when entering step 1
  const campaignId =
    campaign.id ?? `CMP-${Date.now().toString(36).toUpperCase()}`;

  const {
    register,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: campaign.name ?? '',
      description: campaign.description ?? '',
      type: campaign.type ?? 'points',
      startDate: campaign.startDate ?? '',
      endDate: campaign.endDate ?? '',
    },
    mode: 'onChange',
  });

  // Set campaign ID on mount if not set
  useEffect(() => {
    if (!campaign.id) updateCampaign({ id: campaignId });
  }, [campaign.id, campaignId, updateCampaign]);

  // Sync form changes → Zustand store in real-time
  useEffect(() => {
    const sub = watch((values) => {
      updateCampaign({
        name: values.name,
        description: values.description,
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
      });
    });
    return () => sub.unsubscribe();
  }, [watch, updateCampaign]);

  const watchedValues = watch();
  const descLen = watchedValues.description?.length ?? 0;

  // Duration chip calculation
  const durationDays =
    watchedValues.startDate &&
    watchedValues.endDate &&
    watchedValues.endDate > watchedValues.startDate
      ? differenceInDays(
          parseISO(watchedValues.endDate),
          parseISO(watchedValues.startDate)
        ) + 1
      : null;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* ── Section: Basic Info ───────────────────────────────────────────── */}
      <div className="card-base p-6 space-y-5">
        <div
          className="flex items-center gap-2 pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <FileText className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-sm font-semibold text-foreground">Campaign Information</h2>
        </div>

        {/* Campaign ID — read-only */}
        <div className="space-y-1.5">
          <Label
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Hash className="h-3 w-3" />
            Campaign ID (auto-generated)
          </Label>
          <div
            className="flex h-9 w-full items-center rounded-lg border px-3 text-sm font-mono select-all cursor-text"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {campaignId}
          </div>
        </div>

        {/* Campaign Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor={`${formId}-name`}
            className="text-sm font-medium text-foreground"
          >
            Campaign Name{' '}
            <span style={{ color: 'var(--accent-danger)' }}>*</span>
          </Label>
          <Input
            id={`${formId}-name`}
            placeholder="e.g. Oct Collections Drive 2024"
            maxLength={100}
            {...register('name')}
            className={cn(
              errors.name && 'ring-1 ring-destructive border-destructive'
            )}
            style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
          />
          <div className="flex items-center justify-between min-h-[18px]">
            {errors.name ? (
              <p
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--accent-danger)' }}
              >
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {watchedValues.name?.length ?? 0}/100
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label
            htmlFor={`${formId}-desc`}
            className="text-sm font-medium text-foreground"
          >
            Description
          </Label>
          <Textarea
            id={`${formId}-desc`}
            placeholder="Describe the campaign objective, target behaviour, and key metrics…"
            rows={3}
            maxLength={500}
            {...register('description')}
            className={cn(
              errors.description && 'ring-1 ring-destructive border-destructive'
            )}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              resize: 'vertical',
            }}
          />
          <div className="flex items-center justify-between min-h-[18px]">
            {errors.description ? (
              <p
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--accent-danger)' }}
              >
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            ) : (
              <span />
            )}
            <span
              className="text-xs"
              style={{
                color:
                  descLen > 480
                    ? 'var(--accent-warning)'
                    : 'var(--text-secondary)',
              }}
            >
              {descLen}/500
            </span>
          </div>
        </div>
      </div>

      {/* ── Section: Campaign Type ────────────────────────────────────────── */}
      <div className="card-base p-6 space-y-4">
        <div
          className="flex items-center gap-2 pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <Tag className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-sm font-semibold text-foreground">
            Campaign Type{' '}
            <span style={{ color: 'var(--accent-danger)' }}>*</span>
          </h2>
        </div>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {CAMPAIGN_TYPES.map((ct) => {
                const Icon = TYPE_ICONS[ct.value];
                const isSelected = field.value === ct.value;
                return (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => field.onChange(ct.value)}
                    className={cn(
                      'relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150',
                      isSelected
                        ? 'shadow-[0_0_0_2px_rgba(156,29,38,0.6)]'
                        : 'hover:translate-y-[-1px] hover:shadow-lg'
                    )}
                    style={{
                      borderColor: isSelected
                        ? 'var(--accent-primary)'
                        : 'var(--border)',
                      backgroundColor: isSelected
                        ? 'rgba(156,29,38,0.08)'
                        : 'transparent',
                    }}
                  >
                    {/* Selected dot */}
                    {isSelected && (
                      <div
                        className="absolute top-3 right-3 h-2 w-2 rounded-full"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      />
                    )}

                    <div
                      className="rounded-lg p-2 transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? 'rgba(156,29,38,0.2)'
                          : 'var(--surface-muted)',
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{
                          color: isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                        }}
                      />
                    </div>

                    <div>
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        }}
                      >
                        {ct.label}
                      </p>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {ct.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        />

        {errors.type && (
          <p
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--accent-danger)' }}
          >
            <AlertCircle className="h-3 w-3" />
            {errors.type.message}
          </p>
        )}
      </div>

      {/* ── Section: Campaign Period ──────────────────────────────────────── */}
      <div className="card-base p-6 space-y-4">
        <div
          className="flex items-center gap-2 pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <Calendar className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-sm font-semibold text-foreground">
            Campaign Period{' '}
            <span style={{ color: 'var(--accent-danger)' }}>*</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-start`}
              className="text-sm font-medium text-foreground"
            >
              Start Date
            </Label>
            <input
              id={`${formId}-start`}
              type="date"
              min={todayStr}
              {...register('startDate')}
              onChange={(e) => {
                register('startDate').onChange(e);
                // Clear end date if it's now before new start
                if (watchedValues.endDate && e.target.value > watchedValues.endDate) {
                  setValue('endDate', '');
                }
              }}
              className={cn(
                'flex h-9 w-full rounded-lg border px-3 py-1 text-sm outline-none transition-colors',
                'focus:ring-1 focus:ring-[rgba(156,29,38,0.45)]',
                errors.startDate && 'ring-1 ring-destructive border-destructive'
              )}
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                colorScheme: 'light',
              }}
            />
            {errors.startDate && (
              <p
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--accent-danger)' }}
              >
                <AlertCircle className="h-3 w-3" />
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-end`}
              className="text-sm font-medium text-foreground"
            >
              End Date
            </Label>
            <input
              id={`${formId}-end`}
              type="date"
              min={watchedValues.startDate || todayStr}
              {...register('endDate')}
              className={cn(
                'flex h-9 w-full rounded-lg border px-3 py-1 text-sm outline-none transition-colors',
                'focus:ring-1 focus:ring-[rgba(156,29,38,0.45)]',
                errors.endDate && 'ring-1 ring-destructive border-destructive'
              )}
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                colorScheme: 'light',
              }}
            />
            {errors.endDate && (
              <p
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--accent-danger)' }}
              >
                <AlertCircle className="h-3 w-3" />
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Duration preview chip */}
        {durationDays !== null && watchedValues.startDate && watchedValues.endDate && (
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{
              borderColor: 'rgba(156,29,38,0.35)',
              backgroundColor: 'rgba(156,29,38,0.08)',
              color: 'var(--accent-primary)',
            }}
          >
            <Calendar className="h-3.5 w-3.5" />
            {format(parseISO(watchedValues.startDate), 'MMM d')}
            {' – '}
            {format(parseISO(watchedValues.endDate), 'MMM d, yyyy')}
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: 'rgba(156,29,38,0.18)' }}
            >
              {durationDays} day{durationDays !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
