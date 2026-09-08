"use client";

import { Suspense, useEffect, useState } from "react";
import {
  CallEvent,
  MessageRecord,
  MessageTemplate,
  WhatsAppConnectionStatus,
} from "@/types";
import {
  Smartphone,
  QrCode,
  Circle,
  Clock,
  Send,
  CheckCheck,
  Check,
  User,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { formatPhoneNumber, formatRelativeTime } from "@/lib/utils";
import { AVAILABLE_VARIABLES, renderTemplate } from "@/lib/template-engine";
import { localMessageGenerator, MessageLanguage, MessageTone } from "@/lib/ai-generator";
import { useSearchParams } from "next/navigation";

function WhatsAppWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone");

  const [session, setSession] = useState<{ status: WhatsAppConnectionStatus; number?: string }>({
    status: "DISCONNECTED",
  });
  const [calls, setCalls] = useState<CallEvent[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallEvent | null>(null);

  // Message Editor & AI State
  const [editorText, setEditorText] = useState("");
  const [currentTone, setCurrentTone] = useState<MessageTone>("FRIENDLY");
  const [currentLanguage, setCurrentLanguage] = useState<MessageLanguage>("ENGLISH");
  const [isSending, setIsSending] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [phoneNumberToConnect, setPhoneNumberToConnect] = useState("+91 98765 43210");

  const fetchData = async () => {
    try {
      const [sessionRes, callsRes, tmplsRes, msgsRes] = await Promise.all([
        fetch("/api/session"),
        fetch("/api/calls"),
        fetch("/api/templates"),
        fetch("/api/messages"),
      ]);

      if (sessionRes.ok) {
        const s = await sessionRes.json();
        setSession(s);
      }
      if (callsRes.ok) {
        const c: CallEvent[] = await callsRes.json();
        setCalls(c);
        if (!selectedCall && c.length > 0) {
          const match = initialPhone ? c.find((item) => item.phoneNumber === initialPhone) : c[0];
          const initial = match || c[0];
          setSelectedCall(initial);
          setEditorText(initial.suggestedMessage);
        }
      }
      if (tmplsRes.ok) setTemplates(await tmplsRes.json());
      if (msgsRes.ok) setMessages(await msgsRes.json());
    } catch (e) {
      // Handled
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCall = (call: CallEvent) => {
    setSelectedCall(call);
    setEditorText(call.suggestedMessage);
  };

  const handleTriggerAiGeneration = (tone: MessageTone, lang: MessageLanguage) => {
    if (!selectedCall) return;
    setCurrentTone(tone);
    setCurrentLanguage(lang);

    const result = localMessageGenerator.generate({
      businessName: "Apex Electronics",
      customerPhone: selectedCall.phoneNumber,
      customerName: selectedCall.customerName,
      missedCallTime: new Date(selectedCall.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      tone: tone,
      language: lang,
    });
    setEditorText(result.content);
  };

  const handleApplyTemplate = (template: MessageTemplate) => {
    if (!selectedCall) return;
    const rendered = renderTemplate(template.content, {
      name: selectedCall.customerName,
      phone: selectedCall.phoneNumber,
      business_name: "Apex Electronics",
      date: new Date(selectedCall.timestamp).toLocaleDateString(),
      time: new Date(selectedCall.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    });
    setEditorText(rendered);
  };

  const handleInsertTag = (tag: string) => {
    setEditorText((prev) => `${prev} ${tag}`);
  };

  const handleSendMessage = async () => {
    if (!selectedCall || !editorText.trim()) return;
    setIsSending(true);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callEventId: selectedCall.id,
          phoneNumber: selectedCall.phoneNumber,
          customerName: selectedCall.customerName,
          content: editorText.trim(),
        }),
      });

      // Update call status locally
      setSelectedCall({ ...selectedCall, whatsappStatus: "SENT" });
      fetchData();
    } catch (e) {
      // Handled
    } finally {
      setIsSending(false);
    }
  };

  const handleConnectSession = async () => {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connect", phoneNumber: phoneNumberToConnect }),
    });
    setShowQrModal(false);
    fetchData();
  };

  const handleDisconnectSession = async () => {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }),
    });
    fetchData();
  };

  // Recent messages for selected contact
  const conversationMessages = selectedCall
    ? messages.filter((m) => m.phoneNumber === selectedCall.phoneNumber)
    : [];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col gap-4">
      {/* Top Bar: Connection Status & Actions */}
      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#075E54] to-[#25D366] flex items-center justify-center text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">WhatsApp Web Dashboard</h1>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  session.status === "CONNECTED"
                    ? "bg-[#25D366]/15 text-[#25D366]"
                    : session.status === "CONNECTING"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                <Circle className="w-1.5 h-1.5 fill-current" />
                {session.status}
              </span>
            </div>
            <p className="text-xs text-[#8696A0]">
              {session.status === "CONNECTED"
                ? `Linked Session: ${formatPhoneNumber(session.number || "")}`
                : "No active browser session linked"}
            </p>
          </div>
        </div>

        <div>
          {session.status === "CONNECTED" ? (
            <button
              onClick={handleDisconnectSession}
              className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-rose-500/20 hover:text-rose-400 text-[#8696A0] text-xs font-semibold transition-colors border border-[#222E35]"
            >
              Disconnect Session
            </button>
          ) : (
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Connect WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Pane Layout */}
      {session.status !== "CONNECTED" ? (
        // DISCONNECTED STATE: QR SETUP INSTRUCTIONS
        <div className="flex-1 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#202C33] flex items-center justify-center text-[#00A884] mb-4">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">WhatsApp Web is Disconnected</h2>
          <p className="text-sm text-[#8696A0] max-w-md mb-6">
            Pair your WhatsApp account to enable browser-based conversation follow-ups directly from this dashboard.
          </p>

          <div className="max-w-md w-full bg-[#1F2C34] p-5 rounded-2xl border border-[#222E35] text-left space-y-3 mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick QR Connection Steps:
            </h3>
            <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
              <li>Open WhatsApp on your phone.</li>
              <li>Tap Settings or Menu (⋮) &gt; <strong>Linked Devices</strong>.</li>
              <li>Tap <strong>Link a Device</strong>.</li>
              <li>Point your camera to complete pairing.</li>
            </ol>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="px-6 py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-sm font-bold shadow-lg shadow-[#00A884]/20 transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Connect WhatsApp Now</span>
          </button>
        </div>
      ) : (
        // CONNECTED STATE: 2-PANE WORKBENCH
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
          {/* Left Pane: Customer Conversation List */}
          <div className="md:col-span-5 lg:col-span-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-[#222E35] flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Missed Calls Queue ({calls.length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#222E35]/50 p-2 space-y-1">
              {calls.map((call) => {
                const isSelected = selectedCall?.id === call.id;
                return (
                  <button
                    key={call.id}
                    onClick={() => handleSelectCall(call)}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#202C33] border border-[#00A884]/40"
                        : "hover:bg-[#182229] border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2A3942] flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                      {call.customerName ? call.customerName[0].toUpperCase() : <User className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-white truncate">
                          {call.customerName || formatPhoneNumber(call.phoneNumber)}
                        </span>
                        <span className="text-[10px] text-[#8696A0] shrink-0">
                          {formatRelativeTime(call.timestamp).split(",")[1] || "Today"}
                        </span>
                      </div>
                      <p className="text-xs text-[#8696A0] truncate mt-0.5">
                        {formatPhoneNumber(call.phoneNumber)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            call.whatsappStatus === "SENT"
                              ? "bg-[#25D366]/15 text-[#25D366]"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {call.whatsappStatus === "SENT" ? "Replied" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Conversation Workbench */}
          <div className="md:col-span-7 lg:col-span-8 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col overflow-hidden">
            {selectedCall ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-[#222E35] bg-[#111B21] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center text-white font-bold">
                      {selectedCall.customerName ? selectedCall.customerName[0].toUpperCase() : "C"}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {selectedCall.customerName || formatPhoneNumber(selectedCall.phoneNumber)}
                      </h3>
                      <p className="text-xs text-[#8696A0]">
                        Customer Phone: {formatPhoneNumber(selectedCall.phoneNumber)} • Missed at{" "}
                        {new Date(selectedCall.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      selectedCall.whatsappStatus === "SENT"
                        ? "bg-[#25D366]/15 text-[#25D366]"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {selectedCall.whatsappStatus === "SENT" ? "Follow-up Dispatched" : "Pending Follow-up"}
                  </span>
                </div>

                {/* Messages Feed View */}
                <div className="flex-1 p-4 overflow-y-auto bg-[#0B141A] space-y-3">
                  <div className="flex justify-center">
                    <div className="px-3 py-1 rounded-full bg-[#182229] border border-[#222E35] text-[11px] text-[#8696A0]">
                      Missed Call received on {formatRelativeTime(selectedCall.timestamp)}
                    </div>
                  </div>

                  {conversationMessages.map((m) => (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-md bg-[#005C4B] text-white p-3 rounded-2xl rounded-tr-none shadow-md space-y-1">
                        <p className="text-xs leading-relaxed">{m.content}</p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-300">
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {m.status === "DELIVERED" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                          ) : m.status === "SENT" ? (
                            <Check className="w-3.5 h-3.5 text-gray-300" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-300 animate-spin" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI-Assisted Message Generator & Variation Chips */}
                <div className="p-3 bg-[#111B21] border-t border-[#222E35] space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTriggerAiGeneration(currentTone, currentLanguage)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold shadow-sm shadow-[#00A884]/20 transition-all mr-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiGeneration("FRIENDLY", currentLanguage)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-gray-200 text-xs font-medium transition-colors border border-[#222E35]"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiGeneration("SHORT", currentLanguage)}
                      className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-gray-200 text-xs font-medium transition-colors border border-[#222E35]"
                    >
                      Shorter
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiGeneration("PROFESSIONAL", currentLanguage)}
                      className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-gray-200 text-xs font-medium transition-colors border border-[#222E35]"
                    >
                      More professional
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiGeneration(currentTone, "HINDI")}
                      className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-gray-200 text-xs font-medium transition-colors border border-[#222E35]"
                    >
                      Hindi
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerAiGeneration(currentTone, "HINGLISH")}
                      className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-gray-200 text-xs font-medium transition-colors border border-[#222E35]"
                    >
                      Hinglish
                    </button>
                  </div>

                  {/* Template Selection Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider shrink-0">
                      Templates:
                    </span>
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="px-2.5 py-0.5 rounded-lg bg-[#202C33] hover:bg-[#00A884]/20 hover:text-[#00A884] text-gray-200 text-xs font-medium whitespace-nowrap transition-colors border border-[#222E35]"
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Tags */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider shrink-0">
                      Insert Tag:
                    </span>
                    {AVAILABLE_VARIABLES.map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => handleInsertTag(v.tag)}
                        className="px-2 py-0.5 rounded bg-[#202C33] hover:bg-[#00A884]/20 text-gray-300 text-[11px] font-mono whitespace-nowrap transition-colors"
                      >
                        {v.tag}
                      </button>
                    ))}
                  </div>

                  {/* Message Editor Input */}
                  <div className="flex items-end gap-2 pt-1">
                    <textarea
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                      placeholder="Type or generate your WhatsApp follow-up reply..."
                      rows={2}
                      className="flex-1 bg-[#202C33] border border-[#222E35] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00A884] resize-none"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !editorText.trim()}
                      className="px-5 py-3 rounded-xl bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#00A884]/20 transition-all flex items-center gap-2 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSending ? "Sending..." : "Send"}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-[#8696A0]">
                Select a missed call from the left to start follow-up conversation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Connect Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#111B21] border border-[#222E35] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white text-center">
              Link WhatsApp Web Session
            </h3>

            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-inner relative">
              <QrCode className="w-36 h-36 text-[#075E54]" />
              <span className="text-[10px] text-gray-500 font-bold mt-1">Scan via WhatsApp</span>
            </div>

            <div className="space-y-2 text-xs text-gray-300 bg-[#202C33] p-4 rounded-xl border border-[#222E35]">
              <p className="font-bold text-white">Instructions:</p>
              <p>1. Open WhatsApp on your primary phone.</p>
              <p>2. Go to <strong>Linked Devices &gt; Link a Device</strong>.</p>
              <p>3. Enter your linked business number to confirm bridge:</p>
              <input
                value={phoneNumberToConnect}
                onChange={(e) => setPhoneNumberToConnect(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#111B21] border border-[#222E35] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00A884] mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 rounded-xl bg-[#202C33] text-xs font-semibold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectSession}
                className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white shadow-md shadow-[#00A884]/20"
              >
                Confirm Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatsAppPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8696A0]">Loading WhatsApp Workbench...</div>}>
      <WhatsAppWorkbenchContent />
    </Suspense>
  );
}
