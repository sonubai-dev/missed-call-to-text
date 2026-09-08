import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, MessageCircle, PhoneMissed, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Missed Call to WhatsApp - Automatic Business Follow-up',
  description: 'Never lose a customer because you missed a call. Automatically follow up with customers through SMS and WhatsApp.',
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 sm:pt-32 sm:pb-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Never Lose a Customer Because You <span className="text-green-600">Missed a Call.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-500">
              Automatically follow up with customers through SMS and WhatsApp when your business misses a call. Turn missed calls into warm leads instantly.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/download" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md transition-all">
                Download APK
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center px-8 py-3.5 border border-slate-200 text-base font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all">
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-500">The simplest way to automate your customer recovery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <PhoneMissed className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Missed Call Detected</h3>
              <p className="text-slate-500">The Android app instantly detects when a customer call is missed on your business phone.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Automatic Follow-up</h3>
              <p className="text-slate-500">A personalized SMS or WhatsApp message is automatically queued and sent to the caller.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. CRM Activity Updated</h3>
              <p className="text-slate-500">The customer is saved to your local CRM with a complete timeline of calls and messages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Built for Local Businesses</h2>
              <p className="text-lg text-slate-500 mb-8">
                If your business relies on incoming phone calls, every missed call is a missed opportunity. MissCall Assistant helps you recover those leads automatically.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Restaurants & Cafes</h4>
                    <p className="text-slate-500">Missed a table booking or food order call? Automatically follow up with a menu link.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Clinics & Doctors</h4>
                    <p className="text-slate-500">Missed a patient inquiry? Send an instant follow-up to schedule an appointment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Real Estate & Salons</h4>
                    <p className="text-slate-500">Never lose a property lead or booking because you were busy serving another client.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="bg-green-600 px-4 py-3 text-white font-medium flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Follow-up</span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-2">To: +1 (555) 123-4567</p>
                  <div className="bg-green-50 text-slate-800 rounded-lg rounded-tl-none p-4 shadow-sm border border-green-100 inline-block">
                    Hi! This is Dr. Smith's Clinic. We just missed your call. How can we help you today? Would you like to schedule an appointment?
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-right">Sent automatically at 10:42 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to stop losing customers?</h2>
          <p className="text-xl text-green-100 mb-10">
            Download the Android app today and set up your automated follow-up system in 5 minutes.
          </p>
          <Link href="/download" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-green-700 bg-white hover:bg-green-50 shadow-lg transition-all">
            Download MissCall APK
          </Link>
        </div>
      </section>
    </div>
  );
}
