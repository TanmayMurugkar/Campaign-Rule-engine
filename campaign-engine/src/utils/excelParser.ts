import * as XLSX from 'xlsx';
import type { AgentRecord } from '@/types/targeting.types';

const REQUIRED_COLUMNS = [
  'agentId',
  'name',
  'channel',
  'subChannel',
  'designation',
  'zone',
  'vintage',
] as const;

type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

function normalizeKey(key: string) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

function pickColumnMap(headers: string[]) {
  const normalized = new Map<string, string>();
  for (const h of headers) normalized.set(normalizeKey(h), h);

  const map: Partial<Record<RequiredColumn, string>> = {};
  for (const col of REQUIRED_COLUMNS) {
    const found = normalized.get(normalizeKey(col));
    if (found) map[col] = found;
  }
  return map;
}

export async function parseAgentFile(file: File): Promise<{
  agents: AgentRecord[];
  errors: string[];
}> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: '',
    raw: false,
  });

  const headers = rows.length ? Object.keys(rows[0] ?? {}) : [];
  const colMap = pickColumnMap(headers);

  const missing = REQUIRED_COLUMNS.filter((c) => !colMap[c]);
  const errors: string[] = [];
  if (missing.length) {
    errors.push(`Missing required columns: ${missing.join(', ')}`);
    return { agents: [], errors };
  }

  const agents: AgentRecord[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? {};
    const get = (k: RequiredColumn) => r[colMap[k] as string];

    const vintageRaw = get('vintage');
    const vintage = Number(vintageRaw);
    if (!Number.isFinite(vintage)) {
      errors.push(`Row ${i + 2}: vintage must be a number`);
      continue;
    }

    const agentId = String(get('agentId') ?? '').trim();
    const name = String(get('name') ?? '').trim();
    if (!agentId || !name) {
      errors.push(`Row ${i + 2}: agentId and name are required`);
      continue;
    }

    agents.push({
      agentId,
      name,
      channel: String(get('channel') ?? '').trim(),
      subChannel: String(get('subChannel') ?? '').trim(),
      designation: String(get('designation') ?? '').trim(),
      zone: String(get('zone') ?? '').trim(),
      vintage,
    });
  }

  return { agents, errors };
}

