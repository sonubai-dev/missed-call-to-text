import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  Server,
  CreditCard,
  PhoneCall,
  Users,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardViewProps {
  adminEmail: string;
  onLogout: () => void;
  onOpenDashboard: () => void;
  onOpenWebsite: () => void;
}

export function AdminDashboardView({
  adminEmail,
  onLogout,
  onOpenDashboard,
  onOpenWebsite,
}: AdminDashboardViewProps) {
  const [apkInfo, setApkInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchApkStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/release-apk-status');
      if (res.ok) {
        const data = await res.json();
        setApkInfo(data);
      }
    } catch (e) {
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApkStatus();
  }, []);

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {}
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] flex flex-col">
      {/* Top Navigation Bar */}
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
              <div className="text-xs text-slate-400 font-mono">{adminEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWebsite}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#1F2C34] hover:bg-[#2A3942] rounded-lg transition-colors"
            >
              Live Website
            </button>
            <button
              onClick={onOpenDashboard}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#1F2C34] hover:bg-[#2A3942] rounded-lg transition-colors"
            >
              CRM Workbench
            </button>
            <button
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Security Session Banner */}
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

        {/* System Overview Grid */}
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

        {/* APK Release Information */}
        <div className="bg-[#111B21] p-6 rounded-2xl border border-[#222E35]">
          <div className="flex items-center justify-between pb-4 border-b border-[#222E35] mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Production Android Release Artifact</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live download binary distributed to customers</p>
            </div>
            <button
              onClick={fetchApkStatus}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0C1317] border border-[#222E35]">
              <div className="text-slate-500 text-[11px]">Filename</div>
              <div className="font-mono font-medium text-white mt-1">Missed-Call-Assistant.apk</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0C1317] border border-[#222E35]">
              <div className="text-slate-500 text-[11px]">Size</div>
              <div className="font-mono font-medium text-emerald-400 mt-1">
                {apkInfo?.sizeFormatted || '20.50 MB'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0C1317] border border-[#222E35]">
              <div className="text-slate-500 text-[11px]">Target SDK</div>
              <div className="font-mono font-medium text-white mt-1">Android 14 (API 34)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0C1317] border border-[#222E35]">
              <div className="text-slate-500 text-[11px]">Cryptographic Signatures</div>
              <div className="font-mono font-medium text-emerald-400 mt-1">v2 Scheme + v3 Scheme</div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-[#0C1317] border border-[#222E35]">
            <div className="text-slate-500 text-[11px] mb-1">SHA-256 Checksum:</div>
            <div className="font-mono text-[11px] text-slate-300 break-all select-all">
              {apkInfo?.sha256 || 'EE202575AFB0848D0DE43E36F010CC75F7308335AC9A35588D10CA7C682BC26E'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
