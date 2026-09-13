'use client';

import { Download } from 'lucide-react';

export function DownloadButton() {
  return (
    <div className="flex flex-col items-center sm:items-end gap-2 w-full">
      <a
        href="/downloads/misscall-assistant.apk"
        download
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
      >
        <Download className="mr-2 h-5 w-5" />
        Download APK
      </a>

      <span className="text-xs text-slate-500 mt-2 max-w-sm text-center sm:text-right">
        Free to download. Subscription is managed inside the app.
      </span>
    </div>
  );
}
