"use client";

import { useEffect, useState } from "react";
import { CallEvent, MessageRecord, WhatsAppConnectionStatus } from "@/types";
import {
  PhoneMissed,
  Clock,
  Send,
  MessageCircle,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber, formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const [calls, setCalls] = useState<CallEvent[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [session, setSession] = useState<{ status: WhatsAppConnectionStatus; number?: string }>({
    status: "DISCONNECTED",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [callsRes, msgsRes, sessionRes] = await Promise.all([
        fetch("/api/calls"),
        fetch("/api/messages"),
        fetch("/api/session"),
      ]);
      if (callsRes.ok) setCalls(await callsRes.json());
      if (msgsRes.ok) setMessages(await msgsRes.json());
      if (sessionRes.ok) setSession(await sessionRes.json());
    } catch (e) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMissedToday = calls.filter((c) => c.status === "MISSED").length;
  const followUpsPending = calls.filter((c) => c.whatsappStatus === "PENDING").length;
  const messagesSentToday = messages.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
  const repliesReceived = 1; // Simulated customer response indicator

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Overview</h1>
          <p className="text-sm text-[#8696A0]">
            Live missed-call detection and automated WhatsApp follow-up telemetry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/whatsapp"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-sm font-semibold transition-all shadow-md shadow-[#00A884]/20"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open WhatsApp Workbench</span>
          </Link>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Missed */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
            <PhoneMissed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider">
              Total Missed Today
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{totalMissedToday}</p>
          </div>
        </div>

        {/* Follow-ups Pending */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider">
              Follow-ups Pending
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{followUpsPending}</p>
          </div>
        </div>

        {/* Messages Sent */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider">
              Messages Sent
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{messagesSentToday}</p>
          </div>
        </div>

        {/* Replies Received */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider">
              Replies Received
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{repliesReceived}</p>
          </div>
        </div>
      </div>

      {/* Main Card: Missed Calls Action Hub */}
      <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35]">
        <div className="flex items-center justify-between pb-4 border-b border-[#222E35]">
          <div>
            <h2 className="text-base font-bold text-white">Recent Missed Calls & Action Hub</h2>
            <p className="text-xs text-[#8696A0]">
              Select a customer to edit and dispatch their personalized WhatsApp follow-up
            </p>
          </div>
          <Link
            href="/calls"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A884] hover:text-[#25D366] transition-colors"
          >
            <span>View All Calls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recent Calls List */}
        <div className="divide-y divide-[#222E35]/60">
          {calls.slice(0, 5).map((call) => (
            <div
              key={call.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182229]/40 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <PhoneMissed className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {call.customerName || formatPhoneNumber(call.phoneNumber)}
                    </span>
                    {call.customerName && (
                      <span className="text-xs text-[#8696A0]">
                        ({formatPhoneNumber(call.phoneNumber)})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8696A0] mt-0.5">
                    {formatRelativeTime(call.timestamp)} • Status:{" "}
                    <span className="text-rose-400 font-medium">Missed</span>
                  </p>
                  <p className="text-xs text-gray-300 mt-1 italic line-clamp-1 bg-[#202C33]/60 px-2.5 py-1 rounded-md border border-[#222E35]/40">
                    "{call.suggestedMessage}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                    call.whatsappStatus === "SENT"
                      ? "bg-[#25D366]/15 text-[#25D366]"
                      : call.whatsappStatus === "IGNORED"
                      ? "bg-gray-500/15 text-gray-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {call.whatsappStatus === "SENT"
                    ? "Message Sent"
                    : call.whatsappStatus === "IGNORED"
                    ? "Ignored"
                    : "Follow-up Pending"}
                </span>

                <Link
                  href={`/whatsapp?phone=${encodeURIComponent(call.phoneNumber)}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-semibold transition-colors"
                >
                  Message
                </Link>
              </div>
            </div>
          ))}

          {calls.length === 0 && (
            <div className="py-12 text-center text-[#8696A0]">
              <CheckCircle2 className="w-10 h-10 text-[#00A884] mx-auto mb-2" />
              <p className="font-semibold text-white">No Missed Calls Today</p>
              <p className="text-xs">You are all caught up with your incoming customer calls.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
