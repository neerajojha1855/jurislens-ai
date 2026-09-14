import React, { useState } from 'react';
import { BookOpen, AlertOctagon, CheckSquare, HelpCircle, Shield, ArrowRight, Quote } from 'lucide-react';

export default function AnalysisTabs({ analysis }) {
  const [activeTab, setActiveTab] = useState('summary');

  const { executive_summary, rights_summary, obligations, risks, lawyer_checklist } = analysis;

  const tabs = [
    { id: 'summary', label: 'Plain Summary', icon: BookOpen },
    { id: 'risks', label: `Risk Radar (${risks.length})`, icon: AlertOctagon },
    { id: 'obligations', label: 'Obligations & Rights', icon: CheckSquare },
    { id: 'checklist', label: 'Lawyer Checklist', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-indigo-500">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Executive Summary (Plain English)
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                {executive_summary}
              </p>
            </div>

            {rights_summary && rights_summary.length > 0 && (
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Key Rights Granted to You
                </h3>
                <ul className="space-y-2">
                  {rights_summary.map((right, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      <span>{right}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* RISKS TAB */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            {risks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No notable risks or adverse clauses were detected in this document.
              </div>
            ) : (
              risks.map((risk, index) => {
                const isHigh = risk.severity === 'HIGH';
                const isMedium = risk.severity === 'MEDIUM';

                return (
                  <div
                    key={index}
                    className={`rounded-2xl p-6 border transition-all ${
                      isHigh
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : isMedium
                        ? 'bg-amber-950/20 border-amber-800/60'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="text-base font-semibold text-white">{risk.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isMedium
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {risk.severity} Severity
                      </span>
                    </div>

                    <div className="mb-3 p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-slate-400 italic flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 flex-shrink-0 text-slate-500 mt-0.5" />
                      <span>"{risk.clause_quote}"</span>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">
                      <strong>Why it matters:</strong> {risk.plain_explanation}
                    </p>

                    {risk.recommendation && (
                      <div className="text-xs text-indigo-300 bg-indigo-950/30 border border-indigo-900/50 p-2.5 rounded-lg flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                        <span><strong>Recommendation:</strong> {risk.recommendation}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* OBLIGATIONS TAB */}
        {activeTab === 'obligations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obligations.map((item, idx) => (
              <div key={idx} className="glass-panel rounded-xl p-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {item.party}
                </div>
                <div className="text-sm text-slate-200">{item.obligation_text}</div>
                {item.deadline_or_condition && (
                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <strong>Timeline / Trigger:</strong> {item.deadline_or_condition}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 text-xs text-indigo-200">
              💡 <strong>Consultation Prep:</strong> Use these prepared questions when talking to your attorney or before signing to address the biggest blind spots.
            </div>

            <div className="space-y-3">
              {lawyer_checklist.map((item, idx) => (
                <div key={idx} className="glass-panel rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                      {item.category}
                    </div>
                    <div className="text-sm font-medium text-white">{item.question}</div>
                    <div className="text-xs text-slate-400">{item.context}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
