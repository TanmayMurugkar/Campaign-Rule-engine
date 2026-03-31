import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseAgentFile } from '@/utils/excelParser';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import type { AgentRecord } from '@/types/targeting.types';

function downloadTemplate() {
  const header = 'agentId,name,channel,subChannel,designation,zone,vintage\n';
  const blob = new Blob([header], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agent_upload_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExcelUploader() {
  const updateCampaign = useCampaignWizardStore((s) => s.updateCampaign);
  const targeting = useCampaignWizardStore((s) => s.campaign.targeting);

  const [isParsing, setIsParsing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<AgentRecord[]>([]);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setIsParsing(true);
      setErrors([]);
      setPreview([]);

      try {
        const res = await parseAgentFile(file);
        setErrors(res.errors);
        setPreview(res.agents.slice(0, 10));

        updateCampaign({
          targeting: {
            mode: 'excel_upload',
            uploadFileName: file.name,
            uploadedAgents: res.agents,
          },
        });
      } catch (e) {
        setErrors(['Failed to parse file. Please verify the file format and try again.']);
      } finally {
        setIsParsing(false);
      }
    },
    [updateCampaign]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const agentCount = targeting?.uploadedAgents?.length ?? 0;
  const fileName = targeting?.uploadFileName;

  const columns = useMemo(
    () => ['agentId', 'name', 'channel', 'subChannel', 'designation', 'zone', 'vintage'],
    []
  );

  return (
    <div className="card-base p-6 space-y-5">
      <div
        className="flex items-center justify-between gap-3 pb-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-sm font-semibold text-white">Upload Agents (Excel/CSV)</h3>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <Download className="h-3.5 w-3.5" />
          Download template
        </button>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'rounded-xl border border-dashed p-6 text-center transition-colors cursor-pointer',
          isDragActive && 'bg-white/5'
        )}
        style={{ borderColor: 'rgba(99,102,241,0.35)' }}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--accent-primary)' }} />
        <p className="text-sm font-medium text-white">
          {isDragActive ? 'Drop the file here…' : 'Drag & drop a .xlsx/.csv file, or click to select'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Required columns: agentId, name, channel, subChannel, designation, zone, vintage
        </p>
        {isParsing && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
            Parsing…
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>File: {fileName ?? '—'}</span>
        <span>{agentCount.toLocaleString()} agents loaded</span>
      </div>

      {errors.length > 0 && (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'rgba(245,158,11,0.35)', backgroundColor: 'rgba(245,158,11,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--accent-warning)' }} />
            <p className="text-sm font-semibold text-white">Upload issues</p>
          </div>
          <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
            {errors.slice(0, 8).map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
            {errors.length > 8 && <li>…and {errors.length - 8} more</li>}
          </ul>
        </div>
      )}

      {/* Preview */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-semibold text-white">Preview (first 10 rows)</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            This is only a preview; all valid rows are stored in the draft.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 text-left font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {preview.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-10 text-center">
                    <span style={{ color: 'var(--text-secondary)' }}>No rows to preview yet.</span>
                  </td>
                </tr>
              ) : (
                preview.map((r, idx) => (
                  <tr key={`${r.agentId}-${idx}`} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 text-white">{r.agentId}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.name}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.channel}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.subChannel}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.designation}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.zone}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.vintage}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

