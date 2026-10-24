import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  Users,
  CreditCard,
  Bell,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Smartphone,
  Phone,
  LayoutDashboard,
  Building2,
  Receipt,
  Radio,
  Settings,
  HelpCircle,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  Check,
  Download,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface BusinessItem {
  id: string;
  device_id: string;
  business_name: string;
  phone: string;
  fcm_token: string | null;
  status: 'registered_unpaid' | 'trial' | 'active' | 'halted' | 'cancelled';
  razorpay_subscription_id: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminDashboardViewProps {
  adminEmail: string;
  onLogout: () => void;
  onOpenDashboard: () => void;
  onOpenWebsite: () => void;
}

type AdminTab = 'dashboard' | 'businesses' | 'subscriptions' | 'payments' | 'broadcast';

export function AdminDashboardView({
  adminEmail,
  onLogout,
  onOpenDashboard,
  onOpenWebsite,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeSubscribers: 0,
    registeredUnpaid: 0,
    trialUsers: 0,
    haltedOrCancelled: 0,
    estimatedMonthlyRevenue: 0,
  });

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);

  // Chart range filter
  const [chartRange, setChartRange] = useState<'This Month' | 'Last 30 Days' | 'This Year'>('This Month');

  // Push notification state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notifyTitle, setNotifyTitle] = useState('MissCall Assistant Pro: Keep Follow-Ups Active');
  const [notifyBody, setNotifyBody] = useState('Resume automated missed-call SMS follow-ups for your customers for only ₹100/month.');
  const [notifySuccessMsg, setNotifySuccessMsg] = useState('');
  const [isSendingPush, setIsSendingPush] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/businesses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.data || []);
      }
    } catch (e) {
      console.error('Failed to load businesses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBusinesses();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const openBusinessDetails = async (b: BusinessItem) => {
    setSelectedBusiness(b);
    try {
      const res = await fetch(`/api/admin/businesses/${b.id}`);
      if (res.ok) {
        const data = await res.json();
        setPaymentEvents(data.paymentEvents || []);
      }
    } catch (e) {
      setPaymentEvents([]);
    }
  };

  const toggleSelectBusiness = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllUnpaid = () => {
    const unpaidIds = businesses
      .filter((b) => b.status === 'registered_unpaid')
      .map((b) => b.id);
    setSelectedIds(unpaidIds);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setIsSendingPush(true);
    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessIds: selectedIds,
          title: notifyTitle,
          body: notifyBody,
        }),
      });
      const data = await res.json();
      setNotifySuccessMsg(data.message || 'Notification dispatched to devices!');
      setTimeout(() => {
        setNotifySuccessMsg('');
        setShowNotifyModal(false);
      }, 2500);
    } catch (err: any) {
      alert('Failed to send notification: ' + err.message);
    } finally {
      setIsSendingPush(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active (₹100/mo)
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> 3-Day Trial
          </span>
        );
      case 'registered_unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Registered Unpaid
          </span>
        );
      case 'halted':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3 h-3 text-rose-600" /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#1E293B] font-sans flex antialiased">
      {/* 1. PERSISTENT PURPLE SIDEBAR (REFERENCE 1 STYLE) */}
      <aside className="w-64 bg-[#3B28CC] text-white flex-shrink-0 flex flex-col justify-between py-6 px-4 shadow-xl z-20">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#3B28CC] flex items-center justify-center font-black text-xl shadow-md">
              M
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">MissCall</h2>
              <span className="text-[11px] font-semibold text-indigo-200 tracking-wide uppercase">Admin Portal</span>
            </div>
          </div>

          {/* Navigation Items with Reference 1 Style Pills */}
          <nav className="space-y-1.5 pt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#3B28CC] shadow-md font-extrabold translate-x-1'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('businesses')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'businesses'
                  ? 'bg-white text-[#3B28CC] shadow-md font-extrabold translate-x-1'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Businesses</span>
              {stats.totalBusinesses > 0 && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'businesses' ? 'bg-[#3B28CC] text-white' : 'bg-white/20 text-white'
                }`}>
                  {stats.totalBusinesses}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('subscriptions');
                setSelectedStatus('active');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-[#3B28CC] shadow-md font-extrabold translate-x-1'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Subscriptions</span>
              {stats.activeSubscribers > 0 && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'subscriptions' ? 'bg-[#3B28CC] text-white' : 'bg-white/20 text-white'
                }`}>
                  {stats.activeSubscribers}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                selectAllUnpaid();
                setShowNotifyModal(true);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-indigo-100 hover:bg-white/10 hover:text-white transition-all text-left"
            >
              <Radio className="w-4 h-4 text-amber-300" />
              <span>Broadcast Push</span>
            </button>

            <div className="pt-4 border-t border-indigo-400/20 my-2 space-y-1">
              <span className="px-4 text-[10px] uppercase tracking-wider text-indigo-300 font-bold">External</span>
              <button
                onClick={onOpenWebsite}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-medium text-indigo-200 hover:bg-white/10 hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Landing Page</span>
              </button>
              <button
                onClick={onOpenDashboard}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-medium text-indigo-200 hover:bg-white/10 hover:text-white transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>CRM Simulator</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-indigo-400/20 px-2 space-y-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Railway Verified</span>
            </div>
            <p className="text-[10px] text-indigo-200 mt-1">₹100/mo Razorpay HMAC Webhook Security Active</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl bg-white/15 hover:bg-rose-600 hover:text-white text-indigo-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (CLEAN WHITE / LIGHT GREY) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-[#3B28CC] border border-indigo-100">
              Live Production
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input Bar (Reference 1 style) */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search business, phone, device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3B28CC] transition-all"
              />
            </form>

            <button
              onClick={() => {
                fetchStats();
                fetchBusinesses();
              }}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Notification Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  selectAllUnpaid();
                  setShowNotifyModal(true);
                }}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white">
                  {stats.registeredUnpaid > 0 ? stats.registeredUnpaid : '0'}
                </span>
              </button>
            </div>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3B28CC] to-indigo-400 text-white font-black text-sm flex items-center justify-center shadow-sm">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">Admin Controller</div>
                <div className="text-[10px] text-slate-500 font-mono">{adminEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* 3. FOUR SIGNATURE STAT CARDS (REFERENCE 1 VIBRANT COLORS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Purple Card */}
            <div className="bg-[#4338CA] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide uppercase text-indigo-200">Registered Devices</span>
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black">{stats.totalBusinesses}</div>
                <div className="text-[11px] text-indigo-200 font-medium mt-1">Total app installations</div>
              </div>
            </div>

            {/* Card 2: Blue Card */}
            <div className="bg-[#0284C7] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide uppercase text-sky-200">Active Subscribers</span>
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black">{stats.activeSubscribers}</div>
                <div className="text-[11px] text-sky-200 font-medium mt-1">₹100/mo autopay active</div>
              </div>
            </div>

            {/* Card 3: Green Card */}
            <div className="bg-[#059669] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide uppercase text-emerald-200">Monthly Run-Rate</span>
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black">₹{stats.estimatedMonthlyRevenue}</div>
                <div className="text-[11px] text-emerald-200 font-medium mt-1">Predictable SaaS MRR</div>
              </div>
            </div>

            {/* Card 4: Lime Card */}
            <div className="bg-[#65A30D] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide uppercase text-lime-200">Unpaid & Trial</span>
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black">{stats.registeredUnpaid + stats.trialUsers}</div>
                <div className="text-[11px] text-lime-200 font-medium mt-1">Ready for conversion push</div>
              </div>
            </div>
          </div>

          {/* 4. MAIN TWO-COLUMN SECTION (PROFILE & HEALTH + ANALYTICS CHART) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: System Status & Profile Card (Reference 1 Left Panel) */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-3">
                  {/* Circular decorative ring */}
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#EEF2F6" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#3B28CC"
                      strokeWidth="6"
                      strokeDasharray="251.2"
                      strokeDashoffset="60"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#3B28CC] font-black text-2xl flex items-center justify-center">
                      ⚡
                    </div>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 text-base">MissCall Cloud Service</h3>
                <p className="text-xs text-slate-500 font-medium">Railway PostgreSQL + Express Node.js</p>

                {/* 3 Donut Mini-Gauges (Reference 1 style) */}
                <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-6 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-base font-extrabold text-[#3B28CC]">99.9%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Uptime</div>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <div className="text-base font-extrabold text-emerald-600">100%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">DB Sync</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-extrabold text-sky-600">₹100</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Plan</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Timeline Feed (Reference 1 style) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Recent System Events</h4>
                  <span className="text-[10px] font-bold text-[#3B28CC] bg-indigo-50 px-2 py-0.5 rounded-full">Live</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-[#3B28CC] flex items-center justify-center shrink-0 mt-0.5">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Razorpay Webhook Handler</div>
                      <div className="text-[11px] text-slate-500">HMAC verification listener active</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Automatic Sync Worker</div>
                      <div className="text-[11px] text-slate-500">6-Hour interval scheduled on Android</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">3-Day Free Trial Logic</div>
                      <div className="text-[11px] text-slate-500">Server verified on first registration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Analytics Chart & Recommended Actions (Reference 1 Right Panel) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analytics Chart Card with Wave Curves */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Subscription & Growth Analytics</h3>
                    <p className="text-xs text-slate-500 font-medium">Weekly trend of app installs vs active subscribers</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 text-xs font-bold mr-2">
                      <span className="flex items-center gap-1.5 text-[#3B28CC]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3B28CC]"></span> Active
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Trials
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        value={chartRange}
                        onChange={(e) => setChartRange(e.target.value as any)}
                        className="text-xs font-bold text-slate-700 bg-slate-100 border-none rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                      >
                        <option>This Month</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SVG Smooth Curve Wave Chart (Reference 1 Style) */}
                <div className="w-full h-56 pt-4 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B28CC" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3B28CC" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeDasharray="4 4" />
                    <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#E2E8F0" />

                    {/* Green Trial Wave */}
                    <path
                      d="M 0 120 C 60 110, 100 80, 160 100 C 220 120, 260 70, 320 90 C 380 110, 420 60, 500 70 L 500 150 L 0 150 Z"
                      fill="url(#greenGradient)"
                    />
                    <path
                      d="M 0 120 C 60 110, 100 80, 160 100 C 220 120, 260 70, 320 90 C 380 110, 420 60, 500 70"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                    />

                    {/* Purple Active Subscribers Wave */}
                    <path
                      d="M 0 135 C 70 140, 120 90, 180 85 C 240 80, 280 40, 360 45 C 420 50, 460 30, 500 35 L 500 150 L 0 150 Z"
                      fill="url(#purpleGradient)"
                    />
                    <path
                      d="M 0 135 C 70 140, 120 90, 180 85 C 240 80, 280 40, 360 45 C 420 50, 460 30, 500 35"
                      fill="none"
                      stroke="#3B28CC"
                      strokeWidth="3"
                    />

                    {/* Interactive Marker Pin (Reference 1 tooltip) */}
                    <circle cx="360" cy="45" r="5" fill="#3B28CC" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>

                  {/* Floating Metric Bubble (Reference 1 style) */}
                  <div className="absolute top-2 right-24 bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold text-slate-800">
                    <span className="text-[#3B28CC] font-extrabold">{stats.activeSubscribers}</span> Active • <span className="text-emerald-600 font-extrabold">₹{stats.estimatedMonthlyRevenue}</span> MRR
                  </div>

                  {/* X Axis Labels */}
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span>Week 01</span>
                    <span>Week 03</span>
                    <span>Week 05</span>
                    <span>Week 07</span>
                    <span>Week 09</span>
                    <span>Current</span>
                  </div>
                </div>
              </div>

              {/* Action Quick Cards (Reference 1 Recommended Jobs Section) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm">Administrative Operations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Action 1 */}
                  <div
                    onClick={() => {
                      selectAllUnpaid();
                      setShowNotifyModal(true);
                    }}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3B28CC] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Bell className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#3B28CC] transition-colors" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">Notify Unpaid Users</h5>
                      <p className="text-[11px] text-slate-500 mt-1">Send push reminder to convert {stats.registeredUnpaid} unpaid devices</p>
                    </div>
                  </div>

                  {/* Action 2 */}
                  <div
                    onClick={onOpenWebsite}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Download className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">Verified APK Distribution</h5>
                      <p className="text-[11px] text-slate-500 mt-1">Test live APK download & SHA-256 integrity</p>
                    </div>
                  </div>

                  {/* Action 3 */}
                  <div
                    onClick={onOpenDashboard}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">Call Flow Simulator</h5>
                      <p className="text-[11px] text-slate-500 mt-1">Test 2s, 5s, 10s SMS delay safely without live carrier charges</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. REGISTERED BUSINESSES & SUBSCRIBERS TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Registered Businesses & Devices</h3>
                <p className="text-xs text-slate-500 font-medium">Live PostgreSQL database state synchronized via Railway</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 text-xs">
                {(['all', 'active', 'trial', 'registered_unpaid', 'halted'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition-all ${
                      selectedStatus === st
                        ? 'bg-white text-[#3B28CC] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(businesses.map((b) => b.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        checked={businesses.length > 0 && selectedIds.length === businesses.length}
                        className="rounded accent-[#3B28CC]"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold">Business Name</th>
                    <th className="py-3 px-4 font-bold">Phone Number</th>
                    <th className="py-3 px-4 font-bold">Device ID</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Subscription ID</th>
                    <th className="py-3 px-4 font-bold">Registered</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No businesses found matching current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    businesses.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                        onClick={() => openBusinessDetails(b)}
                      >
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectBusiness(b.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(b.id)}
                            onChange={() => {}}
                            className="rounded accent-[#3B28CC]"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 group-hover:text-[#3B28CC] transition-colors">
                          {b.business_name || 'My Business'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{b.phone}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] max-w-[130px] truncate">
                          {b.device_id}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {b.razorpay_subscription_id ? (
                            <span className="text-[#3B28CC] font-semibold">{b.razorpay_subscription_id}</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openBusinessDetails(b);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#3B28CC] hover:text-white text-slate-700 font-bold text-[11px] transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 6. BUSINESS DETAIL & PAYMENT EVENTS MODAL */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-xs text-slate-700 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-800 text-lg">{selectedBusiness.business_name}</h3>
                <p className="text-xs font-mono text-[#3B28CC] font-semibold">{selectedBusiness.phone}</p>
              </div>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Device ID</span>
                <p className="font-mono text-slate-800 break-all text-[11px] mt-0.5">{selectedBusiness.device_id}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedBusiness.status)}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Razorpay Subscription</span>
                <p className="font-mono text-[#3B28CC] text-[11px] mt-0.5 font-bold">
                  {selectedBusiness.razorpay_subscription_id || 'Not Subscribed'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Valid Until</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedBusiness.valid_until
                    ? new Date(selectedBusiness.valid_until).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Payment & Webhook Events Log */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3B28CC]" />
                <span>Recorded Webhook & Payment Events ({paymentEvents.length})</span>
              </h4>

              {paymentEvents.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-center font-medium">
                  No webhook payment events recorded yet for this device.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {paymentEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#3B28CC] font-bold">{ev.event_type}</span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(ev.created_at).toLocaleString()}
                        </span>
                      </div>
                      <pre className="text-slate-600 text-[10px] bg-white p-2.5 rounded-xl border border-slate-100 overflow-x-auto">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-end">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-6 py-2.5 rounded-2xl bg-[#3B28CC] hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BROADCAST PUSH NOTIFICATION MODAL */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-xs text-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#3B28CC]" />
                <h3 className="font-extrabold text-slate-800 text-base">Broadcast Push Notification</h3>
              </div>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifySuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{notifySuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-slate-600 font-bold">Target Businesses ({selectedIds.length} selected)</label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Notification will be dispatched to selected registered devices.
                </p>
              </div>

              <div>
                <label className="text-slate-600 font-bold">Notification Title</label>
                <input
                  type="text"
                  required
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none focus:bg-white focus:border-[#3B28CC] transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold">Notification Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={notifyBody}
                  onChange={(e) => setNotifyBody(e.target.value)}
                  className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none focus:bg-white focus:border-[#3B28CC] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingPush || selectedIds.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#3B28CC] hover:bg-indigo-700 text-white font-extrabold transition-all disabled:opacity-50 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingPush ? 'Sending...' : 'Dispatch Notification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
