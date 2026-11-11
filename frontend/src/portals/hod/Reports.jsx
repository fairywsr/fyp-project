import React, { useState } from 'react';
import { reportsApi } from '../../api/misc.api';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Download, FileSpreadsheet, FileJson, CheckCircle2 } from 'lucide-react';

const FORMAT_OPTIONS = [
  {
    id: 'csv',
    label: 'CSV — Spreadsheet',
    desc: 'Open in Excel, Google Sheets, or Numbers',
    icon: FileSpreadsheet,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
  },
  {
    id: 'json',
    label: 'JSON — Raw Archive',
    desc: 'Structured data for developers or auditors',
    icon: FileJson,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border-indigo-500/25',
  },
];

export function HodReports() {
  const [format, setFormat] = useState('csv');
  const [status, setStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    setDone(false);
    try {
      const data = await reportsApi.exportReport(format, status ? { status } : {});
      const isJson = format === 'json';
      const blob = new Blob(
        [isJson ? JSON.stringify(data, null, 2) : data],
        { type: isJson ? 'application/json' : 'text/csv' }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dept_queries_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      alert('Export failed: ' + (e.message || 'unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Export Department Reports
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate official CSV or JSON reports for accreditation and committee review
        </p>
      </div>

      {/* Success toast */}
      {done && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Report downloaded successfully!
        </div>
      )}

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Format selector — visual cards */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = format === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${opt.iconBg}`}
                  >
                    <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                      {opt.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/80" />

        {/* Status filter */}
        <Select
          label="Filter by Query Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses (complete dataset)</option>
          <option value="resolved">Resolved Only</option>
          <option value="pending">Pending Only</option>
          <option value="escalated">Escalated Only</option>
          <option value="in_progress">In Progress Only</option>
        </Select>

        {/* Download button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={downloading}
          onClick={handleExport}
          icon={Download}
        >
          {downloading ? 'Generating Report…' : 'Generate & Download Report'}
        </Button>
      </div>
    </div>
  );
}
