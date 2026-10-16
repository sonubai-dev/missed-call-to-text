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
  MessageCircle,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const version = '1.0.2';
  const size = '20.5 MB';
  const lastUpdated = 'October 2026';
  const sha256 = 'ee202575afb0848d0de43e36f010cc75f7308335ac9a35588d10ca7c682bc26e';

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
    <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-[#222E35] bg-[#111B21]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>MissCall Assistant</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  v{version}
                </span>
              </div>
              <div className="text-[11px] text-[#8696A0]">Smart Android Telephony Automation</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenDashboard}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#1F2C34] hover:bg-[#2A3942] rounded-xl transition-all"
            >
              CRM Web
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3-Day Free Trial • No Credit Card Required</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Missed call? Customer ko turant SMS jaaye.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Lightweight Android application designed for Indian business owners. Automatically sends polite SMS follow-ups from your SIM card with smart 2s/5s/10s delay countdown safeguards and dual-SIM support.
          </p>

          {/* Primary Download Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#182229] to-[#111B21] border border-[#222E35] shadow-2xl space-y-4 max-w-xl mx-auto">
            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base shadow-lg shadow-emerald-950/60 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download APK Now ({size})</span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
              <span>Version: <strong className="text-white">v{version}</strong></span>
              <span>•</span>
              <span>Updated: <strong className="text-white">{lastUpdated}</strong></span>
              <span>•</span>
              <span>Android 8.0+</span>
            </div>

            {/* Checksum Box */}
            <div className="pt-2 border-t border-[#222E35]">
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35]/60">
                <div className="text-[11px] font-mono text-slate-400 truncate text-left">
                  <span className="text-emerald-400 font-bold mr-1">SHA-256:</span>
                  <span className="select-all">{sha256}</span>
                </div>
                <button
                  onClick={copyChecksum}
                  className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSha ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Native Dual-SIM Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose specifically whether to send follow-up SMS via SIM 1 (e.g. Jio) or SIM 2 (e.g. Airtel). Uses your existing unlimited carrier SMS plan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2s / 5s / 10s Delay Countdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero awkward double texts. If you dial back the customer or reply yourself within the countdown window, the automated SMS cancels itself immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">100% On-Device Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your call logs, customer phone numbers, and messages never leave your phone. All screening and dispatch happen completely offline on device.
            </p>
          </div>
        </div>

        {/* Step-by-Step Installation Guide (Hinglish) */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Phone me Install Kaise Karein? (5 Simple Steps)
            </h2>
            <p className="text-xs text-slate-400">
              Follow these simple steps on your Android device to activate missed-call SMS automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">APK Download Karein</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upar diye gaye <strong>"Download APK"</strong> button par tap karein aur download complete hone dein.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">"Play Protect blocked" Aaye toh:</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tap <strong>"More details"</strong> &gt; tap <strong>"Install anyway"</strong>. (Hamara app Play Store ke bahar direct distribute hota hai isliye ye warning aati hai).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">"App not installed" Error Aaye toh:</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Purana version phone se pehle <strong>Uninstall</strong> karein, free phone storage check karein, aur dubara APK install karein.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Allow Restricted Settings & Permissions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Android Settings &gt; Apps &gt; MissCall Assistant &gt; ⋮ (top right) &gt; <strong>"Allow restricted settings"</strong> turn on karein. Fir Call Log, Phone, aur SMS permissions grant karein.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex items-start gap-4 md:col-span-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-500/30">
                5
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Battery Optimization OFF & Autostart (Xiaomi / Vivo / Oppo)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  App settings me <strong>Battery Optimization</strong> ko "Unrestricted" karein aur <strong>Autostart</strong> enable karein taaki screen lock hone par bhi missed call detect ho sake.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#182229] via-[#111B21] to-[#182229] border border-[#222E35] text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <span>Transparent Flat Pricing</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white">₹100 / Month Flat</h3>
            <p className="text-xs text-slate-400">
              Includes unlimited missed call detections, dual-SIM SMS routing, and 3 days free trial on first launch.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dual SIM Support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Works 100% Offline</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install & Start Free Trial</span>
          </button>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-white text-center mb-6">Frequently Asked Questions</h3>

          {[
            {
              q: 'Why does the app need Call Log and Phone permissions?',
              a: 'The app uses Android’s native CallScreeningService to detect when a business call is missed. It does NOT upload your call history anywhere. The detection happens locally inside your phone memory.',
            },
            {
              q: 'Why does the app need SEND_SMS permission?',
              a: 'MissCall Assistant dispatches the polite follow-up message directly from your phone’s SIM card (SIM 1 or SIM 2) using your active SMS balance, saving you high third-party SMS gateway fees.',
            },
            {
              q: 'What if I call back the customer immediately?',
              a: 'That is the beauty of our delay countdown safeguard! When a missed call occurs, a 2s, 5s, or 10s timer starts. If you dial back or answer before the timer expires, the automated text is cancelled instantly.',
            },
            {
              q: 'Does it work when my internet is disconnected?',
              a: 'Yes! The missed call listener and SMS engine work 100% offline. Subscription entitlements are securely cached for 3 days offline so you never drop customers in low-network zones.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#111B21] border border-[#222E35] cursor-pointer"
              onClick={() => toggleFaq(i)}
            >
              <div className="flex items-center justify-between font-semibold text-white text-sm">
                <span>{faq.q}</span>
                {activeFaq === i ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              {activeFaq === i && (
                <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-[#222E35] pt-3">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Contact & Support Section */}
        <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] max-w-2xl mx-auto text-center space-y-4">
          <h4 className="text-base font-bold text-white">Need help setting up on your phone?</h4>
          <p className="text-xs text-slate-400">
            Our engineering team is available to assist you with installation or subscription activation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20MissCall%20Assistant"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#25D366]/20 text-[#25D366] border border-[#222E35] font-semibold text-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href="mailto:support@vistaroai.com?subject=MissCall%20Assistant%20Support"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-slate-300 font-semibold text-xs transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email: support@vistaroai.com</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222E35] bg-[#0C1317] py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MissCall Assistant</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} VistaroAI. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms & Refund Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onNavigateTab('admin-login');
                window.history.pushState({}, '', '/admin/login');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy & Terms Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B21] border border-[#222E35] rounded-2xl max-w-xl w-full p-6 text-xs text-slate-300 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222E35] pb-3">
              <h3 className="font-bold text-white text-base">
                {activeLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service & Refund Policy'}
              </h3>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-2 py-1 rounded bg-[#202C33] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {activeLegalModal === 'privacy' ? (
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>1. Zero Data Harvesting:</strong> MissCall Assistant does NOT upload, sell, or collect your call logs, phone contacts, or SMS messages to any cloud database. All operations take place locally on your Android device.
                </p>
                <p>
                  <strong>2. Anonymous Device Identification:</strong> When checking subscription status, the app generates a random device UUID without collecting your name, Google account, or personal profile.
                </p>
                <p>
                  <strong>3. Payments via Razorpay:</strong> All subscription billing is processed through Razorpay's PCI-DSS compliant secure servers. Your payment details (UPI, debit card, net banking) are handled directly by Razorpay and never stored on our servers.
                </p>
              </div>
            ) : (
              <div className="space-y-3 leading-relaxed">
                <p>
                  <strong>1. Subscription Terms:</strong> MissCall Assistant provides automated missed-call SMS software for a monthly subscription fee of ₹100.
                </p>
                <p>
                  <strong>2. 3-Day Free Trial:</strong> All new devices receive 3 days of complimentary access to test SMS auto-dispatch before payment is required.
                </p>
                <p>
                  <strong>3. Cancellation & Refund Policy:</strong> You may cancel your subscription at any time through the in-app subscription menu or Razorpay dashboard. If you experience technical defects, contact support@vistaroai.com within 7 days for a full refund.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
