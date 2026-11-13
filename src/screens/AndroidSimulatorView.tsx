import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  PhoneCall,
  PhoneMissed,
  Send,
  Clock,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Wifi,
  Battery,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Settings,
  List,
  Layers,
  ArrowRight,
  PhoneIncoming,
  Volume2,
} from 'lucide-react';
import { Customer, MessageTemplate, BusinessSettings, CallEvent } from '../types';
import { supabase } from '../lib/supabase';

interface AndroidSimulatorViewProps {
  customers: Customer[];
  templates: MessageTemplate[];
  settings: BusinessSettings;
  calls: CallEvent[];
  onCallProcessed: (call: CallEvent, customer?: Customer | null, messageContent?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export function AndroidSimulatorView({
  customers,
  templates,
  settings,
  calls,
  onCallProcessed,
  onNavigateTab,
}: AndroidSimulatorViewProps) {
  // Mobile App Internal States
  const [isServiceActive, setIsServiceActive] = useState(true);
  const [selectedSim, setSelectedSim] = useState<'SIM 1 (Jio 5G)' | 'SIM 2 (Airtel 4G)'>('SIM 1 (Jio 5G)');
  const [smsDelay, setSmsDelay] = useState<number>(2); // 0s, 2s, 5s, 10s, 30s
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'tmpl-1');
  const [workingHoursOnly, setWorkingHoursOnly] = useState(false);
  const [appTab, setAppTab] = useState<'controls' | 'logs' | 'settings'>('controls');

  // Simulator Rig States
  const [callerPhone, setCallerPhone] = useState('+91 98765 43210');
  const [callerName, setCallerName] = useState('Rahul Verma (New Lead)');
  const [isRinging, setIsRinging] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastDispatchedLog, setLastDispatchedLog] = useState<{
    phone: string;
    text: string;
    sim: string;
    time: string;
  } | null>(null);

  // Time state for mobile status bar
  const [currentTime, setCurrentTime] = useState('11:45');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0] || {
    id: 'tmpl-1',
    name: 'General Follow-up',
    content: 'Hello! Sorry we missed your call from {{business_name}}. How can we assist you today?',
  };

  const formattedMessage = activeTemplate.content
    .replace(/\{\{business_name\}\}/g, settings.businessName || 'Solita Solutions')
    .replace(/\{\{customer_name\}\}/g, callerName || 'Customer');

  // Trigger Missed Call Simulation
  const handleTriggerMissedCall = () => {
    if (!isServiceActive) {
      alert('Android Service is paused! Turn ON the service toggle on the phone to test.');
      return;
    }

    setIsRinging(true);

    // Simulate 2 seconds of ringing before caller hangs up (Missed Call)
    setTimeout(() => {
      setIsRinging(false);
      setIsDispatching(true);

      const delaySeconds = smsDelay;
      let remaining = delaySeconds;
      setCountdown(remaining);

      if (remaining === 0) {
        completeDispatch();
      } else {
        const timer = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timer);
            setCountdown(null);
            completeDispatch();
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      }
    }, 2200);
  };

  const completeDispatch = () => {
    setIsDispatching(false);

    const now = new Date();
    const callId = `call-${Date.now()}`;
    const newCall: CallEvent = {
      id: callId,
      phoneNumber: callerPhone,
      customerName: callerName,
      timestamp: Date.now(),
      status: 'MISSED',
      whatsappStatus: 'SENT',
      suggestedMessage: formattedMessage,
      simSlot: selectedSim,
    };

    // Update parent state
    const existing = customers.find(
      (c) => c.phoneNumber.replace(/\s+/g, '') === callerPhone.replace(/\s+/g, '')
    );
    onCallProcessed(newCall, existing, formattedMessage);

    // Record last dispatched event
    setLastDispatchedLog({
      phone: callerPhone,
      text: formattedMessage,
      sim: selectedSim,
      time: now.toLocaleTimeString(),
    });

    // Sync live to Supabase
    supabase.from('missed_calls').insert({
      device_id: 'default_device',
      phone_number: callerPhone,
      customer_name: callerName,
      call_status: 'MISSED',
      whatsapp_status: 'SENT',
      suggested_message: formattedMessage,
      notes: `Dispatched via ${selectedSim}`,
    }).then(() => {}).catch(() => {});

    supabase.from('messages').insert({
      device_id: 'default_device',
      phone_number: callerPhone,
      customer_name: callerName,
      content: formattedMessage,
      status: 'SENT',
      mode: 'MANUAL',
    }).then(() => {}).catch(() => {});
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111B21] p-6 rounded-3xl border border-[#222E35]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Interactive Android Device Simulator
            </span>
            <span className="text-xs text-slate-400">Android 14 (API 34)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            MissCall Assistant — Native Mobile UI & Hardware Test
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interact with every button, toggle Dual-SIM settings, change SMS delay, and test inbound missed-call auto-replies in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-slate-200 transition-all border border-[#222E35]"
          >
            Open Web CRM
          </button>
          <button
            onClick={() => onNavigateTab('admin-login')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-900/30"
          >
            Admin Portal
          </button>
        </div>
      </div>

      {/* Main Grid: Mobile Device Screen + Testing Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER: Interactive Android Phone Mockup (5 Columns) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[360px] sm:w-[380px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative ring-1 ring-white/10 select-none">
            {/* Phone Outer Notch / Bezel */}
            <div className="bg-[#0C1317] rounded-[40px] overflow-hidden border border-slate-800 flex flex-col h-[740px] relative text-[#E9EDEF]">
              
              {/* 1. Android Status Bar */}
              <div className="bg-[#111B21] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-300 z-30">
                <span>{currentTime}</span>
                {/* Dynamic Camera Punch-hole */}
                <div className="w-4 h-4 rounded-full bg-black border border-slate-800" />
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-[10px] text-emerald-400 font-extrabold">5G</span>
                  <Wifi className="w-3.5 h-3.5 text-slate-300" />
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* 2. App Top Header in Phone */}
              <div className="bg-gradient-to-r from-[#111B21] to-[#1A2730] px-4 py-3 border-b border-[#222E35] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    M
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white leading-tight">MissCall Assistant</h3>
                    <p className="text-[10px] text-slate-400">Solita Solutions</p>
                  </div>
                </div>

                {/* Master Service ON/OFF Toggle */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${isServiceActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isServiceActive ? 'ACTIVE' : 'OFF'}
                  </span>
                  <button
                    onClick={() => setIsServiceActive(!isServiceActive)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      isServiceActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>

              {/* 3. Phone Body Tabs (Controls / Logs / Settings) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {appTab === 'controls' && (
                  <div className="space-y-4">
                    {/* Status Pill Card */}
                    <div className={`p-3.5 rounded-2xl border transition-all ${
                      isServiceActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isServiceActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                          <span className="font-bold text-xs">
                            {isServiceActive ? 'Telephony Listening Active' : 'Service Stopped'}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 font-mono">
                          Native SMS
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {isServiceActive
                          ? 'CallScreeningService is intercepting missed calls automatically.'
                          : 'Turn on toggle above to resume carrier SMS replies.'}
                      </p>
                    </div>

                    {/* Dual SIM Selector Card */}
                    <div className="bg-[#111B21] p-3.5 rounded-2xl border border-[#222E35] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dispatch Carrier SIM</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Dual-SIM Ready</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {(['SIM 1 (Jio 5G)', 'SIM 2 (Airtel 4G)'] as const).map((sim) => (
                          <button
                            key={sim}
                            onClick={() => setSelectedSim(sim)}
                            className={`py-2 px-2.5 rounded-xl text-left border text-[11px] font-medium transition-all ${
                              selectedSim === sim
                                ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                                : 'bg-[#0C1317] border-[#222E35] text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="text-[9px] text-slate-500 font-mono">Slot {sim.startsWith('SIM 1') ? '1' : '2'}</div>
                            <div className="truncate">{sim}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SMS Dispatch Delay */}
                    <div className="bg-[#111B21] p-3.5 rounded-2xl border border-[#222E35] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>SMS Reply Delay</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">{smsDelay}s Delay</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        {[0, 2, 5, 10, 30].map((d) => (
                          <button
                            key={d}
                            onClick={() => setSmsDelay(d)}
                            className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[11px] transition-all border ${
                              smsDelay === d
                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                : 'bg-[#0C1317] border-[#222E35] text-slate-400 hover:text-white'
                            }`}
                          >
                            {d === 0 ? 'Instant' : `${d}s`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Message Template */}
                    <div className="bg-[#111B21] p-3.5 rounded-2xl border border-[#222E35] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>SMS Auto-Reply Template</span>
                        </span>
                      </div>

                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full bg-[#0C1317] border border-[#222E35] rounded-xl p-2 text-[11px] text-white outline-none focus:border-emerald-500"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.language || 'EN'})
                          </option>
                        ))}
                      </select>

                      <div className="p-2.5 bg-[#0C1317] rounded-xl border border-[#222E35] text-[10px] text-slate-300 font-mono leading-relaxed">
                        {formattedMessage}
                      </div>
                    </div>

                    {/* Pro Subscription Badge */}
                    <div className="p-3 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="font-bold text-white text-[11px]">3-Day Free Trial Active</div>
                          <div className="text-[10px] text-indigo-200">Full Unlimited Native SMS</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                        ₹99/mo Pro
                      </span>
                    </div>
                  </div>
                )}

                {appTab === 'logs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
                      <span>Recent Telephony Events</span>
                      <span>Total: {calls.length}</span>
                    </div>

                    <div className="space-y-2">
                      {calls.slice(0, 6).map((c) => (
                        <div key={c.id} className="p-3 bg-[#111B21] rounded-xl border border-[#222E35] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                            <div>
                              <div className="font-bold text-white text-[11px]">{c.phoneNumber}</div>
                              <div className="text-[9px] text-slate-400">{c.customerName || 'Caller'}</div>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            SMS Sent
                          </span>
                        </div>
                      ))}

                      {calls.length === 0 && (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          No calls yet. Click 'Simulate Missed Call' on the right to test!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {appTab === 'settings' && (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#111B21] rounded-2xl border border-[#222E35] space-y-2 text-xs">
                      <h4 className="font-bold text-white text-[11px]">Business Profile</h4>
                      <p className="text-[10px] text-slate-400">Business Name: {settings.businessName || 'Solita Solutions'}</p>
                      <p className="text-[10px] text-slate-400">Location: Gaya, Bihar 824232</p>
                      <p className="text-[10px] text-slate-400">Support: help.solita@gmail.com</p>
                    </div>

                    <div className="p-3.5 bg-[#111B21] rounded-2xl border border-[#222E35] space-y-2 text-xs">
                      <h4 className="font-bold text-white text-[11px]">System Diagnostics</h4>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Battery Optimization:</span>
                          <span className="text-emerald-400 font-bold">Unrestricted</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Call Screening API:</span>
                          <span className="text-emerald-400 font-bold">Granted</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Carrier SMS Capability:</span>
                          <span className="text-emerald-400 font-bold">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ringing Overlay (Simulated Incoming Call) */}
              {isRinging && (
                <div className="absolute inset-0 bg-[#0C1317]/95 backdrop-blur-md z-40 flex flex-col items-center justify-between py-16 px-6 text-center animate-fade-in">
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-500/10 animate-bounce">
                      <PhoneIncoming className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-black text-white">Incoming Call...</h4>
                    <p className="text-xs text-rose-400 font-mono font-bold animate-pulse">Ringing</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">{callerPhone}</h3>
                    <p className="text-xs text-slate-400">{callerName}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    Carrier ring detected • Hang up in progress...
                  </div>
                </div>
              )}

              {/* Countdown Overlay (Delay before SMS Dispatch) */}
              {isDispatching && (
                <div className="absolute bottom-16 inset-x-4 bg-emerald-950/95 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl z-40 text-center space-y-2 animate-bounce-subtle">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Missed Call Detected! Dispatching SMS...</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {countdown !== null && countdown > 0 ? `${countdown}s` : 'Sending...'}
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Sending reply to <strong>{callerPhone}</strong> via <strong>{selectedSim}</strong>
                  </p>
                </div>
              )}

              {/* 4. Phone Bottom App Navigation */}
              <div className="bg-[#111B21] border-t border-[#222E35] px-4 py-2.5 flex items-center justify-around z-30">
                <button
                  onClick={() => setAppTab('controls')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                    appTab === 'controls' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Controls</span>
                </button>
                <button
                  onClick={() => setAppTab('logs')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                    appTab === 'logs' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Logs</span>
                </button>
                <button
                  onClick={() => setAppTab('settings')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                    appTab === 'settings' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Android Home Bar Pill */}
              <div className="bg-[#111B21] pb-2 pt-1 flex justify-center">
                <div className="w-28 h-1 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Simulator Control Deck & Test Triggers (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Action Box */}
          <div className="bg-[#111B21] p-6 sm:p-8 rounded-3xl border border-[#222E35] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#222E35] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Inbound Missed Call Testing Deck</h3>
                  <p className="text-xs text-slate-400">Trigger simulated customer calls and verify live auto-reply</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#202C33] text-emerald-400 border border-[#222E35]">
                Live Carrier Simulator
              </span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Quick Caller Scenario:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { name: 'Amit Kumar (New Lead)', phone: '+91 98765 43210' },
                  { name: 'Dr. Priya Patel (VIP)', phone: '+91 94321 09876' },
                  { name: 'Anonymous Customer', phone: '+91 91234 56789' },
                ].map((preset) => (
                  <button
                    key={preset.phone}
                    onClick={() => {
                      setCallerName(preset.name);
                      setCallerPhone(preset.phone);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      callerPhone === preset.phone
                        ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                        : 'bg-[#0C1317] border-[#222E35] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold truncate text-[11px]">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{preset.phone}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Caller Phone Number:
                </label>
                <input
                  type="text"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  className="w-full bg-[#0C1317] border border-[#222E35] rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Caller Name / Contact:
                </label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-[#0C1317] border border-[#222E35] rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleTriggerMissedCall}
              disabled={isRinging || isDispatching}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <PhoneIncoming className="w-5 h-5 fill-current" />
              <span>Simulate Inbound Missed Call & Trigger Auto-Reply</span>
            </button>
          </div>

          {/* Last Dispatched SMS Receipt */}
          {lastDispatchedLog && (
            <div className="bg-[#111B21] p-6 rounded-3xl border border-emerald-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SMS Dispatched Successfully!</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">{lastDispatchedLog.time}</span>
              </div>

              <div className="p-4 bg-[#0C1317] rounded-2xl border border-[#222E35] space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Recipient: <strong className="text-white font-mono">{lastDispatchedLog.phone}</strong></span>
                  <span>Carrier: <strong className="text-emerald-400">{lastDispatchedLog.sim}</strong></span>
                </div>
                <div className="pt-2 border-t border-[#222E35] text-slate-200 font-mono text-[11px] leading-relaxed">
                  "{lastDispatchedLog.text}"
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Recorded in Supabase missed_calls & messages</span>
                </span>
              </div>
            </div>
          )}

          {/* Feature Architecture Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111B21] p-5 rounded-2xl border border-[#222E35] space-y-2">
              <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Dual-SIM Logic</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Choose SIM 1 (Jio) or SIM 2 (Airtel) directly on the phone. The native Android SmsManager dispatches using the exact carrier subscription ID.
              </p>
            </div>

            <div className="bg-[#111B21] p-5 rounded-2xl border border-[#222E35] space-y-2">
              <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Delay Buffer (0s - 30s)</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevents spamming if the customer immediately calls back or if you answer on another line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
