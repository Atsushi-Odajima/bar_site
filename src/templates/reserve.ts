// 予約ページ（3ステップ＋完了）。動きは src/pages/reserve.ts
import { SITE, SEAT_TYPES, isDemo } from '../config/site';
import { contact, icon } from './helpers';

const R = SITE.reservation;

function field(id: string, label: string, opts: { type?: string; required?: boolean; hint?: string; attrs?: string; textarea?: boolean }): string {
  const req = opts.required ? '<span class="req">必須</span>' : '<span class="opt">任意</span>';
  const describedby = [opts.hint ? `${id}-hint` : '', `${id}-err`].filter(Boolean).join(' ');
  const control = opts.textarea
    ? `<textarea id="${id}" name="${id}" rows="4" aria-describedby="${describedby}" ${opts.attrs ?? ''}></textarea>`
    : `<input id="${id}" name="${id}" type="${opts.type ?? 'text'}" aria-describedby="${describedby}" ${opts.required ? 'aria-required="true"' : ''} ${opts.attrs ?? ''}>`;
  return `<div class="field" data-field="${id}">
    <label for="${id}">${label}${req}</label>
    ${opts.hint ? `<p class="field__hint" id="${id}-hint">${opts.hint}</p>` : ''}
    ${control}
    <p class="field__err" id="${id}-err" role="alert" hidden></p>
  </div>`;
}

export function reserveMain(): string {
  const people = Array.from({ length: R.maxPeopleOnline }, (_, i) => i + 1)
    .map((n) => `<label class="chip"><input type="radio" name="people" value="${n}"><span>${n}<small>名</small></span></label>`)
    .join('');
  const seats = SEAT_TYPES.map((t) => {
    const s = SITE.seats[t];
    return `<label class="seatopt" data-seat="${t}">
      <input type="radio" name="seat" value="${t}">
      <span class="seatopt__body">
        <span class="seatopt__name">${s.label}</span>
        <span class="seatopt__cap">${s.maxPerBooking}名様まで</span>
        <span class="seatopt__state" aria-live="off"></span>
      </span>
    </label>`;
  }).join('');

  return `<main id="main" class="rsv">
  <div class="rsv__inner">
    <header class="rsv__head">
      <p class="rsv__en" lang="en">Reservation</p>
      <h1 class="rsv__title">ご予約</h1>
      ${
        isDemo
          ? `<div class="notice notice--demo" role="note">
        <p class="notice__title">${icon('information')}<span>操作体験用です</span></p>
        <p>実際の予約・送信・通知は行われません。お名前や電話番号は<strong>実在の情報を入力せず</strong>、ステップ2の「サンプル情報を入力する」ボタンをお使いください。</p>
      </div>`
          : ''
      }
      <p class="rsv__line">お電話・LINE でもご予約いただけます：${contact('phone', `${icon('phone')}<span>電話</span>`, 'linklike')}・${contact('line', `${icon('chat-3')}<span>LINE で予約</span>`, 'linklike')}</p>
    </header>

    <ol class="stepper" aria-label="予約の手順">
      <li data-stepper="1"><span class="stepper__num">1</span><span>日時・人数・席</span></li>
      <li data-stepper="2"><span class="stepper__num">2</span><span>お客様情報</span></li>
      <li data-stepper="3"><span class="stepper__num">3</span><span>内容確認</span></li>
    </ol>

    <noscript><p class="notice">予約画面を使うには JavaScript を有効にしてください。</p></noscript>

    <form class="rsv__form" id="rsv-form" novalidate>
      <section class="step" data-step="1" aria-labelledby="step1-title">
        <h2 class="step__title" id="step1-title" tabindex="-1">ステップ1：人数・日付・時間・席を選ぶ</h2>
        <div class="errsum" data-errsum role="alert" tabindex="-1" hidden></div>

        <fieldset class="group" id="g-people">
          <legend>${icon('group')}<span>人数</span></legend>
          <div class="chips">${people}<label class="chip chip--wide"><input type="radio" name="people" value="7+"><span>7名以上</span></label></div>
          <div class="notice notice--group" data-group-note hidden>
            <p class="notice__title">${icon('group')}<span>7名様以上はご相談ください</span></p>
            <p>オンラインでは${R.maxPeopleOnline}名様までお受けしています。7名様以上のご宴会・貸切は、お電話でご相談ください。${isDemo ? '（見本のため、ボタンを押すと導入後の動作をご案内します）' : ''}</p>
            <p>${contact('phone', `${icon('phone')}<span>電話で相談する</span>`, 'btn btn--ghost-dark')}</p>
          </div>
          <p class="field__err" id="people-err" hidden></p>
        </fieldset>

        <fieldset class="group" id="g-date" data-needs="people">
          <legend>${icon('calendar')}<span>日付</span></legend>
          <p class="group__hint">火曜日は定休日です。本日から${R.daysAhead}日先まで選べます。</p>
          <div class="cal" data-cal></div>
          <p class="group__picked" data-date-picked aria-live="polite"></p>
          <p class="field__err" id="date-err" hidden></p>
        </fieldset>

        <fieldset class="group" id="g-time" data-needs="date">
          <legend>${icon('time')}<span>時間</span></legend>
          <p class="group__hint">ご来店時刻（30分ごと）。${isDemo ? '<strong>表示の空き状況はデモ用のサンプル</strong>です。' : ''}</p>
          <div class="chips chips--time" data-times><p class="group__empty">先に人数と日付を選んでください。</p></div>
          <p class="field__err" id="time-err" hidden></p>
        </fieldset>

        <fieldset class="group" id="g-seat" data-needs="time">
          <legend>${icon('seat')}<span>席の種類</span></legend>
          <p class="group__hint">テーブルは1卓4名様、座敷は1室6名様までです（席の連結は承っていません）。</p>
          <div class="seatopts">${seats}</div>
          <p class="field__err" id="seat-err" hidden></p>
        </fieldset>

        <div class="step__nav">
          <button type="button" class="btn btn--hi btn--lg" data-next="2"><span>お客様情報の入力へ</span>${icon('right')}</button>
        </div>
      </section>

      <section class="step" data-step="2" aria-labelledby="step2-title" hidden>
        <h2 class="step__title" id="step2-title" tabindex="-1">ステップ2：お客様情報</h2>
        <div class="errsum" data-errsum role="alert" tabindex="-1" hidden></div>
        ${
          isDemo
            ? `<div class="notice notice--demo">
          <p>実在の個人情報は入力しないでください。下のボタンで見本の情報が入ります。</p>
          <button type="button" class="btn btn--ghost-dark" data-sample>${icon('edit')}<span>サンプル情報を入力する</span></button>
        </div>`
            : ''
        }
        ${field('name', 'お名前', { required: true, attrs: 'autocomplete="off" maxlength="40"', hint: '例：見本 太郎' })}
        ${field('phone', '電話番号', { type: 'tel', required: true, attrs: 'inputmode="tel" autocomplete="off" maxlength="15"', hint: 'ハイフンはあってもなくても構いません。例：090-0000-0000' })}
        ${field('email', 'メールアドレス', { type: 'email', attrs: 'inputmode="email" autocomplete="off" maxlength="80"', hint: '例：sample@example.com' })}
        ${field('request', 'ご要望', { textarea: true, attrs: 'maxlength="300"', hint: 'コースのご希望、お子様連れ、アレルギーなど（300文字まで）' })}
        <div class="step__nav">
          <button type="button" class="btn btn--ghost-dark btn--lg" data-prev="1">${icon('left')}<span>戻る</span></button>
          <button type="button" class="btn btn--hi btn--lg" data-next="3"><span>入力内容の確認へ</span>${icon('right')}</button>
        </div>
      </section>

      <section class="step" data-step="3" aria-labelledby="step3-title" hidden>
        <h2 class="step__title" id="step3-title" tabindex="-1">ステップ3：内容の確認</h2>
        <p>以下の内容でよろしければ、「デモ予約を完了する」を押してください。</p>
        <dl class="confirm" data-confirm></dl>
        <div class="notice notice--error" data-submit-error role="alert" tabindex="-1" hidden>
          <p class="notice__title">${icon('warning')}<span>保存できませんでした</span></p>
          <p data-submit-error-msg></p>
          <p>予約はまだ完了していません。もう一度「デモ予約を完了する」を押してください。</p>
        </div>
        <div class="step__nav">
          <button type="button" class="btn btn--ghost-dark btn--lg" data-prev="2">${icon('left')}<span>戻る</span></button>
          <button type="submit" class="btn btn--hi btn--lg" data-submit>${icon('check')}<span>デモ予約を完了する</span></button>
        </div>
      </section>

      <section class="step step--done" data-step="done" aria-labelledby="done-title" hidden>
        <p class="done__mark" aria-hidden="true">${icon('check')}</p>
        <h2 class="step__title" id="done-title" tabindex="-1">デモ予約が完了しました</h2>
        <p class="done__label">予約番号</p>
        <p class="done__number" data-done-number></p>
        <dl class="confirm" data-done-summary></dl>
        ${isDemo ? `<div class="notice notice--demo" role="note"><p><strong>この予約は見本のため、実際には送信されません。</strong>お店への通知・確認メールもありません。予約は、お使いのブラウザ内にだけ保存されています。</p></div>` : ''}
        <div class="done__actions">
          <a class="btn btn--hi btn--lg" href="/admin/">${icon('list-check')}<span>店舗側予約管理画面で確認する</span></a>
          <button type="button" class="btn btn--ghost-dark btn--lg" data-restart>${icon('refresh-1')}<span>もう一度予約を体験する</span></button>
          <a class="linklike" href="/">トップページへ戻る</a>
        </div>
      </section>
    </form>
  </div>
</main>`;
}
