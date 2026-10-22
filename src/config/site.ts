// =====================================================================
// 店舗設定：ここを書き換えると、サイト全体（3画面）の店名・連絡先・営業時間が変わります。
// ビルド時テンプレート（src/templates）と、実行時スクリプト（予約・管理）の両方が読み込みます。
// =====================================================================

export type SiteMode = 'demo' | 'production';

/** 実行環境の判定（ビルド時は Node の process.env、実行時は Vite の define で埋め込み） */
declare const __SITE_MODE__: SiteMode | undefined;
const envMode: SiteMode | undefined =
  typeof __SITE_MODE__ !== 'undefined'
    ? __SITE_MODE__
    : typeof process !== 'undefined' && process.env?.SITE_MODE === 'production'
      ? 'production'
      : undefined;

export const SITE = {
  /**
   * demo：架空店舗の制作見本（電話・LINE・SNS・地図は押すとデモ案内を表示、noindex、構造化データなし）
   * production：実店舗として公開（tel: や実URLへ移動、地図埋め込み、Restaurant 構造化データを出力）
   * 環境変数 SITE_MODE=production でビルドすると本番動作になります。
   */
  mode: (envMode ?? 'demo') as SiteMode,

  name: '炉端と酒 灯',
  nameShort: '灯',
  nameRuby: 'ともしび',
  nameEn: 'TOMOSHIBI',
  genre: '炉端焼きと地酒の居酒屋',
  catchVertical: ['炭の音、', '酒の香。'],
  lead: '炭火で焼く魚と野菜、県内の蔵の地酒。夜が更けたら、カウンターで静かな一杯も。',

  address: '〇〇県〇〇市〇〇町1-2-3',
  postalCode: '000-0000',
  access: '〇〇駅 東口から徒歩4分',
  /** 表示用。デモでは tel: リンクを張りません */
  phone: '000-0000-0000',
  hours: { open: '17:00', close: '24:00', lastOrder: '23:00' },
  /** 0=日曜 … 2=火曜 */
  closedWeekdays: [2] as number[],
  closedLabel: '火曜日',
  seats: {
    counter: { label: 'カウンター', count: 10, unit: '席', maxPerBooking: 4 },
    zashiki: { label: '座敷', count: 2, unit: '部屋', perUnit: 6, maxPerBooking: 6 },
    table: { label: 'テーブル', count: 4, unit: '卓', perUnit: 4, maxPerBooking: 4 },
  },
  totalSeatsLabel: '全38席',
  parking: '専用駐車場なし（近隣にコインパーキングあり）',
  payment: '現金・クレジットカード・QRコード決済',
  smoking: '店内禁煙（店外に喫煙スペースあり）',

  /** 本番で使う連絡先・URL。デモでは使用しません（リンク先として出力しない） */
  links: {
    tel: 'tel:0000000000',
    line: 'https://lin.ee/xxxxxxx',
    instagram: 'https://www.instagram.com/xxxxxxx/',
    x: 'https://x.com/xxxxxxx',
    tabelog: 'https://tabelog.com/xxxxxxx/',
    mapEmbed: 'https://www.google.com/maps/embed?pb=xxxxxxx',
    mapLink: 'https://maps.google.com/?q=xxxxxxx',
  },

  /** 公開URL（OGP の絶対URLに使用）。Cloudflare Pages の本番URLに合わせて変更してください */
  siteUrl: 'https://tomoshibi-sample.pages.dev',

  reservation: {
    idPrefix: 'TMS',
    /** 受付期間（当日を含め何日先まで） */
    daysAhead: 90,
    firstSlot: '17:00',
    lastSlot: '22:00',
    slotMinutes: 30,
    minPeople: 1,
    maxPeopleOnline: 6,
  },

  admin: {
    /** デモ体験用の入口。本番の認証ではありません（README 参照） */
    demoPassword: 'demo',
  },

  /** localStorage に保存するキーの接頭辞。デモデータ初期化はこの接頭辞のキーだけを削除します */
  storagePrefix: 'tomoshibi-demo:',
} as const;

export const isDemo = SITE.mode === 'demo';

export type SeatType = keyof typeof SITE.seats;
export const SEAT_TYPES = Object.keys(SITE.seats) as SeatType[];
