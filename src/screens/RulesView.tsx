import React from 'react';
import { Sliders, ShieldCheck, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { DispatchRule, MessageTemplate } from '../types';

interface RulesViewProps {
  rules: DispatchRule[];
  templates: MessageTemplate[];
  onUpdateRules: (rules: DispatchRule[]) => void;
}

export function RulesView({ rules, templates, onUpdateRules }: RulesViewProps) {
  const toggleRule = (id: string) => {
    onUpdateRules(
      rules.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Dispatch Rules Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated evaluation policies and anti-spam limits for missed calls.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">{rule.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Priority #{rule.priority}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Cooldown: {rule.cooldownMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-slate-500" /> Condition: {rule.conditionType}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleRule(rule.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                rule.isEnabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-[#202C33] text-slate-400 hover:text-white'
              }`}
            >
              {rule.isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
