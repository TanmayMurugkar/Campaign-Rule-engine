import type { KPI, KPICondition, PayoutStructure, PayoutTier, TierDimension, UnlockCondition, VintageTarget } from '@/types/payout.types';

function fmtDim(d: TierDimension) {
  const v = Array.isArray(d.value) ? `${d.value[0]}–${d.value[1]}` : String(d.value);
  return `${d.field} ${d.operator} ${v}`;
}

function fmtTier(t: PayoutTier) {
  const dims = t.dimensions.length ? t.dimensions.map(fmtDim).join(', ') : 'All';
  const payout = t.cashAmount != null && t.cashAmount > 0 ? `₹${t.cashAmount}` : `${t.points} pts`;
  return `- ${dims}: ${payout}`;
}

function fmtUnlock(u: UnlockCondition) {
  return `${u.kpiId} ${u.operator} ${u.threshold}`;
}

function fmtCondition(c: KPICondition) {
  if (c.type === 'min_count') return `min count ≥ ${c.threshold}${c.fallbackPercentage != null ? ` (fallback ${c.fallbackPercentage}%)` : ''}`;
  if (c.type === 'min_amount') return `min amount ≥ ${c.threshold}${c.fallbackPercentage != null ? ` (fallback ${c.fallbackPercentage}%)` : ''}`;
  return `fallback ${c.threshold}%`;
}

function fmtVintageTargets(v: VintageTarget[]) {
  return v.map((x) => `- Vintage ${x.vintageRange[0]}–${x.vintageRange[1]} months → Target: ${x.targetCount}`).join('\n');
}

function fmtKpi(k: KPI) {
  const lines: string[] = [];
  lines.push(`• ${k.name}${k.isBase ? ' (Base)' : ''}`);
  if (k.unlockCondition) lines.push(`  - Unlock: ${fmtUnlock(k.unlockCondition)}`);
  if (k.pointsPerUnit != null) lines.push(`  - Points per unit: ${k.pointsPerUnit}`);
  if (k.conditions.length) lines.push(`  - Conditions: ${k.conditions.map(fmtCondition).join('; ')}`);
  if (k.tiers.length) lines.push(`  - Tiers:\n${k.tiers.map(fmtTier).map((s) => `    ${s}`).join('\n')}`);
  return lines.join('\n');
}

/** UI-only: human readable payout explanation */
export function formatPayoutStructureHumanReadable(structure: PayoutStructure): string {
  const lines: string[] = [];
  lines.push(`MODE: ${structure.mode === 'transaction_based' ? 'Transaction-Based' : 'Target-Based'}`);

  if (structure.mode === 'target_based') {
    if (structure.baseKPI) lines.push(`BASE KPI: ${structure.baseKPI}`);
    if (structure.baseKPITargetByVintage?.length) {
      lines.push('VINTAGE TARGETS:');
      lines.push(fmtVintageTargets(structure.baseKPITargetByVintage));
    }
  }

  if (!structure.kpis.length) {
    lines.push('(no KPIs defined yet)');
    return lines.join('\n');
  }

  lines.push('KPIs:');
  for (const k of structure.kpis) lines.push(fmtKpi(k));
  return lines.join('\n');
}

