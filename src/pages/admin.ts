import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/app.css';
import { SITE } from '../config/site';
import { initCommon, openDialog } from '../lib/common';
import { addDays, formatJa, todayJST } from '../lib/jst';
import { STATUS_LABELS, store, type Reservation, type ReservationStatus } from '../lib/reservation-store';

initCommon();

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// デモ体験用の入口（本番の認証ではありません。README 参照）
const AUTH_KEY = `${SITE.storagePrefix}admin-entered`;
const isEntered = () => {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  } catch {
    return false;
  }
};
const setEntered = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(AUTH_KEY, '1');
    else sessionStorage.removeItem(AUTH_KEY);
  } catch {
    /* 保存できなくても、このページを開いている間は使える */
  }
};

const login = $<HTMLFormElement>('[data-login]');
const app = $('[data-app]');
const statusEl = $('[data-status]');

const params = new URLSearchParams(location.search);
let date = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') ?? '') ? params.get('date')! : todayJST();
let highlight = decodeURIComponent(location.hash.slice(1));
let rows: Reservation[] = [];

const SEAT = (r: Reservation) => SITE.seats[r.seat].label;

function say(msg: string): void {
  statusEl.textContent = '';
  requestAnimationFrame(() => (statusEl.textContent = msg));
}

async function load(): Promise<void> {
  try {
    rows = await store.list();
  } catch (err) {
    rows = [];
    say(err instanceof Error ? err.message : '読み込めませんでした。');
  }
  render();
}

function render(): void {
  const dayRows = rows.filter((r) => r.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const active = dayRows.filter((r) => r.status !== 'cancelled');
  $<HTMLInputElement>('[data-date-input]').value = date;
  $('[data-summary]').innerHTML = `<strong>${formatJa(date, true)}</strong>　予約 ${active.length}件・${active.reduce((s, r) => s + r.people, 0)}名様<small>（キャンセルを除く）</small>`;
  $('[data-list-title]').textContent = `${formatJa(date)}の予約一覧`;

  // 予約のある日（昨日以降）
  const counts = new Map<string, number>();
  rows.filter((r) => r.date >= addDays(todayJST(), -1) && r.status !== 'cancelled').forEach((r) => counts.set(r.date, (counts.get(r.date) ?? 0) + 1));
  const days = [...counts.keys()].sort().slice(0, 14);
  $('[data-days]').innerHTML = days.length
    ? `<p class="adm-days__label">予約のある日</p><div class="adm-days__list">${days
        .map(
          (dd) =>
            `<button type="button" class="adm-day${dd === date ? ' is-current' : ''}" data-goto-date="${dd}" aria-pressed="${dd === date}">${formatJa(dd)}<span>${counts.get(dd)}件</span></button>`,
        )
        .join('')}</div>`
    : '';

  const cur = document.querySelector<HTMLElement>('.adm-day.is-current');
  if (cur) cur.parentElement!.scrollLeft = cur.offsetLeft - (cur.parentElement!.clientWidth - cur.offsetWidth) / 2;

  $('[data-list]').innerHTML = dayRows.length
    ? `<ul class="adm-rows">${dayRows
        .map(
          (r) => `<li class="adm-row is-${r.status}${r.number === highlight ? ' is-highlight' : ''}" id="${r.number}">
        <p class="adm-row__time">${r.time}</p>
        <div class="adm-row__main">
          <p class="adm-row__name">${esc(r.name)} 様 ${r.source === 'web' ? '<span class="adm-badge adm-badge--web">体験で追加</span>' : ''}</p>
          <p class="adm-row__meta">${r.people}名様・${SEAT(r)}<span class="adm-row__no">${r.number}</span></p>
          ${r.request ? `<p class="adm-row__req">${esc(r.request)}</p>` : ''}
        </div>
        <div class="adm-row__ops">
          <label class="adm-row__status">
            <span class="sr-only">${esc(r.name)}様の</span><span>状態</span>
            <select data-status-for="${r.id}">
              ${(Object.keys(STATUS_LABELS) as ReservationStatus[])
                .map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`)
                .join('')}
            </select>
          </label>
          <button type="button" class="btn btn--ghost-dark btn--sm" data-detail-for="${r.id}">詳細<span class="sr-only">（${esc(r.name)}様）</span></button>
        </div>
      </li>`,
        )
        .join('')}</ul>`
    : `<p class="adm-empty">この日の予約はありません。<br><small>「予約のある日」から日付を選ぶか、<a href="/reserve/">予約を体験</a>してみてください。</small></p>`;

  if (highlight) {
    document.getElementById(highlight)?.scrollIntoView({ block: 'center' });
    highlight = '';
  }
}

function setDate(next: string): void {
  date = next;
  render();
}

function detail(r: Reservation): string {
  const row = (k: string, v: string) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
  return [
    row('予約番号', r.number),
    row('状態', STATUS_LABELS[r.status]),
    row('日時', `${formatJa(r.date, true)} ${r.time}〜`),
    row('人数', `${r.people}名様`),
    row('席', SEAT(r)),
    row('お名前', `${esc(r.name)} 様`),
    row('電話番号', esc(r.phone)),
    row('メール', r.email ? esc(r.email) : '（なし）'),
    row('ご要望', r.request ? esc(r.request) : '（なし）'),
    row('受付', r.source === 'web' ? `Web（この見本で体験）・${new Date(r.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}` : 'サンプルデータ'),
  ].join('');
}

// ---------------------------------------------------------------------
// 操作
// ---------------------------------------------------------------------
login.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $<HTMLInputElement>('#adm-pass');
  const err = $('#adm-pass-err');
  if (input.value.trim() !== SITE.admin.demoPassword) {
    err.textContent = `パスワードが違います。デモ用パスワードは「${SITE.admin.demoPassword}」です（半角小文字）。`;
    err.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  setEntered(true);
  enter();
});

function enter(): void {
  login.hidden = true;
  app.hidden = false;
  load();
}

app.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const dayBtn = t.closest<HTMLElement>('[data-day]');
  if (dayBtn) return setDate(addDays(date, Number(dayBtn.dataset.day)));
  if (t.closest('[data-today]')) return setDate(todayJST());
  const go = t.closest<HTMLElement>('[data-goto-date]');
  if (go) return setDate(go.dataset.gotoDate!);
  const det = t.closest<HTMLButtonElement>('[data-detail-for]');
  if (det) {
    const r = rows.find((x) => x.id === det.dataset.detailFor);
    if (!r) return;
    $('[data-detail]').innerHTML = detail(r);
    openDialog($<HTMLDialogElement>('#adm-detail'), det);
    return;
  }
  const reset = t.closest<HTMLButtonElement>('[data-reset]');
  if (reset) openDialog($<HTMLDialogElement>('#adm-reset'), reset);
  if (t.closest('[data-logout]')) {
    setEntered(false);
    app.hidden = true;
    login.hidden = false;
    $<HTMLInputElement>('#adm-pass').value = '';
    $<HTMLInputElement>('#adm-pass').focus();
  }
});

app.addEventListener('change', async (e) => {
  const t = e.target as HTMLElement;
  if (t.matches('[data-date-input]')) {
    const v = (t as HTMLInputElement).value;
    if (v) setDate(v);
    return;
  }
  const sel = t.closest<HTMLSelectElement>('[data-status-for]');
  if (!sel) return;
  const id = sel.dataset.statusFor!;
  try {
    const r = await store.updateStatus(id, sel.value as ReservationStatus);
    rows = await store.list();
    render();
    // 再描画後も同じ選択欄に戻す（キーボード操作を続けやすく）
    $<HTMLSelectElement>(`[data-status-for="${id}"]`).focus();
    say(`${r.name}様の予約を「${STATUS_LABELS[r.status]}」に変更しました。`);
  } catch (err) {
    say(err instanceof Error ? err.message : '変更できませんでした。');
    render();
  }
});

$('[data-reset-ok]').addEventListener('click', async () => {
  const dlg = $<HTMLDialogElement>('#adm-reset');
  try {
    await store.resetDemo();
    setEntered(true); // 初期化で入口の状態も消えるため入り直す
    date = todayJST();
    dlg.close();
    await load();
    say('デモデータを初期状態に戻しました。');
  } catch (err) {
    dlg.close();
    say(err instanceof Error ? err.message : '初期化できませんでした。');
  }
});

if (isEntered()) enter();
