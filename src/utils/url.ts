// Only allow safe URL schemes in hrefs that render CMS-controlled values.
// Blocks javascript:/data:/vbscript: style schemes (stored-XSS vectors via
// admin-entered project/social links) while keeping http(s), mailto and
// relative paths working.
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^(https?:\/\/|mailto:|\/(?!\/))/i.test(trimmed)) return trimmed;
  return undefined;
}
