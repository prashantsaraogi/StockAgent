import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const webDir = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo root (parent of web/) — required for Vercel/serverless fs.readFile outside web/ */
const repoRoot = path.join(webDir, '..');

/** Files outside web/ read at runtime (fs.readFile / readdir) — must ship with each serverless route. */
const repoRuntimeTrace = [
  './StockBook/**/*',
  './News/**/*',
  './investor-wisdom/**/*',
  './GLOSSARY.md',
  './.cursor/skills/**/*',
  './.cursor/rules/**/*',
  './.cursor/portfolio/**/*',
  './data/users/**/*',
];

const nextConfig: NextConfig = {
  // Repo root is parent of web/ — agent reads framework files outside web/
  outputFileTracingRoot: repoRoot,
  // App routes use '/*'; API routes need explicit globs — '/api/**/*' alone omitted StockBook before.
  outputFileTracingIncludes: {
    '/*': repoRuntimeTrace,
    '/chat': repoRuntimeTrace,
    '/home': repoRuntimeTrace,
    '/portfolio': repoRuntimeTrace,
    '/api/chat': repoRuntimeTrace,
    '/api/**/*': repoRuntimeTrace,
  },
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
