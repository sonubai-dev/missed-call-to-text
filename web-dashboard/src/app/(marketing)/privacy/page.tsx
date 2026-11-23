import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy & User Data Protection - MissCall Assistant',
  description: 'Official Google Play and DPDP Act compliant privacy policy for MissCall Assistant by Solita Solutions.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span>Google Play Policy & DPDP Act (2023) Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy & User Data Protection
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Published by <strong>Solita Solutions</strong> • Effective November 2026 • 100% Free Lifetime Edition
          </p>
        </div>

        {/* 100% On-Device Privacy Highlight */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
          <h3 className="font-extrabold text-sm text-emerald-900">
            🔒 Core Privacy Guarantee: 100% On-Device Local Processing
          </h3>
          <p className="leading-relaxed">
            MissCall Assistant is built on a <strong>privacy-first architecture</strong>. All incoming call detection, contact matching, and carrier SMS follow-up dispatches happen <strong>entirely on your smartphone’s local Android telephony processor</strong>. Your customer contacts, phone numbers, and call logs are <strong>NEVER</strong> uploaded, sold, shared, or exfiltrated to any remote server or advertising network.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Sensitive Android Permissions & Justification</h2>
          <p>
            Under Google Play Store Developer Program Policies regarding <em>Personal and Sensitive User Data</em>, we explicitly disclose every sensitive permission requested by MissCall Assistant:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong>READ_CALL_LOG & READ_PHONE_STATE:</strong> Required strictly to detect incoming missed calls in real-time so that the automated follow-up SMS can be queued. Phone numbers are stored solely in your device’s private local SQLite database.
            </li>
            <li>
              <strong>SEND_SMS:</strong> Required to dispatch the user-configured follow-up text reply to the missed caller via the device’s physical SIM card (Dual-SIM slot selection supported).
            </li>
            <li>
              <strong>POST_NOTIFICATIONS:</strong> Required on Android 13+ to display the persistent background telephony monitor status and confirmation notifications when an SMS is sent.
            </li>
            <li>
              <strong>WAKE_LOCK:</strong> Required to keep the CPU active for the 2–10 second delay safeguard countdown buffer even when the phone screen is off.
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">2. No Third-Party Tracking or Ads</h2>
          <p>
            MissCall Assistant contains <strong>zero third-party advertising SDKs</strong> (no Google AdMob, no Meta Audience Network), zero behavior tracking beacons, and zero cryptocurrency miners. The application is a pure native utility.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">3. 100% Free Lifetime Model & Zero Payment Data</h2>
          <p>
            MissCall Assistant is 100% free of charge for lifetime use. There are no in-app purchases, subscriptions, or credit card charges. No financial or payment data is ever requested, stored, or processed.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">4. Regulatory Compliance</h2>
          <p>This privacy policy adheres to the legal requirements of:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Digital Personal Data Protection Act (DPDP Act 2023)</strong> of India</li>
            <li><strong>TRAI Telecom Commercial Communications Customer Preference Regulations</strong></li>
            <li><strong>EU General Data Protection Regulation (GDPR)</strong></li>
            <li><strong>Google Play Developer Distribution Agreement & User Data Policy</strong></li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">5. Data Deletion & Retention</h2>
          <p>
            You retain absolute control over all stored data. Uninstalling the application immediately purges all local call records, templates, and preference files stored in the app’s sandbox.
          </p>
        </div>

        {/* Contact / Data Controller */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <h3 className="font-extrabold text-sm text-slate-900">Grievance Officer & Publisher Information</h3>
          <p><strong>Entity:</strong> Solita Solutions</p>
          <p><strong>Address:</strong> Gaya, Bihar 824232, India</p>
          <p><strong>Email:</strong> <a href="mailto:help.solita@gmail.com" className="text-[#2563EB] font-bold underline">help.solita@gmail.com</a></p>
          <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/919341718066" className="text-emerald-700 font-bold underline">+91 9341718066</a></p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
          <Link href="/" className="text-[#2563EB] hover:underline">← Back to MissCall Assistant</Link>
          <span className="text-slate-400">© 2026 Solita Solutions</span>
        </div>
      </div>
    </div>
  );
}
