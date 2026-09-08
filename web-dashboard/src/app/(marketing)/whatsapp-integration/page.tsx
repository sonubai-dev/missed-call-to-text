import { Metadata } from 'next';
import { MessageSquare, QrCode, CloudLightning, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WhatsApp Integration - Missed Call to WhatsApp',
  description: 'Connect WhatsApp to your business workflow using WhatsApp Web QR codes or the official WhatsApp Cloud API.',
};

export default function WhatsAppPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            WhatsApp Integration Options
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            MissCall Assistant offers two distinct ways to automate WhatsApp messages depending on your business size and needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
          {/* WhatsApp Web Section */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-100 text-slate-600 px-4 py-1 rounded-bl-xl text-sm font-semibold">
              Free / Small Business
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <QrCode className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">WhatsApp Web Adapter</h2>
            <p className="text-slate-600 mb-8">
              Connect your existing WhatsApp account by simply scanning a QR code inside the app. This creates an isolated background session to dispatch messages automatically.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Uses your existing standard or Business WhatsApp number.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">No official API registration required. Free to send.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Handles reconnections and queues messages if disconnected.</span>
              </li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Disclaimer:</strong> This is an unofficial adapter implementation leveraging web protocols. It is not officially endorsed by WhatsApp. Best suited for low-volume messaging.
              </p>
            </div>
          </div>

          {/* WhatsApp Cloud API Section */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-green-500 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
              Recommended / Scalable
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <CloudLightning className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Official Cloud API</h2>
            <p className="text-slate-600 mb-8">
              Integrate directly with Meta's official WhatsApp Cloud API. Provide your access token in the app settings for instant, reliable, high-volume delivery.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">100% official and supported by Meta.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Highly reliable and scalable for thousands of messages.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Supports delivery and read receipt Webhook tracking.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/download" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-all">
            Download the App
          </Link>
        </div>
      </div>
    </div>
  );
}
