import { DownloadButtonWithRazorpay } from '@/components/marketing/DownloadButtonWithRazorpay';
import { Metadata } from 'next';
import { Download, ShieldCheck, Smartphone, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download Missed Call to WhatsApp - APK for Android',
  description: 'Download the official MissCall Assistant APK for Android. Automate your customer follow-ups today.',
};

export default function DownloadPage() {
  const version = "1.0.0";
  const size = "20.5 MB";
  const sha256 = "BD1D39002FF9814006756BFC5755F3BFC354D022A61B11C4C685823FB2CF2BA6";
  const date = "September 2026";
  const minSdk = "Android 8.0 (Oreo) and above";

  return (
    <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Download MissCall Assistant
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Get the latest version of the Android app to automate your business follow-ups.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-8 sm:p-10 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">MissCall Assistant</h2>
                <p className="text-slate-500">Version {version} • {size}</p>
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified & Secure</span>
                </div>
              </div>
            </div>
            
            <DownloadButtonWithRazorpay />
          </div>

          <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Installation Guide</h3>
              <ol className="space-y-4 text-slate-600 list-decimal pl-4">
                <li><span className="font-medium text-slate-900">Download the APK</span> file to your Android device using the button above.</li>
                <li><span className="font-medium text-slate-900">Open the downloaded file</span> from your notifications or file manager.</li>
                <li>If prompted, tap <span className="font-medium text-slate-900">Settings</span> and toggle on <strong>"Allow from this source"</strong>.</li>
                <li>Tap <span className="font-medium text-slate-900">Install</span> and wait for the process to complete.</li>
                <li>Open the app, grant the required permissions (Call Logs, SMS, Contacts), and complete the quick setup.</li>
              </ol>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Technical Details
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <dt className="text-slate-500 font-medium">Version</dt>
                  <dd className="text-slate-900 col-span-2">{version}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="text-slate-500 font-medium">Release Date</dt>
                  <dd className="text-slate-900 col-span-2">{date}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <dt className="text-slate-500 font-medium">Requirements</dt>
                  <dd className="text-slate-900 col-span-2">{minSdk}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 mt-3">
                  <dt className="text-slate-500 font-medium">SHA-256</dt>
                  <dd className="text-slate-900 col-span-2 break-all text-xs font-mono bg-white p-2 rounded border border-slate-200">
                    {sha256}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
