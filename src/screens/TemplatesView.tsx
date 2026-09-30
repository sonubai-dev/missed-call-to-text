import React, { useState } from "react";
import {
  FileText,
  Plus,
  Star,
  Edit2,
  Trash2,
  Sparkles,
  Check,
  Eye,
} from "lucide-react";
import { MessageTemplate, BusinessSettings } from "../types";
import { AVAILABLE_VARIABLES, renderTemplate } from "../lib/template-engine";

interface TemplatesViewProps {
  templates: MessageTemplate[];
  settings: BusinessSettings;
  onUpdateTemplates: (templates: MessageTemplate[]) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  settings,
  onUpdateTemplates,
}) => {
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState<MessageTemplate["category"]>("MISSED_CALL");

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setTemplateName(t.name);
    setEditorContent(t.content);
    setCategory(t.category);
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setTemplateName("New Custom Template");
    setEditorContent(
      "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?"
    );
    setCategory("MISSED_CALL");
    setIsNew(true);
  };

  const handleInsertTag = (tag: string) => {
    setEditorContent((prev) => `${prev} ${tag}`);
  };

  const handleSetDefault = (t: MessageTemplate) => {
    const updated = templates.map((item) => ({
      ...item,
      isDefault: item.id === t.id,
    }));
    onUpdateTemplates(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this template?")) {
      const updated = templates.filter((t) => t.id !== id);
      onUpdateTemplates(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      const newTmpl: MessageTemplate = {
        id: `tmpl-${Date.now()}`,
        name: templateName.trim(),
        content: editorContent.trim(),
        language: "en",
        isDefault: templates.length === 0,
        category,
      };
      onUpdateTemplates([...templates, newTmpl]);
    } else if (editingTemplate) {
      const updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: templateName.trim(),
              content: editorContent.trim(),
              category,
            }
          : t
      );
      onUpdateTemplates(updated);
    }
    setEditingTemplate(null);
    setIsNew(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Message Templates</h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Create and edit follow-up message templates with dynamic variable tags for instant personalization
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => {
          const previewText = renderTemplate(tmpl.content, {
            name: "Rajesh Sharma",
            business_name: settings.businessName || "Apex Electronics",
            owner_name: settings.ownerName || "Sonu Bai",
            phone: "+91 98765 12345",
            time: "10:30 AM",
            date: "Today",
          });

          return (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{tmpl.name}</span>
                    {tmpl.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!tmpl.isDefault && (
                      <button
                        onClick={() => handleSetDefault(tmpl)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#00A884] hover:bg-[#202C33] rounded-lg transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      className="p-1.5 text-[#8696A0] hover:text-white hover:bg-[#202C33] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!tmpl.isDefault && templates.length > 1 && (
                      <button
                        onClick={() => handleDelete(tmpl.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Raw Template */}
                <div className="bg-[#202C33]/60 p-3 rounded-xl border border-[#222E35]/40 text-xs text-gray-200">
                  <span className="text-[10px] text-[#8696A0] uppercase tracking-wider block mb-1 font-semibold">
                    Template Format:
                  </span>
                  "{tmpl.content}"
                </div>

                {/* Live Preview Render */}
                <div className="mt-2.5 bg-[#0C1317]/60 p-3 rounded-xl border border-[#222E35]/30 text-xs text-[#25D366]">
                  <span className="text-[10px] text-[#8696A0] uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#00A884]" />
                    Live Render Preview:
                  </span>
                  "{previewText}"
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222E35]/60 flex items-center justify-between text-[11px] text-[#8696A0]">
                <span>Category: {tmpl.category}</span>
                <span>Language: {tmpl.language.toUpperCase()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / New Template Modal */}
      {(isNew || editingTemplate) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-[#111B21] border border-[#222E35] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">
              {isNew ? "Create Message Template" : "Edit Template"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#8696A0]">
                    Message Body & Variable Tokens
                  </label>
                  <span className="text-[11px] text-[#00A884] flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Click tag to insert
                  </span>
                </div>

                {/* Variable Token Buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertTag(v.tag)}
                      className="px-2 py-1 text-[11px] font-mono rounded-lg bg-[#202C33] hover:bg-[#00A884]/20 hover:text-[#00A884] text-gray-300 border border-[#222E35] transition-colors"
                      title={v.label}
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  required
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              {/* Real-time preview */}
              <div className="p-3 rounded-xl bg-[#0C1317]/80 border border-[#222E35] text-xs">
                <span className="text-[10px] text-[#8696A0] uppercase font-bold block mb-1">
                  Live Sample Output:
                </span>
                <p className="text-gray-200 italic">
                  "{renderTemplate(editorContent, {
                    name: "Rajesh Sharma",
                    business_name: settings.businessName || "Apex Electronics",
                    owner_name: settings.ownerName || "Sonu Bai",
                    phone: "+91 98765 12345",
                    time: "10:30 AM",
                    date: "Today",
                  })}"
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
