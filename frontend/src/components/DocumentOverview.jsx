import React from 'react';
import { FileText, Clock, Users, ShieldCheck, AlertTriangle, Home } from 'lucide-react';

export default function DocumentOverview({ analysis, onReset }) {
  const { metadata, key_parties, risks } = analysis;
  const highRiskCount = risks.filter((r) => r.severity === 'HIGH').length;

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white truncate max-w-md">{metadata.filename}</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
              {metadata.file_type}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {(metadata.file_size_bytes / 1024).toFixed(1)} KB • {metadata.page_or_section_count} Pages/Sections
          </p>
        </div>

        <button
          onClick={onReset}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
        >
          <Home className="w-3.5 h-3.5" />
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Est. Reading Time</div>
            <div className="text-sm font-semibold text-white">{metadata.estimated_reading_time_mins} mins</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Identified Parties</div>
            <div className="text-sm font-semibold text-white truncate max-w-[180px]">
              {key_parties.length > 0 ? key_parties.join(', ') : 'Not Specified'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className={`p-2.5 rounded-lg ${highRiskCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {highRiskCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-slate-400">Risk Assessment</div>
            <div className="text-sm font-semibold text-white">
              {highRiskCount > 0 ? `${highRiskCount} High Risk Clauses` : 'No Critical Flags'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
