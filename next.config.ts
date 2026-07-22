import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Rendering the payslip PDF server-side (invoice emails) needs the package's
  // Node build, which is what exposes `renderToBuffer`. Leaving it external
  // keeps the bundler from resolving it through its `browser` export condition.
  serverExternalPackages: ['@react-pdf/renderer'],
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },
};

export default nextConfig;
