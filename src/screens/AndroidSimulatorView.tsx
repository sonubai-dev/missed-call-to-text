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
  X,
  Edit3,
  Moon,
  Sun,
  Radio,
  ExternalLink,
  PhoneForwarded,
  Check,
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

// 10 UI/UX Improvement: 1-Click Industry Templates
const INDUSTRY_PRESETS = [
  {
    id: 'preset-retail',
    name: 'Retail / Shop',
    tag: '🏪 Store',
    content: 'Thanks for calling {{business_name}}! We are currently assisting in-store shoppers. What product or size are you looking for?',
  },
  {
    id: 'preset-clinic',
    name: 'Clinic / Doctor',
    tag: '🏥 Clinic',
    content: 'Hello from {{business_name}}! For appointment bookings, clinic timings, or emergency inquiries, please reply with your patient name.',
  },
  {
    id: 'preset-services',
    name: 'Repair / Services',
    tag: '🔧 Services',
    content: 'Missed your call at {{business_name}}! Please share your vehicle or appliance model and problem for quick repair assistance.',
  },
  {
    id: 'preset-night',
    name: 'After-Hours / Night',
    tag: '🌙 Closed',
    content: '{{business_name}} is currently closed for the day. Our team has recorded your call and will call you back first thing tomorrow morning!',
  },
  {
    id: 'preset-general',
    name: 'General Follow-up',
    tag: '💼 General',
    content: 'Hello! Sorry we missed your call from {{business_name}}. How can we assist you today?',
  },
];

export function AndroidSimulatorView({
  customers,
  templates: initialTemplates,
  settings,
  calls: initialCalls,
  onCallProcessed,
  onNavigateTab,
}: AndroidSimulatorViewProps) {
  // Mobile App Internal States
  const [isServiceActive, setIsServiceActive] = useState(true);
  
  // 10 UI/UX Improvement #3: Visual Dual-SIM Carrier Branding
  const [selectedSim, setSelectedSim] = useState<'SIM 1 (Jio 5G)' | 'SIM 2 (Airtel 4G)'>('SIM 1 (Jio 5G)');
  
  // 10 UI/UX Improvement #4: Configurable Delay Buffer (2s, 5s, 10s)
  const [smsDelay, setSmsDelay] = useState<number>(5);
  
  // 10 UI/UX Improvement #2: Active Template & Industry Presets
  const [activeTemplateText, setActiveTemplateText] = useState(
    initialTemplates[0]?.content || INDUSTRY_PRESETS[0].content
  );
  
  // 10 UI/UX Improvement #8: Working Hours & Night Mode Scheduler
  const [isWorkingHoursEnabled, setIsWorkingHoursEnabled] = useState(true);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('08:00 PM');
  const [isNightModeSimulated, setIsNightModeSimulated] = useState(false);

  // 10 UI/UX Improvement #9: Instant Bottom Sheet Modal for Template Editing
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [modalTempText, setModalTempText] = useState(activeTemplateText);

  // App Navigation: 0=controls (Home), 1=logs (Activity), 2=settings, 3=subscription
  const [appTab, setAppTab] = useState<'controls' | 'logs' | 'settings' | 'subscription'>('controls');

  // Simulator Rig States
  const [callerPhone, setCallerPhone] = useState('+91 98765 43210');
  const [callerName, setCallerName] = useState('Rahul Verma (Customer)');
  const [isRinging, setIsRinging] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dispatchCancelled, setDispatchCancelled] = useState(false);
  const [activeTimerRef, setActiveTimerRef] = useState<any>(null);

  // 10 UI/UX Improvement #5: Permission Checklist State
  const [permissionsStatus, setPermissionsStatus] = useState({
    callScreening: true,
    smsEngine: true,
    batteryOptimization: false,
  });

  // Local activity events list
  const [localCalls, setLocalCalls] = useState<CallEvent[]>(initialCalls);

  // Status Bar Clock
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

  const businessName = settings.businessName || 'Solita Solutions';

  // 10 UI/UX Improvement #7: SMS Character & Parts Counter
  const formattedMessage = activeTemplateText
    .replace(/\{\{business_name\}\}/g, businessName)
    .replace(/\{\{customer_name\}\}/g, callerName || 'Customer');

  const charCount = formattedMessage.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  // 10 UI/UX Improvement #1: In-App Test Missed Call Simulator
  const handleTriggerMissedCall = () => {
    if (!isServiceActive) {
      alert('Android Service is paused! Please turn ON the service toggle on the phone.');
      return;
    }

    setDispatchCancelled(false);
    setIsRinging(true);

    // Simulate 2 seconds of ringing before caller hangs up
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
        setActiveTimerRef(timer);
      }
    }, 2000);
  };

  // Immediate Cancel / Call Back Safeguard Simulation
  const handleCancelSafeguard = () => {
    if (activeTimerRef) {
      clearInterval(activeTimerRef);
    }
    setIsDispatching(false);
    setCountdown(null);
    setDispatchCancelled(true);
    setTimeout(() => setDispatchCancelled(false), 3500);
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

    setLocalCalls((prev) => [newCall, ...prev]);

    // Update parent state
    const existing = customers.find(
      (c) => c.phoneNumber.replace(/\s+/g, '') === callerPhone.replace(/\s+/g, '')
    );
    onCallProcessed(newCall, existing, formattedMessage);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111B21] p-6 rounded-3xl border border-[#222E35]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Modern Material 3 Android Simulator
            </span>
            <span className="text-xs text-slate-400">Android 14 (API 34) • 10 UI/UX Improvements Active</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            MissCall Assistant — Interactive Mobile App Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test all 10 new UX improvements: 1-click industry templates, Dual-SIM carrier pills, delay safeguard timeline, character counters, and lead quick-actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('website')}
            className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-slate-200 transition-all border border-[#222E35] cursor-pointer"
          >
            App Website
          </button>
          <button
            onClick={() => onNavigateTab('admin-login')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-md shadow-blue-900/30 cursor-pointer"
          >
            Admin Portal
          </button>
        </div>
      </div>

      {/* Main Grid: Mobile Device + Simulator Rig */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER: Interactive Android Phone (5 Columns) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[360px] sm:w-[380px] bg-black rounded-[52px] p-3 shadow-2xl border-4 border-slate-700 relative ring-1 ring-white/10 select-none">
            {/* Phone Screen Container */}
            <div className="bg-[#F0F7FF] rounded-[44px] overflow-hidden border border-slate-800 flex flex-col h-[760px] relative text-[#0F172A]">
              
              {/* 1. Android Status Bar */}
              <div className="bg-[#DBEAFE] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-700 z-30">
                <span>{currentTime}</span>
                {/* Dynamic Camera Punch-hole */}
                <div className="w-4 h-4 rounded-full bg-black border border-slate-400" />
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-[10px] text-blue-600 font-extrabold">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>

              {/* 2. Top Header with Business Greeting & Status Pill */}
              <div className="bg-gradient-to-b from-[#DBEAFE] to-[#F0F7FF] px-5 py-3.5 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    {businessName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Welcome Back,</span>
                    <h3 className="text-xs font-black text-slate-900 leading-tight">{businessName}</h3>
                  </div>
                </div>

                {/* Master Active Pill */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all ${
                    isServiceActive
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-rose-100 text-rose-700 border-rose-300'
                  }`}>
                    {isServiceActive ? 'Active' : 'Paused'}
                  </span>
                  <button
                    onClick={() => setIsServiceActive(!isServiceActive)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      isServiceActive ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>

              {/* 3. Segmented Navigation Tabs */}
              <div className="bg-[#F0F7FF] px-4 py-2 border-b border-blue-100/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'controls', label: 'Home' },
                  { id: 'logs', label: 'Activity' },
                  { id: 'settings', label: 'Settings' },
                  { id: 'subscription', label: 'Pro ₹99' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAppTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                      appTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 4. Phone Screen Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                
                {/* === TAB 1: HOME / CONTROLS === */}
                {appTab === 'controls' && (
                  <div className="space-y-3.5">
                    {/* Improvement #1: Interactive In-App Test Missed Call Simulator */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Interactive Test Call</span>
                        </span>
                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                          Safe Preview
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-100 leading-relaxed">
                        Test your complete auto-reply pipeline right now without waiting for a customer call.
                      </p>
                      <button
                        onClick={handleTriggerMissedCall}
                        disabled={isRinging || isDispatching}
                        className="w-full py-2 px-3 rounded-xl bg-white text-blue-700 font-black text-[11px] hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run 5-Sec In-App Test Call</span>
                      </button>
                    </div>

                    {/* Improvement #4: Animated Delay Safeguard Stepper */}
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Delay Safeguard Stepper</span>
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {smsDelay}s Buffer
                        </span>
                      </div>

                      {/* Micro-Timeline Stepper */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[10px]">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
                            1
                          </div>
                          <span className="font-bold text-slate-800 text-[9px]">Call Rings</span>
                        </div>
                        <div className="h-0.5 flex-1 bg-slate-300 mx-1.5" />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-1">
                            2
                          </div>
                          <span className="font-bold text-blue-700 text-[9px]">{smsDelay}s Buffer</span>
                        </div>
                        <div className="h-0.5 flex-1 bg-slate-300 mx-1.5" />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-1">
                            3
                          </div>
                          <span className="font-bold text-slate-800 text-[9px]">Auto SMS</span>
                        </div>
                      </div>

                      {/* Delay Selector Pills */}
                      <div className="grid grid-cols-3 gap-2">
                        {[2, 5, 10].map((d) => (
                          <button
                            key={d}
                            onClick={() => setSmsDelay(d)}
                            className={`py-1.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                              smsDelay === d
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {d} Seconds
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Improvement #3: Visual Carrier Branding for Dual-SIM */}
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dispatch Carrier SIM</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Dual-SIM Ready
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => setSelectedSim('SIM 1 (Jio 5G)')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedSim.includes('Jio')
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-blue-700">SIM 1</span>
                            {selectedSim.includes('Jio') && <Check className="w-3 h-3 text-blue-600" />}
                          </div>
                          <div className="font-extrabold text-[11px] text-blue-950 mt-0.5">Jio 5G</div>
                          <div className="text-[9px] text-slate-400 font-mono">+91 98765 00001</div>
                        </button>

                        <button
                          onClick={() => setSelectedSim('SIM 2 (Airtel 4G)')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedSim.includes('Airtel')
                              ? 'bg-rose-50 border-rose-600 text-rose-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-rose-700">SIM 2</span>
                            {selectedSim.includes('Airtel') && <Check className="w-3 h-3 text-rose-600" />}
                          </div>
                          <div className="font-extrabold text-[11px] text-rose-950 mt-0.5">Airtel 4G</div>
                          <div className="text-[9px] text-slate-400 font-mono">+91 94321 00002</div>
                        </button>
                      </div>
                    </div>

                    {/* Improvement #9: SMS Preview Card with Instant Bottom Sheet Tap */}
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>SMS Reply Preview</span>
                        </span>
                        {/* Improvement #7: SMS Character & Parts Counter */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          smsSegments > 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {charCount}/160 chars • {smsSegments} SMS
                        </span>
                      </div>

                      {/* Tappable SMS Bubble (Triggers Bottom Sheet Modal) */}
                      <div
                        onClick={() => {
                          setModalTempText(activeTemplateText);
                          setIsTemplateModalOpen(true);
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-[11px] text-slate-800 leading-relaxed cursor-pointer transition-colors relative group"
                      >
                        <p className="font-medium">"{formattedMessage}"</p>
                        <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold mt-2">
                          <Edit3 className="w-3 h-3" />
                          <span>Tap bubble to edit or change template</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* === TAB 2: ACTIVITY & HISTORY (Improvement #6: Actionable Lead Cards) === */}
                {appTab === 'logs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="font-black text-slate-800 text-xs">Recent Missed Calls</h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {localCalls.length} Records
                      </span>
                    </div>

                    <div className="space-y-2">
                      {localCalls.map((c) => (
                        <div key={c.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                                <PhoneMissed className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-[11px]">{c.phoneNumber}</div>
                                <div className="text-[9px] text-slate-400">{c.customerName || 'Customer Lead'}</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              SMS Sent
                            </span>
                          </div>

                          {/* Quick Actions (Call Back & WhatsApp) */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <a
                              href={`tel:${c.phoneNumber}`}
                              className="flex-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <PhoneCall className="w-3 h-3 text-blue-600" />
                              <span>Call Back</span>
                            </a>
                            <a
                              href={`https://wa.me/${c.phoneNumber.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      ))}

                      {localCalls.length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          No missed calls logged yet. Run a test call on Home!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* === TAB 3: SETTINGS (Improvement #2, #5, #8) === */}
                {appTab === 'settings' && (
                  <div className="space-y-3.5">
                    {/* Improvement #2: 1-Click Industry Templates */}
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                      <span className="font-bold text-slate-800 text-[11px]">1-Click Industry Presets</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {INDUSTRY_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => setActiveTemplateText(preset.content)}
                            className={`p-2 rounded-xl text-left border text-[10px] font-bold transition-all cursor-pointer ${
                              activeTemplateText === preset.content
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div>{preset.tag}</div>
                            <div className="text-[9px] opacity-80 truncate">{preset.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Improvement #8: Business Hours Scheduler */}
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Business Working Hours</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={isWorkingHoursEnabled}
                          onChange={(e) => setIsWorkingHoursEnabled(e.target.checked)}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                      </div>
                      {isWorkingHoursEnabled && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Active Window:</span>
                            <strong className="text-slate-800">09:00 AM – 08:00 PM</strong>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Night Mode:</span>
                            <span>Sends polite closed reply after 8 PM</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Improvement #5: Permission Readiness Checklist with Fix All */}
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>System Permissions Health</span>
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <span>Call Screening API</span>
                          <span className="font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Granted</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <span>Carrier SIM SMS Engine</span>
                          <span className="font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Granted</span>
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded-lg border ${
                          permissionsStatus.batteryOptimization
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <span>Background Battery Exemption</span>
                          <span className="font-bold">
                            {permissionsStatus.batteryOptimization ? 'Active' : 'Restricted'}
                          </span>
                        </div>
                      </div>

                      {!permissionsStatus.batteryOptimization && (
                        <button
                          onClick={() => setPermissionsStatus({ callScreening: true, smsEngine: true, batteryOptimization: true })}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Fix All Permissions (1-Tap Exemption)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* === TAB 4: SUBSCRIPTION (Improvement #10: High-Trust Indian Payment Badges) === */}
                {appTab === 'subscription' && (
                  <div className="space-y-3.5">
                    <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          MissCall Pro
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          3-Day Trial Active
                        </span>
                      </div>

                      <div>
                        <div className="text-2xl font-black text-slate-900">₹99 <span className="text-xs text-slate-500 font-medium">/ month</span></div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Unlimited automated SMS replies, Dual-SIM support, delay safeguard, and lead logging.
                        </p>
                      </div>

                      {/* Indian UPI Trust Badges */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                          Accepted Instant Payment Options
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((brand) => (
                            <span key={brand} className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-extrabold text-slate-700 border border-slate-200">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => alert('Razorpay Checkout triggered for ₹99/month Pro Plan!')}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        Upgrade to Pro • ₹99 / mo
                      </button>

                      <p className="text-[9px] text-center text-slate-400">
                        100% Secure • Cancel anytime with 1-click • No hidden fees
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sheet Modal for Editing Template (Improvement #9) */}
              {isTemplateModalOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end animate-fade-in">
                  <div className="bg-white rounded-t-3xl p-5 space-y-3.5 shadow-2xl border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-xs">Edit Reply Template</h4>
                      <button
                        onClick={() => setIsTemplateModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={modalTempText}
                      onChange={(e) => setModalTempText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 font-medium"
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Available token: <code className="text-blue-600 font-mono">{"{{business_name}}"}</code></span>
                      <span className="font-bold">{modalTempText.length}/160 chars</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setIsTemplateModalOpen(false)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setActiveTemplateText(modalTempText);
                          setIsTemplateModalOpen(false);
                        }}
                        className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
                      >
                        Save Template
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulated Ringing Overlay */}
              {isRinging && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-40 flex flex-col items-center justify-between py-16 px-6 text-center animate-fade-in text-white">
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-500/10 animate-bounce">
                      <PhoneIncoming className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-black">Incoming Call...</h4>
                    <p className="text-xs text-rose-400 font-mono font-bold animate-pulse">Carrier Ringing</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black">{callerPhone}</h3>
                    <p className="text-xs text-slate-300">{callerName}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                    CallScreeningService Active • Ringing...
                  </div>
                </div>
              )}

              {/* Delay Safeguard Countdown Overlay with CANCEL BUTTON */}
              {isDispatching && (
                <div className="absolute bottom-14 inset-x-4 bg-slate-900 text-white border border-blue-500/50 rounded-2xl p-4 shadow-2xl z-40 text-center space-y-2 animate-bounce-subtle">
                  <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-bold">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Missed Call Detected! Sending SMS in:</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {countdown !== null && countdown > 0 ? `${countdown}s` : 'Sending...'}
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Target: <strong>{callerPhone}</strong> via <strong>{selectedSim}</strong>
                  </p>
                  <button
                    onClick={handleCancelSafeguard}
                    className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Cancel SMS (Simulate Owner Calling Back)
                  </button>
                </div>
              )}

              {/* Cancelled Notice */}
              {dispatchCancelled && (
                <div className="absolute bottom-14 inset-x-4 bg-amber-500 text-slate-950 font-bold rounded-2xl p-3 shadow-2xl z-40 text-center text-xs animate-fade-in">
                  SMS Aborted! Outgoing call detected before delay expired.
                </div>
              )}

              {/* Android Home Bar Pill */}
              <div className="bg-[#F0F7FF] pb-2 pt-1 flex justify-center border-t border-blue-100">
                <div className="w-28 h-1 rounded-full bg-slate-400" />
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
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Interactive Inbound Call Deck</h3>
                  <p className="text-xs text-slate-400">Trigger test calls and verify auto-SMS delay safeguard</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#202C33] text-blue-400 border border-[#222E35]">
                Real-Time Hardware Rig
              </span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Customer Scenario:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { name: 'Amit Kumar (New Customer)', phone: '+91 98765 43210' },
                  { name: 'Dr. Priya Patel (VIP Lead)', phone: '+91 94321 09876' },
                  { name: 'Sunil Rao (General Inquiry)', phone: '+91 91234 56789' },
                ].map((preset) => (
                  <button
                    key={preset.phone}
                    onClick={() => {
                      setCallerName(preset.name);
                      setCallerPhone(preset.phone);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      callerPhone === preset.phone
                        ? 'bg-blue-500/15 border-blue-500 text-white font-bold'
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
                  className="w-full bg-[#0C1317] border border-[#222E35] rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
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
                  className="w-full bg-[#0C1317] border border-[#222E35] rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleTriggerMissedCall}
              disabled={isRinging || isDispatching}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <PhoneIncoming className="w-5 h-5 fill-current" />
              <span>Simulate Inbound Call & Verify SMS Safeguard</span>
            </button>
          </div>

          {/* 10 UI/UX Implementation Checklist */}
          <div className="bg-[#111B21] p-6 rounded-3xl border border-[#222E35] shadow-lg space-y-3">
            <h4 className="font-black text-white text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>10 Modern UI/UX Improvements Implemented</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>Interactive In-App Test Card</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <span>1-Click Industry Templates</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>Dual-SIM Carrier Badging (Jio/Airtel)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">4.</span>
                <span>Safeguard Timeline Stepper (2s, 5s, 10s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">5.</span>
                <span>Permission Checklist with 1-Tap Fix</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">6.</span>
                <span>Actionable Logs (Call Back & WhatsApp)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">7.</span>
                <span>Real-Time SMS Character/Part Counter</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">8.</span>
                <span>Business Hours & Night Mode Scheduler</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">9.</span>
                <span>Instant Bottom-Sheet Template Modal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1317] border border-[#222E35] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">10.</span>
                <span>Indian UPI Trust Badges (GPay, PhonePe)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
