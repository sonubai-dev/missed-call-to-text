import React, { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  PhoneIncoming,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  ShieldCheck,
  Send,
  MessageSquare,
  Sliders,
  Terminal,
  Activity,
  User,
  Crown,
  Ban,
  Globe,
  Clock,
  Wifi,
  Signal,
  Battery,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  CallEvent,
  Customer,
  DispatchRule,
  BusinessSettings,
  MessageTemplate,
  ChannelType,
} from "../types";
import { formatPhoneNumber, normalizePhoneNumber } from "../lib/normalizer";
import { evaluateCallRules } from "../lib/rules-engine";
import { renderTemplate } from "../lib/template-engine";

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "success" | "skipped" | "failed";
  details?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
  tag: string;
  message: string;
}

const PRESETS = [
  {
    name: "Unknown Caller",
    phone: "+91 98765 00001",
    callerName: "",
    type: "unknown",
    desc: "Cold lead / First-time caller",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    name: "VIP Saved Contact",
    phone: "+91 98765 12345",
    callerName: "Dr. Rajesh Sharma",
    type: "vip",
    desc: "Priority customer (Healthcare Corp)",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    name: "Blacklisted / Spam",
    phone: "+91 90000 00000",
    callerName: "Spam Telemarketer",
    type: "blacklisted",
    desc: "Blocked number — should be ignored",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    name: "International E.164",
    phone: "+1 (415) 555-0199",
    callerName: "Sarah Jenkins",
    type: "international",
    desc: "USA Country Code (+1) Normalization",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
];

interface SimulatorViewProps {
  customers: Customer[];
  rules: DispatchRule[];
  templates: MessageTemplate[];
  settings: BusinessSettings;
  calls: CallEvent[];
  onCallProcessed: (newCall: CallEvent, newCustomer?: Customer, autoDispatchedMessage?: string) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  customers,
  rules,
  templates,
  settings,
  calls,
  onCallProcessed,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 00001");
  const [callerName, setCallerName] = useState("");
  const [simSlot, setSimSlot] = useState<"SIM 1 (Airtel)" | "SIM 2 (Jio)">("SIM 1 (Airtel)");
  const [channelType, setChannelType] = useState<ChannelType>("WHATSAPP");
  const [ringDuration, setRingDuration] = useState(4);
  const [phoneState, setPhoneState] = useState<"IDLE" | "RINGING" | "ANSWERED" | "MISSED">("IDLE");
  const [ringingTimeRemaining, setRingingTimeRemaining] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "1",
      name: "CallScreeningService",
      description: "Detect incoming call & respond < 5s (Non-blocking)",
      status: "idle",
    },
    {
      id: "2",
      name: "Number Normalization",
      description: "E.164 format normalization & Customer lookup",
      status: "idle",
    },
    {
      id: "3",
      name: "Rule Engine Evaluation",
      description: "Priority check, working hours, caller filter & cooldown",
      status: "idle",
    },
    {
      id: "4",
      name: "Multi-Channel Dispatch",
      description: "Execute WhatsApp / SMS / Email payload",
      status: "idle",
    },
    {
      id: "5",
      name: "Room DB & Webhook Sync",
      description: "Persist activity log & sync to backend /webhooks",
      status: "idle",
    },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "l1",
      timestamp: "09:00:00",
      level: "INFO",
      tag: "TelephonyCallStateManager",
      message: "Android Telephony screening daemon listening on SIM 1 & SIM 2",
    },
  ]);

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (level: LogEntry["level"], tag: string, message: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      level,
      tag,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setPhoneNumber(preset.phone);
    setCallerName(preset.callerName);
    addLog("INFO", "Simulator", `Applied preset: ${preset.name} (${preset.phone})`);
  };

  const runSimulation = async (scenario: "MISSED" | "ANSWERED" | "REJECTED" | "RAPID_3X") => {
    if (isSimulating) return;
    setIsSimulating(true);

    if (scenario === "RAPID_3X") {
      addLog("WARN", "Simulator", "⚡ Starting 3x Rapid Consecutive Calls Test (Anti-Spam Cooldown & Deduplication)");
      for (let i = 1; i <= 3; i++) {
        addLog("INFO", "Telecom", `Call attempt #${i}/3 from ${phoneNumber}`);
        await executeCallCycle("MISSED", i > 1);
        await new Promise((r) => setTimeout(r, 600));
      }
      setIsSimulating(false);
      return;
    }

    await executeCallCycle(scenario, false);
    setIsSimulating(false);
  };

  const executeCallCycle = async (scenario: "MISSED" | "ANSWERED" | "REJECTED", isRepeat: boolean) => {
    // Reset steps
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle", details: undefined })));

    // 1. Ringing
    setPhoneState("RINGING");
    addLog("INFO", "CallScreeningService", `📞 Incoming call detected on ${simSlot} from ${phoneNumber} (${callerName || "Unknown"})`);

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "1" ? { ...s, status: "running", details: "Screening incoming call... Respond < 5s" } : s
      )
    );

    const dur = isRepeat ? 2 : ringDuration;
    for (let r = dur; r > 0; r--) {
      setRingingTimeRemaining(r);
      await new Promise((res) => setTimeout(res, 500));
    }

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "1" ? { ...s, status: "success", details: "Call passed screening without system block" } : s
      )
    );

    // 2. Scenario outcome
    if (scenario === "ANSWERED") {
      setPhoneState("ANSWERED");
      addLog("SUCCESS", "PhoneStateReceiver", "Call was ANSWERED by user. Automation cancelled (No follow-up required).");
      await new Promise((res) => setTimeout(res, 1200));
      setPhoneState("IDLE");
      return;
    }

    if (scenario === "REJECTED") {
      setPhoneState("IDLE");
      addLog("WARN", "PhoneStateReceiver", "Call was REJECTED / DISCONNECTED by user. Marked as rejected.");
      return;
    }

    // Missed Call scenario:
    setPhoneState("MISSED");
    addLog("WARN", "PhoneStateReceiver", `Call transition: RINGING -> IDLE (No answer). Registered as MISSED CALL.`);

    // Step 2: Normalization
    setSteps((prev) =>
      prev.map((s) => (s.id === "2" ? { ...s, status: "running", details: "Normalizing to E.164..." } : s))
    );
    await new Promise((r) => setTimeout(r, 400));

    const normalized = normalizePhoneNumber(phoneNumber, settings.defaultCountryCode);
    const existingCust = customers.find((c) => c.phoneNumber.replace(/\s+/g, "") === normalized.replace(/\s+/g, ""));

    addLog(
      "INFO",
      "NumberNormalizer",
      `Normalized "${phoneNumber}" -> "${normalized}". Customer match: ${
        existingCust ? `${existingCust.name} (VIP: ${existingCust.isVip})` : "New Caller"
      }`
    );

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "2"
          ? {
              ...s,
              status: "success",
              details: `Normalized: ${normalized} • ${existingCust ? existingCust.name : "New Caller"}`,
            }
          : s
      )
    );

    // Step 3: Rule Evaluation
    setSteps((prev) =>
      prev.map((s) => (s.id === "3" ? { ...s, status: "running", details: "Evaluating priority rules..." } : s))
    );
    await new Promise((r) => setTimeout(r, 400));

    const evalResult = evaluateCallRules(normalized, existingCust || null, rules, settings, calls);

    if (evalResult.isBlacklisted) {
      addLog("ERROR", "RuleEvaluator", `❌ Call from ${normalized} is BLACKLISTED. Follow-up skipped.`);
      setSteps((prev) =>
        prev.map((s) => (s.id === "3" ? { ...s, status: "failed", details: "Caller is blacklisted. Skipped." } : s))
      );
      // Persist as ignored
      const newCall: CallEvent = {
        id: `call-${Date.now()}`,
        phoneNumber: normalized,
        customerName: callerName || existingCust?.name || "Spam Robocaller",
        timestamp: Date.now(),
        status: "MISSED",
        whatsappStatus: "IGNORED",
        suggestedMessage: "Blacklisted spam caller. Follow-up blocked by CallScreeningService.",
        simSlot,
        idempotencyKey: `CALL_${Math.random().toString(36).substring(2, 10)}`,
        channelUsed: "WHATSAPP",
      };
      onCallProcessed(newCall);
      setPhoneState("IDLE");
      return;
    }

    if (evalResult.cooldownActive) {
      addLog("WARN", "RuleEvaluator", `⏳ ${evalResult.reason}. Suppressing duplicate follow-up.`);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "3" ? { ...s, status: "skipped", details: `Cooldown active. Duplicate suppressed.` } : s
        )
      );
      const newCall: CallEvent = {
        id: `call-${Date.now()}`,
        phoneNumber: normalized,
        customerName: callerName || existingCust?.name,
        timestamp: Date.now(),
        status: "MISSED",
        whatsappStatus: "SKIPPED",
        suggestedMessage: "Anti-spam cooldown active. Duplicate follow-up suppressed.",
        simSlot,
        idempotencyKey: `CALL_${Math.random().toString(36).substring(2, 10)}`,
        channelUsed: "WHATSAPP",
      };
      onCallProcessed(newCall);
      setPhoneState("IDLE");
      return;
    }

    const matchedRule = evalResult.matchedRule;
    addLog(
      "SUCCESS",
      "RuleEvaluator",
      `Rule matched: "${matchedRule ? matchedRule.name : "Default"}" (Channel: ${
        matchedRule ? matchedRule.channelType : channelType
      })`
    );

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "3"
          ? {
              ...s,
              status: "success",
              details: `Matched: ${matchedRule ? matchedRule.name : "Default"} (${evalResult.reason})`,
            }
          : s
      )
    );

    // Step 4: Dispatch
    setSteps((prev) =>
      prev.map((s) => (s.id === "4" ? { ...s, status: "running", details: "Formatting template message..." } : s))
    );
    await new Promise((r) => setTimeout(r, 400));

    const selectedTmpl =
      templates.find((t) => t.id === matchedRule?.templateId) ||
      templates.find((t) => t.isDefault) ||
      templates[0];

    const formattedMessage = renderTemplate(selectedTmpl.content, {
      name: callerName || existingCust?.name,
      business_name: settings.businessName || "Apex Electronics",
      owner_name: settings.ownerName || "Sonu Bai",
      phone: normalized,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      date: "Today",
    });

    const targetChannel = matchedRule?.channelType || channelType;
    addLog("SUCCESS", "Dispatcher", `Dispatched follow-up via ${targetChannel}: "${formattedMessage}"`);

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "4"
          ? {
              ...s,
              status: "success",
              details: `Sent via ${targetChannel}: "${formattedMessage.substring(0, 45)}..."`,
            }
          : s
      )
    );

    // Step 5: Room DB & Webhook
    setSteps((prev) =>
      prev.map((s) =>
        s.id === "5" ? { ...s, status: "running", details: "Syncing Room DB & signing webhook..." } : s
      )
    );
    await new Promise((r) => setTimeout(r, 400));

    const idempotencyKey = `CALL_${Math.random().toString(36).substring(2, 10)}`;
    addLog(
      "SUCCESS",
      "WebhookDispatcher",
      `Webhook delivered 200 OK to ${settings.webhookUrl} (X-Event-ID: ${idempotencyKey})`
    );

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "5"
          ? {
              ...s,
              status: "success",
              details: `Room DB updated. Webhook signature HMAC-SHA256 verified.`,
            }
          : s
      )
    );

    // Create call record
    const newCall: CallEvent = {
      id: `call-${Date.now()}`,
      phoneNumber: normalized,
      customerName: callerName || existingCust?.name,
      timestamp: Date.now(),
      status: "MISSED",
      whatsappStatus: evalResult.shouldDispatch ? "SENT" : "PENDING",
      suggestedMessage: formattedMessage,
      simSlot,
      idempotencyKey,
      channelUsed: targetChannel,
      rawDurationSeconds: ringDuration * 4,
    };

    onCallProcessed(newCall, undefined, evalResult.shouldDispatch ? formattedMessage : undefined);

    await new Promise((r) => setTimeout(r, 1000));
    setPhoneState("IDLE");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Telephony & Call Pipeline Simulator
          </h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Test incoming call events, E.164 normalization, rule routing, and rapid consecutive anti-spam cooldowns
          </p>
        </div>
      </div>

      {/* Main 3-Column Layout: Controls (4 cols), Phone Mockup (3 cols), Terminal (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Col (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Preset Buttons */}
          <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2.5">
            <span className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider block">
              Quick Test Presets
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${preset.color} hover:opacity-90`}
                >
                  <div>
                    <p className="font-bold">{preset.name}</p>
                    <p className="text-[10px] opacity-80 font-mono">{preset.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8696A0] mb-1">
                Incoming Caller Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8696A0] mb-1">
                Caller Name (Optional)
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="Leave blank for unknown caller"
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#8696A0] mb-1">
                  Receiver SIM Slot
                </label>
                <select
                  value={simSlot}
                  onChange={(e) => setSimSlot(e.target.value as any)}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
                >
                  <option value="SIM 1 (Airtel)">SIM 1 (Airtel)</option>
                  <option value="SIM 2 (Jio)">SIM 2 (Jio)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8696A0] mb-1">
                  Ring Duration
                </label>
                <select
                  value={ringDuration}
                  onChange={(e) => setRingDuration(parseInt(e.target.value))}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
                >
                  <option value={2}>Quick (2s)</option>
                  <option value={4}>Standard (4s)</option>
                  <option value={6}>Long (6s)</option>
                </select>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => runSimulation("MISSED")}
                disabled={isSimulating}
                className="w-full py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20 flex items-center justify-center gap-2"
              >
                <PhoneMissed className="w-4 h-4" />
                <span>Simulate Missed Call</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runSimulation("ANSWERED")}
                  disabled={isSimulating}
                  className="py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] disabled:opacity-50 text-emerald-400 text-xs font-semibold transition-all border border-[#222E35] flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Answered Call</span>
                </button>

                <button
                  onClick={() => runSimulation("REJECTED")}
                  disabled={isSimulating}
                  className="py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] disabled:opacity-50 text-rose-400 text-xs font-semibold transition-all border border-[#222E35] flex items-center justify-center gap-1.5"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Rejected Call</span>
                </button>
              </div>

              <button
                onClick={() => runSimulation("RAPID_3X")}
                disabled={isSimulating}
                className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test 3x Rapid Consecutive Calls</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Live Mobile Phone Mockup (3 cols) */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="w-[260px] h-[520px] bg-black border-4 border-[#222E35] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col p-3">
            {/* Top Speaker & Camera Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#111B21] rounded-full z-30 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
              <span className="w-8 h-1 rounded-full bg-slate-800"></span>
            </div>

            {/* Status Bar */}
            <div className="pt-3 px-3 flex items-center justify-between text-[10px] text-gray-400 font-mono z-20">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3 text-emerald-400" />
                <Wifi className="w-3 h-3 text-emerald-400" />
                <Battery className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 flex flex-col justify-between pt-6 pb-4 px-2 text-center">
              {phoneState === "RINGING" ? (
                <div className="flex-1 flex flex-col justify-between py-6 animate-pulse">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      Incoming Call ({simSlot.split(" ")[0]})
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {callerName || "Unknown Caller"}
                    </h3>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">{phoneNumber}</p>
                    <p className="text-[10px] text-amber-400 mt-2 font-mono">
                      Ringing... {ringingTimeRemaining}s
                    </p>
                  </div>

                  <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-rose-400 shadow-xl">
                    <PhoneIncoming className="w-8 h-8 animate-bounce" />
                  </div>

                  {/* Accept / Decline Action buttons */}
                  <div className="flex items-center justify-around px-2 pt-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg">
                        <PhoneOff className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] text-gray-400">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] text-gray-400">Accept</span>
                    </div>
                  </div>
                </div>
              ) : phoneState === "ANSWERED" ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                    <PhoneCall className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Call Connected</h3>
                    <p className="text-xs text-emerald-400 mt-0.5">00:04</p>
                  </div>
                </div>
              ) : phoneState === "MISSED" ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400">
                    <PhoneMissed className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-400">Missed Call</h3>
                    <p className="text-xs text-white font-mono mt-0.5">{phoneNumber}</p>
                    <p className="text-[10px] text-[#8696A0] mt-1">Processing Automation...</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#111B21] border border-[#222E35] flex items-center justify-center text-[#8696A0]">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Device Idle</h3>
                    <p className="text-[10px] text-[#8696A0]">SIM 1: Airtel 5G • SIM 2: Jio</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] font-semibold">
                    CallScreening Ready
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-24 h-1 bg-gray-600 rounded-full mx-auto my-1"></div>
          </div>
        </div>

        {/* Right: Pipeline Steps & Logs Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Step Tracer */}
          <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2.5">
            <span className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider block">
              Telephony Execution Pipeline
            </span>

            <div className="space-y-2">
              {steps.map((st) => (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-xl border text-xs transition-colors flex items-start justify-between gap-2 ${
                    st.status === "running"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : st.status === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : st.status === "failed"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : st.status === "skipped"
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                      : "bg-[#202C33]/50 border-[#222E35]/60 text-[#8696A0]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-[11px]">{st.name}</span>
                      {st.status === "running" && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-[10px] opacity-80 mt-0.5">{st.details || st.description}</p>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase shrink-0">
                    {st.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logs Terminal */}
          <div className="rounded-2xl bg-[#090D10] border border-[#222E35] overflow-hidden flex flex-col h-56">
            <div className="px-3.5 py-2 bg-[#111B21] border-b border-[#222E35] flex items-center justify-between text-xs font-mono text-[#8696A0]">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live Telephony Log
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>

            <div
              ref={logRef}
              className="p-3 font-mono text-[10px] overflow-y-auto flex-1 space-y-1.5 leading-relaxed"
            >
              {logs.map((l) => (
                <div key={l.id} className="flex gap-2 items-start">
                  <span className="text-gray-500 shrink-0">{l.timestamp}</span>
                  <span
                    className={`font-bold shrink-0 ${
                      l.level === "INFO"
                        ? "text-sky-400"
                        : l.level === "SUCCESS"
                        ? "text-emerald-400"
                        : l.level === "WARN"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    [{l.tag}]
                  </span>
                  <span className="text-gray-300 break-all">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
