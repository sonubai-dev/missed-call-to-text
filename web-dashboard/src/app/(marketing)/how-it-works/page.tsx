import { Metadata } from 'next';
import { PhoneMissed, Settings, MessageSquare, LineChart, Shield, Smartphone } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works - Missed Call to WhatsApp',
  description: 'Learn how MissCall Assistant automates your missed call follow-ups using SMS, WhatsApp Web, and WhatsApp Cloud API.',
};

export default function HowItWorksPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            How MissCall Assistant Works
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            A simple, secure, and fully automated workflow to make sure you never lose a customer.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center hidden md:block" aria-hidden="true">
            <div className="w-1 h-full bg-slate-100 rounded-full" />
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-5/12 mb-8 md:mb-0 md:text-right md:pr-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">1. You Miss a Customer Call</h3>
                <p className="text-slate-600">
                  Whether you are busy serving another client, away from your phone, or outside business hours, a customer tries to reach your business but the call goes unanswered.
                </p>
              </div>
              <div className="z-10 flex items-center justify-center w-16 h-16 bg-red-100 rounded-full border-4 border-white shadow-sm mb-8 md:mb-0">
                <PhoneMissed className="w-8 h-8 text-red-600" />
              </div>
              <div className="md:w-5/12 md:pl-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-slate-700">R</div>
                    <div>
                      <p className="font-semibold text-slate-900">Rahul (New Customer)</p>
                      <p className="text-sm text-red-500 font-medium">Missed call • 10:41 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center justify-between">
              <div className="md:w-5/12 mb-8 md:mb-0 md:pl-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">2. The App Detects It Instantly</h3>
                <p className="text-slate-600">
                  The Android application immediately detects the missed call using native Telephony APIs. It checks if the number is blacklisted or if you've already sent them a message recently (Duplicate Protection).
                </p>
              </div>
              <div className="z-10 flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full border-4 border-white shadow-sm mb-8 md:mb-0">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <div className="md:w-5/12 md:text-right md:pr-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left md:text-right">
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2 md:justify-end"><Shield className="w-4 h-4 text-green-500" /> Not in blacklist</li>
                    <li className="flex items-center gap-2 md:justify-end"><Shield className="w-4 h-4 text-green-500" /> Valid mobile number</li>
                    <li className="flex items-center gap-2 md:justify-end"><Shield className="w-4 h-4 text-green-500" /> Passed duplicate protection</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-5/12 mb-8 md:mb-0 md:text-right md:pr-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Automated Message Sent</h3>
                <p className="text-slate-600 mb-4">
                  Based on your configuration, the app automatically dispatches a highly personalized message using your preferred channel.
                </p>
                <div className="inline-flex flex-wrap gap-2 justify-end">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">WhatsApp Web</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">WhatsApp Cloud API</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Native SIM SMS</span>
                </div>
              </div>
              <div className="z-10 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full border-4 border-white shadow-sm mb-8 md:mb-0">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <div className="md:w-5/12 md:pl-10">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <p className="text-slate-800 text-sm">
                    "Hi Rahul! We just missed your call at City Dental. How can we help you? Reply here or visit our website to book an appointment."
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center justify-between">
              <div className="md:w-5/12 mb-8 md:mb-0 md:pl-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">4. CRM & Webhooks Synchronized</h3>
                <p className="text-slate-600">
                  The caller is automatically added to your local Customer CRM timeline. If you have Webhooks configured, a securely signed JSON payload is instantly dispatched to your external servers.
                </p>
              </div>
              <div className="z-10 flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full border-4 border-white shadow-sm mb-8 md:mb-0">
                <LineChart className="w-8 h-8 text-purple-600" />
              </div>
              <div className="md:w-5/12 md:text-right md:pr-10">
                <div className="bg-slate-900 p-4 rounded-xl text-left overflow-hidden">
                  <pre className="text-xs text-green-400 font-mono">
{`{
  "event_version": "1.0",
  "event_type": "whatsapp_sent",
  "customer": {
    "phone": "+91XXXXXXXX12",
    "status": "NEW"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-24 text-center">
          <Link href="/download" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-green-600 hover:bg-green-700 shadow-md transition-all">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}
