import React from 'react';
import { Scale, Sparkles, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ isHealthy }) {
  return (
    <header className="border-b border-slate-800 bg-legal-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Non-Legal Advice Disclaimer Banner */}
      <div className="bg-amber-950/40 border-b border-amber-900/50 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
        <span>
          <strong>Informational Guidance:</strong> JurisLens AI provides automated document intelligence, not formal legal counsel. Always consult a qualified attorney for binding advice.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">JurisLens</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Legal Document Navigator & Risk Radar</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini 2.5 Flash</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isHealthy ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>API Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>API Offline</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
