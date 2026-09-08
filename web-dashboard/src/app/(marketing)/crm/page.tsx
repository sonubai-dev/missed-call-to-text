import { Metadata } from 'next';
import { Users, Phone, Clock, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Simple Customer CRM - Missed Call to WhatsApp',
  description: 'A lightweight CRM built directly into the Android app. Track missed calls, follow-ups, and lead status effortlessly.',
};

export default function CrmPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            A CRM That Works For You.
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            No bloated dashboards. No complex pipelines. Just a simple, effective timeline of every customer who calls your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Customer Profile
              </h3>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wide">
                Contacted
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-bold text-slate-900">+91 98765 43210</p>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" /> Added 2 hours ago
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Activity Timeline</h4>
              
              <div className="relative pl-6 pb-4 border-l-2 border-slate-200">
                <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-1"></div>
                <p className="font-medium text-slate-900">Missed Call</p>
                <p className="text-sm text-slate-500">10:41 AM</p>
              </div>
              
              <div className="relative pl-6 pb-4 border-l-2 border-slate-200">
                <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1"></div>
                <p className="font-medium text-slate-900">WhatsApp Sent</p>
                <p className="text-sm text-slate-500 text-slate-600 italic">"Hi, we missed your call..."</p>
                <p className="text-xs text-slate-500 mt-1">10:42 AM</p>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                <p className="font-medium text-slate-900">Manual Status Update</p>
                <p className="text-sm text-slate-500">Changed to CONTACTED by Owner</p>
                <p className="text-xs text-slate-500 mt-1">11:15 AM</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Designed for Local Businesses</h2>
            <p className="text-lg text-slate-600 mb-6">
              We aren't trying to replace Salesforce. MissCall Assistant provides exactly what a local business needs: knowing who called, what was sent, and whether they were handled.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Unified Activity Timeline</h4>
                  <p className="text-slate-600 text-sm">See every missed call, automated SMS, manual WhatsApp, and status change in chronological order.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">One-Tap Follow Up</h4>
                  <p className="text-slate-600 text-sm">Initiate a manual phone call, SMS, or WhatsApp message directly from the customer's profile.</p>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <Link href="/webhooks" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Need more power? Connect to your existing CRM using Webhooks <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
