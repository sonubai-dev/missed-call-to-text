import React, { useState } from "react";
import {
  Smartphone,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Radio,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { MessageRecord, BusinessSettings } from "../types";
import { formatPhoneNumber, formatRelativeTime, calculateSmsSegments } from "../lib/normalizer";

interface SmsHistoryViewProps {
  messages: MessageRecord[];
  settings: BusinessSettings;
  onSendSms: (sms: { phoneNumber: string; content: string; simSlot: string }) => void;
}

export const SmsHistoryView: React.FC<SmsHistoryViewProps> = ({
  messages,
  settings,
  onSendSms,
}) => {
  const [recipient, setRecipient] = useState("+91 98765 12345");
  const [smsText, setSmsText] = useState(
    `Hi, we missed your call to ${settings.businessName || "Apex Electronics"}. Please reply here or visit us today!`
  );
  const [selectedSim, setSelectedSim] = useState<string>(
    settings.defaultSmsSim || "SIM 1 (Airtel)"
  );
  const [isSending, setIsSending] = useState(false);

  const calc = calculateSmsSegments(smsText);

  const smsLogs = messages.filter(
    (m) => m.channel === "SMS" || (m.mode ? m.mode.startsWith("SMS") : false)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsText.trim() || !recipient.trim()) return;

    setIsSending(true);
    onSendSms({
      phoneNumber: recipient.trim(),
      content: smsText.trim(),
      simSlot: selectedSim,
    });

    setTimeout(() => {
      setIsSending(false);
      setSmsText("");
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Native SMS & Multi-SIM Manager
          </h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Send carrier SMS follow-ups using your Android phone SIM card with dual-slot management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: SMS Composer & SIM Selector (1 col) */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222E35]">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Outbound SMS Radio Config</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Preferred SIM Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-2">
                Active Android SIM Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["SIM 1 (Airtel)", "SIM 2 (Jio)"] as const).map((sim) => (
                  <button
                    key={sim}
                    type="button"
                    onClick={() => setSelectedSim(sim)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      selectedSim === sim
                        ? "bg-sky-500/20 border-sky-500 text-sky-300"
                        : "bg-[#202C33] border-[#222E35] text-[#8696A0] hover:text-white"
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{sim}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Recipient Phone Number (E.164)
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#8696A0]">SMS Text</label>
                <span className="text-[11px] font-mono text-sky-400">
                  {calc.charCount} chars • {calc.segments} segment{calc.segments > 1 ? "s" : ""}
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Enter SMS content..."
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Segment calculation pill */}
            <div className="p-3 rounded-xl bg-[#202C33]/70 border border-[#222E35] text-[11px] text-[#8696A0] space-y-1">
              <div className="flex justify-between">
                <span>Encoding:</span>
                <span className="font-mono text-white">
                  {calc.isUnicode ? "Unicode (UCS-2)" : "Standard GSM-7"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining in segment:</span>
                <span className="font-mono text-white">{calc.remainingInSegment}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Carrier SMS Cost:</span>
                <span className="font-mono text-emerald-400">₹0.00 (Carrier Plan)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || !smsText.trim()}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-sky-900/30 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? "Transmitting via Carrier..." : "Send via Carrier SIM"}</span>
            </button>
          </form>
        </div>

        {/* Right col: SMS Dispatch Log (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#222E35] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Sent SMS Log ({smsLogs.length})</h3>
            <span className="text-xs text-[#8696A0]">Telephony Carrier Network</span>
          </div>

          <div className="divide-y divide-[#222E35]/60 flex-1 overflow-y-auto">
            {smsLogs.map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-[#182229]/40 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {msg.customerName || formatPhoneNumber(msg.phoneNumber)}
                    </span>
                    <span className="text-[#8696A0] font-mono">
                      {formatPhoneNumber(msg.phoneNumber)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#202C33] text-sky-400 font-mono">
                      {msg.simSlot || "SIM 1 (Airtel)"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>{msg.status}</span>
                  </span>
                </div>

                <p className="text-xs text-gray-300 bg-[#202C33]/60 p-2.5 rounded-xl border border-[#222E35]/40 leading-relaxed">
                  {msg.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#8696A0]">
                  <span>Sent via Android Telephony Manager</span>
                  <span>{formatRelativeTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {smsLogs.length === 0 && (
              <div className="py-16 text-center text-[#8696A0]">
                <Smartphone className="w-12 h-12 text-[#8696A0] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-white text-sm">No Native SMS Sent Yet</p>
                <p className="text-xs mt-1">Compose a message on the left or trigger an auto-rule.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
