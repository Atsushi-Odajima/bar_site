# CLAUDE.md — 炉端と酒「灯」制作見本

ミツモア・くらしのマーケットで「ホームページ作成」を受注するための**架空店舗の制作見本**。
見る人は地方・郊外の飲食店オーナー（40〜60代、スマホ中心）。

## 判断の優先順位（迷ったらこの順）

1. スマホで料理・価格・営業時間・予約方法がすぐ分かる
2. 写真と文字組みから、お店の魅力が伝わる
3. 予約と管理画面のデモを迷わず体験できる
4. 表示速度・読みやすさ・操作性
5. アニメーション

## 決めたこと

- 店名：**炉端と酒「灯（ともしび）」**（他案：「炭と酒 ほむら」「炉ばた 燈心」→ 読みやすさと提灯モチーフとの相性で「灯」に決定）
- 予約番号の接頭辞：`TMS`（例 `TMS-20261022-0007`）
- 技術：**Vite + TypeScript（フレームワークなし）**。1ページ＋予約＋管理の3画面だけで、静的HTMLを
  ビルド時に設定ファイルから生成すれば十分なため。実行時JSを最小にでき表示が速い。
  - ビルド時テンプレート：`vite.config.ts` のプラグインが `src/templates/*.ts` を呼び、
    `src/config/site.ts`・`src/data/*` から HTML を生成（店名・メニュー・営業時間の差し替えを1か所で）。
  - マルチページ：`/`・`/reserve/`・`/admin/`（Cloudflare Pages で直接開いても表示できる）
- アニメーション：GSAP + ScrollTrigger は**お品書きの巻物とパララックスのみ**（遅延読み込み）。
  暖簾・提灯・黒板は CSS と IntersectionObserver。Lenis は使わない（通常スクロール）。
- スタイル：素の CSS ＋ CSS 変数（`src/styles/tokens.css`）
- 配色：墨 `#1b1916` / 生成り `#efe7d8` / 炭火オレンジ `#e2793a`（文字用に濃い `#a94c14` も）
- 書体：見出し Shippori Mincho、本文 Zen Kaku Gothic New、英字 Cormorant Garamond、黒板のみ Klee One（使用文字だけのサブセット）。CSS は非ブロッキングで読み込む
- アイコン：**MingCute（Apache-2.0）に統一**。線幅2・角丸。喫煙/禁煙・提灯・暖簾・徳利は同じ線幅で自作（`src/icons/custom-*.svg`）
- 写真：Unsplash の実写のみ（AI生成禁止）。`public/images/` に WebP 800/1600。出典は `CREDITS.md`
- 外部ロゴ：公式の利用条件を確認できないものはサービス名のテキストボタン（ロゴを自作・模倣しない）
- デモ/本番の切替：`src/config/site.ts` の `mode`（環境変数 `SITE_MODE=production` で上書き）
  - demo：電話・LINE・SNS・地図は押すと「実店舗ではここから〜」のデモ案内ダイアログ。`noindex`。構造化データなし。
  - production：`tel:`・実URL・Google マップ埋め込み・`Restaurant` JSON-LD を出力
- 予約データ：`src/lib/reservation-store.ts` に集約（localStorage）。Supabase 差し替え箇所はコメントで明示。
  キーは `tomoshibi-demo:` で始まるものだけを使う（初期化もこの接頭辞のみ削除）。

- BAR 要素（バー使い等）は入れない。ヒーローの説明文は「炭火で焼く魚と野菜、地酒、ご馳走。」
- `/admin/` の名称は「店舗側予約管理画面」。お客様には見えない業務画面のため、白地・濃い文字・ゴシックで見やすさ優先
  （`src/styles/admin.css`）。お客様向けのヘッダー・フッター・固定の電話/予約バーは出さない

## 演出（優先度順）

1. 暖簾が開くオープニング（1.5秒以内、2回目以降スキップ、スキップボタン、操作をブロックしない）
2. 和紙のお品書きが広がる（本文は常に読める。紙の余白と軸だけが動く）
3. 提灯の点灯 / 写真のパララックス（PCのみ） / 火の粉（ヒーローのみ・少数） / 黒板の装飾線
- `prefers-reduced-motion` では完成状態を静的表示。初期化失敗時も本文を隠さない。

## 守ること

- 本文16px以上、主要ボタン高さ48px以上、固定バーで本文・入力欄を隠さない
- 架空の口コミ・受賞歴・実績・メディア掲載は書かない
- 実在の店名・住所・電話・SNSアカウントを使わない。ダミー番号に `tel:` を張らない
- ヘッダー付近とフッターに「架空店舗の制作見本」を表示
- 絵文字・OS記号・定番アイコンセット（Font Awesome / Material / Heroicons / Lucide 等）禁止

## フェーズ計画

1. 土台：Vite・トークン・レイアウト・固定アクションバー・ビルド時テンプレート
2. 素材：写真（Unsplash）・アイコン（MingCute）・ロゴ方針、`CREDITS.md`
3. 各セクションの中身
4. 演出（暖簾・巻物 → 提灯・パララックス・火の粉・黒板）
5. 予約（3ステップ＋完了）と /admin
6. 性能・アクセシビリティ・SEO（noindex/OGP）・Cloudflare Pages 設定・スクショ・README

## 実装メモ

- 写真の差し替え：`public/images/` ＋ `src/data/photos.json` → `npm run credits`
- 画面外セクション（seats〜links）に `content-visibility: auto`（フォント読み込み時の再レイアウト対策）。
  そのためページ内移動は滑らかスクロールにしない（着地位置がずれる）
- 動作確認：`/reserve/?demo-fail` で保存失敗を再現
- 外部ロゴは未使用（サービス名のテキストボタン）

## コマンド

- `npm run dev` / `npm run build`（出力 `dist`）/ `npm run preview` / `npm run typecheck`
