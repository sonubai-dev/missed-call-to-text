import { Metadata } from 'next';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Missed Call to WhatsApp',
  description: 'Get in touch with the MissCall Assistant support team.',
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            Have a question about the app or need help setting up an integration? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">General Support</h3>
            <p className="text-sm text-slate-500 mb-4">Questions about installation, features, or setup.</p>
            <a href="mailto:support@misscallassistant.com" className="text-blue-600 font-medium hover:underline">
              support@misscallassistant.com
            </a>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">WhatsApp API Help</h3>
            <p className="text-sm text-slate-500 mb-4">Need help configuring your Meta Cloud API tokens?</p>
            <a href="mailto:api@misscallassistant.com" className="text-green-600 font-medium hover:underline">
              api@misscallassistant.com
            </a>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Partnerships</h3>
            <p className="text-sm text-slate-500 mb-4">Interested in white-labeling or business partnerships?</p>
            <a href="mailto:partners@misscallassistant.com" className="text-purple-600 font-medium hover:underline">
              partners@misscallassistant.com
            </a>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Report a Bug</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Found an issue with the Android application? Please provide detailed steps to reproduce the issue along with your Android device model and OS version.
          </p>
          <a href="mailto:bugs@misscallassistant.com?subject=Bug Report" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-slate-900 bg-white hover:bg-slate-100 transition-colors">
            Submit Bug Report
          </a>
        </div>
      </div>
    </div>
  );
}
