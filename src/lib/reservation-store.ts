// =====================================================================
// 予約データの保存処理（このファイルに集約）
//
// 現在：デモモード。お使いのブラウザの localStorage に保存します。
//       別端末への共有・店舗への通知はありません。
//
// ▼ Supabase へ差し替える場合
//   1. 下の `ReservationStore` インターフェースを満たす `SupabaseReservationStore` を作る
//      （list → select、create → insert、updateStatus → update、resetDemo は不要）
//   2. ファイル末尾の `export const store = ...` を差し替える
//   ※ 保存先を変えるだけでは本番運用できません。管理画面の認証、行レベルの権限設定（RLS）、
//     予約通知、空席・在庫の管理、二重予約の防止がサーバー側で別途必要です（README 参照）。
// =====================================================================
import { SITE, type SeatType } from '../config/site';
import { addDays, todayJST, weekday } from './jst';

export type ReservationStatus = 'confirmed' | 'visited' | 'cancelled';

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  confirmed: '確定',
  visited: '来店済み',
  cancelled: 'キャンセル',
};

export interface ReservationInput {
  date: string; // YYYY-MM-DD（日本時間）
  time: string; // HH:MM
  people: number;
  seat: SeatType;
  name: string;
  phone: string;
  email?: string;
  request?: string;
}

export interface Reservation extends ReservationInput {
  id: string;
  number: string; // 例：TMS-20261022-0007
  status: ReservationStatus;
  createdAt: string; // ISO 8601
  source: 'web' | 'sample';
  /** 同じ操作の二重登録を防ぐためのキー（予約フォームごとに発行） */
  requestKey: string;
}

export interface ReservationStore {
  list(): Promise<Reservation[]>;
  /** 同じ requestKey での2回目以降は、新規登録せず最初の予約を返す */
  create(input: ReservationInput, requestKey: string): Promise<Reservation>;
  updateStatus(id: string, status: ReservationStatus): Promise<Reservation>;
  /** この制作見本が保存したデータだけを消して、初期のサンプル予約に戻す */
  resetDemo(): Promise<void>;
}

export class StorageUnavailableError extends Error {
  constructor() {
    super('この端末・ブラウザでは保存できませんでした。プライベートブラウズを解除するか、少し時間をおいてもう一度お試しください。');
    this.name = 'StorageUnavailableError';
  }
}

const KEY = `${SITE.storagePrefix}reservations`;
const SEEDED = `${SITE.storagePrefix}seeded`;

const isClosed = (d: string): boolean => SITE.closedWeekdays.includes(weekday(d));

/** 定休日を除いて数えた、今日から n 営業日後（負なら前）の日付。n=0 は今日以降で最初の営業日 */
function openDay(n: number): string {
  let d = todayJST();
  if (n === 0) {
    while (isClosed(d)) d = addDays(d, 1);
    return d;
  }
  const step = n > 0 ? 1 : -1;
  for (let left = Math.abs(n); left > 0; ) {
    d = addDays(d, step);
    if (!isClosed(d)) left--;
  }
  return d;
}

function sampleReservations(): Reservation[] {
  const rows: Array<[number, string, number, SeatType, string, ReservationStatus, string?]> = [
    [-1, '19:00', 2, 'counter', '見本 一郎', 'visited'],
    [-1, '18:30', 4, 'table', '見本 花子', 'visited', '誕生日のため、デザートにひと言添えてほしい'],
    [0, '18:00', 2, 'counter', '見本 次郎', 'confirmed'],
    [0, '19:00', 6, 'zashiki', '見本 商店（担当：見本 三郎）', 'confirmed', '宴会コース（飲み放題付き）希望'],
    [0, '19:30', 3, 'table', '見本 さくら', 'confirmed', '子ども1名（5歳）。取り皿をお願いします'],
    [0, '20:30', 1, 'counter', '見本 四郎', 'cancelled'],
    [1, '18:30', 4, 'table', '見本 五郎', 'confirmed'],
    [2, '19:00', 5, 'zashiki', '見本 ゆり', 'confirmed', '灯コース 5名'],
  ];
  const seq = new Map<string, number>();
  return rows.map(([day, time, people, seat, name, status, request], i) => {
    const date = openDay(day);
    const n = (seq.get(date) ?? 0) + 1;
    seq.set(date, n);
    return {
      id: `sample-${i + 1}`,
      number: makeNumber(date, n),
      date,
      time,
      people,
      seat,
      name,
      phone: `090-0000-${String(i + 1).padStart(4, '0')}`,
      email: '',
      request: request ?? '',
      status,
      createdAt: new Date().toISOString(),
      source: 'sample',
      requestKey: `sample-${i + 1}`,
    };
  });
}

function makeNumber(date: string, n: number): string {
  return `${SITE.reservation.idPrefix}-${date.replace(/-/g, '')}-${String(n).padStart(4, '0')}`;
}

function read(): Reservation[] {
  try {
    if (!localStorage.getItem(SEEDED)) {
      localStorage.setItem(KEY, JSON.stringify(sampleReservations()));
      localStorage.setItem(SEEDED, '1');
    }
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Reservation[];
  } catch {
    throw new StorageUnavailableError();
  }
}

function write(rows: Reservation[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    throw new StorageUnavailableError();
  }
}

/** 動作確認用：URL に ?demo-fail を付けると保存失敗を再現できます */
const simulateFailure = (): boolean =>
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo-fail');

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

class LocalStorageReservationStore implements ReservationStore {
  async list(): Promise<Reservation[]> {
    return read();
  }

  async create(input: ReservationInput, requestKey: string): Promise<Reservation> {
    await wait(600); // 通信している雰囲気を出すための待ち時間（デモ用）
    if (simulateFailure()) throw new StorageUnavailableError();
    const rows = read();
    const dup = rows.find((r) => r.requestKey === requestKey);
    if (dup) return dup;
    const sameDay = rows.filter((r) => r.date === input.date).map((r) => Number(r.number.slice(-4)));
    const rsv: Reservation = {
      ...input,
      id: crypto.randomUUID?.() ?? `r-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      number: makeNumber(input.date, Math.max(0, ...sameDay) + 1),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      source: 'web',
      requestKey,
    };
    write([...rows, rsv]);
    return rsv;
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const rows = read();
    const r = rows.find((x) => x.id === id);
    if (!r) throw new Error('予約が見つかりませんでした。画面を再読み込みしてください。');
    r.status = status;
    write(rows);
    return r;
  }

  async resetDemo(): Promise<void> {
    try {
      // この制作見本の接頭辞が付いたキーだけを削除する（他サイトのデータには触れない）
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(SITE.storagePrefix)) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(SITE.storagePrefix)) sessionStorage.removeItem(k);
      }
    } catch {
      throw new StorageUnavailableError();
    }
  }
}

// ▼ 保存先の差し替え箇所（Supabase 実装を作ったらここを変更）
export const store: ReservationStore = new LocalStorageReservationStore();
