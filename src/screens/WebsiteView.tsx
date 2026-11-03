import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Zap,
  PhoneCall,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BatteryCharging,
  Sliders,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  Star,
  RefreshCw,
  Send,
  CreditCard,
} from 'lucide-react';

interface WebsiteViewProps {
  onOpenDashboard: () => void;
  onOpenSimulator: () => void;
  onNavigateTab: (tab: any) => void;
}

export function WebsiteView({
  onOpenDashboard,
  onOpenSimulator,
  onNavigateTab,
}: WebsiteViewProps) {
  const [copiedSha, setCopiedSha] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const version = '1.0.2';
  const size = '20.5 MB';
  const lastUpdated = 'October 2026';
  const sha256 = '4EA4DADE497925A6430525DBADE99C964DC1F71E01261029A89736C7C75BCEEA';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/misscall-assistant.apk';
    link.setAttribute('download', 'Missed-Call-Assistant.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyChecksum = () => {
    navigator.clipboard.writeText(sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2500);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-indigo-600 selection:text-white relative">
      {/* Subtle Dot Grid Background (Reference 3 Quso Style) */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      {/* 1. TOP NAVBAR */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3B28CC] text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200">
              M
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>MissCall Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-[#3B28CC] font-bold border border-indigo-100">
                  Android
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Telephony Follow-Up</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#3B28CC] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#3B28CC] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#3B28CC] transition-colors">Pricing</a>
            <a href="#download" className="hover:text-[#3B28CC] transition-colors">Download APK</a>
            <a href="#faq" className="hover:text-[#3B28CC] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('admin-login')}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              Admin Portal
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B28CC] hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-indigo-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (REFERENCE 3 QUSO STYLE WITH FLOATING CARDS) */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-[#3B28CC] text-xs font-extrabold border border-indigo-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart Missed Call Native SMS Follow-Up Automation</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Never Miss a Customer <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B28CC] via-indigo-600 to-sky-500">
              Follow-Up.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Automatically send an SMS reply when you miss a customer call. Configure your business, choose your delay and keep your follow-ups running with MissCall Assistant.
          </p>

          {/* Social Proof Star Pill */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">4.9/5 rated by retail shops & service businesses</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#3B28CC] hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-indigo-300 transition-all hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              <span>Download for Android (APK)</span>
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Release {version} • {size} • Android 8.0 to 14 Supported • 3-Day Free Trial
          </div>
        </div>

        {/* 3. INTERACTIVE FLOATING MOCKUP CAROUSEL (REFERENCE 3 STYLE) */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          {/* Floating Card Left: Sent SMS Notification */}
          <div className="hidden lg:block absolute -left-10 top-16 z-20 bg-white p-4 rounded-3xl shadow-xl border border-slate-200 w-64 text-left animate-bounce duration-1000">
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
          <div className="hidden lg:block absolute -right-8 top-28 z-20 bg-white p-4 rounded-3xl shadow-xl border border-slate-200 w-64 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-[#3B28CC] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Delay Safeguard Active</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Set to <strong className="text-slate-800">5 seconds</strong>. If you call back first, SMS is automatically aborted.
            </p>
          </div>

          {/* Center Card: Android Redesigned Interface Showcase (Reference 2 Layout) */}
          <div className="mx-auto max-w-md bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden text-left relative">
            {/* Phone Screen Header (Light Blue & White Gradient - Reference 2) */}
            <div className="bg-gradient-to-b from-[#E0F2FE] via-[#EFF6FF] to-white p-6 pb-4 border-b border-sky-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B28CC] to-sky-400 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    MB
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Welcome Back</h3>
                    <p className="text-xs text-slate-600 font-semibold">My Store & Services</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active • ₹99/mo
                </span>
              </div>

              {/* Automation Toggle Card */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">Automate Missed Call SMS</span>
                  <span className="text-[11px] text-slate-500">SIM 1 • AirTel Telecom</span>
                </div>
                <div className="w-11 h-6 bg-[#3B28CC] rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>

            {/* Phone Screen Body Content */}
            <div className="p-6 space-y-4 bg-white text-xs">
              {/* Delay Selector */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  SMS Delay Safeguard
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="py-2 text-center rounded-xl bg-slate-50 text-slate-500 font-bold border border-slate-200">
                    2 Sec
                  </div>
                  <div className="py-2 text-center rounded-xl bg-[#3B28CC] text-white font-extrabold shadow-sm">
                    5 Sec
                  </div>
                  <div className="py-2 text-center rounded-xl bg-slate-50 text-slate-500 font-bold border border-slate-200">
                    10 Sec
                  </div>
                </div>
              </div>

              {/* SMS Message Template Preview */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Configured Reply Message
                </span>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                  "Hello! Sorry we missed your call from our store. How can we help you today?"
                </div>
              </div>

              {/* Diagnostics Health */}
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
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
      <section id="features" className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#3B28CC] uppercase tracking-wider">Reliable Architecture</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Built Exclusively for Android Native SMS</h2>
            <p className="text-slate-600 text-sm">
              No third-party messaging delays, no cloud reliance. Everything executes right on your phone through your carrier SIM card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3B28CC] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Instant Native SMS</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Dispatches native carrier SMS immediately when a missed call is detected, using standard Android telephony APIs.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">2s, 5s, 10s Delay Safeguard</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Configurable delay allows you time to call the customer back immediately. If you call first, the scheduled SMS is automatically canceled.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Dual-SIM Support</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Explicitly choose which SIM slot dispatches your automated SMS response, preserving personal and business number separation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">100% On-Device Privacy</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Customer phone numbers and call logs never leave your phone. The app operates locally without selling or harvesting contacts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">₹99/Month Fair Pricing</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                3-Day free trial on install. Afterward, pay a simple ₹99/month subscription via Razorpay with instant server-verified activation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">24/7 Background Reliability</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Clear in-app guidance for disabling battery optimization ensures your missed-call listener stays active even when the screen is locked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto space-y-12 text-center">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-extrabold text-[#3B28CC] uppercase tracking-wider">Fast Onboarding</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">How It Works in 3 Steps</h2>
          <p className="text-slate-600 text-sm">Get up and running in under two minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3B28CC] font-black text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-black text-slate-900 text-base">Download & Install</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Download the verified APK directly from our official website and grant standard telephony permissions.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3B28CC] font-black text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-black text-slate-900 text-base">Customize Your Reply</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Enter your store or business name, customize the SMS message, and choose your safeguard delay (2s, 5s, or 10s).
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3B28CC] font-black text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-black text-slate-900 text-base">Automate Follow-Ups</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Start your 3-day free trial or activate the ₹99/mo subscription. When a customer calls and you miss it, they get your SMS automatically!
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING */}
      <section id="pricing" className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-[#3B28CC] uppercase tracking-wider">Simple SaaS Plan</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">One Transparent Plan for All Businesses</h2>
            <p className="text-slate-600 text-sm">No setup fees. No hidden markups. Pure native Android utility.</p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-indigo-200 shadow-xl space-y-6 text-left max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">MissCall Assistant Pro</h3>
                <p className="text-xs text-slate-500 font-medium">Full business telephony automation</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-[#3B28CC]">
                3-Day Trial Included
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">₹99</span>
              <span className="text-slate-500 font-bold text-sm">/ month</span>
            </div>

            <ul className="space-y-3 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Unlimited automated missed-call SMS replies</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Customizable 2s, 5s, 10s callback delay safeguard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dual-SIM card selection & management</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3-day offline local cache fallback</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Razorpay secure payment & autopay integration</span>
              </li>
            </ul>

            <button
              onClick={handleDownload}
              className="w-full py-4 rounded-2xl bg-[#3B28CC] hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 transition-all text-center block"
            >
              Get Started with 3-Day Free Trial
            </button>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Standard carrier SMS rates apply according to your existing SIM plan.
            </p>
          </div>
        </div>
      </section>

      {/* 7. APK DOWNLOAD & SHA-256 VERIFICATION */}
      <section id="download" className="py-20 px-6 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-[#3B28CC] uppercase tracking-wider">Production Release</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Download Verified Android APK</h2>
          <p className="text-slate-600 text-sm">
            Install MissCall Assistant directly onto your device. Play Protect compliance verified.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 text-lg">misscall-assistant.apk</h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Clean
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Version {version} • Size: {size} • Updated {lastUpdated}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#3B28CC] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </button>
          </div>

          {/* SHA-256 Checksum Display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                SHA-256 Cryptographic Checksum
              </span>
              <button
                onClick={copyChecksum}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B28CC] hover:underline"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSha ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-700 break-all bg-white p-2.5 rounded-xl border border-slate-100">
              {sha256}
            </p>
          </div>

          {/* Android Installation Instructions */}
          <div className="space-y-3 pt-2">
            <h5 className="font-bold text-slate-900 text-xs">Android Installation Instructions:</h5>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
              <li>Click <strong>Download APK</strong> to save the package to your Android device.</li>
              <li>When prompted by Chrome or your browser, select <strong>"Download anyway"</strong>.</li>
              <li>Open the downloaded APK and tap <strong>"Install"</strong> (allow <em>Install unknown apps</em> if asked).</li>
              <li>Open MissCall Assistant, enter your business name, and start your 3-day trial!</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about MissCall Assistant.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the automated delay safeguard work?',
                a: 'When someone misses your call, MissCall Assistant waits your chosen delay (2, 5, or 10 seconds) before sending an SMS. If you call the customer back within that window, the scheduled SMS is automatically aborted so you never send an unnecessary text.',
              },
              {
                q: 'Does this use WhatsApp or native SMS?',
                a: 'MissCall Assistant strictly uses your phone’s native Android carrier SMS. This guarantees immediate delivery without requiring WhatsApp Business API setups or third-party message bans.',
              },
              {
                q: 'What happens after the 3-day free trial?',
                a: 'After 3 days, you can subscribe for just ₹99/month via our secure Razorpay integration. Your subscription activates instantly and you can cancel anytime.',
              },
              {
                q: 'Are my customer phone numbers uploaded to your servers?',
                a: 'No. MissCall Assistant processes calls and dispatches SMS directly on your phone. Your contacts, customer phone numbers, and call logs remain 100% private on your device.',
              },
              {
                q: 'Which Android versions are supported?',
                a: 'The application supports Android 8.0 up through Android 14 (SDK 26 to 34). We use native CallScreeningService for modern Android compatibility.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex items-center justify-between font-bold text-sm text-slate-800">
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#3B28CC]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                {activeFaq === idx && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#3B28CC] text-white flex items-center justify-center font-bold text-sm">
              M
            </div>
            <span className="font-bold text-slate-900">MissCall Assistant</span>
            <span>• © 2026 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigateTab('admin-login')} className="hover:text-slate-900">
              Admin Portal
            </button>
            <button onClick={() => onNavigateTab('simulator')} className="hover:text-slate-900">
              Call Simulator
            </button>
            <button onClick={handleDownload} className="text-[#3B28CC] font-bold hover:underline">
              Download APK
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
