import React, { useState } from 'react';
import { reportsApi } from '../../api/misc.api';
import { departmentsApi } from '../../api/academic.api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Download, FileSpreadsheet } from 'lucide-react';

export function AdminReports() {
  const [format, setFormat] = useState('csv');
  const [deptId, setDeptId] = useState('');
  const [status, setStatus] = useState('');
  const [downloading, setDownloading] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const handleExport = async () => {
    setDownloading(true);
    try {
      const params = {};
      if (deptId) params.dept_id = deptId;
      if (status) params.status = status;

      const data = await reportsApi.exportReport(format, params);
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_queries_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_queries_report_${new Date().toISOString().slice(0, 10)}.json`;
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
        <h2 className="text-xl font-bold text-slate-100">System Reports & Data Export</h2>
        <p className="text-xs text-slate-400 mt-1">Generate comprehensive university-wide reports across all academic departments</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <Select
          label="Export Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="csv">CSV Spreadsheet</option>
          <option value="json">JSON Raw Archive</option>
        </Select>

        <Select
          label="Filter by Department"
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
          ))}
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
            Export Comprehensive Report
          </Button>
        </div>
      </div>
    </div>
  );
}
