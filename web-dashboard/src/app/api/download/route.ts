import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'downloads', 'misscall-assistant.apk'),
    path.join(process.cwd(), 'web-dashboard', 'public', 'downloads', 'misscall-assistant.apk'),
    path.join(process.cwd(), '..', 'web-dashboard', 'public', 'downloads', 'misscall-assistant.apk'),
  ];

  let apkBuffer: Buffer | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      apkBuffer = fs.readFileSync(p);
      break;
    }
  }

  if (!apkBuffer) {
    return NextResponse.json(
      { error: 'APK asset not found. Please contact support.' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(apkBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="misscall-assistant.apk"',
      'Content-Length': apkBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600, immutable',
    },
  });
}
