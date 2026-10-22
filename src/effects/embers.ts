// 炭火の火の粉：少数の粒子が下からゆらゆら昇る。
// スマホでは粒子数とフレームレートを下げ、画面外・タブ非表示では停止する。

interface Ember {
  x: number;
  y: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  phase: number;
  sway: number;
}

export function startEmbers(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const small = window.matchMedia('(max-width: 767px)').matches;
  const lowPower = (navigator.hardwareConcurrency ?? 4) <= 4;
  const count = small || lowPower ? 8 : 16;
  const frameMs = small || lowPower ? 1000 / 30 : 1000 / 60;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0;
  let h = 0;

  // サイズは ResizeObserver から受け取る（読み込み中に強制レイアウトを起こさない）
  const resize = (width: number, height: number) => {
    w = width;
    h = height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = (e: Partial<Ember> = {}): Ember => ({
    x: w * (0.15 + Math.random() * 0.7),
    y: h * (0.85 + Math.random() * 0.2),
    vy: 0.25 + Math.random() * 0.45,
    r: 0.8 + Math.random() * 1.6,
    life: 0,
    max: 260 + Math.random() * 260,
    phase: Math.random() * Math.PI * 2,
    sway: 0.3 + Math.random() * 0.6,
    ...e,
  });

  const embers: Ember[] = [];

  let raf = 0;
  let last = 0;
  let visible = true;

  const tick = (t: number) => {
    raf = requestAnimationFrame(tick);
    if (t - last < frameMs) return;
    const step = Math.min((t - last) / 16.7, 3);
    last = t;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.life += step;
      e.y -= e.vy * step;
      e.x += Math.sin(e.phase + e.life * 0.02) * e.sway * 0.4 * step;
      const p = e.life / e.max;
      if (p >= 1 || e.y < -10) {
        embers[i] = spawn();
        continue;
      }
      // 出始めと消え際をなめらかに
      const a = Math.sin(Math.PI * p) * 0.85;
      ctx.fillStyle = `rgba(255, 168, 92, ${a * 0.18})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 196, 130, ${a})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const run = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) run();
    else stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));
  new ResizeObserver(([en]) => {
    resize(en.contentRect.width, en.contentRect.height);
    if (!embers.length) embers.push(...Array.from({ length: count }, () => spawn({ life: Math.random() * 300 })));
    run();
  }).observe(canvas);
}
