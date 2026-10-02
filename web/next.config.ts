import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Repo root is parent of web/ — agent reads framework files outside web/
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async redirects() {
    return [
      { source: '/news', destination: '/journal/news', permanent: false },
      {
        source: '/news/:year/:month/:day',
        destination: '/journal/news/:year/:month/:day',
        permanent: false,
      },
      { source: '/analysis-log', destination: '/journal/analysis', permanent: false },
      {
        source: '/analysis-log/:id',
        destination: '/journal/analysis/:id',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
