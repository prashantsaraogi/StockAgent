import { getDocBySlug, listAllDocs } from './documentation-index';

export type ResolvedMarkdownLink =
  | { kind: 'doc'; slug: string }
  | { kind: 'app'; href: string }
  | { kind: 'external'; href: string }
  | { kind: 'same-page'; href: string };

function normalizePathPart(href: string): string {
  const noQuery = href.split('#')[0].split('?')[0];
  return decodeURIComponent(noQuery).replace(/\\/g, '/').trim();
}

function stripRelativePrefix(p: string): string {
  return p.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
}

/** Map markdown hrefs to in-app documentation routes or internal paths. */
export function resolveMarkdownHref(href: string | undefined): ResolvedMarkdownLink | null {
  if (!href) return null;

  if (href.startsWith('#')) {
    return { kind: 'same-page', href };
  }

  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return { kind: 'external', href };
  }

  const pathPart = normalizePathPart(href);

  if (pathPart.startsWith('/readme/documentation/')) {
    const slug = pathPart.replace(/^\/readme\/documentation\//, '').replace(/\/$/, '');
    if (getDocBySlug(slug)) return { kind: 'doc', slug };
    return { kind: 'app', href: pathPart };
  }

  if (pathPart.startsWith('/') && !pathPart.toLowerCase().endsWith('.md')) {
    return { kind: 'app', href: pathPart };
  }

  const candidates = new Set<string>([
    pathPart,
    stripRelativePrefix(pathPart),
    stripRelativePrefix(pathPart).replace(/^web\//, 'web/'),
  ]);

  for (const doc of listAllDocs()) {
    const repoPath = doc.path.replace(/\\/g, '/');
    for (const c of candidates) {
      if (c === repoPath || c.endsWith(`/${repoPath}`)) {
        return { kind: 'doc', slug: doc.slug };
      }
    }
    const fileName = repoPath.split('/').pop();
    if (fileName) {
      for (const c of candidates) {
        if (c === fileName || c.endsWith(`/${fileName}`)) {
          return { kind: 'doc', slug: doc.slug };
        }
      }
    }
  }

  return null;
}
