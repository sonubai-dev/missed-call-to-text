import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  MessageSquare,
  Smartphone,
  Mail,
  Shield,
  Zap,
} from "lucide-react";
import { DispatchRule, MessageTemplate, ChannelType } from "../types";

interface RulesViewProps {
  rules: DispatchRule[];
  templates: MessageTemplate[];
  onUpdateRules: (rules: DispatchRule[]) => void;
}

export const RulesView: React.FC<RulesViewProps> = ({
  rules,
  templates,
  onUpdateRules,
}) => {
  const [editingRule, setEditingRule] = useState<DispatchRule | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [form, setForm] = useState<Omit<DispatchRule, "id">>({
    name: "",
    isEnabled: true,
    priority: 1,
    conditionType: "ALL_MISSED",
    channelType: "WHATSAPP",
    templateId: templates[0]?.id || "",
    delaySeconds: 0,
    cooldownMinutes: 60,
    workingHoursOnly: false,
  });

  const handleOpenEdit = (rule: DispatchRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      isEnabled: rule.isEnabled,
      priority: rule.priority,
      conditionType: rule.conditionType,
      channelType: rule.channelType,
      templateId: rule.templateId,
      delaySeconds: rule.delaySeconds,
      cooldownMinutes: rule.cooldownMinutes,
      workingHoursOnly: rule.workingHoursOnly,
    });
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setEditingRule(null);
    setForm({
      name: "New Dispatch Rule",
      isEnabled: true,
      priority: rules.length + 1,
      conditionType: "ALL_MISSED",
      channelType: "WHATSAPP",
      templateId: templates[0]?.id || "",
      delaySeconds: 0,
      cooldownMinutes: 120,
      workingHoursOnly: true,
    });
    setIsNew(true);
  };

  const handleToggle = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    onUpdateRules(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this rule?")) {
      const updated = rules.filter((r) => r.id !== id);
      onUpdateRules(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      const newRule: DispatchRule = {
        id: `rule-${Date.now()}`,
        ...form,
      };
      onUpdateRules([...rules, newRule]);
    } else if (editingRule) {
      const updated = rules.map((r) => (r.id === editingRule.id ? { ...r, ...form } : r));
      onUpdateRules(updated);
    }
    setEditingRule(null);
    setIsNew(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Automation Rules Engine</h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Configure condition evaluation, channel priority routing, and anti-spam cooldown intervals
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const tmpl = templates.find((t) => t.id === rule.templateId);
          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl bg-[#111B21] border transition-all flex flex-col justify-between ${
                rule.isEnabled ? "border-[#222E35]" : "border-[#222E35]/40 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#202C33] text-[#00A884] font-mono font-bold text-xs flex items-center justify-center">
                      #{rule.priority}
                    </span>
                    <span className="font-bold text-sm text-white">{rule.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={() => handleToggle(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#202C33] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A884]"></div>
                    </label>

                    <button
                      onClick={() => handleOpenEdit(rule)}
                      className="p-1.5 text-[#8696A0] hover:text-white hover:bg-[#202C33] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#8696A0]">
                  <div className="flex items-center justify-between">
                    <span>Trigger Condition:</span>
                    <span className="font-bold text-white bg-[#202C33] px-2 py-0.5 rounded">
                      {rule.conditionType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dispatch Channel:</span>
                    <span className="font-bold text-[#00A884]">{rule.channelType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Anti-Spam Cooldown:</span>
                    <span className="font-mono text-gray-300">{rule.cooldownMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dispatch Delay:</span>
                    <span className="font-mono text-gray-300">
                      {rule.delaySeconds === 0 ? "Instant (0s)" : `${rule.delaySeconds}s`}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[11px] text-[#8696A0] mb-1">Assigned Template:</span>
                    <p className="text-xs text-gray-300 bg-[#202C33]/60 p-2.5 rounded-xl border border-[#222E35]/40 italic line-clamp-2">
                      "{tmpl?.content || "Default Template"}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222E35]/60 flex items-center justify-between text-[11px] text-[#8696A0]">
                <span>
                  {rule.workingHoursOnly ? "Restricted to Working Hours" : "24/7 Execution"}
                </span>
                <span className="font-mono text-emerald-400">Rule Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Rule Modal */}
      {(isNew || editingRule) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-[#111B21] border border-[#222E35] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">
              {isNew ? "Create Automation Rule" : "Edit Rule"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Condition Type
                  </label>
                  <select
                    value={form.conditionType}
                    onChange={(e) => setForm({ ...form, conditionType: e.target.value as any })}
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  >
                    <option value="ALL_MISSED">All Missed Calls</option>
                    <option value="FIRST_TIME">First-Time Callers Only</option>
                    <option value="VIP_ONLY">VIP Callers Only</option>
                    <option value="AFTER_HOURS">After Working Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">Channel</label>
                  <select
                    value={form.channelType}
                    onChange={(e) => setForm({ ...form, channelType: e.target.value as any })}
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">Native SMS</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Priority Order (1 = Highest)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Cooldown (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.cooldownMinutes}
                    onChange={(e) =>
                      setForm({ ...form, cooldownMinutes: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Message Template
                </label>
                <select
                  value={form.templateId}
                  onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                >
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.workingHoursOnly}
                    onChange={(e) => setForm({ ...form, workingHoursOnly: e.target.checked })}
                    className="accent-[#00A884] w-4 h-4 rounded"
                  />
                  <span>Restrict to Working Hours Only</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRule(null);
                    setIsNew(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#8696A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white shadow-md shadow-[#00A884]/20"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
