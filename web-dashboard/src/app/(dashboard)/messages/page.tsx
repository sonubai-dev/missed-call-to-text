"use client";

import { useEffect, useState } from "react";
import { MessageRecord, MessageStatus } from "@/types";
import { MessageSquare, Check, CheckCheck, Clock, AlertCircle, Search } from "lucide-react";
import { formatPhoneNumber, formatRelativeTime } from "@/lib/utils";

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | MessageStatus>("ALL");

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) setMessages(await res.json());
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#25D366]/15 text-[#25D366]">
            <CheckCheck className="w-3.5 h-3.5" />
            DELIVERED
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#00A884]/15 text-[#00A884]">
            <Check className="w-3.5 h-3.5" />
            SENT
          </span>
        );
      case "SENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            SENDING...
          </span>
        );
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            QUEUED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
    }
  };

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.phoneNumber.includes(search) ||
      (m.customerName && m.customerName.toLowerCase().includes(search.toLowerCase())) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Messages Log</h1>
          <p className="text-sm text-[#8696A0]">
            Track delivery receipts and real-time status across WhatsApp sending modes
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8696A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search messages by recipient or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202C33] border border-[#222E35] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(["ALL", "QUEUED", "SENDING", "SENT", "DELIVERED", "FAILED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === st
                  ? "bg-[#00A884] text-white"
                  : "bg-[#202C33] text-[#8696A0] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List Card */}
      <div className="rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden divide-y divide-[#222E35]/60">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#182229]/40 transition-colors"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {msg.customerName || formatPhoneNumber(msg.phoneNumber)}
                  </span>
                  <span className="text-xs text-[#8696A0]">
                    ({formatPhoneNumber(msg.phoneNumber)})
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#202C33] text-[#8696A0]">
                    {msg.mode}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 bg-[#202C33]/60 p-2.5 rounded-lg border border-[#222E35]/40">
                  {msg.content}
                </p>
                {msg.errorMessage && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">Error: {msg.errorMessage}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
              {getStatusBadge(msg.status)}
              <span className="text-xs text-[#8696A0]">
                {formatRelativeTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#8696A0]">
            <MessageSquare className="w-12 h-12 text-[#8696A0] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-white">No Messages Found</p>
            <p className="text-xs">Dispatched follow-up messages will show here with real-time status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
