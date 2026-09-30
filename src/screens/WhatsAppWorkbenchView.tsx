import React, { useState } from "react";
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
  Search,
  MessageSquare,
  ShieldCheck,
  FileText,
} from "lucide-react";
import {
  CallEvent,
  MessageRecord,
  MessageTemplate,
  WhatsAppConnectionStatus,
  BusinessSettings,
} from "../types";
import { formatPhoneNumber, formatRelativeTime, formatDateTime } from "../lib/normalizer";
import { AVAILABLE_VARIABLES, renderTemplate } from "../lib/template-engine";
import { localMessageGenerator, MessageTone, MessageLanguage } from "../lib/ai-generator";

interface WhatsAppWorkbenchViewProps {
  calls: CallEvent[];
  messages: MessageRecord[];
  templates: MessageTemplate[];
  sessionStatus: WhatsAppConnectionStatus;
  linkedNumber?: string;
  settings: BusinessSettings;
  onSendMessage: (payload: {
    callEventId?: string;
    phoneNumber: string;
    customerName?: string;
    content: string;
  }) => void;
  onOpenQrModal: () => void;
  onDisconnectSession: () => void;
  initialSelectedPhone?: string;
}

export const WhatsAppWorkbenchView: React.FC<WhatsAppWorkbenchViewProps> = ({
  calls,
  messages,
  templates,
  sessionStatus,
  linkedNumber,
  settings,
  onSendMessage,
  onOpenQrModal,
  onDisconnectSession,
  initialSelectedPhone,
}) => {
  // Find or default selected call
  const [selectedPhone, setSelectedPhone] = useState<string>(
    initialSelectedPhone || (calls.length > 0 ? calls[0].phoneNumber : "+91 98765 12345")
  );

  const selectedCall = calls.find((c) => c.phoneNumber === selectedPhone) || calls[0];

  const [editorText, setEditorText] = useState(selectedCall?.suggestedMessage || "");
  const [currentTone, setCurrentTone] = useState<MessageTone>("FRIENDLY");
  const [currentLanguage, setCurrentLanguage] = useState<MessageLanguage>("ENGLISH");
  const [isSending, setIsSending] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  const handleSelectContact = (call: CallEvent) => {
    setSelectedPhone(call.phoneNumber);
    setEditorText(call.suggestedMessage);
  };

  const handleTriggerAiGeneration = (tone: MessageTone, lang: MessageLanguage) => {
    if (!selectedCall) return;
    setCurrentTone(tone);
    setCurrentLanguage(lang);

    const result = localMessageGenerator.generate({
      businessName: settings.businessName || "Apex Electronics",
      customerPhone: selectedCall.phoneNumber,
      customerName: selectedCall.customerName,
      missedCallTime: new Date(selectedCall.timestamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      tone,
      language: lang,
    });
    setEditorText(result.content);
  };

  const handleApplyTemplate = (template: MessageTemplate) => {
    if (!selectedCall) return;
    const rendered = renderTemplate(template.content, {
      name: selectedCall.customerName,
      phone: selectedCall.phoneNumber,
      business_name: settings.businessName || "Apex Electronics",
      owner_name: settings.ownerName || "Sonu Bai",
      date: "Today",
      time: new Date(selectedCall.timestamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
    setEditorText(rendered);
  };

  const handleInsertTag = (tag: string) => {
    setEditorText((prev) => `${prev} ${tag}`);
  };

  const handleSend = () => {
    if (!editorText.trim() || !selectedCall) return;
    setIsSending(true);

    onSendMessage({
      callEventId: selectedCall.id,
      phoneNumber: selectedCall.phoneNumber,
      customerName: selectedCall.customerName,
      content: editorText.trim(),
    });

    setTimeout(() => {
      setIsSending(false);
    }, 600);
  };

  const conversationMessages = messages.filter(
    (m) => m.phoneNumber === selectedPhone && (m.channel === "WHATSAPP" || m.mode.includes("WHATSAPP"))
  );

  const filteredCalls = calls.filter(
    (c) =>
      c.phoneNumber.includes(contactSearch) ||
      (c.customerName && c.customerName.toLowerCase().includes(contactSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-7.5rem)] flex flex-col gap-4">
      {/* Top Session Bar */}
      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#075E54] to-[#25D366] flex items-center justify-center text-white shadow-md shadow-[#25D366]/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">WhatsApp Web Workbench</h1>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  sessionStatus === "CONNECTED"
                    ? "bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30"
                    : sessionStatus === "CONNECTING"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                <Circle className="w-1.5 h-1.5 fill-current" />
                {sessionStatus}
              </span>
            </div>
            <p className="text-xs text-[#8696A0]">
              {sessionStatus === "CONNECTED"
                ? `Linked Session: ${linkedNumber || "+91 98765 43210"} (Web Bridge Active)`
                : "No active browser session linked. Scan QR code to connect."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessionStatus === "CONNECTED" ? (
            <button
              onClick={onDisconnectSession}
              className="px-3.5 py-1.5 rounded-xl bg-[#202C33] hover:bg-rose-500/20 text-[#8696A0] hover:text-rose-400 text-xs font-semibold transition-colors"
            >
              Disconnect Session
            </button>
          ) : (
            <button
              onClick={onOpenQrModal}
              className="px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Link Device via QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Chat & Workbench Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Col: Contact list (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#222E35]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search callers..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#222E35]/60">
            {filteredCalls.map((call) => {
              const isSelected = call.phoneNumber === selectedPhone;
              return (
                <div
                  key={call.id}
                  onClick={() => handleSelectContact(call)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                    isSelected ? "bg-[#202C33]" : "hover:bg-[#182229]/60"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#00A884]/20 border border-[#00A884]/40 flex items-center justify-center text-[#00A884] font-bold text-xs shrink-0 mt-0.5">
                    {(call.customerName || "U").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-white truncate">
                        {call.customerName || formatPhoneNumber(call.phoneNumber)}
                      </span>
                      <span className="text-[10px] text-[#8696A0] shrink-0 font-mono">
                        {formatRelativeTime(call.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8696A0] font-mono">
                      {formatPhoneNumber(call.phoneNumber)}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-1">
                      {call.suggestedMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Chat & AI Composer (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-[#222E35] bg-[#182229]/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00A884]/20 border border-[#00A884]/40 flex items-center justify-center text-[#00A884] font-bold text-xs">
                {(selectedCall?.customerName || "U").charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {selectedCall?.customerName || formatPhoneNumber(selectedCall?.phoneNumber || "")}
                </p>
                <p className="text-[10px] text-[#8696A0] font-mono">
                  {formatPhoneNumber(selectedCall?.phoneNumber || "")} • Mode: {settings.whatsAppSendingMode}
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                selectedCall?.whatsappStatus === "SENT"
                  ? "bg-[#25D366]/20 text-[#25D366]"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {selectedCall?.whatsappStatus || "PENDING"}
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B141A] bg-opacity-70">
            {/* System Info Banner */}
            <div className="text-center my-2">
              <span className="text-[10px] px-3 py-1 rounded-full bg-[#182229] text-[#8696A0] border border-[#222E35]">
                🔒 End-to-end encrypted • Automated Follow-up Bridge
              </span>
            </div>

            {conversationMessages.map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-md bg-[#005C4B] rounded-2xl rounded-tr-none p-3 shadow-md border border-[#005c4b]/50 text-white space-y-1">
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-teal-200 font-mono">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.status === "DELIVERED" ? (
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                    ) : msg.status === "SENT" ? (
                      <Check className="w-3.5 h-3.5 text-teal-200" />
                    ) : (
                      <Clock className="w-3 h-3 text-teal-200" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {conversationMessages.length === 0 && (
              <div className="py-12 text-center text-[#8696A0] text-xs">
                No previous messages with this number. Craft your reply below.
              </div>
            )}
          </div>

          {/* AI Generator & Quick Templates Toolbar */}
          <div className="p-3 border-t border-[#222E35] bg-[#111B21] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Tone Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-[10px] font-bold text-[#8696A0] uppercase mr-1">
                  AI Tone:
                </span>
                {(["FRIENDLY", "PROFESSIONAL", "URGENT", "CONCISE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTriggerAiGeneration(t, currentLanguage)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      currentTone === t
                        ? "bg-[#00A884] text-white"
                        : "bg-[#202C33] text-[#8696A0] hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-[#8696A0] uppercase mr-1">Lang:</span>
                {(["ENGLISH", "HINDI", "SPANISH"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleTriggerAiGeneration(currentTone, lang)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      currentLanguage === lang
                        ? "bg-[#25D366] text-slate-900"
                        : "bg-[#202C33] text-[#8696A0] hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Template Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-[10px] font-bold text-[#8696A0] uppercase mr-1">
                Templates:
              </span>
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-2 py-0.5 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-gray-300 hover:text-white border border-[#222E35] whitespace-nowrap text-[11px]"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Dynamic Tags */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
              <span className="text-[#8696A0] font-mono mr-1">Insert:</span>
              {AVAILABLE_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertTag(v.tag)}
                  className="px-1.5 py-0.5 rounded bg-[#202C33] hover:bg-[#00A884]/20 hover:text-[#00A884] text-gray-300 border border-[#222E35] font-mono"
                >
                  {v.tag}
                </button>
              ))}
            </div>

            {/* Composer Input Area */}
            <div className="flex items-end gap-2 pt-1">
              <textarea
                rows={2}
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                placeholder="Type a message or use AI buttons above..."
                className="flex-1 bg-[#202C33] border border-[#222E35] rounded-xl p-2.5 text-xs text-white placeholder-[#8696A0] focus:outline-none focus:border-[#00A884]"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !editorText.trim()}
                className="p-3 rounded-xl bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-50 text-white transition-all shadow-md shadow-[#00A884]/20"
                title="Send message"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
