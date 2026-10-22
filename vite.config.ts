import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { SITE } from './src/config/site';
import { head, header, footer, actionBar, demoDialog, noren, bootScript, fillKleeText, type Page } from './src/templates/layout';
import { homeMain, boardText } from './src/templates/home';
import { reserveMain } from './src/templates/reserve';
import { adminMain } from './src/templates/admin';

const demoSuffix = SITE.mode === 'demo' ? '｜架空店舗の制作見本' : '';

const META: Record<Page, { title: string; description: string }> = {
  home: {
    title: `${SITE.name}（${SITE.nameRuby}）｜${SITE.genre}${demoSuffix}`,
    description:
      SITE.mode === 'demo'
        ? `架空店舗の制作見本です。炭火の炉端焼きと地酒の居酒屋「${SITE.name}」を想定した、スマホで予約まで体験できるホームページの見本です。`
        : `${SITE.lead} ${SITE.access}。${SITE.hours.open}〜${SITE.hours.close}、${SITE.closedLabel}定休。`,
  },
  reserve: {
    title: `ご予約｜${SITE.name}${demoSuffix}`,
    description:
      SITE.mode === 'demo'
        ? `架空店舗の制作見本です。人数・日付・時間・席を選ぶWeb予約の流れを体験できます（実際の予約・送信は行われません）。`
        : `${SITE.name}のWeb予約。人数・日付・時間・席をお選びください。`,
  },
  admin: {
    title: `予約管理｜${SITE.name}${demoSuffix}`,
    description: `架空店舗の制作見本です。お店側の予約管理画面の操作見本です。`,
  },
};

/** index.html 内の <!--render:xxx--> を、src/templates の出力に置き換える */
function templates(): Plugin {
  const render = (page: Page, key: string): string => {
    switch (key) {
      case 'head':
        return bootScript(page === 'home') + head({ page, ...META[page] });
      case 'header':
        return header(page);
      case 'footer':
        return footer();
      case 'actionbar':
        return actionBar(page);
      case 'dialogs':
        return demoDialog();
      case 'noren':
        return page === 'home' ? noren() : '';
      case 'main':
        return page === 'home' ? homeMain() : page === 'reserve' ? reserveMain() : adminMain();
      default:
        throw new Error(`unknown render key: ${key}`);
    }
  };
  return {
    name: 'site-templates',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page: Page = ctx.path.startsWith('/reserve') ? 'reserve' : ctx.path.startsWith('/admin') ? 'admin' : 'home';
        const out = html.replace(/<!--render:([a-z]+)-->/g, (_, key: string) => render(page, key));
        return page === 'home' ? fillKleeText(out, boardText()) : out;
      },
    },
  };
}

export default defineConfig({
  plugins: [templates()],
  define: {
    __SITE_MODE__: JSON.stringify(SITE.mode),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        reserve: resolve(__dirname, 'reserve/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
});
