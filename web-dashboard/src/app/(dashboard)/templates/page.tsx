"use client";

import { useEffect, useState } from "react";
import { MessageTemplate } from "@/types";
import { FileText, Plus, Star, Edit, Trash2, Check, Sparkles } from "lucide-react";
import { AVAILABLE_VARIABLES } from "@/lib/template-engine";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) setTemplates(await res.json());
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setEditorContent(t.content);
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setEditorContent("Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?");
    setIsNew(true);
  };

  const handleInsertTag = (tag: string) => {
    setEditorContent((prev) => `${prev} ${tag}`);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      id: editingTemplate?.id,
      name: formData.get("name") as string,
      content: editorContent.trim(),
      isDefault: formData.get("isDefault") === "on",
      language: "en",
    };

    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingTemplate(null);
    setIsNew(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this template?")) {
      await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
      fetchTemplates();
    }
  };

  const handleSetDefault = async (t: MessageTemplate) => {
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, isDefault: true }),
    });
    fetchTemplates();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Message Templates</h1>
          <p className="text-sm text-[#8696A0]">
            Create and edit follow-up message templates with dynamic variable tags
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-sm font-semibold transition-all shadow-md shadow-[#00A884]/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white">{tmpl.name}</span>
                  {tmpl.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#25D366]/15 text-[#25D366]">
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
                    <Edit className="w-4 h-4" />
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

              <div className="bg-[#202C33]/60 p-3.5 rounded-xl border border-[#222E35]/40 text-sm text-gray-200">
                "{tmpl.content}"
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#222E35]/60 flex items-center justify-between text-[11px] text-[#8696A0]">
              <span>Language: {tmpl.language.toUpperCase()}</span>
              <span>Supported Tags: &#123;&#123;name&#125;&#125;, &#123;&#123;business_name&#125;&#125;</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / New Template Modal */}
      {(isNew || editingTemplate) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#111B21] border border-[#222E35] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {isNew ? "Create Message Template" : "Edit Template"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Template Name
                </label>
                <input
                  name="name"
                  defaultValue={editingTemplate?.name || ""}
                  placeholder="e.g. Template 1 (Default)"
                  required
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#8696A0]">
                    Message Body & Dynamic Variables
                  </label>
                  <span className="text-[11px] text-[#00A884] flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Click tag to insert
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertTag(v.tag)}
                      className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-[#202C33] hover:bg-[#00A884]/20 hover:text-[#00A884] text-gray-300 border border-[#222E35] transition-colors"
                      title={v.label}
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  defaultChecked={editingTemplate?.isDefault || false}
                  className="accent-[#00A884] rounded w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-gray-200 cursor-pointer">
                  Make this my default auto-reply template
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222E35]">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#202C33] text-sm font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-sm font-bold text-white shadow-md shadow-[#00A884]/20"
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
}
