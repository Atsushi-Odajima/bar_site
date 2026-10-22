// 3画面で共通のヘッダー・フッター・固定アクションバー・ダイアログ
import { SITE, isDemo } from '../config/site';
import { contact, esc, icon, photos } from './helpers';

export type Page = 'home' | 'reserve' | 'admin';

interface HeadOpts {
  page: Page;
  title: string;
  description: string;
  extra?: string;
}

const KLEE_TEXT_PLACEHOLDER = '%%KLEE_TEXT%%';

/** Web フォントの CSS を描画を止めずに読み込む（届くまでは端末の標準フォントで表示）*/
const fontLink = (href: string): string =>
  `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;

export function head({ page, title, description, extra = '' }: HeadOpts): string {
  const url = `${SITE.siteUrl}${page === 'home' ? '/' : `/${page}/`}`;
  const fonts = [
    'family=Shippori+Mincho:wght@600',
    'family=Zen+Kaku+Gothic+New:wght@400;700',
    'family=Cormorant+Garamond:ital,wght@1,500',
  ].join('&');
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${isDemo ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#1b1916">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(isDemo ? `${SITE.name}（架空店舗の制作見本）` : SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.siteUrl}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLink(`https://fonts.googleapis.com/css2?${fonts}&display=swap`)}
${page === 'home' ? fontLink(`https://fonts.googleapis.com/css2?family=Klee+One:wght@600&display=swap&text=${KLEE_TEXT_PLACEHOLDER}`) : ''}
${extra}`;
}

/** 黒板で使う文字だけを Klee One から取得する（フォントを軽くするため） */
export function fillKleeText(html: string, text: string): string {
  const chars = [...new Set([...text])].join('');
  return html.replace(KLEE_TEXT_PLACEHOLDER, encodeURIComponent(chars));
}

const brand = (): string => `<a class="brand" href="/" aria-label="${esc(SITE.name)} トップへ">
  <span class="brand__mark">${icon('custom-lantern')}</span>
  <span class="brand__text"><span class="brand__sub">炉端と酒</span><span class="brand__name">${SITE.nameShort}</span></span>
</a>`;

const NAV = [
  ['#about', 'お店について'],
  ['#menu', 'お品書き'],
  ['#drinks', 'お酒'],
  ['#seats', '店内・お席'],
  ['#courses', '宴会・コース'],
  ['#faq', 'よくある質問'],
  ['#access', 'アクセス'],
] as const;

/** 架空店舗であることの表示（ヘッダー付近）と、見本を見る人向けの案内 */
export function demoBar(page: Page): string {
  if (!isDemo) return '';
  const cur = (p: Page) => (p === page ? ' aria-current="page"' : '');
  return `<div class="demobar" role="note" aria-label="制作見本のお知らせ">
  <p class="demobar__text"><strong>架空店舗の制作見本</strong>です。店舗・予約は架空です。</p>
  <nav class="demobar__nav" aria-label="制作見本の案内">
    <a href="/"${cur('home')}>サイトを見る</a>
    <a href="/reserve/"${cur('reserve')}>予約を体験する</a>
    <a href="/admin/"${cur('admin')}>お店側の管理画面を見る</a>
  </nav>
</div>`;
}

export function header(page: Page): string {
  const prefix = page === 'home' ? '' : '/';
  const links = NAV.map(([h, l]) => `<li><a href="${prefix}${h}">${l}</a></li>`).join('');
  return `${demoBar(page)}
<header class="site-header" data-page="${page}">
  <div class="site-header__inner">
    ${brand()}
    <nav class="gnav" aria-label="ページ内の案内"><ul>${links}</ul></nav>
    <a class="btn btn--hi btn--sm site-header__cta" href="/reserve/">${icon('calendar')}<span>予約する</span></a>
    <button type="button" class="navtoggle" aria-haspopup="dialog" aria-controls="navdialog">${icon('menu')}<span>目次</span></button>
  </div>
</header>
<dialog class="navdialog" id="navdialog" aria-label="目次">
  <div class="navdialog__inner">
    <button type="button" class="navdialog__close" data-close>${icon('close')}<span>閉じる</span></button>
    <ul class="navdialog__list">${links}</ul>
    <a class="btn btn--hi" href="/reserve/">${icon('calendar')}<span>予約する</span></a>
  </div>
</dialog>`;
}

export function footer(): string {
  const credits = photos().length
    ? `写真：Unsplash（${[...new Set(photos().map((p) => p.photographer))].length}名の撮影者）／アイコン：MingCute（Apache-2.0）`
    : '写真：未取得（仮画像）';
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__shop">
      <p class="site-footer__name">${SITE.name}<span>（${SITE.nameRuby}）</span></p>
      <p>〒${SITE.postalCode} ${SITE.address}</p>
      <p>電話 ${contact('phone', SITE.phone, 'linklike')}</p>
      <p>${SITE.hours.open}〜${SITE.hours.close}（L.O. ${SITE.hours.lastOrder}）／ 定休日 ${SITE.closedLabel}</p>
    </div>
    <ul class="site-footer__sns" aria-label="外部サイト">
      <li>${contact('tabelog', '食べログ', 'textlink')}</li>
      <li>${contact('line', 'LINE', 'textlink')}</li>
      <li>${contact('instagram', 'Instagram', 'textlink')}</li>
      <li>${contact('x', 'X', 'textlink')}</li>
    </ul>
    ${isDemo ? `<p class="site-footer__demo" role="note">※このサイトは<strong>架空店舗の制作見本</strong>です。店舗・予約は架空です。掲載の店名・住所・電話番号・メニューはすべて見本用のダミーです。</p>` : ''}
    <p class="site-footer__credit">${credits}</p>
    <p class="site-footer__copy" lang="en">&copy; ${SITE.nameEn}</p>
  </div>
</footer>`;
}

/** スマホのみ：画面下に固定の「電話・予約・LINE・地図」 */
export function actionBar(page: Page): string {
  const mapHref = page === 'home' ? '#access' : '/#access';
  const mapBtn = isDemo
    ? `<a class="actionbar__btn" href="${mapHref}">${icon('map-pin')}<span>地図</span></a>`
    : `<a class="actionbar__btn" href="${SITE.links.mapLink}" target="_blank" rel="noopener">${icon('map-pin')}<span>地図</span></a>`;
  return `<nav class="actionbar" aria-label="すぐに使う操作">
  ${contact('phone', `${icon('phone')}<span>電話</span>`, 'actionbar__btn')}
  <a class="actionbar__btn actionbar__btn--hi" href="/reserve/">${icon('calendar')}<span>予約</span></a>
  ${contact('line', `${icon('chat-3')}<span>LINE</span>`, 'actionbar__btn')}
  ${mapBtn}
</nav>`;
}

/** デモ用：電話・LINE・SNS を押したときの説明ダイアログ */
export function demoDialog(): string {
  if (!isDemo) return '';
  return `<dialog class="demodialog" id="demodialog" aria-labelledby="demodialog-title" aria-describedby="demodialog-body">
  <div class="demodialog__inner">
    <p class="demodialog__tag">制作見本のデモ</p>
    <h2 class="demodialog__title" id="demodialog-title"></h2>
    <p class="demodialog__body" id="demodialog-body"></p>
    <div class="demodialog__actions">
      <a class="btn btn--hi" href="/reserve/" data-demo-reserve hidden>${icon('calendar')}<span>Web予約を体験する</span></a>
      <button type="button" class="btn btn--ghost" data-close>閉じる</button>
    </div>
  </div>
</dialog>`;
}

/** 起動時の head 内スクリプト：js クラス付与と暖簾の再生判定（失敗しても本文を隠さない） */
export function bootScript(withNoren: boolean): string {
  const noren = withNoren
    ? `try{var k='${SITE.storagePrefix}noren-seen';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!localStorage.getItem(k)){localStorage.setItem(k,'1');d.classList.add('noren-play');setTimeout(function(){d.classList.remove('noren-play')},1600)}}catch(e){}`
    : '';
  return `<script>(function(){var d=document.documentElement;d.classList.add('js');${noren}})();</script>`;
}

/** 暖簾（装飾。aria-hidden。押しても下のページを操作できる）*/
export function noren(): string {
  const strip = (i: number) =>
    `<div class="noren__strip" style="--i:${i}"><div class="noren__print">
      <span class="noren__mon">${SITE.nameShort}</span>
      <span class="noren__sub">${SITE.name.replace(SITE.nameShort, '').trim()}</span>
    </div></div>`;
  return `<div class="noren" aria-hidden="true">
  <div class="noren__rod"></div>
  <div class="noren__cloth">${[0, 1, 2, 3].map(strip).join('')}</div>
</div>
<button type="button" class="noren-skip">スキップ</button>`;
}
