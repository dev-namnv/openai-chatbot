export function getSubCacheKey(id: string, language: string): string {
  return `aio-sub.${id}.${language}`;
}

export function getVttCacheKey(id: string, lang: string, url: string): string {
  return `vtt.${id}.${lang}.${url}`;
}

export function getCinemetaCacheKey(id: string): string {
  return `cinema-meta.${id}`;
}
