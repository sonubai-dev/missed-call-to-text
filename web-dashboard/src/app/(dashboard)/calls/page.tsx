"use client";

import { useEffect, useState } from "react";
import { CallEvent, WhatsAppFollowUpStatus } from "@/types";
import { PhoneMissed, Search, Filter, MessageSquare, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber, formatRelativeTime } from "@/lib/utils";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallEvent[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | WhatsAppFollowUpStatus>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    try {
      const res = await fetch("/api/calls");
      if (res.ok) setCalls(await res.json());
    } catch (e) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleIgnore = async (id: string) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, whatsappStatus: "IGNORED" }),
      });
      fetchCalls();
    } catch (e) {
      // Handled
    }
  };

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Missed Call Log</h1>
          <p className="text-sm text-[#8696A0]">
            Review all detected customer missed calls and monitor follow-up progress
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
            className="w-full bg-[#202C33] border border-[#222E35] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "PENDING", "SENT", "IGNORED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-[#00A884] text-white"
                  : "bg-[#202C33] text-[#8696A0] hover:text-white"
              }`}
            >
              {status === "ALL" ? "All Calls" : status === "PENDING" ? "Pending" : status}
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
                    <span className="font-bold text-base text-white">
                      {call.customerName || formatPhoneNumber(call.phoneNumber)}
                    </span>
                    {call.customerName && (
                      <span className="text-xs text-[#8696A0]">
                        {formatPhoneNumber(call.phoneNumber)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8696A0] mt-0.5">
                    {formatRelativeTime(call.timestamp)}
                  </p>
                  <p className="text-xs text-gray-300 mt-2 bg-[#202C33]/70 p-2.5 rounded-lg border border-[#222E35]/40 max-w-2xl">
                    <span className="text-[#8696A0] font-medium block text-[11px] mb-0.5">Suggested Follow-Up:</span>
                    "{call.suggestedMessage}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:self-center shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    call.whatsappStatus === "SENT"
                      ? "bg-[#25D366]/15 text-[#25D366]"
                      : call.whatsappStatus === "IGNORED"
                      ? "bg-gray-500/15 text-gray-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {call.whatsappStatus}
                </span>

                {call.whatsappStatus !== "SENT" && (
                  <>
                    <Link
                      href={`/whatsapp?phone=${encodeURIComponent(call.phoneNumber)}`}
                      className="px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-[#00A884]/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </Link>

                    {call.whatsappStatus !== "IGNORED" && (
                      <button
                        onClick={() => handleIgnore(call.id)}
                        className="px-3 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-[#8696A0] hover:text-white text-xs font-semibold transition-colors"
                      >
                        Ignore
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredCalls.length === 0 && (
            <div className="py-16 text-center text-[#8696A0]">
              <PhoneMissed className="w-12 h-12 text-[#8696A0] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-white">No Calls Matching Search</p>
              <p className="text-xs">Try adjusting your search terms or filter selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
