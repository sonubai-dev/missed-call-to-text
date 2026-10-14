/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/api/download',
        destination: '/downloads/misscall-assistant.apk',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/downloads/:path*.apk',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.android.package-archive',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment; filename="Missed-Call-Assistant.apk"',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
