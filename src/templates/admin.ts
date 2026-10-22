// 予約管理の操作見本（/admin/）。動きは src/pages/admin.ts
import { SITE, isDemo } from '../config/site';
import { icon } from './helpers';

export function adminMain(): string {
  return `<main id="main" class="adm">
  <div class="adm__inner">
    <header class="adm__head">
      <p class="rsv__en" lang="en">Reservations</p>
      <h1 class="rsv__title">予約管理<span class="adm__tag">操作見本</span></h1>
      ${
        isDemo
          ? `<div class="notice notice--demo" role="note">
        <p class="notice__title">${icon('information')}<span>お店側の「予約管理の操作見本」です</span></p>
        <p>この見本の予約は、お使いのブラウザ内に保存されます。別端末への共有や店舗への通知はありません。表示の予約はすべて架空のサンプルです。</p>
      </div>`
          : ''
      }
    </header>

    <noscript><p class="notice">管理画面を使うには JavaScript を有効にしてください。</p></noscript>

    <form class="adm-login" data-login hidden>
      <h2 class="adm-login__title">${icon('lock')}<span>管理画面に入る</span></h2>
      ${isDemo ? `<p class="adm-login__hint">デモ用パスワード：<strong class="mono">${SITE.admin.demoPassword}</strong><br><small>体験用の入口です。本番の認証の仕組みではありません。</small></p>` : ''}
      <div class="field">
        <label for="adm-pass">パスワード</label>
        <input id="adm-pass" type="password" autocomplete="off" aria-describedby="adm-pass-err">
        <p class="field__err" id="adm-pass-err" role="alert" hidden></p>
      </div>
      <button type="submit" class="btn btn--hi btn--lg">${icon('right')}<span>入る</span></button>
    </form>

    <div class="adm-app" data-app hidden>
      <div class="adm-bar">
        <div class="adm-date">
          <button type="button" class="btn btn--ghost-dark btn--sq" data-day="-1" aria-label="前の日">${icon('left')}</button>
          <label class="adm-date__pick"><span class="sr-only">表示する日付</span><input type="date" data-date-input></label>
          <button type="button" class="btn btn--ghost-dark btn--sq" data-day="1" aria-label="次の日">${icon('right')}</button>
          <button type="button" class="btn btn--ghost-dark" data-today>今日</button>
        </div>
        <p class="adm-sum" data-summary aria-live="polite"></p>
      </div>
      <div class="adm-days" data-days aria-label="予約のある日"></div>
      <h2 class="adm-list__title" data-list-title></h2>
      <div class="adm-list" data-list></div>
      <p class="adm-status" role="status" data-status></p>
      <div class="adm-foot">
        <button type="button" class="btn btn--ghost-dark" data-reset>${icon('refresh-1')}<span>デモデータを初期状態に戻す</span></button>
        <button type="button" class="linklike" data-logout>管理画面から出る</button>
      </div>
    </div>
  </div>

  <dialog class="admdialog" id="adm-detail" aria-labelledby="adm-detail-title">
    <div class="admdialog__inner">
      <h2 id="adm-detail-title">予約の詳細</h2>
      <dl class="confirm" data-detail></dl>
      <div class="demodialog__actions"><button type="button" class="btn btn--ghost-dark" data-close>閉じる</button></div>
    </div>
  </dialog>
  <dialog class="admdialog" id="adm-reset" aria-labelledby="adm-reset-title">
    <div class="admdialog__inner">
      <h2 id="adm-reset-title">デモデータを初期状態に戻しますか？</h2>
      <p>この制作見本がブラウザに保存した予約（体験で入れたデモ予約を含む）を消して、最初のサンプル予約に戻します。他のサイトのデータには影響しません。</p>
      <div class="demodialog__actions">
        <button type="button" class="btn btn--hi" data-reset-ok>初期状態に戻す</button>
        <button type="button" class="btn btn--ghost-dark" data-close>やめる</button>
      </div>
    </div>
  </dialog>
</main>`;
}
