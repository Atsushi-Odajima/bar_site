// トップページ本文（ビルド時に静的 HTML として出力）
import { SITE, isDemo } from '../config/site';
import { COMMITMENTS, COURSES, DRINKS, FAQ, MENU, SEATS_INFO, TODAY_SPECIALS } from '../data/content';
import { contact, esc, icon, photo, photos, secHead, yen, type IconName } from './helpers';

const H = SITE.hours;

function hero(): string {
  const vert = SITE.catchVertical.map((l) => `<span>${l}</span>`).join('');
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__visual">
    <div class="win win--arch hero__win">
      ${photo('hero', { eager: true, sizes: '(min-width: 900px) 58vw, 100vw', cls: 'win__img' })}
      <canvas class="embers" aria-hidden="true"></canvas>
    </div>
    <p class="hero__vertical" aria-hidden="true">${vert}</p>
  </div>
  <div class="hero__body">
    <p class="hero__genre">${icon('fire')}<span>${SITE.genre}</span></p>
    <h1 class="hero__name" id="hero-title">
      <span class="hero__name-sub">炉端と酒</span>
      <span class="hero__name-main">${SITE.nameShort}<span class="hero__ruby">${SITE.nameRuby}</span></span>
    </h1>
    <p class="sr-only">${SITE.catchVertical.join('')}</p>
    <p class="hero__lead">${SITE.lead}</p>
    <dl class="keyinfo">
      <div><dt>${icon('time')}営業時間</dt><dd>${H.open}〜${H.close}<small>（L.O. ${H.lastOrder}）</small></dd></div>
      <div><dt>${icon('calendar')}定休日</dt><dd>${SITE.closedLabel}</dd></div>
      <div><dt>${icon('seat')}お席</dt><dd>カウンター・座敷・テーブル<small>（${SITE.totalSeatsLabel}）</small></dd></div>
      <div><dt>${icon('map-pin')}場所</dt><dd>${SITE.access}</dd></div>
    </dl>
    <div class="hero__cta">
      <a class="btn btn--hi btn--lg" href="/reserve/">${icon('calendar')}<span>席を予約する</span></a>
      ${contact('phone', `${icon('phone')}<span>電話する</span>`, 'btn btn--ghost btn--lg')}
    </div>
    <p class="hero__line">${contact('line', `${icon('chat-3')}<span>LINE でも予約できます</span>`, 'linklike')}</p>
  </div>
</section>`;
}

function about(): string {
  const rows = COMMITMENTS.map(
    (c) => `<li class="craft__item">
      <span class="craft__num" aria-hidden="true">${c.num}</span>
      <h3 class="craft__title">${c.title}</h3>
      <p>${c.body}</p>
    </li>`,
  ).join('');
  return `<section class="sec about" id="about" aria-labelledby="about-title">
  <div class="about__inner">
    ${secHead('about', 'Our Craft', 'お店について')}
    <p class="about__vertical" aria-hidden="true">炭と、酒と、<br>この土地のもの。</p>
    <ol class="craft">${rows}</ol>
    <figure class="about__fig">
      <div class="win win--shoji">${photo('charcoal', { sizes: '(min-width: 900px) 34vw, 90vw', cls: 'win__img' })}</div>
    </figure>
  </div>
</section>`;
}

function specials(): string {
  const items = TODAY_SPECIALS.items
    .map(
      (i) =>
        `<li><span class="board__name">${i.name}</span><span class="board__dots" aria-hidden="true"></span><span class="board__price">${yen(i.price)}${i.unit ? `<small>／${i.unit}</small>` : ''}</span></li>`,
    )
    .join('');
  return `<section class="sec specials" id="specials" aria-labelledby="specials-title">
  <div class="specials__inner">
    ${secHead('specials', "Today's Board", '今日のおすすめ')}
    <div class="specials__wrap">
      <div class="board" data-board>
        <svg class="board__deco" viewBox="0 0 600 420" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" class="board__frame" d="M18 18 C 200 12, 400 22, 582 16 C 588 140, 578 280, 584 402 C 400 410, 200 398, 16 406 C 10 280, 20 140, 18 18" />
        </svg>
        <svg class="board__fish" viewBox="0 0 80 40" aria-hidden="true"><path pathLength="1" d="M20 20 c 14 -14 38 -14 52 0 c -14 14 -38 14 -52 0 z M20 20 l -14 -10 v 20 z M60 17 v0.5" /></svg>
        <p class="board__date" data-today>本日</p>
        <h3 class="board__title">${TODAY_SPECIALS.title}</h3>
        <svg class="board__underline" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 9 C 70 4, 160 12, 297 6" /></svg>
        <ul class="board__list">${items}</ul>
        <p class="board__note">※${TODAY_SPECIALS.note}</p>
      </div>
      <figure class="specials__fig">
        <div class="win win--arch-sm">${photo('grilled-fish', { sizes: '(min-width: 900px) 30vw, 80vw', cls: 'win__img' })}</div>
      </figure>
    </div>
  </div>
</section>`;
}

function menu(): string {
  const tabs = MENU.map(
    (c, i) =>
      `<button type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${c.label}</button>`,
  ).join('');
  const panels = MENU.map(
    (c, i) => `<div class="oshinagaki" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" tabindex="0"${i === 0 ? '' : ' hidden'}>
      <div class="oshinagaki__fig win win--round">${photo(c.photo, { sizes: '(min-width: 900px) 220px, 120px', cls: 'win__img' })}</div>
      <p class="oshinagaki__lead">${c.lead}</p>
      <ul class="oshinagaki__list">${c.items
        .map(
          (m) => `<li>
          <span class="oshinagaki__name">${m.name}${m.note ? `<small>${m.note}</small>` : ''}</span>
          <span class="oshinagaki__leader" aria-hidden="true"></span>
          <span class="oshinagaki__price">${yen(m.price)}${m.unit ? `<small>／${m.unit}</small>` : ''}</span>
        </li>`,
        )
        .join('')}</ul>
    </div>`,
  ).join('');
  return `<section class="sec menu" id="menu" aria-labelledby="menu-title">
  <div class="menu__inner">
    ${secHead('menu', 'Oshinagaki', 'お品書き')}
    <p class="menu__note">価格はすべて税込です。カテゴリを選ぶと切り替わります。</p>
    <div class="makimono" data-makimono>
      <div class="makimono__rod makimono__rod--start" aria-hidden="true"></div>
      <div class="makimono__paper">
        <div class="makimono__content">
          <div class="tabs" role="tablist" aria-label="お品書きのカテゴリ">${tabs}</div>
          ${panels}
          <p class="makimono__stamp" aria-hidden="true">${SITE.nameShort}</p>
        </div>
      </div>
      <div class="makimono__rod makimono__rod--end" aria-hidden="true"></div>
    </div>
  </div>
</section>`;
}

function drinks(): string {
  const picks = DRINKS.picks
    .map(
      (p) => `<li class="drinks__pick">
      <p class="drinks__kind">${p.kind}</p>
      <h3 class="drinks__title">${p.title}</h3>
      <p>${p.body}</p>
    </li>`,
    )
    .join('');
  return `<section class="sec drinks" id="drinks" aria-labelledby="drinks-title">
  <div class="drinks__inner">
    <figure class="drinks__fig">
      <div class="win win--tall">${photo('lanterns', { sizes: '(min-width: 900px) 32vw, 90vw', cls: 'win__img' })}</div>
      <figcaption class="drinks__vertical" aria-hidden="true">地酒と、炭火。</figcaption>
    </figure>
    <div class="drinks__body">
      ${secHead('drinks', 'Sake &amp; Highball', 'お酒')}
      <p class="drinks__lead">${DRINKS.lead}</p>
      <ul class="drinks__picks">${picks}</ul>
      <blockquote class="tanzaku">
        <p class="tanzaku__label">${icon('custom-tokkuri')}<span>店主のひとこと</span></p>
        <p class="tanzaku__text">${DRINKS.ownerNote}</p>
      </blockquote>
      <div class="drinks__sub">
        <div class="win win--round">${photo('yakitori-2', { sizes: '(min-width: 900px) 14vw, 40vw', cls: 'win__img' })}</div>
        <p>全メニューと価格は<a href="#menu" data-menu-tab="sake">お品書きの「日本酒」</a>・<a href="#menu" data-menu-tab="highball">「ハイボール・焼酎」</a>をご覧ください。</p>
      </div>
    </div>
  </div>
</section>`;
}

function seats(): string {
  const rows = SEATS_INFO.map(
    (s, i) => `<li class="seat seat--${i % 2 ? 'rev' : 'fwd'}">
      <div class="win win--${s.mask}">${photo(s.photo, { sizes: '(min-width: 900px) 50vw, 100vw', cls: 'win__img' })}</div>
      <div class="seat__body">
        <h3 class="seat__title">${s.title}</h3>
        <p class="seat__cap">${icon('group')}<span>${s.capacity}</span></p>
        <p>${s.body}</p>
      </div>
    </li>`,
  ).join('');
  return `<section class="sec seats" id="seats" aria-labelledby="seats-title">
  <div class="seats__inner">
    ${secHead('seats', 'Seats', '店内・お席', true)}
    <p class="seats__lead">カウンター10席、座敷2部屋、テーブル4卓。人数と過ごし方に合わせてお選びください。</p>
    <ul class="seats__list">${rows}</ul>
    <p class="seats__note">※写真は素材写真を使ったイメージです。撮影場所はそれぞれ異なり、実際の店内・席数を示すものではありません。</p>
  </div>
</section>`;
}

function courses(): string {
  const rows = COURSES.map(
    (c) => `<li class="course">
      <div class="course__head">
        <h3 class="course__name">${c.name}</h3>
        <p class="course__meta">${c.count}・${c.time}</p>
      </div>
      <p class="course__price">${yen(c.price)}<small>（税込・お一人様）</small></p>
      <p class="course__dishes">${c.dishes.join('<span aria-hidden="true">／</span>')}</p>
      <p class="course__note">${c.note}</p>
    </li>`,
  ).join('');
  return `<section class="sec courses" id="courses" aria-labelledby="courses-title">
  <div class="courses__inner">
    ${secHead('courses', 'Courses', '宴会・コース')}
    <figure class="courses__fig"><div class="win win--slit">${photo('course', { sizes: '(min-width: 900px) 1100px, 100vw', cls: 'win__img' })}</div></figure>
    <p class="courses__lead">歓送迎会や家族の集まりに。座敷は1部屋6名様まで、2部屋続きでのご相談も承ります。</p>
    <ol class="courses__list">${rows}</ol>
    <div class="courses__cta">
      <a class="btn btn--hi btn--lg" href="/reserve/">${icon('calendar')}<span>コースで予約する</span></a>
      <p>コースはご予約時の「ご要望」欄にお書きください。7名様以上はお電話でご相談ください。</p>
    </div>
  </div>
</section>`;
}

function faq(): string {
  const items = FAQ.map(
    (f) => `<details class="faq__item">
      <summary>${icon(f.icon as IconName)}<span>${f.q}</span></summary>
      <p>${f.a}</p>
    </details>`,
  ).join('');
  return `<section class="sec faq" id="faq" aria-labelledby="faq-title">
  <div class="faq__inner">
    ${secHead('faq', 'Q &amp; A', 'よくある質問', true)}
    <div class="faq__list">${items}</div>
  </div>
</section>`;
}

function access(): string {
  const map = isDemo
    ? `<figure class="mapdemo">
        <svg viewBox="0 0 640 400" role="img" aria-labelledby="mapdemo-title">
          <title id="mapdemo-title">仮の案内図（見本）。駅の東口から大通りを進み、2本目の角を曲がった先に店がある様子を示したイラスト</title>
          <rect width="640" height="400" class="mapdemo__bg"/>
          <path class="mapdemo__river" d="M-10 330 C 120 300, 220 360, 360 330 S 560 290, 650 320"/>
          <path class="mapdemo__road" d="M0 150 H640 M0 245 H640 M140 0 V400 M420 0 V400"/>
          <path class="mapdemo__route" d="M180 110 V150 H420 V215 H470"/>
          <rect class="mapdemo__station" x="70" y="70" width="140" height="40" rx="4"/>
          <text x="140" y="96" class="mapdemo__label">〇〇駅 東口</text>
          <circle class="mapdemo__pin" cx="490" cy="215" r="20"/>
          <text x="490" y="223" class="mapdemo__pinlabel">${SITE.nameShort}</text>
          <text x="540" y="262" class="mapdemo__label mapdemo__label--sm">徒歩4分</text>
        </svg>
        <figcaption><strong>所在地・地図が入る見本です</strong>（地図は仮）。本番では Google マップを埋め込みます。</figcaption>
      </figure>`
    : `<div class="mapembed"><iframe src="${SITE.links.mapEmbed}" title="${esc(SITE.name)}の地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
  return `<section class="sec access" id="access" aria-labelledby="access-title">
  <div class="access__inner">
    ${secHead('access', 'Access', 'アクセス')}
    <div class="access__grid">
      ${map}
      <figure class="access__fig">
        <div class="win win--tall">${photo('entrance', { sizes: '(min-width: 900px) 22vw, 60vw', cls: 'win__img' })}</div>
        <figcaption>灯りのともる暖簾が目印です。<small>（外観イメージ・素材写真）</small></figcaption>
      </figure>
      <dl class="access__info">
        <div><dt>${icon('map-pin')}住所</dt><dd>〒${SITE.postalCode}<br>${SITE.address}<br><small>${SITE.access}</small></dd></div>
        <div><dt>${icon('phone')}電話</dt><dd>${contact('phone', SITE.phone, 'linklike linklike--lg')}</dd></div>
        <div><dt>${icon('time')}営業時間</dt><dd>${H.open}〜${H.close}<br><small>（料理・お飲み物 L.O. ${H.lastOrder}）</small></dd></div>
        <div><dt>${icon('calendar')}定休日</dt><dd>${SITE.closedLabel}<small>（祝日の場合は営業）</small></dd></div>
        <div><dt>${icon('parking')}駐車場</dt><dd>${SITE.parking}</dd></div>
        <div><dt>${icon('bank-card')}お支払い</dt><dd>${SITE.payment}</dd></div>
        <div><dt>${icon('custom-no-smoking')}喫煙</dt><dd>${SITE.smoking}</dd></div>
      </dl>
    </div>
  </div>
</section>`;
}

function links(): string {
  return `<section class="sec links" id="links" aria-labelledby="links-title">
  <div class="links__inner">
    <h2 class="links__title" id="links-title">最新情報・ご予約は外部サイトでも</h2>
    <p class="links__lead">本日のおすすめや空席情報をお知らせしています。</p>
    <ul class="links__list">
      <li>${contact('line', `<span class="line-add__main">友だち追加</span><span class="line-add__sub">LINE 公式アカウント</span>`, 'line-add')}</li>
      <li>${contact('instagram', '<span>Instagram</span><small>写真で見る今日の料理</small>', 'svc')}</li>
      <li>${contact('x', '<span>X</span><small>空席・入荷のお知らせ</small>', 'svc')}</li>
      <li>${contact('tabelog', '<span>食べログ</span><small>店舗情報を見る</small>', 'svc')}</li>
    </ul>
    ${isDemo ? '<p class="links__note">※見本のため、各ボタンは押すと導入後の動作をご案内します（外部サイトには移動しません）。各サービスのロゴは利用条件を確認できたものだけを使用する方針のため、サービス名で表示しています。</p>' : ''}
  </div>
</section>`;
}

/** 制作見本を見ている方への案内（本番では出力しない） */
function demoGuide(): string {
  if (!isDemo) return '';
  const credits = photos()
    .map((p) => `<li>${esc(p.altJa)} — <a href="${p.pageUrl}" rel="noopener" target="_blank">${esc(p.credit)}</a></li>`)
    .join('');
  return `<section class="sec guide" id="guide" aria-labelledby="guide-title">
  <div class="guide__inner">
    <p class="guide__tag">ホームページ制作をご検討中の方へ</p>
    <h2 class="guide__title" id="guide-title">この制作見本について</h2>
    <p>このサイトは<strong>架空店舗「${SITE.name}」の制作見本</strong>です。店舗・メニュー・予約はすべて架空で、実際の送信や通知は行われません。</p>
    <ul class="guide__links">
      <li><a class="guide__link" href="#top">${icon('home-1')}<span><strong>サイトを見る</strong><small>スマホでの見え方・お品書き・アクセス</small></span></a></li>
      <li><a class="guide__link" href="/reserve/">${icon('calendar')}<span><strong>予約を体験する</strong><small>お客様側の予約の流れ（3ステップ）</small></span></a></li>
      <li><a class="guide__link" href="/admin/">${icon('list-check')}<span><strong>お店側の管理画面を見る</strong><small>予約一覧・ステータス変更（パスワード demo）</small></span></a></li>
    </ul>
    <div class="guide__cols">
      <div>
        <h3>この見本で体験できること</h3>
        <ul class="guide__check">
          <li>暖簾が開くオープニング、和紙のお品書き、黒板のおすすめなどの見せ方</li>
          <li>人数・日付・時間・席を選ぶ予約の流れ（定休日・過去の日時は選べません）</li>
          <li>同じブラウザで入れたデモ予約を、管理画面で確認・ステータス変更</li>
          <li>スマホ下部の「電話・予約・LINE・地図」ボタン</li>
        </ul>
      </div>
      <div>
        <h3>本番導入時に設定・開発すること</h3>
        <ul class="guide__check guide__check--todo">
          <li>店名・写真・メニュー・価格・営業時間の差し替え（撮影の手配を含む）</li>
          <li>電話番号・公式LINE・SNS・Google マップの実際のリンク設定</li>
          <li>予約データの保存先（データベース）、管理画面のログイン・権限、予約通知メール</li>
          <li>実際の席数に合わせた空席管理と、二重予約の防止</li>
        </ul>
      </div>
    </div>
    <p><button type="button" class="linklike" data-replay-noren>${icon('refresh-1')}<span>暖簾の演出をもう一度見る</span></button></p>
    <details class="guide__credits">
      <summary>写真・アイコンの出典</summary>
      <ul>${credits || '<li>写真は未取得です（仮画像で表示しています）</li>'}</ul>
      <p>アイコン：MingCute Icon（Apache License 2.0）。提灯・徳利・暖簾・喫煙関連のアイコンは同じ線幅で自作。詳細は CREDITS.md に記載しています。</p>
    </details>
  </div>
</section>`;
}

export function homeMain(): string {
  return `<main id="main">
${hero()}
${about()}
${specials()}
${menu()}
${drinks()}
${seats()}
${courses()}
${faq()}
${access()}
${links()}
${demoGuide()}
</main>`;
}

/** 黒板に表示する文字（Klee One のサブセット用）*/
export function boardText(): string {
  return (
    TODAY_SPECIALS.title +
    TODAY_SPECIALS.items.map((i) => i.name + i.price.toLocaleString('ja-JP') + (i.unit ?? '')).join('') +
    TODAY_SPECIALS.note +
    '本日月火水木金土日0123456789()（）／円※,'
  );
}
