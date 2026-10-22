// =====================================================================
// ページの文章・メニュー・価格（すべて架空店舗の見本データ）
// 価格は税込表記。品名は使用写真の内容に合わせています。
// =====================================================================

export interface MenuItem {
  name: string;
  note?: string;
  price: number;
  /** 価格の後ろに付ける単位（例：「1本」「グラス」） */
  unit?: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  lead: string;
  /** src/data/photos.json の slot */
  photo: string;
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    id: 'yaki',
    photo: 'yakitori',
    label: '焼き物',
    lead: '炉端で一本ずつ、備長炭の遠火で焼き上げます。',
    items: [
      { name: '串焼き盛り合わせ（五本）', note: 'もも・ねぎま・つくね・皮・季節の野菜', price: 1100 },
      { name: 'つくね 卵黄添え', price: 330, unit: '1本' },
      { name: 'ねぎま', price: 220, unit: '1本' },
      { name: '鮎の塩焼き', note: '串打ちして炉端でじっくり', price: 750, unit: '1尾' },
      { name: '旬の魚の塩焼き', note: '仕入れにより魚種が変わります', price: 980 },
      { name: '厚揚げの炉端焼き', note: '生姜醤油で', price: 480 },
      { name: '椎茸の炭火焼き', price: 420 },
      { name: '焼きおにぎり', note: '醤油を塗りながら焼きます', price: 380, unit: '1個' },
    ],
  },
  {
    id: 'sashimi',
    photo: 'sashimi',
    label: '刺身',
    lead: 'その日の朝に港から届いた魚を、厚めに切ってお出しします。',
    items: [
      { name: 'お造り 三種盛り', price: 1380 },
      { name: '鮪の赤身', price: 880 },
      { name: 'お造り 五種盛り', note: '2〜3名様向け', price: 2180 },
      { name: '本日の白身', price: 780 },
      { name: '鰹のたたき', note: '藁で炙り、薬味たっぷり', price: 880 },
      { name: '〆鯖', price: 680 },
    ],
  },
  {
    id: 'ippin',
    photo: 'small-dish',
    label: '一品',
    lead: '最初の一杯に合わせて、すぐお出しできる品もございます。',
    items: [
      { name: 'だし巻き玉子', price: 580 },
      { name: 'おでん盛り合わせ', note: '大根・こんにゃく・玉子など', price: 680 },
      { name: '枝豆', note: 'すぐお出しできます', price: 380 },
      { name: '揚げ出し豆腐', price: 520 },
      { name: '季節野菜のおひたし', price: 420 },
      { name: '自家製ぬか漬け', price: 450 },
      { name: '鶏の唐揚げ', price: 680 },
    ],
  },
  {
    id: 'shime',
    photo: 'shime',
    label: '〆・甘味',
    lead: '飲んだあとの一品に。',
    items: [
      { name: '鯛だし茶漬け', price: 680 },
      { name: '炉端の焼きおにぎり茶漬け', price: 620 },
      { name: 'ざる蕎麦', price: 750 },
      { name: '土鍋ご飯と香の物', note: '炊き上がりまで30分ほど', price: 980 },
      { name: '黒蜜わらび餅', price: 450 },
    ],
  },
  {
    id: 'sake',
    photo: 'sake',
    label: '日本酒',
    lead: '県内の蔵を中心に、常時10種前後。冷・常温・燗をお選びいただけます。',
    items: [
      { name: '本日の純米酒', note: '店主のおすすめを日替わりで', price: 680, unit: '一合' },
      { name: '辛口 本醸造', note: '燗がおすすめ', price: 580, unit: '一合' },
      { name: '純米吟醸', note: '華やかな香り', price: 880, unit: '一合' },
      { name: '季節限定のお酒', note: 'ひやおろし・新酒など', price: 950, unit: '一合' },
      { name: '利き酒セット', note: '三種を少しずつ', price: 1200 },
      { name: '熱燗', note: 'ぬる燗・上燗・熱燗', price: 600, unit: '一合' },
    ],
  },
  {
    id: 'highball',
    photo: 'highball',
    label: 'ハイボール・焼酎',
    lead: '炭火の料理に合う、すっきりした一杯。',
    items: [
      { name: '灯ハイボール', note: '強炭酸・レモンピール', price: 550 },
      { name: '濃いめハイボール', price: 650 },
      { name: 'ジンジャーハイボール', price: 600 },
      { name: '芋焼酎', note: 'ロック・水割り・お湯割り', price: 550 },
      { name: '麦焼酎', note: 'ロック・水割り・お湯割り', price: 500 },
      { name: '生ビール（中）', price: 600 },
      { name: 'ソフトドリンク各種', note: '烏龍茶・柚子ソーダなど', price: 350 },
    ],
  },
];

export const TODAY_SPECIALS = {
  title: '本日のおすすめ',
  items: [
    { name: '戻り鰹のたたき', price: 980 },
    { name: '秋鮭とはらこの炉端焼き', price: 1180 },
    { name: '銀杏の塩炒り', price: 480 },
    { name: 'ひやおろし 一合', price: 780 },
  ],
  note: '仕入れにより変わります',
};

export const COMMITMENTS = [
  {
    num: '一',
    title: '炭火',
    body: '炉端の前に座れば、魚の脂が炭に落ちる音と香り。備長炭の遠火で、外は香ばしく中はふっくらと焼き上げます。',
  },
  {
    num: '二',
    title: '地酒',
    body: '県内の蔵を中心に、季節ごとに入れ替えて常時10種前後。料理に合わせて店主がお選びします。',
  },
  {
    num: '三',
    title: '地元の食材',
    body: '港から届く朝獲れの魚、近くの農家さんの野菜。その日の仕入れで、黒板のおすすめが変わります。',
  },
];

export const DRINKS = {
  lead: '炭火の香ばしさには、きりっと冷えた純米か、ぬる燗を。',
  picks: [
    { kind: '日本酒', title: '県内の蔵の純米酒', body: '冷・常温・燗。温度で表情が変わります。一合 580円〜' },
    { kind: 'ハイボール', title: '灯ハイボール', body: '強炭酸にレモンピール。焼き物と交互にどうぞ。550円' },
    { kind: '焼酎', title: '芋・麦のお湯割り', body: '寒い季節は、お湯割りで体を温めて。500円〜' },
  ],
  ownerNote:
    '「迷ったら、今日の料理を伝えてください。合う一杯をお持ちします。燗の温度もお好みで調整しますので、お気軽にどうぞ。」',
  ownerSign: '店主',
};

export const SEATS_INFO = [
  {
    key: 'counter',
    title: 'カウンター',
    capacity: '10席',
    body: '炉端の目の前。焼き上がる様子を眺めながら、お一人様でも気兼ねなく。夜更けはバー使いもどうぞ。',
    photo: 'counter',
    mask: 'slit',
  },
  {
    key: 'zashiki',
    title: '座敷',
    capacity: '2部屋（各6名様まで）',
    body: '襖で仕切る個室の座敷。小さなお子様連れのご家族や、少人数のご宴会に。',
    photo: 'zashiki',
    mask: 'shoji',
  },
  {
    key: 'table',
    title: 'テーブル',
    capacity: '4卓（各4名様まで）',
    body: '椅子席でゆったり。お仕事帰りの少人数や、ご友人同士の食事に。',
    photo: 'table',
    mask: 'round',
  },
];

export const COURSES = [
  {
    name: '炉端コース',
    price: 3500,
    count: '全7品',
    time: '2時間',
    dishes: ['先付', 'お造り三種', '串焼き三本', '旬の魚の塩焼き', '揚げ物', '〆の茶漬け', '甘味'],
    note: 'お料理のみ。お飲み物は別途ご注文ください。',
  },
  {
    name: '灯コース',
    price: 4500,
    count: '全8品',
    time: '2時間',
    dishes: ['先付', 'お造り五種', '串焼き盛り合わせ', '鰹のたたき', '季節の炉端焼き', '揚げ物', '土鍋ご飯', '甘味'],
    note: 'お料理のみ。お飲み物は別途ご注文ください。',
  },
  {
    name: '宴会コース（飲み放題付き）',
    price: 5500,
    count: '全8品',
    time: '2時間（L.O. 30分前）',
    dishes: ['先付', 'お造り三種', '串焼き盛り合わせ', '旬の魚の塩焼き', '揚げ物', '季節の一品', '〆の蕎麦', '甘味'],
    note: '飲み放題：生ビール・ハイボール・焼酎・日本酒（2種）・ソフトドリンク。4名様から。',
  },
];

export const FAQ = [
  {
    icon: 'baby',
    q: '子ども連れでも大丈夫ですか？',
    a: 'はい。座敷のお部屋なら小さなお子様連れでもゆっくり過ごせます。お子様用の取り皿もご用意しています。',
  },
  {
    icon: 'custom-no-smoking',
    q: 'たばこは吸えますか？',
    a: '店内は全席禁煙です。店外に喫煙スペースがございます。',
  },
  {
    icon: 'parking',
    q: '駐車場はありますか？',
    a: '専用の駐車場はございません。近隣のコインパーキングをご利用ください。',
  },
  {
    icon: 'group',
    q: '貸切はできますか？',
    a: '20名様前後から貸切のご相談を承ります。日程・ご予算はお電話でお問い合わせください。',
  },
  {
    icon: 'bank-card',
    q: 'カードやQRコード決済は使えますか？',
    a: '各種クレジットカード、主なQRコード決済がご利用いただけます。',
  },
] as const;
