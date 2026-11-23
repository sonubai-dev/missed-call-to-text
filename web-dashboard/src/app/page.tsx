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
  Phone,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'MissCall Assistant - 100% Free Lifetime Android Missed Call SMS Automation',
  description:
    'Download MissCall Assistant Android APK. 100% Free Lifetime Edition. Automated missed call SMS follow-up, dual-SIM support, zero API keys, no subscription, and 2s/5s/10s delay safeguard.',
  openGraph: {
    title: 'MissCall Assistant - 100% Free Lifetime Android Utility',
    description: 'Instant SMS auto-reply for missed business calls on Android with dual-SIM routing. Zero API keys, 100% free forever.',
    url: 'https://missed-call-to-text.vercel.app',
    siteName: 'MissCall Assistant',
    type: 'website',
  },
};

export default function HomePage() {
  const version = '1.0.2';
  const size = '20.5 MB';
  const lastUpdated = 'November 2026';
  const sha256 = '4EA4DADE497925A6430525DBADE99C964DC1F71E01261029A89736C7C75BCEEA';

  return (
    <div className="min-h-screen bg-[#0B132B] text-[#E0E6ED] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1C2541] bg-[#0B132B]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-950/40 shrink-0 font-black">
              M
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>MissCall Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  100% Free Lifetime
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#8D99AE] truncate max-w-[140px] sm:max-w-none">
                Zero API Keys • Native Carrier SMS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/downloads/misscall-assistant.apk"
              download="Missed-Call-Assistant.apk"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-950/50 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Free APK</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-bold tracking-wide max-w-full text-center">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate sm:whitespace-normal">100% Free Lifetime • Zero API Keys • No Login/Sign-up</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Missed call? Customer ko turant SMS jaaye.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto px-1 sm:px-0">
            Lightweight Android application designed for Indian business owners. Automatically sends polite SMS follow-ups from your SIM card with smart 2s/5s/10s delay countdown safeguards and dual-SIM support. Pure native utility—no API keys, no subscriptions.
          </p>

          {/* Download Card */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C2541] to-[#0B132B] border border-[#2B3A67] shadow-2xl space-y-3 sm:space-y-4 max-w-xl mx-auto w-full">
            <a
              href="/downloads/misscall-assistant.apk"
              download="Missed-Call-Assistant.apk"
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-950/60 transition-transform active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>Download Free APK Now ({size})</span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-400 font-medium">
              <span>Version: <strong className="text-white">v{version}</strong></span>
              <span>•</span>
              <span>Updated: <strong className="text-white">{lastUpdated}</strong></span>
              <span>•</span>
              <span>Android 8.0 to 14</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">100% Free Forever</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero API Keys Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No Twilio, MSG91, or Meta WhatsApp API keys needed. The app sends SMS directly through your phone’s physical SIM card via native Android telephony.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2s / 5s / 10s Delay Countdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero awkward double texts. If you dial back the customer within the countdown window, the automated SMS cancels itself immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] space-y-3">
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
            <div className="p-5 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-500/30">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">APK Download Karein</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upar diye gaye <strong>"Download Free APK"</strong> button par tap karein aur download complete hone dein.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-500/30">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">"Play Protect blocked" Aaye toh:</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tap <strong>"More details"</strong> &gt; tap <strong>"Install anyway"</strong>. (Direct APK distribution par Play Protect warning aati hai).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-500/30">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">"App not installed" Error Aaye toh:</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Purana version phone se pehle <strong>Uninstall</strong> karein, free phone storage check karein, aur dubara APK install karein.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-500/30">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Allow Restricted Settings & Permissions</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Android Settings &gt; Apps &gt; MissCall Assistant &gt; ⋮ (top right) &gt; <strong>"Allow restricted settings"</strong> turn on karein. Fir Call Log, Phone, aur SMS permissions grant karein.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] flex items-start gap-4 md:col-span-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-500/30">
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

        {/* Free Forever Pricing Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1C2541] via-[#0B132B] to-[#1C2541] border border-[#2B3A67] text-center space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              100% Free Lifetime Edition
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white pt-2">₹0 / Lifetime Free</h3>
            <p className="text-xs text-slate-400">
              Zero subscription fees. Zero API keys. Unlimited automated missed-call SMS follow-ups through your SIM card.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero API Keys</span>
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
        <div className="p-6 rounded-2xl bg-[#1C2541]/70 border border-[#2B3A67] max-w-2xl mx-auto text-center space-y-4">
          <h4 className="text-base font-bold text-white">Need help setting up on your phone?</h4>
          <p className="text-xs text-slate-400">
            Our engineering team is available to assist you with installation or permission settings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/919341718066?text=Hi%20Solita%20Solutions%2C%20I%20need%20help%20with%20MissCall%20Assistant"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#25D366]/20 text-[#25D366] border border-[#2B3A67] font-semibold text-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: +91 9341718066</span>
            </a>

            <a
              href="mailto:help.solita@gmail.com?subject=MissCall%20Assistant%20Support"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-slate-300 font-semibold text-xs transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>help.solita@gmail.com</span>
            </a>

            <a
              href="tel:+917439551862"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-slate-300 font-semibold text-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Dev: +91 7439551862</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C2541] bg-[#0B132B] py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">MissCall Assistant</span> • Built by <strong className="text-slate-300">Solita Solutions</strong> (Gaya, Bihar 824232) • &copy; {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Compliance</Link>
            <span>•</span>
            <a href="/downloads/misscall-assistant.apk" download className="text-blue-400 hover:text-blue-300 font-medium">Download APK</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
