import React, { useState } from "react";
import {
  X,
  Phone,
  Building,
  Mail,
  Star,
  Ban,
  Clock,
  MessageSquare,
  Smartphone,
  Plus,
  Send,
  Calendar,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Customer, CustomerActivity } from "../types";
import { formatPhoneNumber, formatRelativeTime, formatDateTime } from "../lib/normalizer";

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: (updated: Customer) => void;
  onSendMessage: (phoneNumber: string, name?: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onUpdate,
  onSendMessage,
}) => {
  const [formData, setFormData] = useState({
    name: customer.name,
    phoneNumber: customer.phoneNumber,
    company: customer.company || "",
    email: customer.email || "",
    notes: customer.notes || "",
    isVip: customer.isVip,
    isBlacklisted: customer.isBlacklisted,
    status: customer.status,
  });

  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "DETAILS">("TIMELINE");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...customer,
      ...formData,
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const newActivity: CustomerActivity = {
      id: `act-${Date.now()}`,
      customerId: customer.id,
      type: "NOTE_ADDED",
      description: newNote.trim(),
      timestamp: Date.now(),
    };

    const updatedActivities = [newActivity, ...(customer.activityHistory || [])];
    onUpdate({
      ...customer,
      activityHistory: updatedActivities,
    });
    setNewNote("");
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#111B21] border border-[#222E35] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#222E35] flex items-center justify-between bg-[#182229]/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00A884]/20 border border-[#00A884]/40 flex items-center justify-center text-[#00A884] font-black text-lg">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{customer.name}</h2>
                {customer.isVip && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-current" />
                    VIP
                  </span>
                )}
                {customer.isBlacklisted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <Ban className="w-3 h-3" />
                    Blacklisted
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8696A0] font-mono mt-0.5">
                {formatPhoneNumber(customer.phoneNumber)} {customer.company ? `• ${customer.company}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendMessage(customer.phoneNumber, customer.name)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Follow Up</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#202C33] text-[#8696A0] hover:text-white hover:bg-[#2A3942] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#222E35] bg-[#0C1317]/50 px-5 pt-2 gap-4">
          <button
            onClick={() => setActiveTab("TIMELINE")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "TIMELINE"
                ? "border-[#00A884] text-[#00A884]"
                : "border-transparent text-[#8696A0] hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity Timeline ({customer.activityHistory?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "DETAILS"
                ? "border-[#00A884] text-[#00A884]"
                : "border-transparent text-[#8696A0] hover:text-white"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Edit Profile & Tags</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "TIMELINE" ? (
            <div className="space-y-4">
              {/* Quick Add Note Box */}
              <div className="p-3.5 rounded-xl bg-[#202C33]/70 border border-[#222E35]">
                <label className="block text-xs font-semibold text-[#8696A0] mb-1.5">
                  Add Interaction Note / CRM Tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Discussed pricing over phone; promised callback on Friday"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    className="flex-1 bg-[#111B21] border border-[#222E35] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>

              {/* Timeline list */}
              <div className="relative pl-6 space-y-4 border-l-2 border-[#222E35]/80 ml-3 pt-1">
                {(customer.activityHistory || []).map((activity) => {
                  let badgeColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                  let dotColor = "bg-blue-400";
                  let label = "Activity";

                  if (activity.type === "MISSED_CALL") {
                    badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";
                    dotColor = "bg-rose-500";
                    label = "Missed Call";
                  } else if (activity.type === "WHATSAPP_SENT") {
                    badgeColor = "bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30";
                    dotColor = "bg-[#25D366]";
                    label = "WhatsApp Dispatched";
                  } else if (activity.type === "SMS_SENT") {
                    badgeColor = "bg-sky-500/20 text-sky-400 border-sky-500/30";
                    dotColor = "bg-sky-400";
                    label = "SMS Sent";
                  } else if (activity.type === "STATUS_CHANGE") {
                    badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/30";
                    dotColor = "bg-purple-400";
                    label = "Status Update";
                  } else if (activity.type === "NOTE_ADDED") {
                    badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/30";
                    dotColor = "bg-amber-400";
                    label = "Team Note";
                  }

                  return (
                    <div key={activity.id} className="relative group">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ${dotColor} ring-4 ring-[#111B21]`}
                      />

                      <div className="bg-[#202C33]/60 hover:bg-[#202C33] p-3 rounded-xl border border-[#222E35]/60 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}
                          >
                            {label}
                          </span>
                          <span className="text-[11px] text-[#8696A0] font-mono">
                            {formatDateTime(activity.timestamp)} ({formatRelativeTime(activity.timestamp)})
                          </span>
                        </div>
                        <p className="text-xs text-gray-200 mt-1.5 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(!customer.activityHistory || customer.activityHistory.length === 0) && (
                  <div className="text-center py-8 text-[#8696A0] text-xs">
                    No activity recorded yet for this customer.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Phone Number (E.164)
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. City Dental Hospital"
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                    Lead Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
                  >
                    <option value="NEW">NEW LEAD</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CONVERTED">CONVERTED (CUSTOMER)</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Customer Notes & Context
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key background notes regarding this caller..."
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer p-3 rounded-xl bg-[#202C33]/70 border border-[#222E35] flex-1">
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => setFormData({ ...formData, isVip: e.target.checked })}
                    className="accent-[#00A884] w-4 h-4 rounded"
                  />
                  <div>
                    <span className="font-bold block text-white">VIP Priority Client</span>
                    <span className="text-[10px] text-[#8696A0]">Triggers custom VIP instant rule</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer p-3 rounded-xl bg-[#202C33]/70 border border-[#222E35] flex-1">
                  <input
                    type="checkbox"
                    checked={formData.isBlacklisted}
                    onChange={(e) => setFormData({ ...formData, isBlacklisted: e.target.checked })}
                    className="accent-rose-500 w-4 h-4 rounded"
                  />
                  <div>
                    <span className="font-bold block text-rose-400">Blacklisted / Spam</span>
                    <span className="text-[10px] text-[#8696A0]">Bypasses auto-replies entirely</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-[#222E35] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#8696A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white shadow-md shadow-[#00A884]/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
