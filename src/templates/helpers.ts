// ビルド時（Node）に HTML 文字列を組み立てる小さな部品集
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SITE, isDemo } from '../config/site';
import { icon, type IconName } from '../icons/icons';

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const yen = (n: number): string => `${n.toLocaleString('ja-JP')}<span class="yen">円</span>`;

export { icon };
export type { IconName };

// ---------------------------------------------------------------------
// 写真：src/data/photos.json（CREDITS.md と対応）から <img> を作る
// ---------------------------------------------------------------------
export interface Photo {
  slot: string;
  file800: string;
  file1600: string;
  w800: number;
  h800: number;
  w1600: number;
  h1600: number;
  altJa: string;
  photographer: string;
  pageUrl: string;
  credit: string;
}

const photosPath = fileURLToPath(new URL('../data/photos.json', import.meta.url));

export function photos(): Photo[] {
  if (!existsSync(photosPath)) return [];
  return JSON.parse(readFileSync(photosPath, 'utf8')) as Photo[];
}

interface PhotoOpts {
  sizes?: string;
  eager?: boolean;
  cls?: string;
  alt?: string;
}

export function photo(slot: string, opts: PhotoOpts = {}): string {
  const p = photos().find((x) => x.slot === slot);
  const cls = `photo ${opts.cls ?? ''}`.trim();
  if (!p) {
    // 素材が未取得の場合の仮画像（完成扱いにしない）
    return `<div class="${cls} photo--missing" role="img" aria-label="仮画像（${esc(slot)}）"><span>仮画像：${esc(slot)}</span></div>`;
  }
  const src = (f: string) => (f.startsWith('/') ? f : `/images/${f}`);
  const alt = opts.alt ?? p.altJa;
  return `<img class="${cls}" src="${src(p.file800)}" srcset="${src(p.file800)} ${p.w800}w, ${src(p.file1600)} ${p.w1600}w" sizes="${opts.sizes ?? '100vw'}" width="${p.w1600}" height="${p.h1600}" alt="${esc(alt)}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

export function photoPreload(slot: string, sizes: string): string {
  const p = photos().find((x) => x.slot === slot);
  if (!p) return '';
  return `<link rel="preload" as="image" href="${p.file800}" imagesrcset="${p.file800} ${p.w800}w, ${p.file1600} ${p.w1600}w" imagesizes="${sizes}" fetchpriority="high">`;
}

// ---------------------------------------------------------------------
// 連絡先ボタン：デモでは押すと説明ダイアログ、本番では実際のリンク
// ---------------------------------------------------------------------
export type ContactKind = 'phone' | 'line' | 'instagram' | 'x' | 'tabelog';

const hrefOf: Record<ContactKind, string> = {
  phone: SITE.links.tel,
  line: SITE.links.line,
  instagram: SITE.links.instagram,
  x: SITE.links.x,
  tabelog: SITE.links.tabelog,
};

export function contact(kind: ContactKind, inner: string, cls: string, label?: string): string {
  const aria = label ? ` aria-label="${esc(label)}"` : '';
  if (isDemo) {
    return `<button type="button" class="${cls}" data-demo-contact="${kind}" aria-haspopup="dialog"${aria}>${inner}</button>`;
  }
  const ext = kind === 'phone' ? '' : ' target="_blank" rel="noopener"';
  return `<a class="${cls}" href="${hrefOf[kind]}"${ext}${aria}>${inner}</a>`;
}

// ---------------------------------------------------------------------
// 提灯（見出し横）。.is-lit が付くと灯る
// ---------------------------------------------------------------------
export function chochin(): string {
  return `<span class="chochin" aria-hidden="true"><svg viewBox="0 0 40 64" width="40" height="64">
  <path class="chochin__cord" d="M20 0v7"/>
  <rect class="chochin__cap" x="12" y="7" width="16" height="5" rx="1.5"/>
  <path class="chochin__body" d="M13 12C2 16 2 48 13 52h14c11-4 11-36 0-40Z"/>
  <path class="chochin__rib" d="M6.6 20h26.8M5 26h30M4.6 32h30.8M5 38h30M6.6 44h26.8"/>
  <rect class="chochin__cap" x="12" y="52" width="16" height="5" rx="1.5"/>
  <path class="chochin__cord" d="M20 57v6"/>
</svg></span>`;
}

export function secHead(id: string, en: string, ja: string, light = false): string {
  return `<header class="sec-head${light ? ' sec-head--light' : ''}">
  ${chochin()}
  <div>
    <p class="sec-head__en" lang="en">${en}</p>
    <h2 class="sec-head__title" id="${id}-title">${ja}</h2>
  </div>
</header>`;
}
