import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/app.css';
import { SITE, SEAT_TYPES, type SeatType } from '../config/site';
import { initCommon } from '../lib/common';
import { WEEKDAY_LABELS, formatJa, todayJST } from '../lib/jst';
import {
  STATUS_LABEL,
  dateBlock,
  hasSeatFor,
  isPastSlot,
  lastBookableDate,
  seatMax,
  seatStatus,
  slotStatus,
  timeSlots,
} from '../lib/availability';
import { store, type Reservation, type ReservationInput } from '../lib/reservation-store';

initCommon();

// ---------------------------------------------------------------------
// 入力中の内容（戻る・再読み込みで失われないよう sessionStorage に保存）
// ---------------------------------------------------------------------
type Step = '1' | '2' | '3' | 'done';

interface Draft {
  people: number | '7+' | null;
  date: string | null;
  time: string | null;
  seat: SeatType | null;
  name: string;
  phone: string;
  email: string;
  request: string;
  /** 二重登録防止のキー。「もう一度予約を体験する」で新しくなる */
  requestKey: string;
  /** カレンダーに表示中の月（YYYY-MM） */
  month: string;
}

const DRAFT_KEY = `${SITE.storagePrefix}reserve-draft`;
const DONE_KEY = `${SITE.storagePrefix}reserve-done`;

const newKey = () => crypto.randomUUID?.() ?? `k-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyDraft = (): Draft => ({
  people: null,
  date: null,
  time: null,
  seat: null,
  name: '',
  phone: '',
  email: '',
  request: '',
  requestKey: newKey(),
  month: todayJST().slice(0, 7),
});

function loadJSON<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function saveJSON(key: string, v: unknown): void {
  try {
    if (v === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* 保存できない環境でも、画面上の入力はそのまま使える */
  }
}

const d: Draft = { ...emptyDraft(), ...loadJSON<Partial<Draft>>(DRAFT_KEY) };
let done: Reservation | null = loadJSON<Reservation>(DONE_KEY);
const save = () => saveJSON(DRAFT_KEY, d);

// ---------------------------------------------------------------------
// 要素
// ---------------------------------------------------------------------
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const form = $<HTMLFormElement>('#rsv-form');
const steps = new Map<Step, HTMLElement>(
  [...form.querySelectorAll<HTMLElement>('[data-step]')].map((el) => [el.dataset.step as Step, el]),
);
const cal = $('[data-cal]');
const times = $('[data-times]');
const live = document.createElement('p');
live.className = 'sr-only';
live.setAttribute('aria-live', 'polite');
form.append(live);

const announce = (msg: string) => {
  live.textContent = '';
  requestAnimationFrame(() => (live.textContent = msg));
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// ---------------------------------------------------------------------
// 選択内容の妥当性（人数・日付を変えたら、無効になった時間・席を解除する）
// ---------------------------------------------------------------------
const peopleNum = (): number | null => (typeof d.people === 'number' ? d.people : null);

function timeValid(): boolean {
  if (!d.date || !d.time) return false;
  if (dateBlock(d.date) || isPastSlot(d.date, d.time) || slotStatus(d.date, d.time) === 'full') return false;
  const n = peopleNum();
  return n === null || hasSeatFor(d.date, d.time, n);
}

function seatValid(): boolean {
  if (!d.seat || !timeValid()) return false;
  const n = peopleNum();
  return (n === null || n <= seatMax(d.seat)) && seatStatus(d.date!, d.time!, d.seat) !== 'full';
}

function reconcile(): void {
  const cleared: string[] = [];
  if (d.date && dateBlock(d.date)) {
    d.date = null;
    cleared.push('日付');
  }
  if (d.time && !timeValid()) {
    d.time = null;
    cleared.push('時間');
  }
  if (d.seat && !seatValid()) {
    d.seat = null;
    cleared.push('席');
  }
  if (cleared.length) {
    const msg = `条件が変わったため、${cleared.join('・')}の選択を解除しました。もう一度お選びください。`;
    showStatus(msg);
    announce(msg);
  }
}

function showStatus(msg: string): void {
  let el = form.querySelector<HTMLElement>('[data-reset-note]');
  if (!el) {
    el = document.createElement('p');
    el.className = 'reset-note';
    el.dataset.resetNote = '';
    $('#g-time').before(el);
  }
  el.textContent = msg;
  el.hidden = false;
}

// ---------------------------------------------------------------------
// ステップ1の描画
// ---------------------------------------------------------------------
function renderPeople(): void {
  form.querySelectorAll<HTMLInputElement>('input[name=people]').forEach((r) => (r.checked = r.value === String(d.people)));
  const group = d.people === '7+';
  $('[data-group-note]').hidden = !group;
  ['#g-date', '#g-time', '#g-seat'].forEach((sel) => (($(sel) as HTMLFieldSetElement).disabled = group));
}

function monthDays(ym: string): string[] {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: last }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`);
}
const shiftMonth = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1));
  return dt.toISOString().slice(0, 7);
};

const BLOCK_LABEL = { past: '選択できません', closed: '定休日', beyond: '受付期間外' } as const;

function renderCalendar(): void {
  const today = todayJST();
  const minMonth = today.slice(0, 7);
  const maxMonth = lastBookableDate().slice(0, 7);
  if (d.month < minMonth) d.month = minMonth;
  if (d.month > maxMonth) d.month = maxMonth;
  const [y, m] = d.month.split('-').map(Number);
  const days = monthDays(d.month);
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();

  const cells = [
    ...Array.from({ length: lead }, () => '<span class="cal__blank" aria-hidden="true"></span>'),
    ...days.map((iso) => {
      const block = dateBlock(iso);
      const day = Number(iso.slice(8));
      const sel = d.date === iso;
      const [, mm, dd] = iso.split('-').map(Number);
      const wd = WEEKDAY_LABELS[(lead + day - 1) % 7];
      const tag = block === 'closed' ? '休' : iso === today ? '今日' : '';
      const note = block && block !== 'closed' ? `（${BLOCK_LABEL[block]}）` : block === 'closed' ? '（定休日）' : '';
      // 見えている数字を読み上げ名の先頭に含める（音声操作で「22」と言えば押せるように）
      return `<button type="button" class="cal__day${block ? ` is-${block}` : ''}${sel ? ' is-selected' : ''}${iso === today ? ' is-today' : ''}"
        data-date="${iso}" aria-pressed="${sel}" ${block ? 'disabled' : ''}>
        <span class="cal__num">${dd}<span class="sr-only">日（${wd}）${mm}月${note}</span></span>${tag ? `<span class="cal__tag">${tag}</span>` : ''}
      </button>`;
    }),
  ].join('');

  cal.innerHTML = `<div class="cal__head">
      <button type="button" class="btn btn--ghost-dark btn--sq" data-month="-1" aria-label="前の月" ${d.month <= minMonth ? 'disabled' : ''}>‹</button>
      <p class="cal__title" aria-live="polite">${y}年${m}月</p>
      <button type="button" class="btn btn--ghost-dark btn--sq" data-month="1" aria-label="次の月" ${d.month >= maxMonth ? 'disabled' : ''}>›</button>
    </div>
    <div class="cal__grid" role="group" aria-label="${y}年${m}月の日付">
      ${WEEKDAY_LABELS.map((w, i) => `<span class="cal__wd${i === 0 ? ' is-sun' : i === 6 ? ' is-sat' : ''}" aria-hidden="true">${w}</span>`).join('')}
      ${cells}
    </div>`;
  $('[data-date-picked]').textContent = d.date ? `選択中：${formatJa(d.date, true)}` : '';
}

function renderTimes(): void {
  if (!d.date) {
    times.innerHTML = '<p class="group__empty">先に日付を選んでください。</p>';
    return;
  }
  const n = peopleNum();
  times.innerHTML = timeSlots()
    .map((t) => {
      const past = isPastSlot(d.date!, t);
      const st = slotStatus(d.date!, t);
      const noSeat = n !== null && st !== 'full' && !hasSeatFor(d.date!, t, n);
      const disabled = past || st === 'full' || noSeat;
      const label = past ? '受付終了' : st === 'full' || noSeat ? '満席' : st === 'few' ? '残りわずか' : '空きあり';
      return `<label class="chip chip--time${disabled ? ' is-disabled' : ''}${st === 'few' && !disabled ? ' is-few' : ''}">
        <input type="radio" name="time" value="${t}" ${d.time === t ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <span>${t}<small>${label}</small></span>
      </label>`;
    })
    .join('');
}

function renderSeats(): void {
  const n = peopleNum();
  SEAT_TYPES.forEach((t) => {
    const box = $(`[data-seat="${t}"]`);
    const input = $<HTMLInputElement>('input', box);
    const state = $('.seatopt__state', box);
    let reason: string;
    let disabled = true;
    if (!d.date || !d.time) reason = '時間を選ぶと表示されます';
    else if (n !== null && n > seatMax(t)) reason = `${n}名様ではご利用いただけません`;
    else {
      const st = seatStatus(d.date, d.time, t);
      reason = STATUS_LABEL[st];
      disabled = st === 'full';
    }
    input.disabled = disabled;
    input.checked = d.seat === t;
    box.classList.toggle('is-disabled', disabled);
    state.textContent = reason;
  });
}

function renderStep1(): void {
  renderPeople();
  renderCalendar();
  renderTimes();
  renderSeats();
}

// ---------------------------------------------------------------------
// エラー表示（項目のそば＋上部のまとめ）
// ---------------------------------------------------------------------
interface FieldError {
  id: string; // エラー文を出す要素の id の接頭辞
  focus: string; // 修正のために移動する要素
  msg: string;
}

function clearErrors(stepEl: HTMLElement): void {
  stepEl.querySelectorAll<HTMLElement>('.field__err').forEach((e) => (e.hidden = true));
  stepEl.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
  stepEl.querySelectorAll('.has-error').forEach((e) => e.classList.remove('has-error'));
  const sum = stepEl.querySelector<HTMLElement>('[data-errsum]');
  if (sum) sum.hidden = true;
}

function showErrors(stepEl: HTMLElement, errors: FieldError[]): void {
  clearErrors(stepEl);
  errors.forEach((er) => {
    const p = document.getElementById(`${er.id}-err`);
    if (p) {
      p.textContent = er.msg;
      p.hidden = false;
      p.closest('.field, .group')?.classList.add('has-error');
    }
    document.getElementById(er.id)?.setAttribute('aria-invalid', 'true');
  });
  const sum = stepEl.querySelector<HTMLElement>('[data-errsum]')!;
  sum.innerHTML = `<p class="errsum__title">入力内容を確認してください（${errors.length}件）</p>
    <ul>${errors.map((er) => `<li><a href="#${er.focus}">${esc(er.msg)}</a></li>`).join('')}</ul>`;
  sum.hidden = false;
  sum.focus();
}

function validateStep1(): FieldError[] {
  const e: FieldError[] = [];
  if (d.people === '7+')
    e.push({ id: 'people', focus: 'g-people', msg: '7名様以上はオンラインでは承っていません。お電話でご相談ください。' });
  else if (!d.people) e.push({ id: 'people', focus: 'g-people', msg: '人数を選んでください。' });
  if (d.people !== '7+') {
    if (!d.date) e.push({ id: 'date', focus: 'g-date', msg: '日付を選んでください。' });
    if (!d.time) e.push({ id: 'time', focus: 'g-time', msg: d.date ? '時間を選んでください。' : '日付を選ぶと、時間を選べるようになります。' });
    if (!d.seat) e.push({ id: 'seat', focus: 'g-seat', msg: d.time ? '席の種類を選んでください。' : '時間を選ぶと、席を選べるようになります。' });
  }
  return e;
}

/** 全角数字・記号を半角にし、ハイフンや空白を除いた電話番号 */
const normalizePhone = (s: string) =>
  s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s\-‐−ー－()（）]/g, '');

function validateStep2(): FieldError[] {
  const e: FieldError[] = [];
  if (!d.name.trim()) e.push({ id: 'name', focus: 'name', msg: 'お名前を入力してください。' });
  const ph = normalizePhone(d.phone);
  if (!ph) e.push({ id: 'phone', focus: 'phone', msg: '電話番号を入力してください。' });
  else if (!/^0\d{9,10}$/.test(ph))
    e.push({ id: 'phone', focus: 'phone', msg: '電話番号は、0から始まる10〜11桁の数字で入力してください（例：090-0000-0000）。' });
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    e.push({ id: 'email', focus: 'email', msg: 'メールアドレスの形式が正しくありません（例：sample@example.com）。空欄でも予約できます。' });
  if (d.request.length > 300) e.push({ id: 'request', focus: 'request', msg: 'ご要望は300文字以内で入力してください。' });
  return e;
}

// ---------------------------------------------------------------------
// 確認・完了の表示
// ---------------------------------------------------------------------
const seatLabel = (t: SeatType) => SITE.seats[t].label;

function summaryRows(r: ReservationInput, withEdit: boolean): string {
  const edit = (step: string, what: string) =>
    withEdit ? `<button type="button" class="linklike confirm__edit" data-goto="${step}">${what}を変更</button>` : '';
  const row = (k: string, v: string, e = '') => `<div><dt>${k}</dt><dd><span>${v}</span>${e}</dd></div>`;
  return [
    row('日時', `${formatJa(r.date, true)} ${r.time}〜`, edit('1', '日時')),
    row('人数', `${r.people}名様`, edit('1', '人数')),
    row('席', seatLabel(r.seat), edit('1', '席')),
    row('お名前', esc(r.name), edit('2', 'お名前')),
    row('電話番号', esc(r.phone), edit('2', '電話番号')),
    row('メール', r.email ? esc(r.email) : '（なし）', edit('2', 'メール')),
    row('ご要望', r.request ? esc(r.request).replace(/\n/g, '<br>') : '（なし）', edit('2', 'ご要望')),
  ].join('');
}

const currentInput = (): ReservationInput => ({
  date: d.date!,
  time: d.time!,
  people: d.people as number,
  seat: d.seat!,
  name: d.name.trim(),
  phone: d.phone.trim(),
  email: d.email.trim(),
  request: d.request.trim(),
});

// ---------------------------------------------------------------------
// ステップ移動（ブラウザの「戻る」にも対応）
// ---------------------------------------------------------------------
let current: Step = '1';

function canEnter(step: Step): Step {
  if (step === 'done') return done && done.requestKey === d.requestKey ? 'done' : '3';
  if (step >= '2' && validateStep1().length) return '1';
  if (step === '3' && validateStep2().length) return '2';
  return step;
}

function show(step: Step, opts: { push?: boolean; focus?: boolean } = {}): void {
  step = canEnter(step);
  current = step;
  steps.forEach((el, k) => (el.hidden = k !== step));
  document.querySelectorAll<HTMLElement>('[data-stepper]').forEach((li) => {
    const n = li.dataset.stepper!;
    const isCur = n === step;
    li.toggleAttribute('aria-current', isCur);
    if (isCur) li.setAttribute('aria-current', 'step');
    li.classList.toggle('is-done', step === 'done' || n < step);
  });
  $('.stepper').hidden = step === 'done';

  if (step === '1') renderStep1();
  if (step === '2') fillStep2();
  if (step === '3') $('[data-confirm]').innerHTML = summaryRows(currentInput(), true);
  if (step === 'done' && done) {
    $('[data-done-number]').textContent = done.number;
    $('[data-done-summary]').innerHTML = summaryRows(done, false);
    $<HTMLAnchorElement>('[data-step="done"] a[href^="/admin/"]').href = `/admin/?date=${done.date}#${done.number}`;
  }
  if (opts.push) history.pushState({ step }, '', `#step-${step}`);
  if (opts.focus !== false) {
    const h = $('.step__title', steps.get(step)!);
    h.focus({ preventScroll: true });
    $('.stepper').scrollIntoView({ block: 'start', behavior: 'auto' });
    if (step === 'done') window.scrollTo({ top: 0 });
  }
}

function fillStep2(): void {
  (['name', 'phone', 'email', 'request'] as const).forEach((k) => {
    const el = document.getElementById(k) as HTMLInputElement | HTMLTextAreaElement;
    if (el.value !== d[k]) el.value = d[k];
  });
}

window.addEventListener('popstate', (e) => show(((e.state as { step?: Step } | null)?.step ?? '1') as Step, { focus: true }));

// ---------------------------------------------------------------------
// 操作
// ---------------------------------------------------------------------
form.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.name === 'people') {
    d.people = t.value === '7+' ? '7+' : Number(t.value);
    reconcile();
    renderStep1();
  } else if (t.name === 'time') {
    d.time = t.value;
    reconcile();
    renderSeats();
  } else if (t.name === 'seat') {
    d.seat = t.value as SeatType;
  }
  save();
});

form.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement;
  if (['name', 'phone', 'email', 'request'].includes(t.id)) {
    d[t.id as 'name'] = t.value;
    save();
  }
});

form.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const day = t.closest<HTMLButtonElement>('[data-date]');
  if (day && !day.disabled) {
    d.date = day.dataset.date!;
    reconcile();
    save();
    renderCalendar();
    renderTimes();
    renderSeats();
    (cal.querySelector(`[data-date="${d.date}"]`) as HTMLElement | null)?.focus();
    announce(`${formatJa(d.date)}を選びました。続けて時間を選んでください。`);
    return;
  }
  const mon = t.closest<HTMLButtonElement>('[data-month]');
  if (mon) {
    d.month = shiftMonth(d.month, Number(mon.dataset.month));
    save();
    renderCalendar();
    (cal.querySelector(`[data-month="${mon.dataset.month}"]:not([disabled])`) as HTMLElement | null)?.focus();
    return;
  }
  const next = t.closest<HTMLElement>('[data-next]');
  if (next) {
    const stepEl = steps.get(current)!;
    const errors = current === '1' ? validateStep1() : validateStep2();
    if (errors.length) return showErrors(stepEl, errors);
    clearErrors(stepEl);
    show(next.dataset.next as Step, { push: true });
    return;
  }
  const prev = t.closest<HTMLElement>('[data-prev], [data-goto]');
  if (prev) {
    show((prev.dataset.prev ?? prev.dataset.goto) as Step, { push: true });
    return;
  }
  if (t.closest('[data-sample]')) {
    Object.assign(d, { name: '見本 太郎', phone: '090-0000-0000', email: 'sample@example.com', request: '（見本）家族の誕生日のお祝いです。' });
    fillStep2();
    save();
    clearErrors(steps.get('2')!);
    announce('サンプル情報を入力しました。');
    return;
  }
  if (t.closest('[data-restart]')) {
    Object.assign(d, emptyDraft());
    done = null;
    saveJSON(DONE_KEY, null);
    save();
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not([type=radio]), textarea').forEach((el) => (el.value = ''));
    form.querySelector<HTMLElement>('[data-reset-note]')?.setAttribute('hidden', '');
    show('1', { push: true });
  }
});

// エラーまとめのリンク：該当の項目へ移動してフォーカス
form.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('.errsum a');
  if (!a) return;
  e.preventDefault();
  const target = document.getElementById(a.hash.slice(1));
  target?.scrollIntoView({ block: 'center' });
  const focusable = target?.matches('input, textarea') ? target : target?.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled])');
  focusable?.focus({ preventScroll: true });
});

// 送信：二重クリックで重複登録しない／失敗したら完了と表示しない
let submitting = false;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (current !== '3' || submitting) return;
  const btn = $<HTMLButtonElement>('[data-submit]');
  const errBox = $('[data-submit-error]');
  if (validateStep1().length || validateStep2().length) return show('1', { push: true });
  submitting = true;
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  const label = $('span', btn);
  const orig = label.textContent;
  label.textContent = '保存しています…';
  errBox.hidden = true;
  try {
    done = await store.create(currentInput(), d.requestKey);
    saveJSON(DONE_KEY, done);
    show('done', { push: true });
  } catch (err) {
    $('[data-submit-error-msg]').textContent =
      err instanceof Error ? err.message : '保存中に問題が発生しました。';
    errBox.hidden = false;
    errBox.focus();
  } finally {
    submitting = false;
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    label.textContent = orig;
  }
});

// ---------------------------------------------------------------------
// 初期表示：再読み込み時は、いたステップに戻す
// ---------------------------------------------------------------------
reconcile();
form.querySelector<HTMLElement>('[data-reset-note]')?.setAttribute('hidden', '');
const initial = ((history.state as { step?: Step } | null)?.step ?? '1') as Step;
history.replaceState({ step: initial }, '', initial === '1' && !location.hash ? location.pathname + location.search : `#step-${initial}`);
show(initial, { focus: false });
