import React, { useState } from 'react';
import { reportsApi } from '../../api/misc.api';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Download, FileSpreadsheet, Check } from 'lucide-react';

export function HodReports() {
  const [format, setFormat] = useState('csv');
  const [status, setStatus] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const data = await reportsApi.exportReport(format, status ? { status } : {});
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `department_queries_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `department_queries_report_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      alert('Export failed: ' + (e.message || 'unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Export Departmental Queries & Triage Reports</h2>
        <p className="text-xs text-slate-400 mt-1">Download official CSV or JSON reports for accreditation and committee review</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <Select
          label="Export Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="csv">CSV (Spreadsheet / Microsoft Excel)</option>
          <option value="json">JSON (Raw Data Archive)</option>
        </Select>

        <Select
          label="Filter by Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="resolved">Resolved Only</option>
          <option value="pending">Pending Only</option>
          <option value="escalated">Escalated Only</option>
        </Select>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={downloading}
            onClick={handleExport}
            icon={Download}
          >
            Generate & Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}
