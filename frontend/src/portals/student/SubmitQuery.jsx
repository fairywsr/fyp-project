import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queriesApi } from '../../api/queries.api';
import { departmentsApi, coursesApi } from '../../api/academic.api';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, Upload, CheckCircle2 } from 'lucide-react';

export function SubmitQuery() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [deptId, setDeptId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [successQuery, setSuccessQuery] = useState(null);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', deptId],
    queryFn: () => coursesApi.list(deptId ? { dept_id: deptId } : {}),
  });

  const submitMutation = useMutation({
    mutationFn: queriesApi.submitQuery,
    onSuccess: (data) => {
      setSuccessQuery(data);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    submitMutation.mutate({
      subject: subject.trim() || undefined,
      text: text.trim(),
      dept_id: deptId ? parseInt(deptId) : undefined,
      course_id: courseId ? parseInt(courseId) : undefined,
    });
  };

  if (successQuery) {
    return (
      <div className="max-w-2xl mx-auto glass-panel p-8 text-center rounded-2xl border border-emerald-500/30 bg-emerald-950/10 animate-fade-in my-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Query Submitted Successfully!</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Your query #{successQuery.id} has been ingested into the system. Estimated response time is within 24 hours.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => { setSuccessQuery(null); setText(''); setSubject(''); }}>
            Submit Another Query
          </Button>
          <Button variant="primary" onClick={() => navigate(`/student/queries/${successQuery.id}`)}>
            View Query Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Submit an Academic or Departmental Query</h2>
        <p className="text-xs text-slate-400 mt-1">
          Our intelligent routing pipeline will analyze your query and route it directly to the responsible course instructor or department HOD.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
        <Input
          label="Subject (Optional)"
          placeholder="e.g. CS619 Final Project viva schedule clarification"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Department"
            value={deptId}
            onChange={(e) => { setDeptId(e.target.value); setCourseId(''); }}
          >
            <option value="">Auto-Detect via AI / Rules</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </Select>

          <Select
            label="Course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">None / General Inquiry</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Query Description *"
          rows={6}
          placeholder="Please describe your query in detail. Include course codes, deadline dates, or specific questions..."
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="p-4 bg-slate-900/60 rounded-xl border border-dashed border-slate-700/80 text-center">
          <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <span className="text-xs font-semibold text-slate-300 block">Optional Document or Screenshot</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">PDF, PNG, JPG up to 10MB</span>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitMutation.isPending}
            icon={Send}
          >
            Submit Query
          </Button>
        </div>
      </form>
    </div>
  );
}
