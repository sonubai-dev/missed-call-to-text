'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  LogOut,
  Server,
  CreditCard,
  Smartphone,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.admin) {
          setAdmin(data.admin);
        } else {
          router.push('/admin/login');
        }
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <div className="text-xs text-slate-400">Verifying Administrative Session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] flex flex-col">
      <header className="border-b border-[#222E35] bg-[#111B21]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>MissCall Assistant</span>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Owner
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{admin?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#1F2C34] hover:bg-[#2A3942] rounded-lg transition-colors"
            >
              Live Website
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#1F2C34] hover:bg-[#2A3942] rounded-lg transition-colors"
            >
              CRM Workbench
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Secure Session Active
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Protected via <code className="text-white font-mono">HttpOnly; Secure; SameSite=Lax</code> session cookies.
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Authorization: <span className="text-emerald-400 font-semibold">ADMIN_OWNER_EMAIL</span> verified
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111B21] p-5 rounded-2xl border border-[#222E35]">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Business Model</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">₹100 / month</div>
            <div className="text-[11px] text-slate-500 mt-1">Recurring Razorpay Subscription</div>
          </div>

          <div className="bg-[#111B21] p-5 rounded-2xl border border-[#222E35]">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Android Architecture</span>
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">Material 3 Native</div>
            <div className="text-[11px] text-slate-500 mt-1">Dual-SIM • 2s/5s/10s Delay Queue</div>
          </div>

          <div className="bg-[#111B21] p-5 rounded-2xl border border-[#222E35]">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Webhook Security</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">HMAC-SHA256</div>
            <div className="text-[11px] text-slate-500 mt-1">Timing-safe signature validator</div>
          </div>

          <div className="bg-[#111B21] p-5 rounded-2xl border border-[#222E35]">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Release Distribution</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">Vercel CDN Edge</div>
            <div className="text-[11px] text-slate-500 mt-1">Static APK • 0-byte ISR Route</div>
          </div>
        </div>
      </main>
    </div>
  );
}
