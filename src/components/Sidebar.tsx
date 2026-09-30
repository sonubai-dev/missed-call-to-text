import React from "react";
import {
  LayoutDashboard,
  PhoneMissed,
  Users,
  BellRing,
  MessageSquare,
  Smartphone,
  Sliders,
  FileText,
  PlayCircle,
  Webhook,
  Settings,
  ShieldAlert,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "calls"
  | "customers"
  | "followups"
  | "whatsapp"
  | "sms"
  | "rules"
  | "templates"
  | "simulator"
  | "webhooks"
  | "settings";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount: number;
  missedCount: number;
  customerCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  missedCount,
  customerCount,
}) => {
  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: "calls" as NavTab,
      label: "Missed Calls",
      icon: PhoneMissed,
      badge: missedCount > 0 ? missedCount : undefined,
      badgeColor: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    },
    {
      id: "customers" as NavTab,
      label: "Customer CRM",
      icon: Users,
      badge: customerCount,
      badgeColor: "bg-[#202C33] text-[#8696A0]",
    },
    {
      id: "followups" as NavTab,
      label: "Follow-up Queue",
      icon: BellRing,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    },
    {
      id: "whatsapp" as NavTab,
      label: "WhatsApp Web",
      icon: MessageSquare,
      badge: "Bridge",
      badgeColor: "bg-[#25D366]/20 text-[#25D366]",
    },
    {
      id: "sms" as NavTab,
      label: "SMS & Dual SIM",
      icon: Smartphone,
      badge: undefined,
    },
    {
      id: "rules" as NavTab,
      label: "Automation Rules",
      icon: Sliders,
      badge: undefined,
    },
    {
      id: "templates" as NavTab,
      label: "Message Templates",
      icon: FileText,
      badge: undefined,
    },
    {
      id: "simulator" as NavTab,
      label: "Call Simulator",
      icon: PlayCircle,
      badge: "Interactive",
      badgeColor: "bg-emerald-500/20 text-emerald-400",
    },
    {
      id: "webhooks" as NavTab,
      label: "Webhooks & Sync",
      icon: Webhook,
      badge: undefined,
    },
    {
      id: "settings" as NavTab,
      label: "Settings",
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <aside className="w-64 bg-[#111B21] border-r border-[#222E35] flex flex-col shrink-0">
      {/* App brand header */}
      <div className="p-4 border-b border-[#222E35]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A884] to-[#25D366] flex items-center justify-center text-white shadow-md shadow-[#00A884]/20">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-wide block">
              MissCall Assistant
            </span>
            <span className="text-[11px] text-[#00A884] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
              Telephony Service Active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8696A0]">
          Core Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-[#00A884] text-white shadow-sm shadow-[#00A884]/30"
                  : "text-[#8696A0] hover:text-white hover:bg-[#202C33]/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-[#8696A0] group-hover:text-white"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor || "bg-[#202C33] text-[#8696A0]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#222E35] bg-[#0C1317]/50 m-2 rounded-xl">
        <div className="flex items-center justify-between text-[11px] text-[#8696A0]">
          <span>Telephony Port</span>
          <span className="font-mono text-emerald-400">Android 14 Ready</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#8696A0] mt-1">
          <span>Engine Status</span>
          <span className="text-white font-medium">Local-First Room DB</span>
        </div>
      </div>
    </aside>
  );
};
