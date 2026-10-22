// src/data/photos.json から CREDITS.md を生成する（写真を差し替えたら npm run credits）
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const photos = JSON.parse(readFileSync(join(root, 'src/data/photos.json'), 'utf8'));

const rows = photos
  .map(
    (p) =>
      `| \`${p.file800.replace('/images/', '')}\`<br>\`${p.file1600.replace('/images/', '')}\` | ${p.altJa} | [${p.photographer}](${p.photographerUrl}) | ${p.source}<br>${p.pageUrl} | ${p.licenseUrl} | ${p.checkedDate} | ${p.credit} |`,
  )
  .join('\n');

const notes = photos.map((p) => `- **${p.slot}**：${p.notesJa ?? p.notes}`).join('\n');

const md = `# CREDITS（素材の出典と利用条件）

この制作見本で使っている写真・アイコン・フォント・ライブラリの出典です。
確認できなかった項目は推測で埋めていません。

## 写真（すべて Unsplash の実写素材。AI 生成画像は使っていません）

- 利用条件：Unsplash License（https://unsplash.com/license）
  - 商用・非商用とも無料で利用可。クレジット表記は必須ではない（撮影者への表記は推奨）。
  - 写真をそのまま（大きな加工なしに）販売すること、Unsplash の写真を集めて同種・競合サービスを作ることは不可。
- 各写真ページで「Free to use under the Unsplash License」と表示されていること、Unsplash+（有料）でないこと、
  AI 生成の表示がないことを確認しました（確認日：2026-10-22）。
- 実在店舗の看板・店名・銘柄が読める写真は避け、写り込んだ小さな文字はぼかし・トリミングで除去しています（下の「加工・注意事項」）。
- 顔がはっきり分かる人物写真は使っていません。
- 席紹介の写真（カウンター・座敷・テーブル）は撮影場所がそれぞれ異なります。サイト上でも「素材写真を使ったイメージ」である旨を表示しています。
- 変換：長辺 800px / 1600px の WebP（品質72、メタデータ削除）。\`public/images/\` に配置。

| ファイル | 内容（alt） | 撮影者 | 配布元・元ページ | 利用条件 | 確認日 | クレジット表記 |
|---|---|---|---|---|---|---|
${rows}

### 加工・注意事項

${notes}

## アイコン

- **MingCute Icon**（1セットに統一）
  - 配布元：https://github.com/Richard9394/MingCute ／ Iconify：https://icon-sets.iconify.design/mingcute/
  - ライセンス：Apache License 2.0（https://github.com/Richard9394/MingCute/blob/main/LICENSE）
  - 選んだ理由：線幅2px・角丸で統一された線画アイコンで、定番セット（Font Awesome / Material / Heroicons / Lucide）ほど見慣れておらず、
    小さなサイズでも形が崩れにくく視認性が高いため。電話・カレンダー・時計・地図ピン・人数・席・駐車場・子ども連れ・カード決済・お酒・焼き物（火）などが揃っている。
  - 使用ファイル：\`src/icons/*-line.svg\`（Iconify API から取得した SVG。改変なし）
- **自作アイコン**（MingCute に無いモチーフを、同じ 24px グリッド・線幅2・角丸で作成）
  - \`custom-lantern\`（提灯）、\`custom-tokkuri\`（徳利）、\`custom-noren\`（暖簾）、\`custom-smoking\`（喫煙）、\`custom-no-smoking\`（禁煙）
  - 見出し横の提灯・暖簾のオープニング・黒板の魚の線画も自作です。

## 外部サービスのロゴ（食べログ・LINE・Instagram・X）

- **ロゴは使用していません。** すべてサービス名のテキストボタンで表示しています。
  - アイコン配布サイト（Simple Icons 等）に収録されていることは、各社の利用条件を確認したことにはならないため使っていません。
  - 食べログは公式のロゴ素材・利用条件を確認できなかったため、ロゴを自作・模倣せず文字のボタンにしています。
  - LINE は「友だち追加」ボタン風の配色（緑地に濃い文字）にしていますが、LINE のロゴマークは使っていません。
- 本番導入時に公式ロゴを使う場合は、各社のブランドリソース・ガイドライン（色・余白・最小サイズ・変形禁止など）を確認し、
  公式に配布されている素材をそのまま使ってください。

## フォント（Google Fonts、SIL Open Font License 1.1）

- Shippori Mincho（見出し）、Zen Kaku Gothic New（本文）、Cormorant Garamond（英字の飾り）、Klee One（黒板。使用文字だけを読み込み）
- https://fonts.google.com/ ／ https://openfontlicense.org/

## ライブラリ

- GSAP / ScrollTrigger（https://gsap.com/ 、ライセンス：https://gsap.com/standard-license/ ）
- Vite、TypeScript（MIT / Apache-2.0）
`;
writeFileSync(join(root, 'CREDITS.md'), md);
console.log('CREDITS.md written');
