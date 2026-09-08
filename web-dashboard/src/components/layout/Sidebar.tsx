"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneMissed,
  Users,
  MessageSquare,
  FileText,
  Smartphone,
  Settings,
  Circle,
  Radio,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WhatsAppConnectionStatus } from "@/types";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "App Simulator", href: "/simulator", icon: PlayCircle },
  { label: "Missed Calls", href: "/calls", icon: PhoneMissed },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "WhatsApp", href: "/whatsapp", icon: Smartphone },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<WhatsAppConnectionStatus>("DISCONNECTED");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setPhone(data.number || "");
        }
      } catch (e) {
        // Handled
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-[#0B141A] text-gray-200 border-r border-[#222E35] flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#222E35] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#075E54] to-[#25D366] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#25D366]/20">
          W
        </div>
        <div>
          <h1 className="font-bold text-sm text-white tracking-wide leading-tight">
            MissCall Assistant
          </h1>
          <p className="text-[11px] text-[#8696A0] font-medium">WhatsApp Web Engine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? "bg-[#00A884]/15 text-[#00A884] font-semibold"
                  : "text-[#8696A0] hover:text-white hover:bg-[#111B21]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#00A884]" : "text-[#8696A0]"}`} />
              <span>{item.label}</span>
              {item.label === "WhatsApp" && status === "CONNECTED" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-[#222E35]">
        <Link
          href="/whatsapp"
          className="block p-3 rounded-xl bg-[#111B21] hover:bg-[#1F2C34] transition-colors border border-[#222E35]/60"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8696A0]">
              Web Session
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                status === "CONNECTED"
                  ? "bg-[#25D366]/15 text-[#25D366]"
                  : status === "CONNECTING"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              <Circle className="w-1.5 h-1.5 fill-current" />
              {status}
            </span>
          </div>
          <p className="text-xs text-white font-medium truncate">
            {status === "CONNECTED" ? phone || "Session Active" : "Click to connect QR"}
          </p>
        </Link>
      </div>
    </aside>
  );
}
