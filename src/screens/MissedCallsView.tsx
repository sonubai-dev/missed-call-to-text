import React, { useState } from "react";
import {
  PhoneMissed,
  Search,
  MessageSquare,
  Check,
  X,
  Clock,
  Smartphone,
  Shield,
  Filter,
} from "lucide-react";
import { CallEvent, WhatsAppFollowUpStatus } from "../types";
import { formatPhoneNumber, formatRelativeTime, formatDateTime } from "../lib/normalizer";

interface MissedCallsViewProps {
  calls: CallEvent[];
  onOpenMessage: (call: CallEvent) => void;
  onIgnoreCall: (callId: string) => void;
  onSelectCustomer: (phoneNumber: string) => void;
}

export const MissedCallsView: React.FC<MissedCallsViewProps> = ({
  calls,
  onOpenMessage,
  onIgnoreCall,
  onSelectCustomer,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | WhatsAppFollowUpStatus>("ALL");

  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      c.phoneNumber.includes(search) ||
      (c.customerName && c.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "ALL" || c.whatsappStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Missed Call Log</h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Review all detected customer missed calls and monitor automated follow-up progress
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8696A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search phone number or caller name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202C33] border border-[#222E35] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "PENDING", "SENT", "IGNORED", "SKIPPED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-[#00A884] text-white shadow-sm shadow-[#00A884]/20"
                  : "bg-[#202C33] text-[#8696A0] hover:text-white"
              }`}
            >
              {status === "ALL" ? "All Calls" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Calls Table Card */}
      <div className="rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden">
        <div className="divide-y divide-[#222E35]/60">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#182229]/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
                  <PhoneMissed className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCustomer(call.phoneNumber)}
                      className="font-bold text-sm text-white hover:text-[#00A884] transition-colors"
                    >
                      {call.customerName || formatPhoneNumber(call.phoneNumber)}
                    </button>
                    {call.customerName && (
                      <span className="text-xs text-[#8696A0] font-mono">
                        {formatPhoneNumber(call.phoneNumber)}
                      </span>
                    )}
                    {call.simSlot && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202C33] text-[#8696A0]">
                        {call.simSlot}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#8696A0] mt-0.5">
                    {formatDateTime(call.timestamp)} ({formatRelativeTime(call.timestamp)}) • Ring: {call.rawDurationSeconds || 15}s
                  </p>

                  <p className="text-xs text-gray-300 mt-2 bg-[#202C33]/70 p-2.5 rounded-lg border border-[#222E35]/40 max-w-2xl">
                    <span className="text-[#8696A0] font-medium block text-[10px] uppercase tracking-wider mb-0.5">
                      Suggested Auto-Followup Text:
                    </span>
                    "{call.suggestedMessage}"
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8696A0] font-mono">
                    <span>Idempotency Key: {call.idempotencyKey}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 lg:self-center shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    call.whatsappStatus === "SENT"
                      ? "bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30"
                      : call.whatsappStatus === "IGNORED"
                      ? "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                      : call.whatsappStatus === "SKIPPED"
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {call.whatsappStatus}
                </span>

                {call.whatsappStatus !== "SENT" && (
                  <button
                    onClick={() => onOpenMessage(call)}
                    className="px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-[#00A884]/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                )}

                {call.whatsappStatus !== "IGNORED" && call.whatsappStatus !== "SENT" && (
                  <button
                    onClick={() => onIgnoreCall(call.id)}
                    className="px-3 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-[#8696A0] hover:text-white text-xs font-semibold transition-colors"
                  >
                    Ignore
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredCalls.length === 0 && (
            <div className="py-16 text-center text-[#8696A0]">
              <PhoneMissed className="w-12 h-12 text-[#8696A0] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-white text-sm">No Calls Matching Search</p>
              <p className="text-xs mt-1">Try adjusting your search terms or filter selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
