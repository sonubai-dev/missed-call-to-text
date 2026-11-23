import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ShieldCheck,
  Clock,
  Zap,
  Sliders,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Star,
  Send,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  X,
  FileText,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WebsiteViewProps {
  onOpenDashboard?: () => void;
  onOpenSimulator: () => void;
  onNavigateTab: (tab: any) => void;
}

export function WebsiteView({
  onOpenSimulator,
  onNavigateTab,
}: WebsiteViewProps) {
  const [activeBrandTab, setActiveBrandTab] = useState<'poco' | 'oppo' | 'vivo' | 'samsung'>('poco');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'google-play' | null>(null);

  const version = '1.0.2';
  const size = '20.5 MB';
  const lastUpdated = 'November 2026';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/misscall-assistant.apk';
    link.setAttribute('download', 'Missed-Call-Assistant.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white relative w-full max-w-full overflow-x-hidden">
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      {/* 1. TOP NAVBAR */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-blue-200 shrink-0">
              M
            </div>
            <div>
              <div className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                <span>MissCall Assistant</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Free Lifetime
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[130px] sm:max-w-none">
                Smart Native Telephony Follow-Up
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#2563EB] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">How It Works</a>
            <a href="#free-forever" className="hover:text-[#2563EB] transition-colors">100% Free Forever</a>
            <a href="#download" className="hover:text-[#2563EB] transition-colors">Download APK</a>
            <a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-[#2563EB] transition-colors">Contact</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200 cursor-pointer shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Test Simulator</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-blue-300 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Free APK</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] text-[11px] sm:text-xs font-extrabold border border-blue-200 shadow-sm max-w-full text-center">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span className="truncate sm:whitespace-normal">100% Free Forever • Zero API Keys • No Login/Sign-up • Dual-SIM SMS</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Never Miss a Customer <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-blue-600 to-sky-500">
              Follow-Up.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-1 sm:px-0">
            Automatically send polite SMS follow-ups when you miss a customer call. Runs directly on your phone using your carrier SIM card. Zero API keys, zero subscriptions, zero logins required.
          </p>

          {/* Social Proof Star Pill */}
          <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">4.9/5 rated by shopkeepers, clinics & service businesses across India</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 w-full max-w-md sm:max-w-none mx-auto">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl text-sm font-extrabold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Free Android APK</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-sm font-extrabold transition-all shadow-sm cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#2563EB]" />
              <span>Test App Simulator in Browser</span>
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl sm:rounded-2xl text-sm font-bold transition-all text-center"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-500 font-medium px-2 text-center">
            Release {version} • {size} • Android 8.0 to 14 Supported • 100% Free Lifetime Edition
          </div>
        </div>

        {/* 3. INTERACTIVE FLOATING MOCKUP CAROUSEL */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 relative px-2 sm:px-0">
          {/* Floating Card Left: Sent SMS Notification */}
          <div className="hidden xl:block absolute -left-6 top-16 z-20 bg-white p-4 rounded-3xl shadow-xl border border-slate-200 w-64 text-left animate-bounce duration-1000">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">Auto SMS Dispatched</span>
                <span className="text-[10px] text-slate-400 block">+91 98765 00000</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
              "Hello! Sorry we missed your call from our store. How can we help you today?"
            </p>
          </div>

          {/* Floating Card Right: Delay Safeguard Pill */}
          <div className="hidden xl:block absolute -right-6 top-28 z-20 bg-white p-4 rounded-3xl shadow-xl border border-slate-200 w-64 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Delay Safeguard Active</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Set to <strong className="text-slate-800">5 seconds</strong>. If you call back first, SMS is automatically aborted.
            </p>
          </div>

          {/* Center Card: Android Redesigned Interface Showcase */}
          <div className="mx-auto w-full max-w-[340px] sm:max-w-sm md:max-w-md bg-white rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-slate-900 overflow-hidden text-left relative">
            {/* Phone Screen Header */}
            <div className="bg-gradient-to-b from-[#E0F2FE] via-[#EFF6FF] to-white p-4 sm:p-6 pb-3 sm:pb-4 border-b border-sky-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#2563EB] to-sky-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-md shrink-0">
                    MB
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">Welcome Back</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-semibold">My Store & Services</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active • Free Forever
                </span>
              </div>

              {/* Automation Toggle Card */}
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">Automate Missed Call SMS</span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500">SIM 1 • AirTel / Jio Telecom</span>
                </div>
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#2563EB] rounded-full flex items-center justify-end px-1 shrink-0">
                  <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>

            {/* Phone Screen Body Content */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white text-xs">
              {/* Delay Selector */}
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  SMS Delay Safeguard
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="py-2 text-center rounded-xl bg-slate-50 text-slate-500 font-bold border border-slate-200 text-xs">
                    2 Sec
                  </div>
                  <div className="py-2 text-center rounded-xl bg-[#2563EB] text-white font-extrabold shadow-sm text-xs">
                    5 Sec
                  </div>
                  <div className="py-2 text-center rounded-xl bg-slate-50 text-slate-500 font-bold border border-slate-200 text-xs">
                    10 Sec
                  </div>
                </div>
              </div>

              {/* SMS Message Template Preview */}
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Configured Reply Message
                </span>
                <div className="p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                  "Hello! Sorry we missed your call from our store. How can we help you today?"
                </div>
              </div>

              {/* Diagnostics Health */}
              <div className="p-3 rounded-xl sm:rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="text-[11px] font-bold text-sky-900">Telephony & SMS Ready</span>
                </div>
                <span className="text-[10px] font-extrabold text-sky-600">3/3 Permissions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED FEATURES SECTION */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider">Zero API Keys Required</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pure On-Device Native SMS Utility</h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              No Twilio, No Meta WhatsApp API, No cloud accounts. Everything runs locally on your Android device using your carrier SIM card.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Instant Native SIM SMS</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Dispatches carrier SMS immediately when a missed call is detected using Android's native Telephony APIs. Zero cloud dependency.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">2s, 5s, 10s Delay Safeguard</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Configurable countdown buffer gives you time to call the customer back. If you dial first, the scheduled SMS is instantly canceled.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Dual-SIM Smart Routing</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Choose explicitly whether to dispatch via SIM 1 (e.g. Jio) or SIM 2 (e.g. Airtel), preserving personal and business phone separation.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">100% On-Device Privacy</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Customer phone numbers and call logs never leave your phone. The app operates 100% offline without uploading contacts to any remote server.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">100% Free Lifetime Edition</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                No subscription, no credit card, no sign-in or registration. Missed call detection and automated SMS responses run free forever.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">24/7 Background Reliability</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Built-in guidance for Xiaomi, Samsung, Vivo, and OPPO ensures autostart and battery optimizations stay active when the screen is locked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 sm:space-y-12 text-center">
        <div className="space-y-2 sm:space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider">Fast Onboarding</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How It Works in 3 Steps</h2>
          <p className="text-slate-600 text-xs sm:text-sm">Get up and running in under two minutes with zero configuration hassle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 sm:space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] font-black text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-black text-slate-900 text-base">Download & Install</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Download the verified APK directly from our official website and grant standard telephony permissions.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 sm:space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] font-black text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-black text-slate-900 text-base">Customize Reply & Delay</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Enter your store or business name, customize the SMS message, and choose your safeguard delay (2s, 5s, or 10s).
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 sm:space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] font-black text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-black text-slate-900 text-base">Automate Follow-Ups</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              When a customer calls and you miss it, your phone automatically dispatches your reply SMS via your carrier SIM. 100% Free Lifetime.
            </p>
          </div>
        </div>
      </section>

      {/* 6. 100% FREE FOREVER */}
      <section id="free-forever" className="py-12 sm:py-20 px-4 sm:px-6 bg-slate-50 border-y border-slate-200 w-full overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider">Free Forever</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">100% Free for All Businesses</h2>
            <p className="text-slate-600 text-xs sm:text-sm">No credit card. No login or sign-up. Pure native Android utility.</p>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 border-blue-200 shadow-xl space-y-5 sm:space-y-6 text-left w-full mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">MissCall Assistant Lifetime</h3>
                <p className="text-xs text-slate-500 font-medium">Full business telephony automation</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Free Lifetime
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">₹0</span>
              <span className="text-slate-500 font-bold text-sm">/ Lifetime Free Forever</span>
            </div>

            <ul className="space-y-3 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited automated missed-call SMS replies</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero API keys or developer accounts required</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customizable 2s, 5s, 10s callback delay safeguard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dual-SIM card smart routing (SIM 1 / SIM 2)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% on-device private processing (No cloud leak)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No sign-in, login, or registration required</span>
              </li>
            </ul>

            <button
              onClick={handleDownload}
              className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-200 transition-all text-center block cursor-pointer"
            >
              Download Free Android APK
            </button>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Standard carrier SMS rates apply according to your existing SIM plan.
            </p>
          </div>
        </div>
      </section>

      {/* 7. APK DOWNLOAD & SETUP GUIDE */}
      <section id="download" className="py-12 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto space-y-6 sm:space-y-8 w-full overflow-hidden">
        <div className="text-center space-y-2 sm:space-y-3">
          <span className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider">Production Release</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Download Verified Android APK</h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Install MissCall Assistant directly onto your device. Play Protect compliance verified.
          </p>
        </div>

        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-5 sm:space-y-6 text-left w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black text-xs shrink-0">
                  APK
                </div>
                <h4 className="font-extrabold text-slate-900 text-base sm:text-lg break-all">misscall-assistant.apk</h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Verified Clean
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Version {version} • Size: {size} • Updated {lastUpdated}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md shadow-blue-200 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </button>
          </div>

          {/* Step-by-Step Android Installation & Setup Guide */}
          <div className="space-y-5 pt-1">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                <span>Complete Android Installation & Setup Guide</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Follow these 4 simple steps to install and run MissCall Assistant smoothly on any Android smartphone:
              </p>
            </div>

            {/* 4 Primary Installation Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[11px] shrink-0 font-extrabold">1</span>
                  <span>Download APK</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tap <strong>"Download APK"</strong> above. If your browser warns <em>"File might be harmful"</em>, select <strong>"Download anyway"</strong>.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[11px] shrink-0 font-extrabold">2</span>
                  <span>Open via File Manager</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Open your phone’s <strong>File Manager ➔ Downloads</strong> folder and tap <code className="text-blue-600 font-mono text-[10px]">misscall-assistant.apk</code>.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[11px] shrink-0 font-extrabold">3</span>
                  <span>Allow Unknown Apps</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  When prompted, tap <strong>Settings</strong> and toggle <strong>"Allow from this source"</strong> ON. (On Xiaomi/POCO, check the risk box and tap OK after 10s).
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#2563EB] text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] shrink-0 font-extrabold">4</span>
                  <span>Play Protect: "Install Anyway"</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  If Google Play Protect appears, tap <strong>"More details" ➔ "Install anyway"</strong>. <em>(Do not tap "OK", as OK cancels installation).</em>
                </p>
              </div>
            </div>

            {/* Android 13 & 14 Restricted Setting Fix */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-950 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                <span>Important: If phone says "App was denied access" or "Restricted setting" on SMS:</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Android 13/14 automatically locks SMS for sideloaded APKs until unlocked once in App Info:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-950 font-medium">
                <li>Long-press the <strong>MissCall Assistant</strong> app icon on your home screen and tap <strong>App Info (ⓘ)</strong>.</li>
                <li>Tap the <strong>3 vertical dots (⋮)</strong> in the top-right corner of the App Info screen.</li>
                <li>Select <strong>"Allow restricted settings"</strong> (प्रतिबंधित सेटिंग्स की अनुमति दें) and confirm with Fingerprint/PIN.</li>
                <li>Now tap <strong>Permissions ➔ SMS ➔ Allow</strong>! The automated follow-up system is now ready.</li>
              </ol>
            </div>

            {/* Brand-Specific 24x7 Background Reliability Tabs */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24×7 Background Reliability Settings (Keep App Active)</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Select your smartphone brand below to ensure auto-replies trigger when screen is locked:
                </p>
              </div>

              {/* Brand Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {[
                  { id: 'poco', label: 'POCO & Xiaomi' },
                  { id: 'oppo', label: 'OPPO & Realme' },
                  { id: 'vivo', label: 'Vivo & iQOO' },
                  { id: 'samsung', label: 'Samsung Galaxy' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBrandTab(b.id as any)}
                    className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                      activeBrandTab === b.id
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Brand Tab Contents */}
              <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                {activeBrandTab === 'poco' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-900">POCO / Xiaomi / Redmi (HyperOS & MIUI):</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Long press app icon ➔ <strong>App Info (i)</strong> ➔ Turn <strong>Autostart ON</strong>.</li>
                      <li>In App Info ➔ <strong>Battery Saver</strong> ➔ Select <strong>"No restrictions"</strong> (अप्रतिबंधित).</li>
                      <li>In App Info ➔ <strong>Other permissions</strong> ➔ Allow <em>"Display pop-up windows in background"</em>.</li>
                      <li>Lock app in Recent Apps (multitasking screen) by tapping the 🔒 Lock icon.</li>
                    </ul>
                  </div>
                )}

                {activeBrandTab === 'oppo' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-900">OPPO & Realme (ColorOS / Realme UI):</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Go to <strong>Settings ➔ Apps ➔ Auto-launch</strong> ➔ Enable MissCall Assistant.</li>
                      <li>Go to <strong>Settings ➔ Battery ➔ App battery management</strong> ➔ Allow <em>"Background activity"</em> and <em>"Auto-launch"</em>.</li>
                      <li>In Recent Apps screen, tap the 3 dots (⋮) on MissCall Assistant and tap <strong>Lock</strong>.</li>
                    </ul>
                  </div>
                )}

                {activeBrandTab === 'vivo' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-900">Vivo & iQOO (Funtouch OS / OriginOS):</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Go to <strong>Settings ➔ Battery ➔ Background power consumption</strong> ➔ Select <em>"Allow high background power consumption"</em>.</li>
                      <li>Go to <strong>Settings ➔ Apps & Permissions ➔ Autostart</strong> ➔ Turn ON MissCall Assistant.</li>
                    </ul>
                  </div>
                )}

                {activeBrandTab === 'samsung' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-900">Samsung Galaxy (One UI):</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Long press app icon ➔ <strong>App Info ➔ Battery</strong> ➔ Select <strong>"Unrestricted"</strong>.</li>
                      <li>Go to <strong>Settings ➔ Battery ➔ Background usage limits ➔ Never sleeping apps</strong> ➔ Tap (+) and add MissCall Assistant.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-12 sm:py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about MissCall Assistant.</p>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {[
              {
                q: 'Is MissCall Assistant completely free for lifetime?',
                a: 'Yes, 100% Free Lifetime Edition. There are no subscription fees, no credit card requirements, no trials, and no hidden costs. Missed call detection and automated SMS replies run entirely free forever.',
              },
              {
                q: 'Do I need any API keys or developer accounts?',
                a: 'No! You do not need any API keys (no Twilio, no Fast2SMS, no MSG91, no Meta WhatsApp Cloud API). MissCall Assistant uses your phone\'s physical carrier SIM card directly through Android native telephony APIs.',
              },
              {
                q: 'Do I need to sign up or create an account?',
                a: 'No login, sign-up, or registration is required. You can start using the application immediately upon installation with zero personal credentials.',
              },
              {
                q: 'How does the automated delay safeguard work?',
                a: 'When a missed call occurs, MissCall Assistant waits for your chosen delay (2, 5, or 10 seconds) before sending the SMS. If you call the customer back within that window, the scheduled SMS is automatically aborted.',
              },
              {
                q: 'Are my customer phone numbers uploaded to remote servers?',
                a: 'No. MissCall Assistant processes all calls and dispatches SMS entirely on your device. Your contacts, customer phone numbers, and call logs remain 100% private in local storage.',
              },
              {
                q: 'Which Android versions are supported?',
                a: 'The application supports Android 8.0 up through Android 14 (API 26 to 34). Dual-SIM carrier routing is fully supported across all major phone brands.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer transition-all"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-slate-800 gap-3">
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#2563EB] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                {activeFaq === idx && (
                  <p className="mt-2.5 sm:mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5 sm:pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. AUTHOR & CONTACT SECTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200" id="contact">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full">
              Author & Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5 sm:mt-3 tracking-tight">
              Solita Solutions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 sm:mt-2 flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>Gaya, Bihar - 824232, India</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* General & WhatsApp Support */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Customer & User Support</h3>
                    <p className="text-slate-500 text-[11px] sm:text-xs">Assistance with device permissions & setup</p>
                  </div>
                </div>
                
                <div className="space-y-2.5 sm:space-y-3 mt-4 text-xs">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700 flex-wrap">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Email:</span>
                    <a href="mailto:help.solita@gmail.com" className="font-semibold text-[#2563EB] hover:underline break-all">
                      help.solita@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700 flex-wrap">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>WhatsApp:</span>
                    <a href="https://wa.me/919341718066" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:underline">
                      +91 9341718066
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 sm:gap-3">
                <a
                  href="https://wa.me/919341718066?text=Hi%20Solita%20Solutions,%20I%20need%20help%20with%20MissCall%20Assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
                <a
                  href="mailto:help.solita@gmail.com"
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Support
                </a>
              </div>
            </div>

            {/* Developer Contact */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Developer Contact</h3>
                    <p className="text-slate-500 text-[11px] sm:text-xs">Direct technical contact & bug reports</p>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3 mt-4 text-xs">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700 flex-wrap">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Email:</span>
                    <a href="mailto:contact.dev.sonu@gmail.com" className="font-semibold text-[#2563EB] hover:underline break-all">
                      contact.dev.sonu@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700 flex-wrap">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Call / WhatsApp:</span>
                    <a href="tel:+917439551862" className="font-semibold text-slate-900 hover:underline">
                      +91 7439551862
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 sm:gap-3">
                <a
                  href="tel:+917439551862"
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Developer
                </a>
                <a
                  href="https://wa.me/917439551862?text=Hi%20Sonu,%20contacting%20regarding%20MissCall%20Assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-xs text-slate-500 font-medium text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                M
              </div>
              <span className="font-bold text-slate-900">MissCall Assistant</span>
            </div>
            <span>• Built by <strong className="text-slate-800">Solita Solutions</strong> (Gaya, Bihar 824232)</span>
            <span>• © 2026 All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 sm:gap-x-6 gap-y-2">
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer font-semibold"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer font-semibold"
            >
              Terms & Compliance
            </button>
            <button
              onClick={() => setActiveLegalModal('google-play')}
              className="text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer font-semibold"
            >
              Google Play Policies
            </button>
            <a href="#contact" className="hover:text-slate-900 transition-colors">
              Contact
            </a>
            <button onClick={handleDownload} className="text-[#2563EB] font-bold hover:underline cursor-pointer">
              Download Free APK
            </button>
          </div>
        </div>
      </footer>

      {/* --- LEGAL MODAL: PRIVACY POLICY / TERMS / GOOGLE PLAY --- */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shrink-0">
                  {activeLegalModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                  {activeLegalModal === 'terms' && <FileText className="w-5 h-5 text-blue-600" />}
                  {activeLegalModal === 'google-play' && <ShieldAlert className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-lg leading-tight">
                    {activeLegalModal === 'privacy' && 'Privacy Policy & Data Protection'}
                    {activeLegalModal === 'terms' && 'Terms of Service & Anti-Spam Policy'}
                    {activeLegalModal === 'google-play' && 'Google Play Store Policy & Declarations'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    Published by Solita Solutions • Effective November 2026 • 100% Free Lifetime Edition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs text-slate-600 leading-relaxed">
              {/* PRIVACY POLICY CONTENT */}
              {activeLegalModal === 'privacy' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium space-y-1">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% On-Device Privacy Guarantee</span>
                    </div>
                    <p>
                      MissCall Assistant strictly processes call logs and SMS on your local smartphone. Your customers' phone numbers, contact names, and call histories are <strong>NEVER</strong> uploaded, sold, or shared with remote servers or third-party advertisers.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">1. Sensitive Android Permissions & Justification</h4>
                    <p>Under Google Play User Data policies, we disclose our exact use of sensitive permissions:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      <li><strong>READ_CALL_LOG & READ_PHONE_STATE:</strong> Used in real-time solely to detect when an incoming business call is missed so the automated text follow-up can be triggered.</li>
                      <li><strong>SEND_SMS:</strong> Used solely to dispatch your pre-configured business follow-up message to the missed caller using your phone's SIM card.</li>
                      <li><strong>POST_NOTIFICATIONS:</strong> Displays active background service indicators and missed-call follow-up confirmations.</li>
                      <li><strong>WAKE_LOCK:</strong> Ensures the device CPU remains active for the 2–10 second delay countdown buffer when the screen is locked.</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">2. Zero Remote Exfiltration of Customer Data</h4>
                    <p>
                      Unlike cloud CRM services, MissCall Assistant has no remote database storing your customers' private phone numbers. Incoming call numbers are stored solely in your device's private SQLite database (accessible only by MissCall Assistant).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">3. 100% Free Lifetime Model & Zero Payment Data</h4>
                    <p>
                      MissCall Assistant is 100% free of charge for lifetime use. There are no in-app purchases, subscriptions, or credit card charges. No financial or payment data is ever requested, stored, or processed.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">4. Data Deletion & Retention</h4>
                    <p>
                      You retain full ownership of your data. Uninstalling the application or clearing App Data in your Android Settings permanently wipes all locally cached call logs and templates from your device.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">5. Regulatory Compliance</h4>
                    <p>
                      This policy complies with India’s <strong>Digital Personal Data Protection Act (DPDP Act 2023)</strong>, the <strong>EU General Data Protection Regulation (GDPR)</strong>, and <strong>Google Play Developer Program Policies</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-0.5">
                    <div className="font-bold text-slate-800">Grievance Officer & Data Controller:</div>
                    <div>Solita Solutions, Gaya, Bihar 824232, India</div>
                    <div>Email: <a href="mailto:help.solita@gmail.com" className="text-[#2563EB] font-bold">help.solita@gmail.com</a> • WhatsApp: +91 9341718066</div>
                  </div>
                </>
              )}

              {/* TERMS & COMPLIANCE CONTENT */}
              {activeLegalModal === 'terms' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-medium space-y-1">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span>Legitimate Business Use & Anti-Spam Terms</span>
                    </div>
                    <p>
                      MissCall Assistant is designed strictly for replying to customers who have voluntarily called your business phone. It must never be used for bulk unsolicited marketing or SMS spam.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">1. TRAI & DND Registry Compliance (India)</h4>
                    <p>
                      Users operating in India must strictly adhere to the <strong>Telecom Commercial Communications Customer Preference Regulations (TCCCPR)</strong> established by TRAI. You agree not to send promotional messages to numbers registered on the National Do Not Call (NDNC) registry without prior customer consent.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">2. Carrier SMS Tariffs & Daily Limits</h4>
                    <p>
                      Automated SMS messages are dispatched directly through your selected SIM card (e.g. Jio, Airtel, Vi, BSNL). Standard carrier SMS rates apply according to your active SIM plan. You acknowledge that Indian telecom operators enforce a regulatory cap of 100 SMS per SIM per day on standard prepaid/postpaid plans.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">3. Safeguard Delay Buffer</h4>
                    <p>
                      The app provides a configurable 2s, 5s, or 10s callback delay safeguard. If you return a missed call within this window, the outgoing call is detected and the automated SMS is automatically aborted.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">4. 100% Free Lifetime License</h4>
                    <p>
                      MissCall Assistant is distributed as a 100% free lifetime utility for legitimate business and customer service follow-ups. No fees, recurring charges, or subscriptions apply.
                    </p>
                  </div>
                </>
              )}

              {/* GOOGLE PLAY POLICIES & DECLARATION */}
              {activeLegalModal === 'google-play' && (
                <>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium space-y-1">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Google Play Developer Program Policy Declarations</span>
                    </div>
                    <p>
                      Official documentation regarding Google Play Store Sensitive Permissions, Prominent Disclosures, and Direct Distribution policies.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">1. Google Play SMS & Call Log Policy Exemption</h4>
                    <p>
                      Google Play strictly limits <code>SEND_SMS</code> and <code>READ_CALL_LOG</code> to apps selected as the user's <strong>Default SMS Handler</strong> or <strong>Default Phone/Dialer Handler</strong>.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      • <strong>For Direct Distribution (Website APK):</strong> Sideloaded APKs operate under Android OS permissions without requiring the Google Play Store Default Handler exemption. Users grant standard Android runtime permissions and unlock Android 13/14 Restricted Settings via App Info.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">2. Google Mandated Prominent In-App Disclosure</h4>
                    <p>
                      Per Google Play Policy Section <em>"Prominent Disclosure & Consent"</em>, the app presents an in-app disclosure dialog before requesting permissions, confirming that telephony data is processed solely on-device.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">3. Google Play Protect Compliance</h4>
                    <p>
                      MissCall Assistant contains zero malware, zero third-party ads, zero remote command-and-control backdoors, and zero cryptocurrency miners. The APK is cryptographically signed and safe for production usage.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-medium">Solita Solutions • MissCall Assistant v{version}</span>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
