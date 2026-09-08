import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">MissCall</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">How It Works</Link>
            <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">Features</Link>
            <Link href="/whatsapp-integration" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">WhatsApp</Link>
            <Link href="/crm" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">CRM</Link>
            <Link href="/faq" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/download" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
              Download App
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
