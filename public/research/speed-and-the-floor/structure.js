/* Headquarter: the societal structure model's own page. Runs the model (sm.js) in the browser; nothing here saves anything. */
(() => {
  if (typeof window.SM === 'undefined') return;
  const SM = window.SM;
  const $ = (id) => document.getElementById(id);
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, txt) => { const e = document.createElementNS(NS, tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, String(v))); if (txt != null) e.textContent = txt; return e; };
  const fmt = (v, d = 1) => (v == null || !isFinite(v) ? '—' : (+v).toFixed(d));
  const pct = (v) => (v == null || !isFinite(v) ? '—' : `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`);
  const COLS = ['#2f6f9e', '#d97a2b', '#3a8f6b', '#7a5ea8', '#b8476a'];
  const root = $('sm-root'); if (!root) return;

  /* ---------- a line chart ---------- */
  const lineChart = (box, series, opts) => {
    box.replaceChildren();
    const W = 600, H = opts.h || 200, L = 40, R = 10, T = 10, Bm = 22;
    const all = series.flatMap((s) => s.v).filter(isFinite);
    if (!all.length) return;
    let lo = opts.min != null ? opts.min : Math.min(...all), hi = opts.max != null ? opts.max : Math.max(...all);
    if (opts.log) { lo = Math.log(Math.max(lo, 1e-3)); hi = Math.log(Math.max(hi, 1e-3)); }
    if (hi - lo < 1e-9) { hi = lo + 1; }
    const n = Math.max(...series.map((s) => s.v.length)) - 1 || 1;
    const X = (i) => L + ((W - L - R) * i) / n, Y = (v) => T + (H - T - Bm) * (1 - ((opts.log ? Math.log(Math.max(v, 1e-3)) : v) - lo) / (hi - lo));
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ml-svg', role: 'img', 'aria-label': opts.label || 'Chart' });
    const ticks = opts.log ? [lo, (lo + hi) / 2, hi].map(Math.exp) : [lo, (lo + hi) / 2, hi];
    ticks.forEach((v) => { svg.append(sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'ml-grid' }), sv('text', { x: L - 5, y: Y(v) + 4, 'text-anchor': 'end', class: 'ml-ax' }, v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))); });
    svg.append(sv('text', { x: L, y: H - 5, class: 'ml-ax' }, '0'), sv('text', { x: W - R, y: H - 5, 'text-anchor': 'end', class: 'ml-ax' }, `period ${n}`));
    (opts.marks || []).forEach((m) => { svg.append(sv('line', { x1: X(m.t), x2: X(m.t), y1: T, y2: H - Bm, class: 'ml-eq' })); if (m.label) svg.append(sv('text', { x: X(m.t) + 3, y: T + 10, class: 'ml-ax' }, m.label)); });
    series.forEach((s) => {
      const d = s.v.map((v, j) => `${j ? 'L' : 'M'}${X(j).toFixed(1)},${Y(isFinite(v) ? v : lo).toFixed(1)}`).join(' ');
      svg.append(sv('path', { d, fill: 'none', stroke: s.c, 'stroke-width': s.w || 2, 'stroke-dasharray': s.dash || '', opacity: s.o || 1 }));
    });
    const tip = mk('div', 'cx-tip'); tip.hidden = true;
    const wrap = mk('div', 'cx-rel'); wrap.append(svg, tip);
    svg.addEventListener('pointermove', (ev) => {
      const r = svg.getBoundingClientRect(); const x = ((ev.clientX - r.left) / r.width) * W; const i = Math.round(((x - L) / (W - L - R)) * n);
      if (i < 0 || i > n) { tip.hidden = true; return; }
      tip.hidden = false; tip.textContent = `Period ${i}: ` + series.filter((s) => !s.noTip).map((s) => `${s.name} ${fmt(s.v[i], opts.dec == null ? 2 : opts.dec)}`).join(' · ');
      tip.style.left = Math.min(r.width - 10, Math.max(0, ((ev.clientX - r.left) - 60))) + 'px'; tip.style.top = '0px';
    });
    svg.addEventListener('pointerleave', () => { tip.hidden = true; });
    box.append(wrap);
    if (!opts.noLegend) { const lg = mk('div', 'ml-leg'); series.filter((s) => !s.noTip).forEach((s) => { const k = mk('span', 'ml-k'); const i = mk('i'); i.style.background = s.c; if (s.dash) i.className = 'dash'; k.append(i, document.createTextNode(s.name)); lg.append(k); }); box.append(lg); }
  };
  const slider = (host, def, onInput) => {
    const l = mk('label', 'ml-s'); const top = mk('span', 'ml-sn'); const val = mk('b', '', fmt(def.v, def.d == null ? 2 : def.d));
    top.append(mk('span', '', def.label), val);
    const r = mk('input'); r.type = 'range'; r.min = def.min; r.max = def.max; r.step = def.step || (def.max - def.min) / 100; r.value = def.v; r.setAttribute('aria-label', def.label);
    r.addEventListener('input', () => { def.v = parseFloat(r.value); val.textContent = fmt(def.v, def.d == null ? 2 : def.d); onInput(); });
    l.append(top, r); host.append(l);
    return { set: (v) => { def.v = v; r.value = v; val.textContent = fmt(v, def.d == null ? 2 : def.d); } };
  };

  /* ================= One society ================= */
  const one = $('sm-one');
  const SL = [
    ['hp', 'Political voice', 0, 1, 0.7], ['he', 'Economic voice', 0, 1, 0.7], ['M', 'Manipulation', 0, 0.8, 0], ['forced', 'Forced saving', 0, 0.5, 0],
    ['tc', 'Consumption tax', 0, 0.4, 0.1], ['effG', 'How well taxes are spent', 0, 1, 0.7], ['rep_will', 'Willingness to repress', 0, 1, 0], ['xr', 'Resource extraction rate', 0, 0.12, 0.03],
  ];
  const SH = [['none', 'No shock'], ['shock', 'Political mistake'], ['eshock', 'Broad economic crisis'], ['pand', 'Pandemic'], ['war', 'War']];
  const st = { preset: 'open', shock: 'none', size: 0.4, when: 60 };
  const defs = {}; SL.forEach(([k, l, a, b, v]) => { defs[k] = { label: l, min: a, max: b, v }; });
  const sz = { label: 'Shock size', min: 0, max: 1, v: 0.4 }, wh = { label: 'When it hits (period)', min: 5, max: 110, v: 60, step: 1, d: 0 };
  const ctrls = {};
  let floorsKey = '';
  const kwOne = () => { const kw = {}; Object.entries(defs).forEach(([k, d]) => { kw[k] = d.v; }); const P = SM.PRESETS[st.preset] || SM.PRESETS.open; Object.keys(P.kw).forEach((k) => { if (!(k in defs)) kw[k] = P.kw[k]; }); return kw; };
  const withShock = (kw) => {
    const k = Object.assign({}, kw); const s = st.shock, v = sz.v, t = Math.round(wh.v);
    if (s === 'shock') Object.assign(k, { shock: v, t0: t });
    if (s === 'eshock') Object.assign(k, { eshock: Math.min(0.8, v), et0: t, etype: 'broad' });
    if (s === 'pand') Object.assign(k, { pand: Math.min(0.8, v), tpand: t });
    if (s === 'war') Object.assign(k, { war: v, twar: t });
    return k;
  };
  const buildOne = () => {
    const top = mk('div', 'ml-top');
    const ps = mk('select'); ps.id = 'sm-preset'; Object.entries(SM.PRESETS).forEach(([k, p]) => { const o = mk('option', '', p.label); o.value = k; ps.append(o); });
    const l1 = mk('label'); l1.append(document.createTextNode('Start from'), ps); top.append(l1);
    const ss = mk('select'); ss.id = 'sm-shock'; SH.forEach(([k, l]) => { const o = mk('option', '', l); o.value = k; ss.append(o); });
    const l2 = mk('label'); l2.append(document.createTextNode('Then hit it with'), ss); top.append(l2);
    one.append(top);
    const g = mk('div', 'ml-sliders'); SL.forEach(([k]) => { ctrls[k] = slider(g, defs[k], runOne); }); slider(g, sz, runOne); slider(g, wh, runOne); one.append(g);
    ps.addEventListener('change', () => { st.preset = ps.value; const P = SM.PRESETS[st.preset].kw; SL.forEach(([k, , , , v]) => ctrls[k].set(k in P ? P[k] : v)); runOne(); });
    ss.addEventListener('change', () => { st.shock = ss.value; runOne(); });
    const c1 = mk('div', 'ml-chart'); c1.id = 'sm-one-y'; const c2 = mk('div', 'ml-chart'); c2.id = 'sm-one-b';
    one.append(mk('div', 'cx-h3', 'Output and consumption per person (log scale)'), c1, mk('div', 'cx-h3', 'Order, belief and rent'), c2);
    const out = mk('p', 'ml-out'); out.id = 'sm-one-out'; one.append(out);
    const fl = mk('div', 'sm-floor'); const fb = mk('button', 'rp-b', 'Find this society’s floors'); fb.type = 'button'; fb.id = 'sm-floor-b';
    const fo = mk('p', 'cx-note'); fo.id = 'sm-floor-o'; fo.textContent = 'The largest political mistake and broad economic crisis, as a share of output, it survives without order collapsing.';
    fl.append(fb, fo); one.append(fl);
    fb.addEventListener('click', () => { fo.textContent = 'Working…'; setTimeout(() => { const kw = kwOne(); const fp = floor(kw, 'shock'), fe = floor(kw, 'eshock'); fo.textContent = `Largest political mistake survived: ${fmt(fp, 2)} of output. Largest broad economic crisis survived: ${fmt(fe, 2)}.`; floorsKey = JSON.stringify(kw); }, 20); });
  };
  const survives = (kw) => { const o = SM.runSociety(kw); return o[o.length - 1].C > 0.5; };
  const floor = (kw, key) => {
    const base = Object.assign({}, kw, key === 'eshock' ? { etype: 'broad', et0: 60 } : { t0: 60 });
    if (!survives(Object.assign({}, base, { [key]: 0 }))) return 0;
    if (survives(Object.assign({}, base, { [key]: 1 }))) return 1;
    let lo = 0, hi = 1; for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2; if (survives(Object.assign({}, base, { [key]: mid }))) lo = mid; else hi = mid; } return lo;
  };
  const runOne = () => {
    const kw = kwOne(); const o = SM.runSociety(withShock(kw)); const base = st.shock === 'none' ? o : SM.runSociety(kw);
    const t = Math.round(wh.v); const marks = st.shock === 'none' ? [] : [{ t, label: SH.find((x) => x[0] === st.shock)[1] }];
    lineChart($('sm-one-y'), [
      { name: 'Output', v: o.map((x) => x.y), c: COLS[0] }, { name: 'Consumption', v: o.map((x) => x.c), c: COLS[1] },
      ...(st.shock !== 'none' ? [{ name: 'Output without the shock', v: base.map((x) => x.y), c: COLS[0], dash: '4 4', o: 0.5, w: 1.2 }] : []),
    ], { log: true, label: 'Output and consumption over time', marks, h: 210 });
    lineChart($('sm-one-b'), [
      { name: 'Order', v: o.map((x) => x.C), c: COLS[2] }, { name: 'Belief', v: o.map((x) => x.b), c: COLS[3] }, { name: 'Rent', v: o.map((x) => x.r), c: COLS[4] },
      ...(o.some((x) => x.rep > 0.01) ? [{ name: 'Repression', v: o.map((x) => x.rep), c: '#888', dash: '3 3' }] : []),
    ], { min: 0, max: 1, label: 'Order, belief and rent over time', marks, h: 170 });
    const l = o[o.length - 1], lb = base[base.length - 1];
    const parts = [];
    if (l.C < 0.5) { const i = o.findIndex((x) => x.C < 0.5); parts.push(`Order collapses at period ${i}.`); }
    else parts.push(`After 120 periods: output ${fmt(l.y)}, consumption ${fmt(l.c)}, belief ${fmt(l.b, 2)}, rent ${fmt(l.r, 2)}.`);
    if (st.shock !== 'none' && l.C >= 0.5) parts.push(`Against the same society with no shock, output ends ${pct(l.y / lb.y - 1)}.`);
    if (st.shock === 'pand' || st.shock === 'war') parts.push(`Deaths: ${fmt(l.deaths * 100, 1)}% of people.`);
    if (defs.xr.v > 0.05) parts.push(`Resources left: ${fmt(l.R * 100, 0)}% of the start.`);
    $('sm-one-out').textContent = parts.join(' ');
    const kk = JSON.stringify(kw); if (kk !== floorsKey) $('sm-floor-o').textContent = 'The largest political mistake and broad economic crisis, as a share of output, it survives without order collapsing.';
  };

  /* ================= Between societies ================= */
  const two = $('sm-two');
  const slots = [
    { preset: 'open', o: 0.8, nat: 0.05, strat: 'elim' },
    { preset: 'reform', o: 0.7, nat: 0.15, strat: 'elim' },
    { preset: 'poor', o: 0.7, nat: 0.1, strat: 'mitig' },
  ];
  const wst = { pand: false, pyear: 60, share: true, conceal: 0, runs: 40 };
  const STRAT = [['elim', 'Eliminate'], ['mitig', 'Mitigate'], ['none', 'Do nothing']];
  const buildTwo = () => {
    const grid = mk('div', 'sm-slots');
    slots.forEach((s, i) => {
      const card = mk('div', 'sm-slot'); card.style.setProperty('--sc', COLS[i]);
      const h = mk('div', 'sm-slot-h'); h.append(mk('i'), mk('b', '', `Society ${i + 1}`)); card.append(h);
      const ps = mk('select'); Object.entries(SM.PRESETS).forEach(([k, p]) => { const o = mk('option', '', p.label); o.value = k; ps.append(o); }); ps.value = s.preset;
      ps.addEventListener('change', () => { s.preset = ps.value; schedule(); });
      const l = mk('label'); l.append(document.createTextNode('Kind of society'), ps); card.append(l);
      const g = mk('div', 'sm-mini');
      slider(g, Object.assign(s.oDef = { label: 'Openness to trade', min: 0, max: 1, v: s.o }), () => { s.o = s.oDef.v; schedule(); });
      slider(g, Object.assign(s.nDef = { label: 'Nationalist narrative', min: 0, max: 1, v: s.nat }), () => { s.nat = s.nDef.v; schedule(); });
      card.append(g);
      const pz = mk('select'); STRAT.forEach(([k, lab]) => { const o = mk('option', '', lab); o.value = k; pz.append(o); }); pz.value = s.strat;
      pz.addEventListener('change', () => { s.strat = pz.value; schedule(); });
      const l2 = mk('label', 'sm-pz'); l2.append(document.createTextNode('If a pandemic comes'), pz); card.append(l2);
      grid.append(card);
    });
    two.append(grid);
    const wbar = mk('div', 'sm-wbar');
    const cb = (label, key) => { const l = mk('label', 'sc-obs'); const c = mk('input'); c.type = 'checkbox'; c.checked = !!wst[key]; c.addEventListener('change', () => { wst[key] = c.checked; schedule(); }); l.append(c, document.createTextNode(' ' + label)); wbar.append(l); return c; };
    cb('A pandemic at period 60', 'pand'); cb('Vaccines are shared', 'share');
    const cc = mk('label', 'sc-obs'); const ci = mk('input'); ci.type = 'checkbox'; ci.addEventListener('change', () => { wst.conceal = ci.checked ? 3 : 0; schedule(); }); cc.append(ci, document.createTextNode(' Society 1 hides the outbreak for 3 weeks')); wbar.append(cc);
    two.append(wbar);
    const c1 = mk('div', 'ml-chart'); c1.id = 'sm-two-c'; two.append(mk('div', 'cx-h3', 'Consumption per person, one run (wars marked)'), c1);
    const tb = mk('div', 'sm-tbl'); tb.id = 'sm-two-t'; two.append(mk('div', 'cx-h3', 'Across 40 runs with war drawn at random'), tb);
    const pz = mk('div', 'sm-tbl'); pz.id = 'sm-two-p'; two.append(pz);
    const out = mk('p', 'ml-out'); out.id = 'sm-two-out'; two.append(out);
  };
  let tmr = null; const schedule = () => { clearTimeout(tmr); tmr = setTimeout(runTwo, 120); };
  const socsNow = () => slots.map((s, i) => ({ name: `Society ${i + 1}`, kw: Object.assign({}, (SM.PRESETS[s.preset] || SM.PRESETS.open).kw), o: s.o, nat: s.nat, strat: s.strat, delay: s.strat === 'mitig' ? 3 : 0 }));
  const table = (box, head, rows) => {
    box.replaceChildren(); const t = mk('table', 'sm-t'); const tr = mk('tr'); head.forEach((h) => tr.append(mk('th', '', h))); const th = mk('thead'); th.append(tr); t.append(th);
    const tbd = mk('tbody'); rows.forEach((r) => { const x = mk('tr'); r.forEach((c, j) => { const td = mk('td', j ? 'n' : '', c); x.append(td); }); tbd.append(x); }); t.append(tbd); box.append(t);
  };
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
  const runTwo = () => {
    const socs = socsNow(); const kw = { pand_year: wst.pand ? wst.pyear : null, share_vax: wst.share, conceal: wst.conceal, pand_origin: 0 };
    const one = SM.world(socs, Object.assign({ seed: 1 }, kw));
    const marks = one.events.filter((e) => e.kind === 'war').map((e) => ({ t: e.t, label: `war ${e.a + 1}–${e.b + 1}` }));
    if (wst.pand) marks.push({ t: wst.pyear, label: 'pandemic' });
    lineChart($('sm-two-c'), one.hist.map((h, i) => ({ name: `Society ${i + 1}`, v: h.map((x) => x.c), c: COLS[i] })), { log: true, marks, label: 'Consumption per person in each society', h: 210 });
    const R = []; for (let s = 0; s < wst.runs; s++) R.push(SM.world(socs, Object.assign({ seed: 100 + s }, kw)));
    const wars = R.map((r) => r.events.filter((e) => e.kind === 'war').length);
    const rows = socs.map((s, i) => {
      const c = med(R.map((r) => r.hist[i][119].c)), nu = med(R.map((r) => r.hist[i].slice(60).reduce((a, x) => a + x.nu, 0) / 60));
      const fail = R.filter((r) => r.hist[i][119].C < 0.5).length / R.length, N = med(R.map((r) => r.hist[i][119].N));
      return [`${i + 1}: ${(SM.PRESETS[slots[i].preset] || {}).label}`, fmt(c), fmt(N, 2), fmt(nu, 2), `${Math.round(fail * 100)}%`];
    });
    table($('sm-two-t'), ['Society', 'Consumption', 'People', 'Nationalism', 'Loses order'], rows);
    const P = $('sm-two-p'); P.replaceChildren();
    if (one.pand) table(P, ['Pandemic', 'Deaths per million', 'Output lost (points, 2 years)', 'Weeks of strict measures'], one.pand.map((r, i) => [`Society ${i + 1} · ${STRAT.find((x) => x[0] === slots[i].strat)[1]}`, Math.round(r.deaths * 1e6).toLocaleString(), fmt(r.cost * 100), String(r.strict_weeks)]));
    $('sm-two-out').textContent = `Wars per 120 years: ${fmt(wars.reduce((a, b) => a + b, 0) / wars.length)} on average. Each pair's risk rises with both sides' nationalism and falls with the trade between them; openness to everyone else raises it a little.`;
  };

  /* ================= The final table, worked out live ================= */
  const TBL = [
    ['Open, educated, honest', {}], ['Open, no taxes', { tc: 0, tk: 0 }], ['Open, heavy consumption tax (35%)', { tc: 0.35, tk: 0 }], ['Open, heavy tax (35%), badly spent', { tc: 0.35, tk: 0, effG: 0.3 }], ['Open but manipulated', { M: 0.5 }],
    ['Reform China: forced saving, narrow political voice', { forced: 0.42, he: 0.6, hp: 0.1 }], ['Reform China, repressing', { forced: 0.42, he: 0.6, hp: 0.1, rep_will: 1 }],
    ['Closed planner', { forced: 0.40, he: 0.15, hp: 0.1 }], ['Closed planner, repressing', { forced: 0.40, he: 0.15, hp: 0.1, rep_will: 1 }],
    ['Extractive: taxes leak to rent', { hp: 0.15, he: 0.3, r0: 0.4, leak0: 0.6, effG: 0.3 }],
  ];
  const buildTable = () => {
    const box = $('sm-final'); if (!box) return;
    const rows = TBL.map(([name, kw]) => {
      const o = SM.runSociety(kw); const l = o[o.length - 1]; const okk = l.C > 0.5;
      const g = (a, b) => { let t = 0; for (let i = a; i < b; i++) t += Math.log(Math.max(o[i].y, 1e-9) / Math.max(o[i - 1].y, 1e-9)) * 100; return t / (b - a); };
      return [name, okk ? `${fmt(g(1, 21))} / ${fmt(g(61, 120))}` : 'fragments', okk ? fmt(l.y, 1) : '', okk ? fmt(l.c, 1) : '', fmt(l.b, 2), fmt(floor(kw, 'shock'), 2), fmt(floor(kw, 'eshock'), 2)];
    });
    table(box, ['Society', 'Growth early / late (% a year)', 'Output', 'Consumption', 'Belief', 'Largest political mistake survived', 'Largest economic crisis survived'], rows);
  };

  /* ================= Earlier versions, moved from the Math lab ================= */
  let vSig = '';
  const paintVersions = () => {
    const ul = $('sm-versions'); if (!ul) return;
    let d; try { d = dash.data('world_math'); } catch (e) { d = null; }
    if (!d || d.status !== 'ok') { if (!vSig) ul.replaceChildren(mk('li', 'cx-note', 'Loading…')); return; }
    const list = (d.data || []).filter((x) => x.model === 'bw-entropy-model').sort((a, b) => String(a.order || a.title).localeCompare(String(b.order || b.title), undefined, { numeric: true }));
    const sig = JSON.stringify(list.map((x) => [x.id, x.updated])); if (sig === vSig) return; vSig = sig;
    ul.replaceChildren(); const sum = $('sm-v-sum'); if (sum) sum.textContent = `${list.length} versions`;
    if (!list.length) { ul.append(mk('li', 'cx-note', 'No earlier versions saved.')); return; }
    list.forEach((x) => {
      const li = mk('li', 'pb-i'); const top = mk('div', 'pb-top'); top.append(mk('b', 'pb-t', x.title || 'Untitled')); if (x.updated) top.append(mk('span', 'cx-note', x.updated)); li.append(top);
      if (x.note) li.append(mk('p', 'pb-n', x.note));
      const dd = mk('details', 'pb-x'); dd.append(mk('summary', '', 'Settings and rules'));
      const pre = mk('pre', 'sm-pre'); pre.textContent = `${x.params || ''}\n\n${x.rules || ''}`; dd.append(pre); li.append(dd); ul.append(li);
    });
  };

  buildOne(); runOne(); buildTwo(); runTwo();
  let tableBuilt = false;
  const lazyTable = () => { if (tableBuilt) return; const box = $('sm-final'); if (!box || box.closest('.cx-off')) return; tableBuilt = true; box.replaceChildren(mk('p', 'cx-note', 'Working it out…')); setTimeout(buildTable, 30); };
  window.addEventListener('hashchange', lazyTable); document.addEventListener('click', () => setTimeout(lazyTable, 50)); lazyTable();
  try { dash.onData(() => { try { paintVersions(); } catch (e) { /* stays */ } lazyTable(); }); } catch (e) { /* none */ }
  paintVersions();
})();
