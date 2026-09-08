"use client";

import { useState, useEffect, useRef } from "react";
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
  Mail,
  Sliders,
  Terminal,
  Activity,
  User,
  Crown,
  Ban,
  Globe,
  Flame,
  Volume2,
  Clock,
  Wifi,
  Signal,
  Battery,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "success" | "skipped" | "failed";
  details?: string;
  timestamp?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR" | "DEBUG";
  tag: string;
  message: string;
  payload?: any;
}

const PRESETS = [
  {
    name: "Unknown Caller",
    phone: "+91 98765 00001",
    callerName: "",
    type: "unknown",
    icon: PhoneIncoming,
    desc: "Cold lead / First-time caller",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    name: "VIP Saved Contact",
    phone: "+91 98765 12345",
    callerName: "Dr. Rajesh Sharma",
    type: "vip",
    icon: Crown,
    desc: "Priority customer (Healthcare Corp)",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    name: "Blacklisted / Spam",
    phone: "+91 90000 00000",
    callerName: "Spam Telemarketer",
    type: "blacklisted",
    icon: Ban,
    desc: "Blocked number — should be ignored",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    name: "International E.164",
    phone: "+1 (415) 555-0199",
    callerName: "Sarah Jenkins",
    type: "international",
    icon: Globe,
    desc: "USA Country Code (+1) Normalization",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
];

export default function SimulatorPage() {
  // Simulator State
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 00001");
  const [callerName, setCallerName] = useState("");
  const [simSlot, setSimSlot] = useState<"SIM 1 (Airtel)" | "SIM 2 (Jio)">("SIM 1 (Airtel)");
  const [channelType, setChannelType] = useState<"WHATSAPP" | "SMS" | "EMAIL">("WHATSAPP");
  const [ringDuration, setRingDuration] = useState(4);
  const [isInsideHours, setIsInsideHours] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(0);

  // Phone Mockup States
  const [phoneState, setPhoneState] = useState<"IDLE" | "RINGING" | "ANSWERED" | "MISSED">("IDLE");
  const [phoneScreenView, setPhoneScreenView] = useState<"CALL_SCREEN" | "APP_VIEW" | "NOTIFICATIONS">("CALL_SCREEN");
  const [ringingTimeRemaining, setRingingTimeRemaining] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [notification, setNotification] = useState<{ title: string; message: string; channel: string } | null>(null);

  // Live Pipeline & Logs
  const [isSimulating, setIsSimulating] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: "1", name: "CallScreeningService", description: "Detect incoming call & respond < 5s (Non-blocking)", status: "idle" },
    { id: "2", name: "Number Normalization", description: "E.164 format normalization & Customer lookup", status: "idle" },
    { id: "3", name: "Rule Engine Evaluation", description: "Priority check, working hours, caller filter & cooldown", status: "idle" },
    { id: "4", name: "Multi-Channel Dispatch", description: "Execute WhatsApp / SMS / Email payload", status: "idle" },
    { id: "5", name: "Room DB & Webhook Sync", description: "Persist activity log & sync to backend /webhooks", status: "idle" },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Clock for phone mockup
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll log terminal
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (level: LogEntry["level"], tag: string, message: string, payload?: any) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      level,
      tag,
      message,
      payload,
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
    setPhoneScreenView("CALL_SCREEN");
    setNotification(null);

    // Reset steps
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle", details: undefined })));

    if (scenario === "RAPID_3X") {
      addLog("WARN", "Simulator", "⚡ Starting 3x Rapid Consecutive Calls Test (Deduplication & Anti-Spam Cooldown)");
      for (let i = 1; i <= 3; i++) {
        addLog("INFO", "Telecom", `Incoming Call Attempt #${i}/3 from ${phoneNumber}`);
        await executeSingleCallCycle("MISSED", i > 1);
        await new Promise((r) => setTimeout(r, 600));
      }
      setIsSimulating(false);
      return;
    }

    await executeSingleCallCycle(scenario, false);
    setIsSimulating(false);
  };

  const executeSingleCallCycle = async (scenario: "MISSED" | "ANSWERED" | "REJECTED", isRepeat: boolean) => {
    // 1. Ringing Phase
    setPhoneState("RINGING");
    addLog("INFO", "CallScreeningService", `📞 Incoming call detected on ${simSlot} from ${phoneNumber} (${callerName || "Unknown"})`);

    // Update Step 1
    setSteps((prev) =>
      prev.map((s) => (s.id === "1" ? { ...s, status: "running", details: "CallScreeningService screening call... Respond < 5s" } : s))
    );

    // Simulate ring duration countdown
    const duration = isRepeat ? 2 : ringDuration;
    for (let r = duration; r > 0; r--) {
      setRingingTimeRemaining(r);
      await new Promise((res) => setTimeout(res, 600));
    }

    // Step 1 Success
    setSteps((prev) =>
      prev.map((s) => (s.id === "1" ? { ...s, status: "success", details: "CallScreeningResponse.allowCall() sent within 42ms" } : s))
    );
    addLog("SUCCESS", "Telecom", `CallScreeningService responded immediately: NEVER blocked, allowed ringthrough.`);

    // 2. Call State Transition
    if (scenario === "ANSWERED") {
      setPhoneState("ANSWERED");
      addLog("INFO", "PhoneStateReceiver", `Call was ANSWERED by user. Total ring time: ${duration}s. Marking CallStatus = ANSWERED.`);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "2"
            ? { ...s, status: "success", details: "Logged as ANSWERED" }
            : { ...s, status: "skipped", details: "No follow-up triggered for answered call" }
        )
      );
      await new Promise((res) => setTimeout(res, 1200));
      setPhoneState("IDLE");
      return;
    }

    if (scenario === "REJECTED") {
      setPhoneState("MISSED");
      addLog("INFO", "PhoneStateReceiver", `Call was DECLINED/REJECTED by user. Marking CallStatus = REJECTED.`);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "2"
            ? { ...s, status: "success", details: "Logged as REJECTED" }
            : { ...s, status: "skipped", details: "No auto-reply configured for rejected call" }
        )
      );
      await new Promise((res) => setTimeout(res, 1200));
      setPhoneState("IDLE");
      return;
    }

    // Missed Call Scenario
    setPhoneState("MISSED");
    addLog("WARN", "CallEventPipeline", `Call ended without answer -> Classified as MISSED CALL event.`);

    // Step 2: Normalization & Customer lookup
    setSteps((prev) =>
      prev.map((s) => (s.id === "2" ? { ...s, status: "running", details: "Normalizing number to E.164 format..." } : s))
    );
    await new Promise((r) => setTimeout(r, 400));

    const normalized = phoneNumber.replace(/[^+\d]/g, "");
    const isBlacklisted = phoneNumber.includes("90000");
    const isVip = callerName.includes("Rajesh");

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "2"
          ? {
              ...s,
              status: "success",
              details: `Normalized: ${normalized} | Customer: ${callerName || "New Unknown Lead"} ${isVip ? "👑 VIP" : ""}`,
            }
          : s
      )
    );
    addLog("SUCCESS", "NumberNormalizer", `E.164 Normalized: '${normalized}' (Country: ${normalized.startsWith("+1") ? "US" : "IN"})`);

    if (isBlacklisted) {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "3"
            ? { ...s, status: "failed", details: "Caller is on Blacklist. Automated reply halted." }
            : s.id === "4" || s.id === "5"
            ? { ...s, status: "skipped", details: "Blacklisted number filtered" }
            : s
        )
      );
      addLog("ERROR", "RuleEngine", `🚫 Blacklisted caller detected (${normalized}). Action: Suppress auto-reply.`);
      await new Promise((res) => setTimeout(res, 1000));
      setPhoneState("IDLE");
      return;
    }

    // Step 3: Rule Evaluation
    setSteps((prev) =>
      prev.map((s) => (s.id === "3" ? { ...s, status: "running", details: "Evaluating active priority dispatch rules..." } : s))
    );
    await new Promise((r) => setTimeout(r, 450));

    if (isRepeat) {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "3"
            ? { ...s, status: "skipped", details: "Active 60-min cooldown in effect for this recipient. Skipped duplicate." }
            : s.id === "4" || s.id === "5"
            ? { ...s, status: "skipped", details: "Cooldown protection active" }
            : s
        )
      );
      addLog("WARN", "RuleEngine", `⏳ Anti-Spam Cooldown active for ${normalized} (Last reply sent < 60 mins ago). Skipping duplicate.`);
      await new Promise((res) => setTimeout(res, 800));
      setPhoneState("IDLE");
      return;
    }

    if (!isInsideHours) {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "3"
            ? { ...s, status: "skipped", details: "Outside working hours window (09:00 - 19:00). Scheduled for morning." }
            : s
        )
      );
      addLog("INFO", "RuleEngine", `🌙 Call arrived outside configured working hours. Reason: Outside schedule.`);
    } else {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "3"
            ? {
                ...s,
                status: "success",
                details: `Matched Rule: 'High Priority ${channelType}' (Priority: 10, Delay: ${delaySeconds}s)`,
              }
            : s
        )
      );
      addLog("SUCCESS", "RuleEngine", `Matched Rule #1 -> Target Channel: ${channelType} | Delay: ${delaySeconds}s`);
    }

    // Step 4: Multi-Channel Dispatch
    setSteps((prev) =>
      prev.map((s) => (s.id === "4" ? { ...s, status: "running", details: `Dispatching payload via ${channelType}...` } : s))
    );
    await new Promise((r) => setTimeout(r, 600));

    const replyMsg = callerName
      ? `Hi ${callerName}, thanks for contacting Apex Electronics. Sorry we missed your call. How can we assist you today?`
      : `Hi! We noticed that you called Apex Electronics. Sorry we missed your call. Please message us here and our team will get back to you shortly.`;

    setSteps((prev) =>
      prev.map((s) =>
        s.id === "4"
          ? {
              ...s,
              status: "success",
              details: `Dispatched via ${channelType} to ${normalized} (Status: SENT 200 OK)`,
            }
          : s
      )
    );
    addLog("SUCCESS", `Dispatcher:${channelType}`, `Message successfully sent to ${normalized}`, {
      channel: channelType,
      recipient: normalized,
      content: replyMsg,
      simSlot: simSlot,
      status: "SENT",
    });

    // Step 5: Room DB & Backend Webhook Sync
    setSteps((prev) =>
      prev.map((s) => (s.id === "5" ? { ...s, status: "running", details: "Posting to Room DB & Backend Webhook..." } : s))
    );

    try {
      // Post to Dashboard Store API
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: normalized,
          callerName: callerName || "Unknown Caller",
          timestamp: Date.now(),
          direction: "INCOMING",
          status: "MISSED",
          source: "CALL_SCREENING",
          processed: true,
          whatsappStatus: "SENT",
        }),
      });

      // Also record message in Dashboard Store
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: normalized,
          customerName: callerName || "Unknown Caller",
          content: replyMsg,
          direction: "OUTBOUND",
          status: "SENT",
          timestamp: Date.now(),
        }),
      });

      // Trigger Webhook on Backend API (localhost:4000)
      try {
        await fetch("http://localhost:4000/api/v1/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: normalized,
            customer_name: callerName || "Unknown Caller",
            call_direction: "INCOMING",
            call_status: "MISSED",
            source: "CALL_SCREENING_SIMULATOR",
            timestamp: Date.now(),
          }),
        });
      } catch (e) {
        // Backend ping
      }

      setSteps((prev) =>
        prev.map((s) =>
          s.id === "5"
            ? { ...s, status: "success", details: "Committed to SQLite/Room DB & synced with Backend API (localhost:4000)" }
            : s
        )
      );
      addLog("SUCCESS", "SyncEngine", `Event recorded in Room DB and posted to http://localhost:4000/api/v1/calls`);
    } catch (err: any) {
      setSteps((prev) =>
        prev.map((s) => (s.id === "5" ? { ...s, status: "success", details: "Saved to local activity log" } : s))
      );
    }

    // Set Android Notification on phone mockup
    setNotification({
      title: `CallBridge • ${channelType} Sent`,
      message: `Auto-replied to ${callerName || normalized}: "${replyMsg.slice(0, 45)}..."`,
      channel: channelType,
    });

    await new Promise((res) => setTimeout(res, 800));
    setPhoneState("IDLE");
  };

  return (
    <div className="min-h-screen bg-[#0B141A] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-[#222E35] bg-[#111B21] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00A884] to-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">Android App Testing Simulator</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30">
                Telecom Sandbox
              </span>
            </div>
            <p className="text-xs text-[#8696A0]">
              Simulate real Android incoming calls, Telecom CallScreeningService, rule evaluations, and multi-channel dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#222E35] text-[#8696A0] hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Logs
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Android Smartphone Mockup (Col 4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-start">
          <div className="w-full max-w-[340px] aspect-[9/18.5] bg-[#000000] rounded-[44px] p-3 shadow-2xl shadow-black/80 border-[5px] border-[#2A3942] relative flex flex-col overflow-hidden">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#2A3942] rounded-b-xl z-30 flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black/80 border border-white/10" />
              <div className="w-8 h-1 bg-black/60 rounded-full" />
            </div>

            {/* Android Status Bar */}
            <div className="w-full pt-1 pb-2 px-4 flex items-center justify-between text-[11px] font-semibold text-gray-300 z-20">
              <span>{currentTime}</span>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-[9px] px-1 py-0.2 bg-[#222E35] rounded text-[#00A884] font-bold">
                  {simSlot.includes("SIM 1") ? "SIM1" : "SIM2"}
                </span>
                <Wifi className="w-3 h-3" />
                <Signal className="w-3 h-3" />
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen View Switcher Pill */}
            <div className="px-2 pb-2 z-20 flex justify-center gap-1">
              <button
                onClick={() => setPhoneScreenView("CALL_SCREEN")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                  phoneScreenView === "CALL_SCREEN" ? "bg-[#00A884] text-white" : "bg-[#1F2C34] text-gray-400"
                }`}
              >
                Inbound Call UI
              </button>
              <button
                onClick={() => setPhoneScreenView("APP_VIEW")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                  phoneScreenView === "APP_VIEW" ? "bg-[#00A884] text-white" : "bg-[#1F2C34] text-gray-400"
                }`}
              >
                CallBridge App UI
              </button>
            </div>

            {/* Screen Content */}
            <div className="flex-1 bg-[#111B21] rounded-[32px] overflow-hidden flex flex-col relative border border-[#222E35]/40">
              {/* Notification Overlay if any */}
              {notification && (
                <div className="absolute top-2 left-2 right-2 bg-[#202C33] border border-[#00A884]/40 rounded-2xl p-2.5 shadow-xl z-40 animate-bounce">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-[#00A884] flex items-center justify-center text-white text-[9px] font-black">
                      CB
                    </div>
                    <span className="text-[11px] font-bold text-[#00A884]">{notification.title}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">Just now</span>
                  </div>
                  <p className="text-[10px] text-gray-200 line-clamp-2">{notification.message}</p>
                </div>
              )}

              {/* View 1: Incoming / Ringing Screen */}
              {phoneScreenView === "CALL_SCREEN" ? (
                <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#1F2C34] via-[#111B21] to-[#0B141A]">
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] text-[10px] font-semibold border border-[#00A884]/30 mb-4">
                      <ShieldCheck className="w-3 h-3" />
                      Telecom CallScreening Active
                    </div>

                    <div className="relative mb-3 flex justify-center">
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-tr from-[#00A884] to-[#25D366] flex items-center justify-center text-white text-2xl font-bold shadow-xl ${
                          phoneState === "RINGING" ? "animate-ping" : ""
                        }`}
                      >
                        {callerName ? callerName.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                      </div>
                    </div>

                    <h2 className="text-base font-bold text-white tracking-wide">
                      {callerName || "Unknown Caller"}
                    </h2>
                    <p className="text-xs text-[#8696A0] font-mono mt-0.5">{phoneNumber}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{simSlot}</p>

                    {phoneState === "RINGING" && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold animate-pulse">
                        <Volume2 className="w-4 h-4" />
                        Ringing ({ringingTimeRemaining}s)...
                      </div>
                    )}

                    {phoneState === "MISSED" && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                        <PhoneMissed className="w-4 h-4" />
                        Missed Call Detected
                      </div>
                    )}
                  </div>

                  {/* Call Action Buttons */}
                  <div className="w-full flex items-center justify-around mb-4">
                    <button
                      onClick={() => runSimulation("REJECTED")}
                      disabled={isSimulating}
                      className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 flex flex-col items-center justify-center text-white shadow-lg shadow-rose-500/30 transition disabled:opacity-50"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => runSimulation("ANSWERED")}
                      disabled={isSimulating}
                      className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition disabled:opacity-50"
                    >
                      <PhoneCall className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                /* View 2: CallBridge App UI View */
                <div className="flex-1 flex flex-col bg-[#111B21] p-3 text-xs overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-[#222E35]">
                    <div>
                      <h3 className="font-bold text-white text-sm">CallBridge</h3>
                      <p className="text-[10px] text-[#00A884]">Engine Online • SIM Ready</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00A884] animate-pulse" />
                  </div>

                  {/* Dashboard Metrics */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="bg-[#1F2C34] p-2 rounded-xl border border-[#222E35]">
                      <span className="text-[10px] text-[#8696A0]">Missed Calls</span>
                      <p className="text-base font-bold text-white">12</p>
                    </div>
                    <div className="bg-[#1F2C34] p-2 rounded-xl border border-[#222E35]">
                      <span className="text-[10px] text-[#8696A0]">Auto Replies</span>
                      <p className="text-base font-bold text-[#00A884]">11 Sent</p>
                    </div>
                  </div>

                  <h4 className="text-[11px] font-bold text-gray-300 mb-1.5">Recent Activity</h4>
                  <div className="space-y-1.5 flex-1 overflow-y-auto">
                    <div className="bg-[#1F2C34] p-2 rounded-xl border border-[#222E35]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{callerName || phoneNumber}</span>
                        <span className="text-[9px] text-[#00A884] font-bold">AUTO-SENT</span>
                      </div>
                      <p className="text-[10px] text-[#8696A0] truncate">
                        Hi, sorry we missed your call from Apex Electronics...
                      </p>
                    </div>
                    <div className="bg-[#1F2C34] p-2 rounded-xl border border-[#222E35]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">+91 98111 22334</span>
                        <span className="text-[9px] text-[#00A884] font-bold">AUTO-SENT</span>
                      </div>
                      <p className="text-[10px] text-[#8696A0] truncate">
                        Hi Pooja, we noticed that you called...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Android Nav Bar */}
            <div className="w-full py-2 flex justify-center">
              <div className="w-24 h-1 bg-gray-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Center/Right Columns: Test Control Deck & Live Pipeline (Col 8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Preset Scenario Cards */}
          <div className="bg-[#111B21] border border-[#222E35] rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8696A0] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00A884]" />
              Quick Test Presets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = phoneNumber === preset.phone;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all ${preset.color} ${
                      isSelected ? "ring-2 ring-[#00A884] scale-[1.02]" : "hover:bg-[#1F2C34]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold font-mono">{preset.type}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                    <p className="text-[10px] text-[#8696A0] truncate">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Scenario Form & Action Deck */}
          <div className="bg-[#111B21] border border-[#222E35] rounded-2xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1.5">Caller Phone Number (E.164)</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#1F2C34] border border-[#222E35] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00A884]"
                />
              </div>

              {/* Caller Name Input */}
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1.5">Caller Name (Empty = Unknown)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-[#1F2C34] border border-[#222E35] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              {/* SIM Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1.5">Carrier Dual-SIM Slot</label>
                <select
                  value={simSlot}
                  onChange={(e: any) => setSimSlot(e.target.value)}
                  className="w-full bg-[#1F2C34] border border-[#222E35] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
                >
                  <option value="SIM 1 (Airtel)">SIM 1 (Airtel) — Primary</option>
                  <option value="SIM 2 (Jio)">SIM 2 (Jio) — Secondary</option>
                </select>
              </div>

              {/* Dispatch Channel */}
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1.5">Auto-Reply Dispatch Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannelType("WHATSAPP")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      channelType === "WHATSAPP"
                        ? "bg-[#00A884]/20 border-[#00A884] text-[#00A884]"
                        : "bg-[#1F2C34] border-[#222E35] text-[#8696A0]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelType("SMS")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      channelType === "SMS"
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-[#1F2C34] border-[#222E35] text-[#8696A0]"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelType("EMAIL")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      channelType === "EMAIL"
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-[#1F2C34] border-[#222E35] text-[#8696A0]"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#222E35]">
              <button
                onClick={() => runSimulation("MISSED")}
                disabled={isSimulating}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-[#00A884] hover:bg-[#008f6f] text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-[#00A884]/20 transition disabled:opacity-50"
              >
                <PhoneMissed className="w-4 h-4" />
                Simulate Missed Call & Auto-Reply
              </button>

              <button
                onClick={() => runSimulation("RAPID_3X")}
                disabled={isSimulating}
                className="flex items-center justify-center gap-2 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 font-bold text-sm py-2.5 px-4 rounded-xl transition disabled:opacity-50"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                3x Rapid Consecutive Calls Test
              </button>

              <button
                onClick={() => runSimulation("ANSWERED")}
                disabled={isSimulating}
                className="flex items-center justify-center gap-1.5 bg-[#1F2C34] hover:bg-[#2A3942] text-gray-300 font-semibold text-xs py-2.5 px-3 rounded-xl border border-[#222E35] transition disabled:opacity-50"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                Answered
              </button>

              <button
                onClick={() => runSimulation("REJECTED")}
                disabled={isSimulating}
                className="flex items-center justify-center gap-1.5 bg-[#1F2C34] hover:bg-[#2A3942] text-gray-300 font-semibold text-xs py-2.5 px-3 rounded-xl border border-[#222E35] transition disabled:opacity-50"
              >
                <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                Rejected
              </button>
            </div>
          </div>

          {/* Live Pipeline Execution Trace */}
          <div className="bg-[#111B21] border border-[#222E35] rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8696A0] mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#00A884]" />
              Telecom Pipeline Live Trace
            </h3>

            <div className="space-y-2.5">
              {steps.map((step, idx) => {
                const isRunning = step.status === "running";
                const isSuccess = step.status === "success";
                const isSkipped = step.status === "skipped";
                const isFailed = step.status === "failed";

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isRunning
                        ? "bg-[#00A884]/10 border-[#00A884] animate-pulse"
                        : isSuccess
                        ? "bg-[#1F2C34]/40 border-emerald-500/30"
                        : isFailed
                        ? "bg-rose-500/10 border-rose-500/30"
                        : isSkipped
                        ? "bg-[#111B21] border-[#222E35]/60 opacity-60"
                        : "bg-[#111B21] border-[#222E35]/60"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isRunning && <span className="w-4 h-4 block rounded-full border-2 border-[#00A884] border-t-transparent animate-spin" />}
                      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isFailed && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {isSkipped && <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[9px] text-gray-500">—</div>}
                      {step.status === "idle" && <div className="w-4 h-4 rounded-full border border-gray-600 text-[10px] flex items-center justify-center text-gray-500 font-bold">{idx + 1}</div>}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">{step.name}</p>
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-400">{step.status}</span>
                      </div>
                      <p className="text-[11px] text-[#8696A0]">{step.description}</p>
                      {step.details && (
                        <p className={`text-[11px] font-mono mt-1 ${isFailed ? "text-rose-300" : isSkipped ? "text-amber-300" : "text-[#00A884]"}`}>
                          ↳ {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Console Terminal */}
          <div className="bg-[#070D11] border border-[#222E35] rounded-2xl p-4 flex flex-col h-64">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222E35]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#00A884]" />
                <span className="text-xs font-mono font-bold text-gray-300">Live Telemetry Console</span>
              </div>
              <span className="text-[10px] font-mono text-[#8696A0]">{logs.length} entries</span>
            </div>

            <div ref={logTerminalRef} className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1 pr-1">
              {logs.length === 0 ? (
                <p className="text-gray-600 italic">No events logged yet. Tap 'Simulate Missed Call' to start testing.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="leading-tight">
                    <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                    <span
                      className={`font-bold ${
                        log.level === "SUCCESS"
                          ? "text-emerald-400"
                          : log.level === "WARN"
                          ? "text-amber-400"
                          : log.level === "ERROR"
                          ? "text-rose-400"
                          : "text-[#00A884]"
                      }`}
                    >
                      [{log.tag}]
                    </span>{" "}
                    <span className="text-gray-300">{log.message}</span>
                    {log.payload && (
                      <pre className="text-[10px] text-gray-400 bg-black/40 p-1.5 rounded mt-0.5 overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
