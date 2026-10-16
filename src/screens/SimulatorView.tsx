import React, { useState } from 'react';
import { PlayCircle, PhoneIncoming, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Customer, DispatchRule, MessageTemplate, BusinessSettings, CallEvent } from '../types';
import { evaluateCallRules } from '../lib/rules-engine';

interface SimulatorViewProps {
  customers: Customer[];
  rules: DispatchRule[];
  templates: MessageTemplate[];
  settings: BusinessSettings;
  calls: CallEvent[];
  onCallProcessed: (call: CallEvent, customer?: Customer | null, messageContent?: string) => void;
}

export function SimulatorView({
  customers,
  rules,
  templates,
  settings,
  calls,
  onCallProcessed,
}: SimulatorViewProps) {
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 12345');
  const [customerName, setCustomerName] = useState('Rahul Verma');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    const existing = customers.find((c) => c.phoneNumber.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')) || null;

    const evalResult = evaluateCallRules(cleanPhone, existing, rules, settings, calls);

    const call: CallEvent = {
      id: `sim-${Date.now()}`,
      phoneNumber: cleanPhone,
      customerName: customerName || existing?.name || 'Incoming Caller',
      timestamp: Date.now(),
      status: 'MISSED',
      whatsappStatus: evalResult.shouldDispatch ? 'PENDING' : 'IGNORED',
      suggestedMessage: 'Hello! Sorry we missed your call from our store. How can we help you today?',
      simSlot: settings.defaultSmsSim || 'SIM 1 (Jio)',
    };

    onCallProcessed(call, existing, evalResult.shouldDispatch ? call.suggestedMessage : undefined);
    setLastResult(evalResult);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-emerald-400" />
          <span>Telephony & Missed Call Simulator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Trigger simulated telephony broadcasts to evaluate rules, cooldown triggers, and dispatch flows.
        </p>
      </div>

      <div className="bg-[#111B21] p-6 rounded-2xl border border-[#222E35] space-y-4">
        <form onSubmit={handleSimulate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium">Caller Phone Number</label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 w-full p-3 bg-[#0C1317] border border-[#222E35] rounded-xl text-white outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium">Caller Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full p-3 bg-[#0C1317] border border-[#222E35] rounded-xl text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <PhoneIncoming className="w-4 h-4" />
              <span>Simulate Inbound Missed Call</span>
            </button>
          </div>
        </form>

        {lastResult && (
          <div className="mt-4 p-4 rounded-xl bg-[#0C1317] border border-[#222E35] space-y-2 text-xs">
            <div className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simulation Result: {lastResult.reason}</span>
            </div>
            <div className="text-slate-400">
              Should Dispatch: <span className={lastResult.shouldDispatch ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{lastResult.shouldDispatch ? 'YES' : 'NO'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
