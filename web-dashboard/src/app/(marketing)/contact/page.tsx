import { Metadata } from 'next';
import { Mail, MessageSquare, Phone, MapPin, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Solita Solutions',
  description: 'Get in touch with Solita Solutions - MissCall Assistant support & developer team.',
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Solita Solutions
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-3">
            Contact & Support
          </h1>
          <p className="mt-3 text-sm text-slate-600 flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Gaya, Bihar - 824232, India</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Customer & WhatsApp Support</h3>
              <p className="text-sm text-slate-500 mb-4">Official customer assistance, onboarding & licensing.</p>
              
              <div className="space-y-2 text-sm text-slate-700">
                <p>Email: <a href="mailto:help.solita@gmail.com" className="text-blue-600 font-semibold hover:underline">help.solita@gmail.com</a></p>
                <p>WhatsApp: <a href="https://wa.me/919341718066" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline">+91 9341718066</a></p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <a
                href="https://wa.me/919341718066"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-left flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Developer Direct Contact</h3>
              <p className="text-sm text-slate-500 mb-4">Direct technical contact, integration support & calls.</p>
              
              <div className="space-y-2 text-sm text-slate-700">
                <p>Email: <a href="mailto:contact.dev.sonu@gmail.com" className="text-blue-600 font-semibold hover:underline">contact.dev.sonu@gmail.com</a></p>
                <p>Call / WhatsApp: <a href="tel:+917439551862" className="text-slate-900 font-semibold hover:underline">+91 7439551862</a></p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <a
                href="tel:+917439551862"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call +91 7439551862
              </a>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Solita Solutions</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto text-sm">
            Gaya, Bihar 824232, India. For technical assistance or bug reports, feel free to reach out directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:help.solita@gmail.com" className="inline-flex items-center justify-center px-6 py-3 rounded-full text-slate-900 bg-white font-semibold text-xs hover:bg-slate-100 transition-colors">
              help.solita@gmail.com
            </a>
            <a href="mailto:contact.dev.sonu@gmail.com" className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white bg-slate-800 font-semibold text-xs hover:bg-slate-700 transition-colors border border-slate-700">
              contact.dev.sonu@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
