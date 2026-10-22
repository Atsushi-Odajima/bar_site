// 日付と時刻は端末のタイムゾーンに関係なく「日本時間」で判定する
// 日付は 'YYYY-MM-DD' 文字列で扱い、計算は UTC の暦日として行う

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function partsJST(now: Date = new Date()) {
  const p = Object.fromEntries(fmt.formatToParts(now).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

export const todayJST = (now?: Date): string => partsJST(now).date;
export const nowMinutesJST = (now?: Date): number => partsJST(now).minutes;

const toUTC = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const fromUTC = (dt: Date): string => dt.toISOString().slice(0, 10);

export const addDays = (iso: string, n: number): string => {
  const dt = toUTC(iso);
  dt.setUTCDate(dt.getUTCDate() + n);
  return fromUTC(dt);
};

/** 0=日曜 … 6=土曜 */
export const weekday = (iso: string): number => toUTC(iso).getUTCDay();

export const diffDays = (a: string, b: string): number => Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86400000);

const WD = ['日', '月', '火', '水', '木', '金', '土'];

export const formatJa = (iso: string, withYear = false): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${withYear ? `${y}年` : ''}${m}月${d}日（${WD[weekday(iso)]}）`;
};

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export const WEEKDAY_LABELS = WD;
