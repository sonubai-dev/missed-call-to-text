import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">MissCall</span>
            </Link>
            <p className="text-sm text-slate-500 mb-4">
              Never lose a customer because you missed a call. Automatically follow up with SMS and WhatsApp.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-sm text-slate-600 hover:text-green-600 transition-colors">Features</Link></li>
              <li><Link href="/whatsapp-integration" className="text-sm text-slate-600 hover:text-green-600 transition-colors">WhatsApp Integration</Link></li>
              <li><Link href="/sms" className="text-sm text-slate-600 hover:text-green-600 transition-colors">SMS Follow-up</Link></li>
              <li><Link href="/crm" className="text-sm text-slate-600 hover:text-green-600 transition-colors">Simple CRM</Link></li>
              <li><Link href="/webhooks" className="text-sm text-slate-600 hover:text-green-600 transition-colors">Webhooks</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-sm text-slate-600 hover:text-green-600 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-600 hover:text-green-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-slate-600 hover:text-green-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-600 hover:text-green-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} MissCall Assistant. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/download" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
              Download App for Android
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
