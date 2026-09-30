import React, { useState } from "react";
import {
  BellRing,
  Send,
  X,
  Edit2,
  Clock,
  CheckCircle,
  MessageSquare,
  Smartphone,
  Mail,
  Sparkles,
} from "lucide-react";
import { FollowUpSuggestion, ChannelType } from "../types";
import { formatPhoneNumber, formatRelativeTime } from "../lib/normalizer";

interface FollowUpsViewProps {
  suggestions: FollowUpSuggestion[];
  onApprove: (suggestion: FollowUpSuggestion, editedContent?: string, channel?: ChannelType) => void;
  onDismiss: (suggestionId: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  suggestions,
  onApprove,
  onDismiss,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("WHATSAPP");

  const startEdit = (sug: FollowUpSuggestion) => {
    setEditingId(sug.id);
    setEditedText(sug.suggestedMessage);
    setSelectedChannel(sug.channel || "WHATSAPP");
  };

  const handleApprove = (sug: FollowUpSuggestion) => {
    if (editingId === sug.id) {
      onApprove(sug, editedText, selectedChannel);
      setEditingId(null);
    } else {
      onApprove(sug);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Follow-Up Suggestions Queue
          </h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Auto-generated customer messages waiting for review, scheduled dispatch, or manual override
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden">
        <div className="divide-y divide-[#222E35]/60">
          {suggestions.map((sug) => {
            const isEditing = editingId === sug.id;
            return (
              <div
                key={sug.id}
                className="p-5 flex flex-col gap-3 hover:bg-[#182229]/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {sug.customerName || formatPhoneNumber(sug.phoneNumber)}
                        </span>
                        <span className="text-xs text-[#8696A0] font-mono">
                          {formatPhoneNumber(sug.phoneNumber)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8696A0]">
                        Created {formatRelativeTime(sug.createdAt)} • Target: {sug.channel}
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-center text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    PENDING APPROVAL
                  </span>
                </div>

                {/* Message Box or Editor */}
                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <textarea
                      rows={3}
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full bg-[#202C33] border border-[#00A884] rounded-xl p-3 text-xs text-white focus:outline-none"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8696A0] font-semibold">Channel:</span>
                        {(["WHATSAPP", "SMS", "EMAIL"] as const).map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setSelectedChannel(ch)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              selectedChannel === ch
                                ? "bg-[#00A884] text-white"
                                : "bg-[#202C33] text-[#8696A0] hover:text-white"
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#8696A0] hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(sug)}
                          className="px-4 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white shadow-md shadow-[#00A884]/20 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Save & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-gray-200 bg-[#202C33]/70 p-3 rounded-xl border border-[#222E35]/40 flex-1 leading-relaxed">
                      "{sug.suggestedMessage}"
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(sug)}
                        className="px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleApprove(sug)}
                        className="px-4 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md shadow-[#00A884]/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve & Send</span>
                      </button>

                      <button
                        onClick={() => onDismiss(sug.id)}
                        className="p-1.5 rounded-xl bg-[#202C33] hover:bg-rose-500/20 text-[#8696A0] hover:text-rose-400 transition-colors"
                        title="Dismiss suggestion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {suggestions.length === 0 && (
            <div className="py-20 text-center text-[#8696A0]">
              <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-white text-sm">No Pending Suggestions</p>
              <p className="text-xs mt-1">
                When new missed calls arrive, automated suggestions will appear here for one-click approval.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
