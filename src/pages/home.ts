import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/home.css';
import { initCommon } from '../lib/common';
import { formatJa, todayJST } from '../lib/jst';
import { startEmbers } from '../effects/embers';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

// 各処理は独立させ、1つが失敗しても他（と本文の表示）に影響しないようにする
function safely(name: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    console.warn(`[${name}] 初期化に失敗したため、静的な表示のままにします`, err);
  }
}

safely('common', initCommon);

// ---------------------------------------------------------------------
// 暖簾：再生は head 内スクリプトが判定。ここではスキップと再生し直しだけ
// ---------------------------------------------------------------------
safely('noren', () => {
  const end = () => root.classList.remove('noren-play');
  document.querySelector('.noren-skip')?.addEventListener('click', end);
  document.querySelector('[data-replay-noren]')?.addEventListener('click', () => {
    if (reduceMotion.matches) return;
    window.scrollTo({ top: 0 });
    root.classList.remove('noren-play');
    void root.offsetWidth; // アニメーションを最初からやり直す
    root.classList.add('noren-play');
    setTimeout(end, 1600);
  });
});

// ---------------------------------------------------------------------
// お品書きのタブ（矢印キー・Home/End 対応）
// ---------------------------------------------------------------------
safely('tabs', () => {
  const list = document.querySelector<HTMLElement>('[role=tablist]');
  if (!list) return;
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  const select = (tab: HTMLButtonElement, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')!)!.hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  list.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLButtonElement>('[role=tab]');
    if (t) select(t);
  });
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length]);
  });
  // 「お酒」セクションからカテゴリを指定して移動
  document.querySelectorAll<HTMLAnchorElement>('[data-menu-tab]').forEach((a) =>
    a.addEventListener('click', () => {
      const t = document.getElementById(`tab-${a.dataset.menuTab}`) as HTMLButtonElement | null;
      if (t) select(t, false);
    }),
  );
});

// ---------------------------------------------------------------------
// 黒板の日付（日本時間）
// ---------------------------------------------------------------------
safely('board-date', () => {
  const el = document.querySelector('[data-today]');
  if (el) el.textContent = formatJa(todayJST());
});

// ---------------------------------------------------------------------
// 提灯の点灯・黒板の装飾線：画面に入ったらクラスを付ける（CSS で動かす）
// ---------------------------------------------------------------------
safely('reveal', () => {
  const targets = document.querySelectorAll('.sec-head, [data-board]');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    targets.forEach((t) => t.classList.add('is-in'));
    return;
  }
  root.classList.add('reveal-ready');
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      }),
    { rootMargin: '0px 0px -15% 0px' },
  );
  targets.forEach((t) => io.observe(t));
  // 念のため：一定時間後には必ず完成状態にする
  setTimeout(() => targets.forEach((t) => t.getBoundingClientRect().top < innerHeight && t.classList.add('is-in')), 4000);
});

// ---------------------------------------------------------------------
// 火の粉（ヒーローのみ・少数・画面外では停止）
// ---------------------------------------------------------------------
safely('embers', () => {
  const canvas = document.querySelector<HTMLCanvasElement>('.embers');
  if (canvas && !reduceMotion.matches) startEmbers(canvas);
});

// ---------------------------------------------------------------------
// GSAP：巻物が広がる演出とパララックス（読み込みを後回しにして初期表示を軽く）
// ---------------------------------------------------------------------
async function initScrollEffects(): Promise<void> {
  if (reduceMotion.matches) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // 巻物：紙の余白と軸だけが動く。本文は最初から紙の上にあり、いつでも読める
  const maki = document.querySelector<HTMLElement>('[data-makimono]');
  if (maki && maki.getBoundingClientRect().top > window.innerHeight) {
    gsap.fromTo(
      maki,
      { '--open': 0 },
      { '--open': 1, ease: 'power2.out', scrollTrigger: { trigger: maki, start: 'top 95%', end: 'top 35%', scrub: 0.5 } },
    );
  }

  // パララックス：PC のみ。窓の中で写真が少しずつ動く
  mm.add('(min-width: 900px)', () => {
    document.querySelectorAll<HTMLElement>('.win').forEach((win) => {
      const img = win.querySelector('.win__img');
      if (!img) return;
      gsap.fromTo(
        img,
        { yPercent: -5, scale: 1.12 },
        { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: win, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  });
}

const idle = (cb: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 600);
window.addEventListener('load', () => idle(() => initScrollEffects().catch((e) => console.warn('[gsap]', e))), { once: true });
