import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  PhoneCall,
  PhoneMissed,
  Clock,
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
  ArrowRight,
  PhoneIncoming,
  X,
  Edit3,
  Radio,
  Check,
  Lock,
  MapPin,
  User,
  Building,
  ShieldAlert,
  Zap,
  CheckCircle,
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

// 1-Click Industry Presets for Fast Template Switching
const INDUSTRY_PRESETS = [
  {
    id: 'preset-retail',
    name: 'Retail / Shop',
    tag: '🏪 Store',
    content: 'Thanks for calling {{business_name}}! We are currently assisting customers. What product are you looking for?',
  },
  {
    id: 'preset-clinic',
    name: 'Clinic / Doctor',
    tag: '🏥 Clinic',
    content: 'Hello from {{business_name}}! For appointment bookings, clinic timings, or emergency inquiries, please reply with your name.',
  },
  {
    id: 'preset-services',
    name: 'Repair / Services',
    tag: '🔧 Services',
    content: 'Missed your call at {{business_name}}! Please share your vehicle or appliance model for prompt service assistance.',
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
  // --- USER PROFILE & ONBOARDING STATE ---
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [userName, setUserName] = useState<string>('Vikram Sharma');
  const [businessName, setBusinessName] = useState<string>(settings.businessName || 'Sharma Electronics');
  const [userLocation, setUserLocation] = useState<string>('Gaya, Bihar');

  // Temporary onboarding form states
  const [tempUserName, setTempUserName] = useState<string>(userName);
  const [tempBusinessName, setTempBusinessName] = useState<string>(businessName);
  const [tempLocation, setTempLocation] = useState<string>(userLocation);

  // Settings screen profile edit states
  const [editUserName, setEditUserName] = useState<string>(userName);
  const [editBusinessName, setEditBusinessName] = useState<string>(businessName);
  const [editLocation, setEditLocation] = useState<string>(userLocation);
  const [profileSavedFeedback, setProfileSavedFeedback] = useState<boolean>(false);

  // --- 100% FREE LIFETIME EDITION STATE ---
  const isSubscriptionActive = true;
  const isTrialExpired = false;

  // Mobile App Internal Controls
  const [isServiceActive, setIsServiceActive] = useState<boolean>(true);
  const [smsDelay, setSmsDelay] = useState<number>(5);
  const [selectedSim, setSelectedSim] = useState<'SIM 1 (Jio 5G)' | 'SIM 2 (Airtel 4G)'>('SIM 1 (Jio 5G)');

  const [activeTemplateText, setActiveTemplateText] = useState<string>(
    initialTemplates[0]?.content || INDUSTRY_PRESETS[0].content
  );

  // Instant Bottom Sheet Modal for Template Editing
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [modalTempText, setModalTempText] = useState(activeTemplateText);

  // App Navigation: 'home' | 'settings' | 'activity'
  const [appTab, setAppTab] = useState<'home' | 'settings' | 'activity'>('home');

  // Simulator Hardware Rig States
  const [callerPhone, setCallerPhone] = useState('+91 98765 43210');
  const [callerName, setCallerName] = useState('Rahul Verma (Customer)');
  const [isRinging, setIsRinging] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dispatchCancelled, setDispatchCancelled] = useState(false);
  const [activeTimerRef, setActiveTimerRef] = useState<any>(null);

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

  // Formatted SMS message with dynamic tokens
  const formattedMessage = activeTemplateText
    .replace(/\{\{business_name\}\}/g, businessName)
    .replace(/\{\{customer_name\}\}/g, callerName || 'Customer');

  const charCount = formattedMessage.length;

  // Trigger simulated inbound missed call
  const handleTriggerMissedCall = () => {
    if (isTrialExpired) {
      alert('⚠️ 14-Day Free Trial has expired! Missed-call SMS is paused. Please subscribe to continue.');
      return;
    }

    if (!isServiceActive) {
      alert('Service is paused! Please turn ON the auto-reply switch on the home screen.');
      return;
    }

    setDispatchCancelled(false);
    setIsRinging(true);

    // Simulate 2 seconds of ringing before caller hangs up
    setTimeout(() => {
      setIsRinging(false);
      setIsDispatching(true);

      let remaining = smsDelay;
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

    const existing = customers.find(
      (c) => c.phoneNumber.replace(/\s+/g, '') === callerPhone.replace(/\s+/g, '')
    );
    onCallProcessed(newCall, existing, formattedMessage);

    // Live sync to Supabase
    supabase.from('missed_calls').insert({
      device_id: 'default_device',
      phone_number: callerPhone,
      customer_name: callerName,
      call_status: 'MISSED',
      whatsapp_status: 'SENT',
      suggested_message: formattedMessage,
      notes: `Dispatched via ${selectedSim}`,
    }).then(() => {}, () => {});

    supabase.from('messages').insert({
      device_id: 'default_device',
      phone_number: callerPhone,
      customer_name: callerName,
      content: formattedMessage,
      status: 'SENT',
      mode: 'MANUAL',
    }).then(() => {}, () => {});
  };

  // Handle first launch onboarding finish
  const handleCompleteOnboarding = () => {
    const finalUser = tempUserName.trim() || 'Vikram Sharma';
    const finalBiz = tempBusinessName.trim() || 'Sharma Electronics';
    const finalLoc = tempLocation.trim() || 'Gaya, Bihar';

    setUserName(finalUser);
    setBusinessName(finalBiz);
    setUserLocation(finalLoc);
    setEditUserName(finalUser);
    setEditBusinessName(finalBiz);
    setEditLocation(finalLoc);

    setIsOnboarded(true);
    setAppTab('home');
  };

  // Save profile changes in Settings
  const handleSaveProfileSettings = () => {
    setUserName(editUserName.trim() || 'Business Owner');
    setBusinessName(editBusinessName.trim() || 'My Business');
    setUserLocation(editLocation.trim() || 'India');
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111B21] p-6 rounded-3xl border border-[#222E35]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              100% Free Lifetime Edition
            </span>
            <span className="text-xs text-slate-400">Zero Sign-in • No Subscription Required</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            MissCall Assistant — Interactive App Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modern Electric Blue 3-Tab design: Home controls, Anti-Awkward delay safeguard, live template preview, and local activity logging.
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
          <div className="w-[360px] sm:w-[380px] bg-slate-900 rounded-[52px] p-3 shadow-2xl border-4 border-slate-700 relative ring-1 ring-white/10 select-none">
            {/* Phone Screen Container */}
            <div className="bg-[#F8FAFC] rounded-[44px] overflow-hidden border border-slate-800 flex flex-col h-[760px] relative text-[#0F172A]">
              
              {/* 1. Android Status Bar */}
              <div className="bg-white/80 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-700 z-30 border-b border-slate-100">
                <span>{currentTime}</span>
                {/* Dynamic Camera Punch-hole */}
                <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-700" />
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-[10px] text-blue-600 font-extrabold">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>



              {/* ======================================================== */}
              {/* FLOW 1: ONBOARDING / SIGN UP (FIRST LAUNCH FLOW) */}
              {/* ======================================================== */}
              {!isOnboarded ? (
                <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto animate-fade-in bg-white">
                  <div className="space-y-4">
                    {/* Header Step Indicator */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {onboardingStep}
                        </span>
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Step {onboardingStep} of 2
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 leading-tight">
                        {onboardingStep === 1 ? 'Welcome! Set Up Your Profile' : 'Activate 14-Day Free Trial'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {onboardingStep === 1
                          ? 'Enter your name and store location to personalize automatic replies.'
                          : 'Try all features free for 14 days. ₹0 today, ₹99/mo after trial.'}
                      </p>
                    </div>

                    {/* Step 1: User Profile Inputs */}
                    {onboardingStep === 1 ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>Your Full Name</span>
                          </label>
                          <input
                            type="text"
                            value={tempUserName}
                            onChange={(e) => setTempUserName(e.target.value)}
                            placeholder="e.g. Vikram Sharma"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-blue-600" />
                            <span>Business / Shop Name</span>
                          </label>
                          <input
                            type="text"
                            value={tempBusinessName}
                            onChange={(e) => setTempBusinessName(e.target.value)}
                            placeholder="e.g. Sharma Electronics"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>City / Location</span>
                          </label>
                          <input
                            type="text"
                            value={tempLocation}
                            onChange={(e) => setTempLocation(e.target.value)}
                            placeholder="e.g. Gaya, Bihar"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2.5">
                          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                          <p className="text-[10px] text-blue-800 leading-tight">
                            Personal details are securely saved on your device and injected dynamically into your SMS templates.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Step 2: 14-Day Free Trial Confirmation */
                      <div className="space-y-3 pt-2">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                              Instant Activation
                            </span>
                            <span className="text-xs font-black text-amber-300">100% Free</span>
                          </div>

                          <div>
                            <div className="text-2xl font-black">14-Day Free Trial</div>
                            <div className="text-xs text-blue-100 mt-0.5">
                              Then ₹99 / month • Cancel anytime
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/20 space-y-1.5 text-[11px] text-blue-50">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                              <span>Automated SMS replies via your carrier SIM</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                              <span>Smart 5-second delay buffer safeguard</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                              <span>Dual-SIM carrier support (Jio / Airtel)</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Payment Details
                          </span>
                          <p className="text-[11px] text-slate-700 font-semibold">
                            No charge today. Full access granted for 14 days.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Onboarding Bottom Action Buttons */}
                  <div className="pt-4 space-y-2">
                    {onboardingStep === 1 ? (
                      <button
                        onClick={() => setOnboardingStep(2)}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continue to Plan & Trial</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={handleCompleteOnboarding}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Start 14-Day Free Trial & Go to Home</span>
                        </button>
                        <button
                          onClick={() => setOnboardingStep(1)}
                          className="w-full py-2 text-slate-500 font-semibold text-xs hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          Back to Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ======================================================== */
                /* FLOW 2: MAIN APP INTERFACE (HOME / SETTINGS / ACTIVITY)   */
                /* ======================================================== */
                <div className="flex-1 flex flex-col overflow-hidden relative">
                  
                  {/* Clean Aesthetic App Header */}
                  <div className="bg-white px-5 py-3 border-b border-slate-100 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {businessName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium leading-none">
                          {userLocation}
                        </div>
                        <h3 className="text-xs font-black text-slate-900 mt-0.5 leading-tight">
                          {businessName}
                        </h3>
                      </div>
                    </div>

                    {/* 100% Free Lifetime Status Pill */}
                    <div className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                      <span>● Active • Free</span>
                    </div>
                  </div>

                  {/* Clean 3-Tab Bottom/Top Navigation Bar */}
                  <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    {[
                      { id: 'home', label: 'Home' },
                      { id: 'settings', label: 'Settings' },
                      { id: 'activity', label: 'Activity' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAppTab(tab.id as any)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          appTab === tab.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Screen Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                    
                    {/* ==================================================== */}
                    {/* 1. MINIMAL HOME SCREEN: ONLY ESSENTIALS              */}
                    {/* (Active Switch, Timer Delay, Automated Message Card) */}
                    {/* ==================================================== */}
                    {appTab === 'home' && (
                      <div className="space-y-3">
                        
                        {/* ESSENTIAL 1: Master Active / Inactive Switch Card */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                Auto-Reply Engine
                              </div>
                              <h4 className="text-sm font-black text-slate-900">
                                {isServiceActive ? 'Service is Active' : 'Service is Paused'}
                              </h4>
                            </div>

                            {/* Minimal Toggle Switch */}
                            <button
                              onClick={() => setIsServiceActive(!isServiceActive)}
                              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                isServiceActive ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {isServiceActive
                              ? 'Incoming missed calls will immediately receive your automated SMS follow-up.'
                              : 'Automation paused. Missed calls will not trigger SMS until resumed.'}
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Dispatch SIM:</span>
                            <span className="font-bold text-slate-700">{selectedSim}</span>
                          </div>
                        </div>

                        {/* ESSENTIAL 2: Timer Delay Selector (2s, 5s, 10s) */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>Response Timer Delay</span>
                            </span>
                            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              {smsDelay}s Buffer
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Waits {smsDelay}s before dispatching SMS. If you call back first, SMS is automatically cancelled.
                          </p>

                          {/* Minimal 3-Button Selector */}
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {[2, 5, 10].map((sec) => (
                              <button
                                key={sec}
                                onClick={() => setSmsDelay(sec)}
                                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  smsDelay === sec
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {sec} Seconds
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ESSENTIAL 3: Automated Message Card (Clean Preview with Tap-to-Edit) */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>Automated Reply Message</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {charCount}/160 chars
                            </span>
                          </div>

                          {/* Tappable Minimal Message Bubble */}
                          <div
                            onClick={() => {
                              setModalTempText(activeTemplateText);
                              setIsTemplateModalOpen(true);
                            }}
                            className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-slate-800 text-[11px] font-medium leading-relaxed cursor-pointer transition-colors group"
                          >
                            <p>"{formattedMessage}"</p>
                            <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold mt-2">
                              <Edit3 className="w-3 h-3" />
                              <span>Tap to edit message</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Test In-App Action */}
                        <button
                          onClick={handleTriggerMissedCall}
                          disabled={isRinging || isDispatching}
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-blue-400" />
                          <span>Test Auto-Reply Right Now</span>
                        </button>
                      </div>
                    )}

                    {/* ==================================================== */}
                    {/* 2. SETTINGS SCREEN: PROFILE EDIT & 14-DAY TRIAL      */}
                    {/* ==================================================== */}
                    {appTab === 'settings' && (
                      <div className="space-y-3.5 animate-fade-in">
                        
                        {/* 100% FREE LIFETIME LICENSE CARD */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Edition & License
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ● 100% Free Lifetime
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-black text-slate-900">
                              MissCall Assistant Lifetime
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              No subscription required. All missed-call SMS features run natively on your device forever.
                            </p>
                          </div>
                        </div>

                        {/* EDIT PROFILE SECTION */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-900">Edit Profile & Store</h4>
                            {profileSavedFeedback && (
                              <span className="text-[10px] font-bold text-emerald-600 animate-fade-in flex items-center gap-1">
                                <Check className="w-3 h-3" /> Saved!
                              </span>
                            )}
                          </div>

                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Your Full Name
                              </label>
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Business Name
                              </label>
                              <input
                                type="text"
                                value={editBusinessName}
                                onChange={(e) => setEditBusinessName(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Location / City
                              </label>
                              <input
                                type="text"
                                value={editLocation}
                                onChange={(e) => setEditLocation(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                              />
                            </div>

                            <button
                              onClick={handleSaveProfileSettings}
                              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              Save Profile Changes
                            </button>
                          </div>
                        </div>

                        {/* INDUSTRY PRESETS SHORTCUT */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            1-Click Industry Templates
                          </span>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {INDUSTRY_PRESETS.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => setActiveTemplateText(p.content)}
                                className={`p-2 rounded-xl text-left border text-[10px] font-bold transition-all cursor-pointer ${
                                  activeTemplateText === p.content
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div>{p.tag}</div>
                                <div className="text-[9px] opacity-80 truncate">{p.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ==================================================== */}
                    {/* 3. ACTIVITY LOGS SCREEN                              */}
                    {/* ==================================================== */}
                    {appTab === 'activity' && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="font-black text-slate-900 text-xs">Recent Follow-Ups</h4>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {localCalls.length} Dispatched
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
                              No calls logged yet. Run a test call on Home!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>



                  {/* BOTTOM SHEET MODAL FOR QUICK TEMPLATE EDITING */}
                  {isTemplateModalOpen && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fade-in">
                      <div className="bg-white rounded-t-3xl p-5 space-y-3.5 shadow-2xl border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-slate-900 text-xs">Edit Reply Message</h4>
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
                          <span>Token: <code className="text-blue-600 font-mono">{"{{business_name}}"}</code></span>
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

                  {/* Simulated Incoming Call Overlay */}
                  {isRinging && (
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-40 flex flex-col items-center justify-between py-16 px-6 text-center animate-fade-in text-white">
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
                        Listening for Missed Call...
                      </div>
                    </div>
                  )}

                  {/* Delay Safeguard Countdown Overlay with CANCEL BUTTON */}
                  {isDispatching && (
                    <div className="absolute bottom-12 inset-x-4 bg-slate-900 text-white border border-blue-500/50 rounded-2xl p-4 shadow-2xl z-40 text-center space-y-2 animate-bounce-subtle">
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
                        Cancel SMS (Simulate Calling Back First)
                      </button>
                    </div>
                  )}

                  {/* Cancelled Notice */}
                  {dispatchCancelled && (
                    <div className="absolute bottom-12 inset-x-4 bg-amber-500 text-slate-950 font-bold rounded-2xl p-3 shadow-2xl z-40 text-center text-xs animate-fade-in">
                      SMS Cancelled! Outgoing call detected before delay expired.
                    </div>
                  )}

                  {/* Android Home Bar Indicator */}
                  <div className="bg-white pb-2 pt-1 flex justify-center border-t border-slate-100">
                    <div className="w-28 h-1 rounded-full bg-slate-300" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Simulator Hardware Control Deck & Testing Triggers (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Action Box: Trigger Calls */}
          <div className="bg-[#111B21] p-6 sm:p-8 rounded-3xl border border-[#222E35] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#222E35] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Inbound Call & Safeguard Simulator</h3>
                  <p className="text-xs text-slate-400">Trigger test customer calls to verify auto-SMS delay</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#202C33] text-blue-400 border border-[#222E35]">
                Hardware Rig
              </span>
            </div>

            {/* Quick Customer Presets */}
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

            {/* Custom Caller Inputs */}
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
                  Caller Contact Name:
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
              <span>Simulate Customer Missed Call</span>
            </button>
          </div>

          {/* TELEPHONY QA TESTING RIG */}
          <div className="bg-[#111B21] p-6 rounded-3xl border border-[#222E35] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222E35] pb-3">
              <h4 className="font-black text-white text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Free Lifetime Telephony Rig</span>
              </h4>
              <span className="text-[10px] text-slate-400">Interactive QA Tools</span>
            </div>

            <p className="text-xs text-slate-400">
              Test how the mobile application handles incoming missed calls, delays, and immediate outgoing callback auto-cancellations.
            </p>

            {/* Delay Quick Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Test Delay Safeguard:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSmsDelay(sec)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      smsDelay === sec
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0C1317] border-[#222E35] text-slate-300 hover:text-white'
                    }`}
                  >
                    {sec}s Delay
                  </button>
                ))}
              </div>
            </div>

            {/* Dual SIM Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Test Dispatch SIM Slot:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['SIM 1 (Jio 5G)', 'SIM 2 (Airtel 4G)'] as const).map((sim) => (
                  <button
                    key={sim}
                    onClick={() => setSelectedSim(sim)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedSim === sim
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#0C1317] border-[#222E35] text-slate-300 hover:text-white'
                    }`}
                  >
                    {sim}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setLocalCalls(initialCalls);
                  setIsServiceActive(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-bold text-slate-200 border border-[#222E35] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Reset Demo Activity State</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}