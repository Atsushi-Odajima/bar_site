// 3画面共通：ダイアログ（デモ案内・目次）、入力中の固定バー退避
import { SITE } from '../config/site';

/** ダイアログを開き、閉じたら開く前の要素にフォーカスを戻す */
export function openDialog(dlg: HTMLDialogElement, opener?: Element | null): void {
  const back = (opener ?? document.activeElement) as HTMLElement | null;
  dlg.addEventListener('close', () => back?.focus?.({ preventScroll: true }), { once: true });
  dlg.showModal();
}

function wireDialog(dlg: HTMLDialogElement): void {
  dlg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    // 背景（ダイアログ外側）クリック、または「閉じる」で閉じる
    if (t === dlg || t.closest('[data-close]')) dlg.close();
  });
}

const DEMO_TEXT: Record<string, { title: string; body: string; reserve?: boolean }> = {
  phone: {
    title: '電話をかける',
    body: `実店舗では、ここを押すとそのままお店（${SITE.phone}）に電話がかかります。この見本は架空店舗のため発信しません。`,
    reserve: true,
  },
  line: {
    title: 'LINE で友だち追加',
    body: '実店舗では、ここからお店の LINE 公式アカウントの友だち追加画面が開きます。LINE でのご予約・お問い合わせの受付や、お知らせの配信に使えます。',
    reserve: true,
  },
  instagram: {
    title: 'Instagram を開く',
    body: '実店舗では、ここからお店の Instagram アカウントが開きます。今日の料理や入荷したお酒の写真を発信できます。',
  },
  x: {
    title: 'X を開く',
    body: '実店舗では、ここからお店の X アカウントが開きます。空席や臨時休業のお知らせに使えます。',
  },
  tabelog: {
    title: '食べログを開く',
    body: '実店舗では、ここから食べログの店舗ページが開きます。',
  },
};

export function initCommon(): void {
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach(wireDialog);

  // デモ案内（電話・LINE・SNS）
  const demo = document.getElementById('demodialog') as HTMLDialogElement | null;
  if (demo) {
    document.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-demo-contact]');
      if (!btn) return;
      const t = DEMO_TEXT[btn.dataset.demoContact ?? ''];
      if (!t) return;
      demo.querySelector('#demodialog-title')!.textContent = t.title;
      demo.querySelector('#demodialog-body')!.textContent = t.body;
      const rsv = demo.querySelector<HTMLAnchorElement>('[data-demo-reserve]')!;
      rsv.hidden = !t.reserve || location.pathname.startsWith('/reserve');
      // 目次ダイアログの中から開いた場合は先に閉じる
      document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((d) => d !== demo && d.close());
      openDialog(demo, btn);
    });
  }

  // 目次（スマホ）
  const nav = document.getElementById('navdialog') as HTMLDialogElement | null;
  const toggle = document.querySelector<HTMLButtonElement>('.navtoggle');
  if (nav && toggle) {
    toggle.addEventListener('click', () => openDialog(nav, toggle));
    nav.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const target = a.hash && a.pathname === location.pathname ? document.querySelector<HTMLElement>(a.hash) : null;
      if (!target) return nav.close();
      // ダイアログを閉じてから移動し、移動先の見出しへフォーカスする
      e.preventDefault();
      nav.addEventListener(
        'close',
        () =>
          requestAnimationFrame(() => {
            history.pushState(null, '', a.hash);
            target.scrollIntoView({ block: 'start' });
            const h = target.querySelector<HTMLElement>('h2');
            if (h) {
              h.tabIndex = -1;
              h.focus({ preventScroll: true });
            }
          }),
        { once: true },
      );
      nav.close();
    });
  }

  // 入力中（ソフトキーボード表示中）は固定バーを隠し、入力欄やエラーを覆わない
  const root = document.documentElement;
  document.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).matches('input:not([type=radio]):not([type=checkbox]), textarea, select'))
      root.classList.add('is-typing');
  });
  document.addEventListener('focusout', () => root.classList.remove('is-typing'));
}
