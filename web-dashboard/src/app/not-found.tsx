import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Page not found</h1>
          <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
              Go Home
            </Link>
            <Link href="/download" className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
              Download App
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
