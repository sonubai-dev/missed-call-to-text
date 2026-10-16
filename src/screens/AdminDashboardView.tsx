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

export function AdminDashboardView({
  adminEmail,
  onLogout,
  onOpenDashboard,
  onOpenWebsite,
}: AdminDashboardViewProps) {
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

  // Push notification state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notifyTitle, setNotifyTitle] = useState('Special Pro Offer: ₹100/mo');
  const [notifyBody, setNotifyBody] = useState('Upgrade now to resume unlimited missed-call SMS follow-ups for your customers!');
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
      setNotifySuccessMsg(data.message || 'Notification dispatched!');
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Active (₹100/mo)
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3 h-3" /> 3-Day Trial
          </span>
        );
      case 'registered_unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" /> Registered Unpaid
          </span>
        );
      case 'halted':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <X className="w-3 h-3" /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] font-sans pb-16">
      {/* Admin Navbar */}
      <header className="border-b border-[#222E35] bg-[#111B21] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>MissCall Assistant Master Admin</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Railway DB
                </span>
              </h1>
              <p className="text-[11px] text-[#8696A0]">Logged in as: {adminEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                fetchStats();
                fetchBusinesses();
              }}
              className="p-2 rounded-xl bg-[#202C33] text-slate-300 hover:text-white hover:bg-[#2A3942] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenWebsite}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#202C33] text-slate-300 hover:text-white hover:bg-[#2A3942]"
            >
              Download Portal
            </button>
            <button
              onClick={onOpenDashboard}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#202C33] text-slate-300 hover:text-white hover:bg-[#2A3942]"
            >
              CRM Simulator
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2">
            <div className="flex items-center justify-between text-[#8696A0] text-xs font-bold uppercase tracking-wider">
              <span>Total Businesses</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalBusinesses}</div>
            <div className="text-[11px] text-slate-400">Total registered app devices</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2">
            <div className="flex items-center justify-between text-[#8696A0] text-xs font-bold uppercase tracking-wider">
              <span>Active Subscribers</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.activeSubscribers}</div>
            <div className="text-[11px] text-slate-400">Paying ₹100/mo autopay</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2">
            <div className="flex items-center justify-between text-[#8696A0] text-xs font-bold uppercase tracking-wider">
              <span>Registered Unpaid</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.registeredUnpaid}</div>
            <div className="text-[11px] text-slate-400">Potential conversion target</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2">
            <div className="flex items-center justify-between text-[#8696A0] text-xs font-bold uppercase tracking-wider">
              <span>Monthly Run-rate</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">₹{stats.estimatedMonthlyRevenue}</div>
            <div className="text-[11px] text-slate-400">MRR based on ₹100/mo subscriptions</div>
          </div>
        </div>

        {/* Action Bar: Search, Filters, & Notify */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search business name, phone, or device ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0C1317] border border-[#222E35] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#202C33] hover:bg-[#2A3942] text-xs font-bold text-white rounded-xl"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0C1317] border border-[#222E35] text-xs">
              {(['all', 'registered_unpaid', 'active', 'trial', 'halted'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                    selectedStatus === st
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Notify Unpaid Action Button */}
            <button
              onClick={() => {
                selectAllUnpaid();
                setShowNotifyModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-950/40 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notify Unpaid Users</span>
            </button>
          </div>
        </div>

        {/* Businesses Table */}
        <div className="rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222E35] bg-[#162026] text-[#8696A0] uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-10 text-center">
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
                      className="rounded accent-emerald-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Business</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Device ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222E35]">
                {businesses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No businesses found matching current filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  businesses.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-[#182229] transition-colors cursor-pointer group"
                      onClick={() => openBusinessDetails(b)}
                    >
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectBusiness(b.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(b.id)}
                          onChange={() => {}}
                          className="rounded accent-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {b.business_name || 'Unnamed Business'}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{b.phone}</td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px] max-w-[140px] truncate">
                        {b.device_id}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {b.razorpay_subscription_id ? (
                          <span className="text-cyan-400 font-semibold">{b.razorpay_subscription_id}</span>
                        ) : (
                          <span className="text-slate-600">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openBusinessDetails(b);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-emerald-600 hover:text-white text-slate-300 font-semibold transition-colors"
                        >
                          View Details
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

      {/* Business Detail & Payment Events Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B21] border border-[#222E35] rounded-3xl max-w-2xl w-full p-6 text-xs text-slate-300 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222E35] pb-4">
              <div>
                <h3 className="font-black text-white text-base">{selectedBusiness.business_name}</h3>
                <p className="text-[11px] font-mono text-emerald-400">{selectedBusiness.phone}</p>
              </div>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="p-1 rounded-lg bg-[#202C33] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0C1317] border border-[#222E35]">
              <div>
                <span className="text-slate-500 font-medium">Device ID:</span>
                <p className="font-mono text-white break-all text-[11px]">{selectedBusiness.device_id}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Subscription Status:</span>
                <p className="mt-0.5">{getStatusBadge(selectedBusiness.status)}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Razorpay Sub ID:</span>
                <p className="font-mono text-cyan-400 text-[11px]">
                  {selectedBusiness.razorpay_subscription_id || 'Not Subscribed'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Valid Until:</span>
                <p className="font-semibold text-white">
                  {selectedBusiness.valid_until
                    ? new Date(selectedBusiness.valid_until).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Payment Events Log */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Webhook & Payment Events ({paymentEvents.length})</span>
              </h4>

              {paymentEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#0C1317] border border-[#222E35] text-slate-500 text-center">
                  No webhook payment events recorded yet for this device.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {paymentEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0C1317] border border-[#222E35] space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{ev.event_type}</span>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(ev.created_at).toLocaleString()}
                        </span>
                      </div>
                      <pre className="text-slate-400 text-[10px] bg-[#162026] p-2 rounded overflow-x-auto">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#222E35] pt-4 flex items-center justify-end">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B21] border border-[#222E35] rounded-3xl max-w-lg w-full p-6 text-xs text-slate-300 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222E35] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Send Push Notification</h3>
              </div>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="p-1 rounded-lg bg-[#202C33] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifySuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notifySuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-slate-400 font-semibold">Target Devices ({selectedIds.length} selected)</label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sending push notification to selected registered businesses.
                </p>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Notification Title</label>
                <input
                  type="text"
                  required
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="mt-1 w-full p-2.5 bg-[#0C1317] border border-[#222E35] rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Notification Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={notifyBody}
                  onChange={(e) => setNotifyBody(e.target.value)}
                  className="mt-1 w-full p-2.5 bg-[#0C1317] border border-[#222E35] rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingPush || selectedIds.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all disabled:opacity-50"
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
