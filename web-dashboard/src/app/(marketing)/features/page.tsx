import { Metadata } from 'next';
import { PhoneMissed, MessageSquare, Database, Webhook, ShieldCheck, WifiOff, Smartphone, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features - Missed Call to WhatsApp',
  description: 'Explore the powerful features of MissCall Assistant: Auto-SMS, WhatsApp integration, offline CRM, and Webhooks.',
};

const features = [
  {
    name: 'Reliable Missed Call Detection',
    description: 'Uses native Android Telephony APIs to instantly detect when a call goes unanswered, avoiding duplicate triggers.',
    icon: PhoneMissed,
  },
  {
    name: 'Automatic Native SMS',
    description: 'Send follow-ups using your existing cellular plan. Fully supports Multi-SIM devices so you can choose which line to send from.',
    icon: Smartphone,
  },
  {
    name: 'WhatsApp Web & Cloud API',
    description: 'Choose between connecting your WhatsApp Web via QR code for free sending, or use the official WhatsApp Cloud API for high-volume business messaging.',
    icon: MessageSquare,
  },
  {
    name: 'Built-in Customer CRM',
    description: 'Every caller is automatically added to a local database. Track their status (New, Contacted, Converted) and view a unified timeline of all interactions.',
    icon: Users,
  },
  {
    name: 'Idempotent Webhooks',
    description: 'Sync data to your own servers. Every webhook is cryptographically signed with HMAC-SHA256 and features an X-Event-ID to prevent duplicate processing.',
    icon: Webhook,
  },
  {
    name: 'Offline-First Architecture',
    description: 'No internet? No problem. The app queues all CRM events and webhook dispatches locally using Room database and syncs them automatically when connection is restored.',
    icon: WifiOff,
  },
  {
    name: 'Duplicate Protection',
    description: 'Prevents spamming customers who call multiple times in a short window. You define the cooldown period (e.g. 24 hours).',
    icon: ShieldCheck,
  },
  {
    name: '100% On-Device Data',
    description: 'Your customer data stays on your phone. No Firebase, no third-party cloud analytics. You own your data entirely.',
    icon: Database,
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything you need to recover lost leads
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            A production-ready toolkit built directly into an Android application. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature) => (
            <div key={feature.name} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Start automating today.</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Install the APK on your business Android phone and never let another customer slip through the cracks.
          </p>
          <Link href="/download" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-slate-900 bg-white hover:bg-slate-100 transition-all">
            Download App
          </Link>
        </div>
      </div>
    </div>
  );
}
