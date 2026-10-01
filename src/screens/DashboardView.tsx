import React from "react";
import {
  PhoneMissed,
  Clock,
  Send,
  MessageCircle,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Star,
  Activity,
  Play,
  RotateCw,
  Download,
} from "lucide-react";
import {
  CallEvent,
  MessageRecord,
  Customer,
  FollowUpSuggestion,
  WhatsAppConnectionStatus,
  BusinessSettings,
} from "../types";
import { formatPhoneNumber, formatRelativeTime } from "../lib/normalizer";

interface DashboardViewProps {
  calls: CallEvent[];
  messages: MessageRecord[];
  customers: Customer[];
  suggestions: FollowUpSuggestion[];
  sessionStatus: WhatsAppConnectionStatus;
  settings: BusinessSettings;
  onNavigate: (tab: any) => void;
  onOpenMessageForCall: (call: CallEvent) => void;
  onIgnoreCall: (callId: string) => void;
  onApproveSuggestion: (sug: FollowUpSuggestion) => void;
  onOpenSimulator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  calls,
  messages,
  customers,
  suggestions,
  sessionStatus,
  settings,
  onNavigate,
  onOpenMessageForCall,
  onIgnoreCall,
  onApproveSuggestion,
  onOpenSimulator,
}) => {
  const missedToday = calls.filter((c) => c.status === "MISSED").length;
  const pendingFollowups = calls.filter((c) => c.whatsappStatus === "PENDING").length;
  const sentMessages = messages.filter((m) => m.status === "SENT" || m.status === "DELIVERED").length;
  const vipCustomers = customers.filter((c) => c.isVip).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Business Overview</h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Automated missed-call detection, customer CRM telemetry & WhatsApp follow-ups
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate("download")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Android App</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Call</span>
          </button>
          <button
            onClick={() => onNavigate("whatsapp")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-white text-xs font-semibold transition-all border border-[#222E35]"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00A884]" />
            <span>WhatsApp Workbench</span>
          </button>
        </div>
      </div>

      {/* Official Android App Download Section ("Previous Section") */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#111B21] to-[#182229] border border-emerald-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Smartphone className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Android Application
                </span>
                <span className="text-xs text-slate-400 font-mono">v1.0.0 • 20.5 MB APK</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready to Install
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                MissCall Assistant for Android Phone
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Install on your Android smartphone to capture incoming carrier calls via native <code className="text-emerald-400 font-mono">CallScreeningService</code>, dispatch automated SMS replies via Dual SIM, and sync telemetry live.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <a
              href="/downloads/misscall-assistant.apk"
              download="misscall-assistant.apk"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </a>
            <button
              onClick={() => onNavigate("download")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] border border-[#222E35] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>View Download Website</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Missed */}
        <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-3.5 hover:border-[#222E35]/80 transition-all">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
            <PhoneMissed className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider">
              Total Missed Today
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{missedToday}</p>
          </div>
        </div>

        {/* Follow-ups Pending */}
        <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-3.5 hover:border-[#222E35]/80 transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider">
              Follow-ups Pending
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{pendingFollowups}</p>
          </div>
        </div>

        {/* Messages Sent */}
        <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-3.5 hover:border-[#222E35]/80 transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider">
              Messages Dispatched
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{sentMessages}</p>
          </div>
        </div>

        {/* VIP Contacts */}
        <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center gap-3.5 hover:border-[#222E35]/80 transition-all">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider">
              CRM Contacts / VIPs
            </p>
            <p className="text-2xl font-black text-white mt-0.5">
              {customers.length}{" "}
              <span className="text-xs font-normal text-amber-400">({vipCustomers} VIP)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Section: Action Hub + Pending Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Missed Calls Hub (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#222E35]">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Recent Missed Calls & Action Hub
                </h2>
                <p className="text-[11px] text-[#8696A0]">
                  Detected via Android Telephony APIs • Instant 1-tap follow-up
                </p>
              </div>
              <button
                onClick={() => onNavigate("calls")}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#00A884] hover:text-[#25D366] transition-colors"
              >
                <span>View All ({calls.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#222E35]/60">
              {calls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#182229]/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                      <PhoneMissed className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {call.customerName || formatPhoneNumber(call.phoneNumber)}
                        </span>
                        {call.customerName && (
                          <span className="text-[11px] text-[#8696A0] font-mono">
                            {formatPhoneNumber(call.phoneNumber)}
                          </span>
                        )}
                        {call.simSlot && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202C33] text-[#8696A0] font-mono">
                            {call.simSlot}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8696A0] mt-0.5">
                        {formatRelativeTime(call.timestamp)} • Ring duration: {call.rawDurationSeconds || 15}s
                      </p>
                      <p className="text-xs text-gray-300 mt-1 italic line-clamp-1 bg-[#202C33]/60 px-2 py-1 rounded-md border border-[#222E35]/40 max-w-lg">
                        "{call.suggestedMessage}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
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

                    {call.whatsappStatus !== "SENT" && (
                      <button
                        onClick={() => onOpenMessageForCall(call)}
                        className="px-3 py-1.5 rounded-lg bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    )}

                    {call.whatsappStatus === "PENDING" && (
                      <button
                        onClick={() => onIgnoreCall(call.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-[#8696A0] hover:text-white text-xs font-medium transition-colors"
                      >
                        Ignore
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {calls.length === 0 && (
                <div className="py-12 text-center text-[#8696A0] text-xs">
                  No missed calls recorded yet. Use the simulator above to test call detection!
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#222E35]/60 mt-3 flex items-center justify-between text-[11px] text-[#8696A0]">
            <span>Mode: {settings.whatsAppSendingMode}</span>
            <span>Auto-reply: {settings.isAutoReplyEnabled ? "Enabled" : "Manual Approval"}</span>
          </div>
        </div>

        {/* Right Col: Pending Suggestions & Engine Status */}
        <div className="space-y-4">
          {/* Pending Suggestion Queue */}
          <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#222E35]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pending Follow-Up Queue ({suggestions.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate("followups")}
                className="text-[11px] font-semibold text-[#00A884] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {suggestions.slice(0, 3).map((sug) => (
                <div
                  key={sug.id}
                  className="p-3 rounded-xl bg-[#202C33]/70 border border-[#222E35] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      {sug.customerName || formatPhoneNumber(sug.phoneNumber)}
                    </span>
                    <span className="text-[10px] text-[#8696A0] font-mono">
                      {formatRelativeTime(sug.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 italic line-clamp-2 bg-[#111B21]/60 p-2 rounded-lg border border-[#222E35]/40">
                    "{sug.suggestedMessage}"
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onApproveSuggestion(sug)}
                      className="px-3 py-1 rounded-lg bg-[#00A884] hover:bg-[#008f6f] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Approve & Send</span>
                    </button>
                  </div>
                </div>
              ))}

              {suggestions.length === 0 && (
                <div className="py-6 text-center text-[#8696A0] text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1 opacity-70" />
                  All suggestions processed! No items pending.
                </div>
              )}
            </div>
          </div>

          {/* Engine Multi-Channel Telemetry */}
          <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00A884]" />
              Telephony Channel Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202C33]/60">
                <span className="text-gray-300">WhatsApp Bridge</span>
                <span
                  className={`font-semibold ${
                    sessionStatus === "CONNECTED" ? "text-[#25D366]" : "text-rose-400"
                  }`}
                >
                  {sessionStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202C33]/60">
                <span className="text-gray-300">SIM 1 Outbound (Airtel)</span>
                <span className="font-semibold text-emerald-400">Carrier Ready</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202C33]/60">
                <span className="text-gray-300">SIM 2 Outbound (Jio)</span>
                <span className="font-semibold text-emerald-400">Carrier Ready</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#202C33]/60">
                <span className="text-gray-300">Webhook Sync Queue</span>
                <span className="font-semibold text-sky-400">HMAC-SHA256 OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
