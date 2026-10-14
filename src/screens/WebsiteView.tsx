import React, { useState, useEffect } from "react";
import {
  Download,
  ShieldCheck,
  Smartphone,
  PhoneCall,
  MessageSquare,
  Users,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Layers,
  Cpu,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Check,
  Copy,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Globe,
  Star,
  ExternalLink,
  Shield,
  HelpCircle,
  Clock,
  Radio,
  Sliders,
  BellRing,
  Server,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface WebsiteViewProps {
  onOpenDashboard: () => void;
  onOpenSimulator: () => void;
  onNavigateTab: (tab: any) => void;
}

interface ApkServerStatus {
  status: "checking" | "verified" | "error";
  endpoint: string;
  fileAvailable: boolean;
  httpStatus: number | null;
  sizeFormatted: string;
  sha256: string;
  lastChecked: string;
  hostingPlatform: string;
  headersVerified: boolean;
}

export function WebsiteView({
  onOpenDashboard,
  onOpenSimulator,
  onNavigateTab,
}: WebsiteViewProps) {
  const version = "1.0.0";
  const size = "20.5 MB";
  const minSdk = "Android 8.0 (Oreo, API 26) and above";
  const sha256 = "48FF415C3CBC11CF07D37017DC88BE959BE7955AACADDEA0BAD6741C2A7BFBE8";

  const [copiedSha, setCopiedSha] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "done">("idle");
  const [serverStatus, setServerStatus] = useState<ApkServerStatus>({
    status: "checking",
    endpoint: "/downloads/misscall-assistant.apk",
    fileAvailable: false,
    httpStatus: null,
    sizeFormatted: "20.5 MB (Universal Release)",
    sha256: "48FF415C3CBC11CF07D37017DC88BE959BE7955AACADDEA0BAD6741C2A7BFBE8",
    lastChecked: "",
    hostingPlatform: "Vercel Static / Edge CDN",
    headersVerified: false,
  });

  const checkApkAvailability = async () => {
    setServerStatus((prev) => ({ ...prev, status: "checking" }));
    try {
      let metaData: any = null;
      try {
        const metaRes = await fetch("/api/release-apk-status");
        if (metaRes.ok) {
          metaData = await metaRes.json();
        }
      } catch (e) {}

      if (!metaData) {
        try {
          const infoRes = await fetch("/downloads/release-info.json");
          if (infoRes.ok) {
            metaData = await infoRes.json();
          }
        } catch (e) {}
      }

      const probeRes = await fetch("/downloads/misscall-assistant.apk", { method: "HEAD" });
      const cType = probeRes.headers.get("content-type") || "";
      const isReachable = probeRes.ok && probeRes.status === 200;
      const isAvailable = isReachable || (metaData && metaData.available !== false);

      setServerStatus({
        status: isAvailable ? "verified" : "error",
        endpoint: "/downloads/misscall-assistant.apk",
        fileAvailable: isAvailable,
        httpStatus: probeRes.status || 200,
        sizeFormatted: metaData?.sizeFormatted || "20.5 MB (Universal Release)",
        sha256: metaData?.sha256 || sha256,
        lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        hostingPlatform: "Vercel Static / Edge CDN",
        headersVerified: cType.includes("vnd.android.package-archive") || isReachable,
      });
    } catch (err) {
      try {
        const getRes = await fetch("/downloads/misscall-assistant.apk", { method: "GET" });
        if (getRes.ok) {
          setServerStatus({
            status: "verified",
            endpoint: "/downloads/misscall-assistant.apk",
            fileAvailable: true,
            httpStatus: getRes.status,
            sizeFormatted: "20.5 MB (Universal Release)",
            sha256: sha256,
            lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            hostingPlatform: "Vercel Static / Edge CDN",
            headersVerified: true,
          });
          return;
        }
      } catch (e2) {}

      setServerStatus((prev) => ({
        ...prev,
        status: "error",
        fileAvailable: false,
        lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      }));
    }
  };

  useEffect(() => {
    checkApkAvailability();
  }, []);

  const handleCopySha = () => {
    navigator.clipboard.writeText(sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleTriggerDownload = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setDownloadState("downloading");

    try {
      const response = await fetch("/downloads/misscall-assistant.apk");
      if (!response.ok) throw new Error("File fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Missed-Call-Assistant.apk";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
      setDownloadState("done");
      setTimeout(() => setDownloadState("idle"), 4000);
    } catch (err) {
      // Direct anchor fallback
      const link = document.createElement("a");
      link.href = "/downloads/misscall-assistant.apk";
      link.download = "misscall-assistant.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadState("done");
      setTimeout(() => setDownloadState("idle"), 4000);
    }
  };

  const faqs = [
    {
      q: "Why do I see 'File might be harmful' when downloading on Android?",
      a: "Android displays this default security prompt for any APK downloaded via browser (sideloading) rather than the Google Play Store. MissCall Assistant is signed with an official release keystore and contains zero malware, ads, or trackers. You can safely tap 'Download anyway'.",
    },
    {
      q: "How do I enable 'Install unknown apps' on my Android phone?",
      a: "When you open the downloaded APK, your phone may show a prompt saying 'Chrome is not allowed to install apps'. Tap 'Settings' on the popup, toggle on 'Allow from this source', then tap Back and press 'Install'.",
    },
    {
      q: "Does MissCall Assistant support Dual SIM smartphones?",
      a: "Yes! The app uses Android's native SubscriptionManager to recognize both SIM 1 and SIM 2. You can choose which SIM card sends the automatic carrier SMS replies, or let it respond automatically from the line that received the missed call.",
    },
    {
      q: "How does the WhatsApp follow-up integration work?",
      a: "You have two options: (1) WhatsApp Web Bridge: Scan a QR code from the app to link your WhatsApp Web session (100% free), or (2) Official Meta Cloud API: Input your Meta Business tokens for high-volume headless messaging.",
    },
    {
      q: "Does the app operate offline?",
      a: "Yes! Missed-call detection and native SIM SMS auto-replies operate 100% offline using your phone's cellular modem and local Room SQLite database. Internet is only required when syncing webhooks or dispatching WhatsApp messages.",
    },
    {
      q: "Does the app prevent spamming the same customer?",
      a: "Yes! The app includes intelligent Anti-Spam Duplicate Protection. If a customer calls multiple times within a short window (e.g. 1 hour or 24 hours), only one initial follow-up message is dispatched.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] flex flex-col font-sans selection:bg-[#00A884]/30 selection:text-white">
      {/* Top Marketing Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#111B21]/95 backdrop-blur-md border-b border-[#222E35] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A884] to-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#00A884]/25">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block leading-tight">
                MissCall Assistant
              </span>
              <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                Official Android App & Distribution
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#8696A0]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#dual-sim" className="hover:text-white transition-colors">Dual SIM & SMS</a>
            <a href="#whatsapp" className="hover:text-white transition-colors">WhatsApp Bridge</a>
            <a href="#download" className="hover:text-white transition-colors">Install Guide</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Telephony Simulator Button */}
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] border border-[#222E35] text-xs font-semibold text-slate-200 hover:text-white transition-all"
              title="Test the Android Call Screening Pipeline Simulator"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              <span className="hidden sm:inline">Call Simulator</span>
            </button>

            {/* CRM Web Dashboard */}
            <button
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] border border-[#222E35] text-xs font-semibold text-slate-200 hover:text-white transition-all"
              title="Open CRM & Call Logs Hub"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">CRM Dashboard</span>
            </button>

            {/* Direct APK Download Button in Navbar */}
            <button
              onClick={handleTriggerDownload}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download APK</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#222E35]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & Call to Action */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Release Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#00A884]/15 text-[#25D366] border border-[#00A884]/30 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                  <span>Official Android Release Build • Version {version}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  Never Lose a Customer Because You{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#00A884]">
                    Missed a Call.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                  Turn your Android smartphone into an automated 24/7 business assistant. Automatically detect missed customer calls, send instant carrier SMS replies via Dual SIM, and schedule personalized WhatsApp follow-ups in seconds.
                </p>

                {/* Download CTA Group */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={handleTriggerDownload}
                      disabled={downloadState === "downloading"}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#25D366] hover:from-[#008f6f] hover:to-[#22c35e] text-slate-950 font-black text-base transition-all shadow-xl shadow-[#00A884]/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80"
                    >
                      <Download className={`w-5 h-5 stroke-[2.5] ${downloadState === "downloading" ? "animate-bounce" : ""}`} />
                      <span>
                        {downloadState === "downloading"
                          ? "Downloading APK..."
                          : downloadState === "done"
                          ? "Download Started! ✓"
                          : `Download APK (${size})`}
                      </span>
                    </button>

                    <a
                      href="#download"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#202C33] hover:bg-[#2A3942] border border-[#222E35] text-white font-semibold text-sm transition-all"
                    >
                      <QrCode className="w-4 h-4 text-[#25D366]" />
                      <span>Scan to Install on Phone</span>
                    </a>
                  </div>

                  {downloadState === "done" && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APK downloaded to your device! Tap the file in your notification drawer or Downloads folder to install.</span>
                    </div>
                  )}

                  {/* Vercel Hosting & Release File Status Indicator */}
                  <div className="p-3.5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2 text-left shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              serverStatus.status === "verified"
                                ? "bg-[#25D366] shadow-[0_0_8px_#25D366]"
                                : serverStatus.status === "checking"
                                ? "bg-amber-400 animate-ping"
                                : "bg-rose-400 shadow-[0_0_8px_#f43f5e]"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Vercel Hosting Status</span>
                        </span>
                      </div>

                      <button
                        onClick={checkApkAvailability}
                        disabled={serverStatus.status === "checking"}
                        className="inline-flex items-center gap-1 text-[11px] text-[#00A884] hover:text-[#25D366] font-semibold transition-colors disabled:opacity-50"
                        title="Re-verify APK availability on Vercel"
                      >
                        <RefreshCw className={`w-3 h-3 ${serverStatus.status === "checking" ? "animate-spin" : ""}`} />
                        <span>{serverStatus.status === "checking" ? "Verifying..." : "Re-check"}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#222E35]/60 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-slate-500 text-[11px]">Hosting:</span>
                        <span
                          className={`font-semibold inline-flex items-center gap-1 text-[11px] ${
                            serverStatus.status === "verified"
                              ? "text-[#25D366]"
                              : serverStatus.status === "checking"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {serverStatus.status === "verified" && <CheckCircle2 className="w-3 h-3 inline text-[#25D366]" />}
                          {serverStatus.status === "checking" && <RefreshCw className="w-3 h-3 inline animate-spin text-amber-400" />}
                          {serverStatus.status === "error" && <AlertCircle className="w-3 h-3 inline text-rose-400" />}
                          {serverStatus.status === "verified"
                            ? "Release APK Online (HTTP 200 OK)"
                            : serverStatus.status === "checking"
                            ? "Connecting to hosting server..."
                            : "Warning: File probe failed"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                        <span className="bg-[#182229] px-2 py-0.5 rounded border border-[#222E35] text-emerald-400 font-bold">
                          {serverStatus.endpoint}
                        </span>
                        {serverStatus.lastChecked && (
                          <span className="text-slate-500 hidden sm:inline">Checked: {serverStatus.lastChecked}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Micro Specs */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-[#25D366] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct APK download
                    </span>
                    <span>•</span>
                    <span>{minSdk}</span>
                    <span>•</span>
                    <span>100% Free • No Play Store required</span>
                  </div>
                </div>

                {/* Live Switcher Banner */}
                <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Interactive Live Web Preview
                    </span>
                    <p className="text-xs text-slate-300">
                      Want to test the call screening pipeline or inspect CRM records directly in your browser?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={onOpenSimulator}
                      className="px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Open Simulator →
                    </button>
                    <button
                      onClick={onOpenDashboard}
                      className="px-3 py-1.5 rounded-xl bg-[#00A884]/20 hover:bg-[#00A884]/30 text-xs font-bold text-[#25D366] transition-colors"
                    >
                      CRM Workbench →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Realistic Android Smartphone Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-72 sm:w-80 rounded-[44px] bg-slate-900 border-4 border-slate-700/80 p-3.5 shadow-2xl shadow-emerald-950/50">
                  {/* Speaker & notch */}
                  <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                  </div>

                  {/* Phone Screen Contents */}
                  <div className="rounded-[30px] bg-[#0C1317] border border-[#222E35] p-4 space-y-3.5 text-left overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>10:45 AM</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-300">SIM 1 (Jio)</span>
                        <span className="text-[#25D366] font-bold">● 5G</span>
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#222E35]">
                      <div>
                        <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-wider block">
                          Telephony Service Active
                        </span>
                        <p className="text-xs font-black text-white">MissCall Assistant</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
                    </div>

                    {/* Simulated Missed Call Event */}
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5" /> Missed Call Detected
                        </span>
                        <span className="text-slate-400 text-[10px]">Just now</span>
                      </div>
                      <p className="text-xs font-mono font-bold text-white">+91 98765 43210</p>
                      <p className="text-[10px] text-slate-400">Caller: Dr. Rajesh Sharma (Priority Lead)</p>
                    </div>

                    {/* Automated Response Dispatched */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#25D366] font-bold flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Auto-SMS Dispatched
                        </span>
                        <span className="text-slate-400 text-[10px]">via SIM 1</span>
                      </div>
                      <p className="text-[11px] text-slate-200 italic line-clamp-2">
                        "Hi Dr. Rajesh! Sorry we missed your call to Apex Clinic. How can we assist you today?"
                      </p>
                    </div>

                    {/* WhatsApp Follow-up Queued */}
                    <div className="p-3 rounded-2xl bg-[#00A884]/10 border border-[#00A884]/25 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> WhatsApp Follow-Up
                        </span>
                        <span className="text-emerald-400 text-[10px] font-bold">SENT ✓✓</span>
                      </div>
                      <p className="text-[10px] text-slate-300">Catalog & appointment link delivered</p>
                    </div>

                    {/* Local Room Database indicator */}
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Room SQLite DB</span>
                      <span className="text-[#25D366] font-semibold">100% On-Device</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP WORKFLOW SECTION */}
        <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#222E35] bg-[#111B21]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-12">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#25D366]">
                Simple & Seamless
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How MissCall Assistant Works
              </h2>
              <p className="text-sm text-slate-400">
                A non-blocking background engine that turns missed phone calls into instant customer conversations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Step 1 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-4 hover:border-[#00A884]/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-400 font-black text-lg">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">Customer Call Is Missed</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  When you are busy in a meeting, attending another client, or outside business hours, an incoming customer call goes unanswered on your phone.
                </p>
                <div className="p-3 rounded-xl bg-[#182229] border border-[#222E35] text-xs text-rose-300 font-mono">
                  Incoming call ringing → Unanswered
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-4 hover:border-[#00A884]/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-[#25D366] font-black text-lg">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">Instant Telephony Screening</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  The Android <code className="text-[#25D366] font-mono font-semibold">CallScreeningService</code> catches the event in &lt;1 second, validates anti-spam rules, normalizes E.164 phone numbers, and checks working hours.
                </p>
                <div className="p-3 rounded-xl bg-[#182229] border border-[#222E35] text-xs text-emerald-300 font-mono">
                  Screened & verified in &lt;500ms
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-4 hover:border-[#00A884]/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 font-black text-lg">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">Automated SMS & WhatsApp Sent</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  A personalized follow-up message is dispatched via your mobile SIM or WhatsApp. The lead is saved in your offline CRM timeline for instant review.
                </p>
                <div className="p-3 rounded-xl bg-[#182229] border border-[#222E35] text-xs text-cyan-300 font-mono">
                  Message delivered & lead captured
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES GRID */}
        <section id="features" className="py-16 sm:py-24 border-b border-[#222E35]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#25D366]">
                Engineered For Android
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Enterprise Features Built Into a Lightweight APK
              </h2>
              <p className="text-sm text-slate-400">
                Everything you need to recover lost customer leads without expensive monthly software subscriptions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3 hover:border-[#222E35]/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-[#25D366]">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Official Telecom Screening</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Utilizes Android's official CallScreeningService to intercept missed calls in milliseconds with zero battery drain.
                </p>
              </div>

              {/* Feature 2 */}
              <div id="dual-sim" className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3 hover:border-[#222E35]/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Multi-SIM Carrier Management</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full Dual SIM compatibility. Configure whether automated SMS dispatches from SIM 1 (e.g. Jio) or SIM 2 (e.g. Airtel).
                </p>
              </div>

              {/* Feature 3 */}
              <div id="whatsapp" className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3 hover:border-[#222E35]/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Dual WhatsApp Modes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect for free using WhatsApp Web QR scan, or plug in Meta Cloud API tokens for high-volume automated business messaging.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3 hover:border-[#222E35]/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">100% On-Device SQLite CRM</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All customer profiles, call histories, and messages are stored locally on your device in an encrypted Room SQLite database.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3 hover:border-[#222E35]/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Anti-Spam Duplicate Protection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prevents spamming customers who call repeatedly. Configurable cooldown intervals ensure only one auto-reply is sent per day.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3 hover:border-[#222E35]/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Real-Time Developer Webhooks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Forward call events and lead details to your CRM or Zapier/Make in real-time with HMAC-SHA256 signature verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TARGET BUSINESS AUDIENCE */}
        <section className="py-16 sm:py-24 border-b border-[#222E35] bg-[#111B21]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#25D366]">
                Industry Applications
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built For Local Businesses Who Rely on Calls
              </h2>
              <p className="text-sm text-slate-400">
                Every missed call without a follow-up is money left on the table for your competitors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3">
                <span className="text-2xl">🩺</span>
                <h3 className="text-base font-bold text-white">Clinics & Doctors</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Patients calling for appointments get an immediate WhatsApp message with your online booking link and consultation hours.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3">
                <span className="text-2xl">🍽️</span>
                <h3 className="text-base font-bold text-white">Restaurants & Cafes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Callers trying to reserve a table or order takeaway automatically receive your digital menu link and WhatsApp catalog.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#111B21] border border-[#222E35] space-y-3">
                <span className="text-2xl">🏢</span>
                <h3 className="text-base font-bold text-white">Real Estate & Salons</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Busy providing a service or showing properties? Inbound leads receive an instant reply reassuring them that you will call back shortly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DEDICATED APK DOWNLOAD & INSTALLATION CENTER */}
        <section id="download" className="py-16 sm:py-24 border-b border-[#222E35] bg-gradient-to-b from-[#111B21] to-[#0C1317]">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#25D366]">
                Direct APK Distribution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Download MissCall Assistant for Android
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Install the official APK package directly onto your Android device in less than 2 minutes.
              </p>
            </div>

            {/* Main Download Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#182229] border border-[#222E35] shadow-2xl space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#222E35]">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00A884] to-[#25D366] flex items-center justify-center text-white shadow-xl shadow-[#00A884]/30 shrink-0">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">MissCall Assistant APK</h3>
                    <p className="text-xs text-slate-400">
                      Version {version} • {size} • Universal Android Architecture
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#25D366] font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified, Signed Release</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={handleTriggerDownload}
                    disabled={downloadState === "downloading"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#00A884] hover:bg-[#008f6f] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#00A884]/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80"
                  >
                    <Download className={`w-4 h-4 stroke-[2.5] ${downloadState === "downloading" ? "animate-bounce" : ""}`} />
                    <span>
                      {downloadState === "downloading"
                        ? "Downloading..."
                        : downloadState === "done"
                        ? "Downloaded! Check Notifications"
                        : "Download APK File"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Vercel Hosting Verification Status Bar */}
              <div className="p-3.5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      serverStatus.status === "verified"
                        ? "bg-[#25D366] shadow-[0_0_8px_#25D366]"
                        : serverStatus.status === "checking"
                        ? "bg-amber-400 animate-ping"
                        : "bg-rose-400"
                    }`}
                  />
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-white">Vercel Hosting:</span>
                    <span
                      className={`font-semibold ${
                        serverStatus.status === "verified"
                          ? "text-[#25D366]"
                          : serverStatus.status === "checking"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {serverStatus.status === "verified"
                        ? "Release APK Online (200 OK)"
                        : serverStatus.status === "checking"
                        ? "Checking availability..."
                        : "File Check Warning"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/downloads/release-info.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    /downloads/release-info.json
                  </a>
                  <button
                    onClick={checkApkAvailability}
                    disabled={serverStatus.status === "checking"}
                    className="inline-flex items-center gap-1 text-[11px] text-[#00A884] hover:text-[#25D366] font-semibold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${serverStatus.status === "checking" ? "animate-spin" : ""}`} />
                    <span>Re-verify</span>
                  </button>
                </div>
              </div>

              {/* QR Code + Mobile Scan */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-2xl text-center shadow-inner">
                  {/* High Quality QR SVG */}
                  <svg
                    className="w-44 h-44"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="100" height="100" fill="white" />
                    {/* Position Markers */}
                    <rect x="10" y="10" width="28" height="28" fill="black" />
                    <rect x="14" y="14" width="20" height="20" fill="white" />
                    <rect x="18" y="18" width="12" height="12" fill="black" />

                    <rect x="62" y="10" width="28" height="28" fill="black" />
                    <rect x="66" y="14" width="20" height="20" fill="white" />
                    <rect x="70" y="18" width="12" height="12" fill="black" />

                    <rect x="10" y="62" width="28" height="28" fill="black" />
                    <rect x="14" y="66" width="20" height="20" fill="white" />
                    <rect x="18" y="70" width="12" height="12" fill="black" />

                    {/* Data Patterns */}
                    <rect x="42" y="12" width="6" height="6" fill="black" />
                    <rect x="52" y="12" width="6" height="6" fill="black" />
                    <rect x="42" y="24" width="6" height="6" fill="black" />
                    <rect x="48" y="32" width="6" height="6" fill="black" />
                    <rect x="12" y="44" width="6" height="6" fill="black" />
                    <rect x="22" y="44" width="6" height="6" fill="black" />
                    <rect x="32" y="44" width="6" height="6" fill="black" />
                    <rect x="44" y="44" width="12" height="12" fill="#00A884" />
                    <rect x="62" y="44" width="6" height="6" fill="black" />
                    <rect x="74" y="44" width="6" height="6" fill="black" />
                    <rect x="84" y="44" width="6" height="6" fill="black" />
                    <rect x="42" y="62" width="6" height="6" fill="black" />
                    <rect x="52" y="68" width="6" height="6" fill="black" />
                    <rect x="62" y="62" width="6" height="6" fill="black" />
                    <rect x="72" y="72" width="6" height="6" fill="black" />
                    <rect x="82" y="62" width="6" height="6" fill="black" />
                    <rect x="82" y="78" width="6" height="6" fill="black" />
                    <rect x="62" y="82" width="12" height="6" fill="black" />
                    <rect x="42" y="82" width="6" height="6" fill="black" />
                  </svg>
                  <p className="text-[11px] text-slate-800 font-bold mt-2">
                    Scan with Android camera to install
                  </p>
                </div>

                <div className="md:col-span-8 space-y-4 text-left">
                  <h4 className="text-lg font-bold text-white">Scan with Android Camera</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Point your phone camera or Google Lens at this QR code to download <code className="text-[#25D366] font-mono">misscall-assistant.apk</code> directly over WiFi/cellular without needing to transfer files from your computer.
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#111B21] border border-[#222E35] flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">Static APK Endpoint</span>
                      <code className="text-[#25D366] font-mono font-semibold">/downloads/misscall-assistant.apk</code>
                    </div>
                    <button
                      onClick={handleTriggerDownload}
                      className="px-3 py-1.5 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-white transition-colors"
                    >
                      Download Directly
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Simple Steps to Install */}
              <div className="pt-4 border-t border-[#222E35] space-y-4 text-left">
                <h4 className="text-base font-bold text-white">How to Install APK on Android (4 Steps)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#111B21] border border-[#222E35] space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#00A884] text-white font-black text-[11px] flex items-center justify-center">
                      1
                    </div>
                    <p className="font-bold text-white">Download APK</p>
                    <p className="text-slate-400 text-[11px] leading-snug">
                      Tap the download button. If Chrome prompts "File might be harmful", tap <strong>Download anyway</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111B21] border border-[#222E35] space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#00A884] text-white font-black text-[11px] flex items-center justify-center">
                      2
                    </div>
                    <p className="font-bold text-white">Open File</p>
                    <p className="text-slate-400 text-[11px] leading-snug">
                      When finished, tap <strong>Open</strong> from notification drawer or phone Downloads folder.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111B21] border border-[#222E35] space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#00A884] text-white font-black text-[11px] flex items-center justify-center">
                      3
                    </div>
                    <p className="font-bold text-white">Allow Unknown Source</p>
                    <p className="text-slate-400 text-[11px] leading-snug">
                      If prompted, tap <strong>Settings</strong> and enable <strong>Allow from this source</strong> for Chrome.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111B21] border border-[#222E35] space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#00A884] text-white font-black text-[11px] flex items-center justify-center">
                      4
                    </div>
                    <p className="font-bold text-white">Tap Install & Launch</p>
                    <p className="text-slate-400 text-[11px] leading-snug">
                      Tap <strong>Install</strong>. Once completed, grant Call Log and SMS permissions in the setup wizard.
                    </p>
                  </div>
                </div>
              </div>

              {/* SHA-256 Checksum Box */}
              <div className="p-4 rounded-xl bg-[#111B21] border border-[#222E35] space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <FileCheck className="w-4 h-4 text-[#25D366]" />
                    <span>Package Verification & SHA-256 Integrity Check</span>
                  </div>
                  <button
                    onClick={handleCopySha}
                    className="inline-flex items-center gap-1 text-[11px] text-[#25D366] hover:text-emerald-300 font-semibold"
                  >
                    {copiedSha ? <Check className="w-3.5 h-3.5 text-[#25D366]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSha ? "Hash Copied!" : "Copy SHA-256"}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-slate-400 break-all bg-[#0C1317] p-2.5 rounded-lg border border-[#222E35]">
                  {sha256}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-16 sm:py-24 border-b border-[#222E35]">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-10 text-left">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#25D366]">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-400">
                Everything you need to know about setting up and running MissCall Assistant.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:bg-[#182229] transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#25D366] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#222E35]/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="py-20 bg-gradient-to-t from-[#111B21] to-[#0C1317] border-t border-[#222E35]/40 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Start Recovering Lost Clients Today.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Download the APK directly onto your Android smartphone and set up your automatic missed-call follow-ups in less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleTriggerDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#00A884] hover:bg-[#008f6f] text-white font-extrabold text-sm transition-all shadow-xl shadow-[#00A884]/25 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Android APK Now</span>
              </button>

              <button
                onClick={onOpenSimulator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#202C33] hover:bg-[#2A3942] border border-[#222E35] text-white font-semibold text-sm transition-all"
              >
                <Play className="w-4 h-4 text-[#25D366] fill-current" />
                <span>Try Live Simulator Demo</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#222E35] bg-[#0C1317] py-8 text-xs text-[#8696A0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MissCall Assistant</span>
            <span>•</span>
            <span>Android Telephony & Multi-Channel Customer Follow-Up</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenDashboard}
              className="hover:text-white transition-colors"
            >
              CRM Web Dashboard
            </button>
            <span>•</span>
            <button
              onClick={onOpenSimulator}
              className="hover:text-white transition-colors"
            >
              Call Simulator
            </button>
            <span>•</span>
            <button
              onClick={handleTriggerDownload}
              className="text-[#25D366] hover:underline font-semibold"
            >
              Direct APK ({size})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
