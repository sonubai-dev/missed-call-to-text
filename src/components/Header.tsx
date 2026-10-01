import React from "react";
import {
  Smartphone,
  Circle,
  Play,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  User,
  Download,
} from "lucide-react";
import { WhatsAppConnectionStatus, UserAccount } from "../types";

interface HeaderProps {
  sessionStatus: WhatsAppConnectionStatus;
  linkedNumber?: string;
  user: UserAccount;
  onOpenSimulator: () => void;
  onOpenPaywall: () => void;
  onResetData: () => void;
  onOpenDownload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionStatus,
  linkedNumber,
  user,
  onOpenSimulator,
  onOpenPaywall,
  onResetData,
  onOpenDownload,
}) => {
  return (
    <header className="h-16 bg-[#111B21] border-b border-[#222E35] px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00A884] flex items-center justify-center text-white shadow-sm shadow-[#00A884]/30">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              MissCall Assistant
            </h1>
            <span className="text-[10px] text-[#8696A0] tracking-wide uppercase font-semibold">
              Android Telephony & WhatsApp Engine
            </span>
          </div>
        </div>

        {/* WhatsApp Session Status Indicator */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#222E35]">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              sessionStatus === "CONNECTED"
                ? "bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20"
                : sessionStatus === "CONNECTING"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
            }`}
          >
            <Circle className="w-2 h-2 fill-current" />
            <span>WA: {sessionStatus}</span>
          </span>
          {sessionStatus === "CONNECTED" && linkedNumber && (
            <span className="text-xs text-[#8696A0] font-mono hidden lg:inline">
              ({linkedNumber})
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Download Android App Website Link */}
        <button
          onClick={onOpenDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shadow-sm"
          title="Download Android App APK & Website"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download App</span>
        </button>

        {/* Telephony Simulator Button */}
        <button
          onClick={onOpenSimulator}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
          title="Launch Telephony & Call Pipeline Simulator"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Call Simulator</span>
        </button>

        {/* Subscription / Paywall Status */}
        <button
          onClick={onOpenPaywall}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            user.subscriptionStatus === "ACTIVE"
              ? "bg-[#202C33] border-[#222E35] text-emerald-400 hover:border-emerald-500/50"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
          }`}
          title="Manage SaaS Subscription & Paywall"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {user.subscriptionStatus === "ACTIVE" ? "Pro Plan" : "Subscription Inactive"}
          </span>
        </button>

        {/* Reset Sample Data */}
        <button
          onClick={onResetData}
          className="p-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-[#8696A0] hover:text-white transition-colors"
          title="Reset sample data to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#222E35]">
          <div className="w-8 h-8 rounded-full bg-[#00A884]/20 border border-[#00A884]/40 flex items-center justify-center text-[#00A884] font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
            <p className="text-[10px] text-[#8696A0] leading-none">Business Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
};
