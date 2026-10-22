// src/icons/*.svg（MingCute ＋ 自作）を、テンプレートと実行時の両方から使える TS モジュールに変換する
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/icons');
const entries = readdirSync(dir)
  .filter((f) => f.endsWith('.svg'))
  .sort()
  .map((f) => {
    const svg = readFileSync(join(dir, f), 'utf8').trim();
    const attrs = svg.match(/^<svg([^>]*)>/)[1]
      .replace(/\s(xmlns|width|height)="[^"]*"/g, '')
      .trim();
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    return [f.replace(/\.svg$/, '').replace(/-line$/, ''), { attrs, inner }];
  });

const out = `// 自動生成：npm run icons（編集は src/icons/*.svg へ）
// MingCute Icon（Apache-2.0）と、同じ線幅で自作した custom-* アイコン
export const ICONS = ${JSON.stringify(Object.fromEntries(entries), null, 2)} as const;

export type IconName = keyof typeof ICONS;

export function icon(name: IconName, cls = ''): string {
  const { attrs, inner } = ICONS[name];
  return \`<svg class="icon \${cls}" \${attrs} aria-hidden="true" focusable="false">\${inner}</svg>\`;
}
`;
writeFileSync(join(dir, 'icons.ts'), out);
console.log(`icons: ${entries.length}`);
