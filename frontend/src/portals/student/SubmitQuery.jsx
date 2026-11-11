import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queriesApi } from "../../api/queries.api";
import { departmentsApi, coursesApi } from "../../api/academic.api";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Send, Upload, CheckCircle2 } from "lucide-react";

export function SubmitQuery() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [deptId, setDeptId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [successQuery, setSuccessQuery] = useState(null);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsApi.list,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses", deptId],
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
        <h2 className="text-xl font-bold text-slate-100">
          Query Submitted Successfully!
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Your query # {successQuery.id} has been ingested into the system.
          Estimated response time is within 24 hours.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setSuccessQuery(null);
              setText("");
              setSubject("");
            }}
          >
            Submit Another Query
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/student/queries/${successQuery.id}`)}
          >
            View Query Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-5 mb-3 ">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Send className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Student Support Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Submit a Query
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Submit your academic or departmental inquiry. Our intelligent routing
          system will automatically identify and forward your query to the
          relevant instructor or department HOD.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden glass-panel p-5 sm:p-8 rounded-2xl border border-slate-700/60 shadow-2xl shadow-indigo-950/20 space-y-7 text-left"
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Section heading */}
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Query Information
            </h3>
            <p className="text-[11px] text-slate-500">
              Provide the details of your inquiry below.
            </p>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Input
            label="Subject"
            placeholder="e.g. CS619 Final Project viva schedule clarification"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            helperText="A clear summary helps route your inquiry faster."
          />
        </div>

        {/* Department & Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-300">
                Department
              </span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </div>

            <Select
              label="Department"
              value={deptId}
              onChange={(e) => {
                setDeptId(e.target.value);
                setCourseId("");
              }}
            >
              <option value="">⚡ Auto-Detect via AI / Rules</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
            <p className="text-[10px] text-slate-500">
              Let AI identify the responsible department.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-300">
                Course
              </span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </div>

            <Select
              label="Course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">None / General Inquiry</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </Select>
            <p className="text-[10px] text-slate-500">
              Select a course if your query is course-specific.
            </p>
          </div>
        </div>

        {/* Query Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            {/* <span className="text-xs font-semibold text-slate-300">
              Query Description
            </span> */}
            <span className="text-[10px] text-slate-500">
              Detailed explanation
            </span>
          </div>

          <Textarea
            label="Query Description"
            rows={6}
            placeholder="Please describe your query in detail. Include course codes, deadline dates, or specific questions..."
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-[10px] text-slate-500">
            <span className="text-indigo-400">Tip:</span> Include relevant
            dates, course codes, and supporting details for faster resolution.
          </p>
        </div>

        {/* Attachment */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Supporting Documents
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              Attach relevant documents or screenshots if needed.
            </p>
          </div>

          <div className="relative p-7 sm:p-9 bg-slate-950/40 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/60 hover:bg-indigo-500/[0.03] transition-all duration-300 text-center cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>

            <span className="text-xs font-semibold text-slate-200 block group-hover:text-indigo-300 transition-colors">
              Optional Document or Screenshot
            </span>

            <span className="text-[10px] text-slate-500 block mt-2">
              PDF, PNG, JPG
            </span>

            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-medium text-slate-400">
              Maximum file size: 10MB
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300">
                Intelligent Query Processing
              </p>
              <p className="text-[10px] text-slate-500">
                Gemini AI · Automated Routing · Faculty SLA
              </p>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
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
