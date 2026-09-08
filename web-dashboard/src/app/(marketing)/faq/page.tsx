import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ - Missed Call to WhatsApp',
  description: 'Frequently asked questions about MissCall Assistant.',
};

const faqs = [
  {
    q: "What is MissCall Assistant?",
    a: "It's an Android application that automatically detects missed calls on your business phone and sends a personalized follow-up message via native SMS or WhatsApp to ensure you never lose a potential customer."
  },
  {
    q: "How does missed-call detection work?",
    a: "The app uses official Android Telephony APIs to listen for phone state changes. If a ringing call transitions to disconnected without being answered, it registers as a missed call. It completely ignores rejected calls or outgoing calls."
  },
  {
    q: "Does it use my SIM card to send SMS?",
    a: "Yes. The app uses your Android device's native SMS capabilities to send texts. Standard messaging rates from your carrier will apply. You do not need to pay for Twilio or external SMS gateways."
  },
  {
    q: "Does it work with Dual SIM phones?",
    a: "Yes. The app allows you to explicitly select which SIM (SIM 1 or SIM 2) should be used for automated outbound messages."
  },
  {
    q: "How does the WhatsApp integration work?",
    a: "You have two choices. You can link your existing WhatsApp (Standard or Business) by scanning a QR code within the app (WhatsApp Web Adapter), or you can use the official WhatsApp Cloud API by entering your Meta API tokens in the app settings."
  },
  {
    q: "Is Firebase or a cloud subscription required?",
    a: "No. The app's core functionality (detecting calls, managing CRM, sending native SMS) happens 100% locally on your Android device. It uses an embedded Room SQLite database."
  },
  {
    q: "Does it require an internet connection?",
    a: "Missed call detection and native SMS sending work completely offline. However, WhatsApp messaging and Webhook integrations require an active internet connection. If the internet is down, the app will securely queue webhooks and sync them when you reconnect."
  },
  {
    q: "Which Android versions are supported?",
    a: "The APK requires Android 8.0 (Oreo) or higher."
  },
  {
    q: "What are webhooks?",
    a: "Webhooks allow developers to push data from the app to their own servers in real-time. Whenever a call is missed or a message is sent, the app can send a JSON payload to a URL of your choice."
  }
];

export default function FaqPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            Everything you need to know about the product and how it works.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-6">Still have questions?</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 transition-all">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
