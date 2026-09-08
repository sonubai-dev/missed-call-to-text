import { Metadata } from 'next';
import { Webhook, Code, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Webhook Integrations - Missed Call to WhatsApp',
  description: 'Connect MissCall Assistant to your existing systems. Secure, idempotent, offline-ready webhooks.',
};

export default function WebhooksPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl flex justify-center items-center gap-3">
            <Webhook className="w-10 h-10 text-purple-600" /> Developer Webhooks
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            Push real-time events from the Android app to your own servers or automation platforms like Zapier/Make.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Enterprise-Grade Reliability</h2>
            <p className="text-lg text-slate-600 mb-8">
              Our webhook system isn't just an afterthought. It's built for production reliability directly inside the Android app.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Exponential Backoff & Offline Queue</h4>
                  <p className="text-slate-600 text-sm">If your server is down or the phone loses internet, the app saves the event locally and retries up to 5 times using an exponential backoff formula. No data is lost.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">HMAC-SHA256 Signatures</h4>
                  <p className="text-slate-600 text-sm">Every POST request includes an <code className="bg-slate-100 px-1 py-0.5 rounded text-pink-600 text-xs">X-Signature</code> header generated using your secret key to prevent spoofing.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Canonical Idempotency</h4>
                  <p className="text-slate-600 text-sm">Every physical missed call generates a single canonical <code className="bg-slate-100 px-1 py-0.5 rounded text-pink-600 text-xs">X-Event-ID</code>. Downstream events (like SMS sent) reference this ID, ensuring you never create duplicate records.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden border border-slate-800">
            <div className="flex bg-[#2d2d2d] px-4 py-2 border-b border-black text-xs font-mono text-slate-400 gap-4">
              <span>POST /api/webhook</span>
              <span className="text-green-400">200 OK</span>
            </div>
            <div className="p-4 overflow-x-auto">
<pre className="text-sm font-mono text-slate-300 leading-relaxed">
<span className="text-blue-400">Headers:</span>
X-Event-Type: missed_call
X-Timestamp: 1694183421000
X-Event-ID: CALL_8f9a2b...
X-Signature: a9b3c4d5...

<span className="text-blue-400">Body:</span>
{`{
  "event_version": "1.0",
  "event": "missed_call",
  "eventId": "EVT_77291a...",
  "idempotencyKey": "CALL_8f9a2b...",
  "customer": {
    "id": "CUST_1492",
    "name": "Unknown",
    "phone": "+15551234567",
    "status": "NEW"
  },
  "business": {
    "name": "City Dental",
    "phone": "+15559998888"
  }
}`}
</pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Supported Event Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['missed_call', 'customer_created', 'customer_updated', 'followup_created', 'sms_sent', 'whatsapp_sent', 'whatsapp_delivered', 'customer_replied'].map(evt => (
              <div key={evt} className="bg-slate-50 border border-slate-100 px-3 py-2 rounded text-sm font-mono text-slate-700 text-center">
                {evt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
