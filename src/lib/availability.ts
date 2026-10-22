// =====================================================================
// 予約の受付条件と「デモ用の空き状況」
// 空き状況は日付・時刻・席から計算する固定のサンプルデータです（毎回同じ結果）。
// 実際の席在庫管理・二重予約防止ではありません。本番では予約データから計算します。
// =====================================================================
import { SITE, SEAT_TYPES, type SeatType } from '../config/site';
import { addDays, diffDays, fromMinutes, nowMinutesJST, todayJST, toMinutes, weekday } from './jst';

export type SlotStatus = 'open' | 'few' | 'full';

const R = SITE.reservation;

export function timeSlots(): string[] {
  const out: string[] = [];
  for (let m = toMinutes(R.firstSlot); m <= toMinutes(R.lastSlot); m += R.slotMinutes) out.push(fromMinutes(m));
  return out;
}

/** 文字列から 0〜99 の固定値を作る（FNV-1a） */
function score(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 100;
}

export const lastBookableDate = (): string => addDays(todayJST(), R.daysAhead);

export type DateBlock = 'past' | 'closed' | 'beyond' | null;

/** 選べない日付ならその理由を返す */
export function dateBlock(iso: string): DateBlock {
  const d = diffDays(todayJST(), iso);
  if (d < 0) return 'past';
  if (d > R.daysAhead) return 'beyond';
  if (SITE.closedWeekdays.includes(weekday(iso))) return 'closed';
  return null;
}

/** 当日の経過済み時刻か */
export function isPastSlot(iso: string, time: string): boolean {
  return iso === todayJST() && toMinutes(time) <= nowMinutesJST();
}

/** 時間帯の空き（デモ用の固定データ） */
export function slotStatus(iso: string, time: string): SlotStatus {
  const s = score(`${iso}|${time}`);
  // 金土の 19:00〜20:00 は混みやすい、という見本らしさを少しだけ持たせる
  const busy = [5, 6].includes(weekday(iso)) && ['19:00', '19:30', '20:00'].includes(time);
  if (s < (busy ? 35 : 10)) return 'full';
  if (s < (busy ? 70 : 28)) return 'few';
  return 'open';
}

/** 席ごとの空き（デモ用の固定データ） */
export function seatStatus(iso: string, time: string, seat: SeatType): SlotStatus {
  if (slotStatus(iso, time) === 'full') return 'full';
  const s = score(`${iso}|${time}|${seat}`);
  if (s < 22) return 'full';
  if (s < 40) return 'few';
  return 'open';
}

export const seatMax = (seat: SeatType): number => SITE.seats[seat].maxPerBooking;

/** その人数・日時で選べる席が1つでもあるか */
export function hasSeatFor(iso: string, time: string, people: number): boolean {
  return SEAT_TYPES.some((t) => people <= seatMax(t) && seatStatus(iso, time, t) !== 'full');
}

export const STATUS_LABEL: Record<SlotStatus, string> = { open: '空きあり', few: '残りわずか', full: '満席' };
