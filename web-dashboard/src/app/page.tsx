import Link from 'next/link';
import {
  Smartphone,
  Download,
  Copy,
  ShieldCheck,
  Clock,
  PhoneCall,
  Check,
  MessageCircle,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'MissCall Assistant - Missed call? Customer ko turant SMS jaaye.',
  description:
    'Download MissCall Assistant Android APK. Automated missed call SMS follow-up, dual-SIM support, 2s/5s/10s delay countdown safeguard, and ₹100/mo subscription with 3-day free trial.',
  openGraph: {
    title: 'MissCall Assistant - Missed call? Customer ko turant SMS jaaye.',
    description: 'Instant SMS auto-reply for missed business calls on Android with dual-SIM routing.',
    url: 'https://web-dashboard-eight-mu.vercel.app',
    siteName: 'MissCall Assistant',
    type: 'website',
  },
};

export default function HomePage() {
  const version = '1.0.2';
  const size = '20.5 MB';
  const lastUpdated = 'October 2026';
  const sha256 = 'ee202575afb0848d0de43e36f010cc75f7308335ac9a35588d10ca7c682bc26e';

  return (
    <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
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

          <div className="flex items-center gap-3">
            <a
              href="/downloads/misscall-assistant.apk"
              download="Missed-Call-Assistant.apk"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3-Day Free Trial • No Credit Card Required</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Missed call? Customer ko turant SMS jaaye.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Lightweight Android application designed for Indian business owners. Automatically sends polite SMS follow-ups from your SIM card with smart 2s/5s/10s delay countdown safeguards and dual-SIM support.
          </p>

          {/* Download Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#182229] to-[#111B21] border border-[#222E35] shadow-2xl space-y-4 max-w-xl mx-auto">
            <a
              href="/downloads/misscall-assistant.apk"
              download="Missed-Call-Assistant.apk"
              className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base shadow-lg shadow-emerald-950/60 transition-transform active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>Download APK Now ({size})</span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
              <span>Version: <strong className="text-white">v{version}</strong></span>
              <span>•</span>
              <span>Updated: <strong className="text-white">{lastUpdated}</strong></span>
              <span>•</span>
              <span>Android 8.0+</span>
            </div>

            {/* Checksum Box */}
            <div className="pt-2 border-t border-[#222E35]">
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35]/60 text-[11px] font-mono text-slate-400 break-all text-center">
                <span className="text-emerald-400 font-bold mr-1">SHA-256:</span>
                <span>{sha256}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
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
              Zero awkward double texts. If you dial back the customer within the countdown window, the automated SMS cancels itself immediately.
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

        {/* 5-Step Hinglish Installation Guide */}
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
        </div>

        {/* Contact Section */}
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
          <div>
            <span className="font-bold text-white">MissCall Assistant</span> • &copy; {new Date().getFullYear()} VistaroAI
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Refund Policy</Link>
            <span>•</span>
            <Link href="/admin/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
