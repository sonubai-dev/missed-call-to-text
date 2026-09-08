import { Metadata } from 'next';
import { Smartphone, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Native SMS Automation - Missed Call to WhatsApp',
  description: 'Use your own Android phone SIM to send automatic SMS follow-ups. No Twilio or external providers required.',
};

export default function SmsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mb-6">
              <Smartphone className="w-4 h-4" /> Native Android SMS
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-6">
              Use Your Own Phone SIM. No External Fees.
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Why pay for Twilio or MSG91 when you already have a mobile plan? MissCall Assistant uses Android's native Telephony capabilities to dispatch automatic follow-up texts directly from your device.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Multi-SIM Support</h4>
                  <p className="text-slate-600 text-sm">Select exactly which SIM card (SIM 1 or SIM 2) should be used for automated dispatches.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Automatic or Manual</h4>
                  <p className="text-slate-600 text-sm">Let the app send the message immediately upon a missed call, or draft it for manual approval via the CRM dashboard.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Delivery Tracking</h4>
                  <p className="text-slate-600 text-sm">The app tracks whether the SMS successfully reached the carrier radio network and logs it to the local database.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative">
            <div className="absolute -top-6 -right-6 bg-blue-500 text-white rounded-2xl p-4 shadow-lg transform rotate-6 hidden md:block">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">SMS Configuration</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message Template</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 font-mono">
                  Hi, we missed your call to {`{business_name}`}. Please reply here and we'll get back to you shortly!
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred SIM</label>
                <div className="flex gap-4">
                  <div className="flex-1 bg-blue-50 border-2 border-blue-500 rounded-lg p-3 flex items-center justify-center gap-2 text-blue-800 font-medium">
                    <Smartphone className="w-5 h-5" /> SIM 1 (Business)
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center gap-2 text-slate-500">
                    <Smartphone className="w-5 h-5" /> SIM 2 (Personal)
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 flex gap-3 border border-green-100 mt-4">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-800">
                  Android requires "Send SMS" permission for this to function. Messages are sent through your carrier and standard SMS rates from your mobile plan apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
