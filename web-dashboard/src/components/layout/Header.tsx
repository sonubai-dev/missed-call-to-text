"use client";

import { useEffect, useState } from "react";
import { BusinessSettings, WhatsAppConnectionStatus } from "@/types";
import { Circle, RefreshCw, Smartphone } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [status, setStatus] = useState<WhatsAppConnectionStatus>("DISCONNECTED");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, sessionRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/session"),
        ]);
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (sessionRes.ok) {
          const s = await sessionRes.json();
          setStatus(s.status);
        }
      } catch (e) {
        // Handled
      }
    };
    fetchData();
  }, []);

  return (
    <header className="h-16 bg-[#111B21] border-b border-[#222E35] px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            {settings?.businessName || "Apex Electronics"}
          </h2>
          <p className="text-xs text-[#8696A0]">
            Local-First Business Assistant • Owner: {settings?.ownerName || "Business Owner"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/whatsapp"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202C33] hover:bg-[#2A3942] border border-[#222E35] transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#00A884]" />
          <span className="text-xs font-semibold text-gray-200">WhatsApp Web:</span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              status === "CONNECTED"
                ? "bg-[#00A884]/20 text-[#00A884]"
                : status === "CONNECTING"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-rose-500/20 text-rose-400"
            }`}
          >
            <Circle className="w-1.5 h-1.5 fill-current" />
            {status}
          </span>
        </Link>
      </div>
    </header>
  );
}
