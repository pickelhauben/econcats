/* The societal structure model (Blut und Wille), version 3, in the browser (public-spending returns retuned November 27, 2026).
   A faithful port of model_v3.py (one society), epidemic.py (a pandemic week by week) and intl.py (several societies).
   No dependencies. Exposes window.SM = { B, I, E, society, runSociety, epidemic, world, PRESETS }. */
(function (root) {
  'use strict';
  const B = {
    bK: 1 / 3, gR: 0.08, dK: 0.05, mincer: 0.10, w: 0.65, N: 1.0, R: 1.0,
    A0: 0.15, AF0: 1.0, gF: 0.015, iota: 0.085, inv_imit: 0.15, theta: 0.02, lam: 0.75, beta: 2.0,
    he: 0.7, hp: 0.7, M: 0.0, cm: 0.5, cp: 0.6, q0: 0.5, kbad: 2, alpha: 0.8, r0: 0.2, rmax: 0.6, drift: 0.01,
    rho: 0.03, sig: 2.0, forced: 0.0, tc: 0.10, tk: 0.05, eps_s: 1.0, eps_d: 0.5, dwl: 1.5,
    sh_ed: 0.4, sh_inf: 0.3, sh_ord: 0.3, leak0: 0.3, effG: 0.7, S0: 6, priv_ed: 0.5, g_priv: 0.3, ed_inc: 0.3, ed_pub: 3, g_el: 0.08,
    tau: 0.05, delta: 0.3, lnN: 6.9, sigma: 1.0, kap: 0.2, lam_o: 0.05, alphaB: 0.05, betaB: 0.50, P: 1.0,
    chi: 0.05, Dstar: 0.4, zeta: 0.06, ord_w: 8.0, rev_k: 0.5, bcrit: 0.3,
    shock: 0.0, t0: 60, fix: 0.2, T: 120,
    eshock: 0.0, etype: 'broad', w_pe: 1.20, scar: 1.30, mem: 0.8, demo: 0.0, et0: 60, fix_e: 0.163, own: 0.15, own_c: 0.35,
    rep_will: 0.0, hcap: null, n0: 0.012, n_min: 0.002, pand: 0.0, tpand: 60, psi_h: 2.0, disr: 2.5, war: 0.0, twar: 60, wdur: 3,
    xr: 0.03, R0: 1.0, regen: 0.02, disc: 0.5, pol: 0.02, clean: 0.0, c_clean: 0.03, dmg: 0.5, hart: 0.0,
    rep_eff: 0.3, rep_cost: 0.10, rep_res: 0.04, rep_chill: 0.5, rep_rent: 0.2,
  };
  const REF = {};
  const clamp = (x, a, b) => Math.min(Math.max(x, a), b);

  /* One society, one period at a time. step(X) takes the effects other societies have on it this period. */
  function society(kw) {
    const p = Object.assign({}, B, kw || {});
    let A = p.A0, AF = p.AF0, r = p.r0, S = p.S0;
    const h = (s) => Math.exp(p.mincer * s);
    let N = p.N, L = p.w * N, Rs = p.R0, Zp = 0, wint = 0; const AF0 = p.AF0; let wleft = 0, pdis = 0, deaths = 0;
    let K = Math.pow(0.25 * p.alpha * A * Math.pow(h(S) * L, 1 - p.bK - 0.05) / p.dK, 1 / (1 - p.bK)) * 0.5;
    let ge = 0.02, co_prev = null, cw_prev = null, cw_raw = null, emig = 0, m_exit = 0;
    let g = 0.02, Gk = 0.3, C = 0.9, b = 0.6, D = 0.6, t = 0;
    const step = (X) => {
      X = X || {};
      const health = (AF / AF0) * (S / 12);
      if (p.pand > 0 && t === p.tpand) {
        const hc = p.hcap == null ? health : p.hcap; const mu = p.pand / (1 + p.psi_h * hc);
        N *= 1 - mu; deaths += mu; pdis = p.disr * mu / (1 + 3 * mu);
        r = Math.min(p.rmax, Math.max(0, r + mu * (0.4 - p.hp * (1 - p.M)))); D = Math.min(1, D + 0.5 * mu);
      }
      if ((X.pand_mu || 0) > 0) {
        const mu = X.pand_mu; N *= 1 - mu; deaths += mu; pdis = Math.max(pdis, X.pand_loss || 0);
        r = Math.min(p.rmax, Math.max(0, r + mu * (0.4 - p.hp * (1 - p.M)))); D = Math.min(1, D + 0.5 * mu);
      }
      if ((X.war || 0) > 0) {
        const w_ = X.war; K *= 1 - 0.25 * w_; N *= 1 - 0.10 * w_; deaths += 0.10 * w_; Gk *= 1 - 0.3 * w_; A *= 1 - 0.05 * w_;
        wleft = Math.max(wleft, p.wdur); wint = w_; b = Math.min(1, b + 0.1 * w_);
      }
      if ((X.conquest || 0) !== 0) {
        const q_ = X.conquest; N *= 1 + q_; K *= 1 + q_; Rs *= 1 + q_;
        if (q_ < 0) { b = Math.max(0, b + 2 * q_); r = Math.min(p.rmax, r - q_); }
      }
      if ((X.mig || 0) !== 0) { N *= 1 + X.mig; S = S + X.mig * ((X.S_in == null ? S : X.S_in) - S) / Math.max(1 + X.mig, 1e-6); }
      if (p.war > 0 && t === p.twar) {
        wint = p.war; K *= 1 - 0.25 * p.war; N *= 1 - 0.10 * p.war; deaths += 0.10 * p.war; Gk *= 1 - 0.3 * p.war; A *= 1 - 0.05 * p.war; wleft = p.wdur;
        b = Math.min(1, b + 0.1 * p.war);
      }
      L = p.w * N;
      const M = p.M, T = p.tc + p.tk;
      const corr = Math.min(1, p.cm * p.he + p.w_pe * p.cp * p.hp * (1 - M)), corrp = Math.min(1, p.cp * p.hp * (1 - M) + 0.05);
      let hit = Math.min(0.9, p.shock * (1.5 - corrp)) * clamp(t - p.t0, 0, 1) * Math.exp(-p.fix * corrp * Math.max(0, t - p.t0));
      const edec = clamp(t - p.et0, 0, 1) * Math.exp(-p.fix_e * corr * Math.max(0, t - p.et0));
      const e_out = p.etype === 'broad' ? p.eshock * edec : 0, e_own = p.etype === 'narrow' ? p.eshock * edec : 0;
      hit = 1 - (1 - hit) * (1 - e_out);
      const E = p.xr * Rs;
      let Y0 = p.alpha * A * Math.pow(K, p.bK) * Math.pow(h(S) * L, 1 - p.bK - p.gR) * Math.pow(Math.max(E, 1e-9) / 0.03, p.gR);
      Y0 *= (1 - p.c_clean * p.clean) / (1 + p.dmg * Zp * Zp);
      Y0 *= 1 - Math.min(0.9, pdis);
      if (wleft > 0) Y0 *= 1 - 0.3 * wint;
      Y0 *= 1 - (X.pand_cost || 0);
      const Yp = Y0 * (1 - p.dwl * 0.5 * (p.tc * p.tc + 2 * p.tk * p.tk)) * Math.pow((p.g_priv + Gk) / (p.g_priv + 0.3), p.g_el) * (1 - hit);
      const Y = Yp * C;
      const Yd = Y * (1 - (X.mil || 0)) * (1 - (X.fdi_out || 0));
      const sR = p.bK * (1 - r) * (1 - p.tk) * (p.dK + g) / (p.rho + p.dK + p.sig * g); const s = Math.max(sR, p.forced);
      const leak = p.leak0 * (1 - p.hp * (1 - M)), useful = T * (1 - r) * (1 - leak) * p.effG;
      const inc = p.eps_s / (p.eps_s + p.eps_d), price = 1 + p.tc * inc;
      const cons = (1 - s) * (1 - r) * (1 - p.tk) * Yd * (1 - p.tc * (1 - inc)) / price / N;
      if (REF.y == null) { REF.y = Yp / N; REF.c = cons; }
      const yhat = 4.5 * (Yp / N) / REF.y, chat = 1.5 * cons / REF.c;
      const chat_free = chat * (1 - sR) / (1 - s);
      const rep = Math.min(1, p.rep_will * Math.max(0, p.bcrit + 0.2 - b) / 0.5);
      const sc = yhat / 4.5 / Math.max(1 - hit, 0.1);
      const lnNe = p.lnN + Math.log(Math.max(N, 1e-6)); const f = (p.tau + p.delta * D * (1 - b)) * lnNe * sc;
      const m = (1 - r) * (1 - T) * yhat * 0.9 * (1 - p.rep_cost * rep) + p.ord_w * useful * p.sh_ord * sc - f;
      const sigma_t = p.sigma * Math.sqrt(sc); const bm = 0.5 * M * (1 - b);
      const c_o = chat * p.own_c / p.own * (1 - 0.3 * Math.min(0.9, e_own)), c_w = chat * (1 - p.own_c) / (1 - p.own);
      const fo = chat > 0 ? chat_free / chat : 1;
      if (co_prev == null) { co_prev = c_o; cw_prev = c_w; }
      const eo = co_prev * (1 + ge); let ew = cw_prev * (1 + ge);
      ge = 0.8 * ge + 0.2 * Math.max(-0.1, Math.min(0.15, cw_raw != null ? (c_w / Math.max(cw_raw, 1e-9) - 1) : 0.02));
      cw_raw = c_w;
      co_prev = (p.mem * co_prev + (1 - p.mem) * c_o) * (1 + ge); cw_prev = (p.mem * cw_prev + (1 - p.mem) * c_w) * (1 + ge);
      m_exit = 0;
      if (X.nb) {
        const cw_nb = 1.5 * X.nb.c / REF.c * (1 - p.own_c) / (1 - p.own);
        ew = ew * (1 + p.demo * Math.max(0, Math.log(Math.max(cw_nb, 1e-9) / Math.max(ew, 1e-9))));
      }
      const g_o = Math.max(0, p.P * Math.max(0.7 * eo + 0.3 * c_o * fo, 1e-6) - c_o) / Math.max(eo, 1e-6);
      const g_w = Math.max(0, p.P * Math.max(0.7 * ew + 0.3 * c_w * fo, 1e-6) - c_w) / Math.max(ew, 1e-6);
      const gap_ = 1.5 * (p.own * g_o + (1 - p.own) * g_w) * (1 - Math.min(0.5, m_exit * 100));
      C = clamp(C + p.kap * (C * (m + p.delta * D * bm * lnNe * sc) - sigma_t) / Math.max(Math.sqrt(sc), 1e-6) - p.lam_o * C + p.rep_eff * rep * (1 - C), 0, 1);
      b = clamp(b + p.alphaB * (1 - b) * (1 - rep) - p.betaB * (1 + M) * gap_ * b - p.rep_res * rep * b, 0, 1);
      D = clamp(D + p.chi * p.hp * (1 - M) * (p.Dstar - D) + p.zeta * M * (1 - D) * 0.2, 0, 1);
      const Starget = 3 + 13 * (1 - Math.exp(-Math.max(0, p.priv_ed + p.ed_inc * Math.log(Math.max(yhat, 1e-9) / 4.5) * (1 - r) + p.ed_pub * useful * p.sh_ed)));
      S = S + 0.05 * (Starget - S) - 3 * m_exit * S / 10;
      Gk = Gk + useful * p.sh_inf - 0.05 * Gk;
      const q = (p.q0 + (1 - p.q0) * S / (S + 6)) * (1 - 0.5 * M); const sel = Math.max(-1, q - p.kbad * (1 - q) * (1 - corr));
      const a = A / AF; const he_eff = p.he * (1 - p.rep_chill * rep);
      const imit = p.iota * Math.max(0, 1 - a) * (1 + p.inv_imit * s / 0.25) * (S / 12) * (0.5 + 0.5 * he_eff) * C * (1 + (X.diff || 0));
      const RD = Math.max(1e-9, he_eff * (S / 12) * N); const near = a < 1 ? a * a : Math.pow(a, -p.beta);
      const innov = p.theta * Math.pow(RD, p.lam) * sel * Math.pow(1 - r, 2) * near * C;
      if (t === p.et0 + 1 && p.etype === 'broad') A = A * Math.max(0.2, 1 - p.scar * p.eshock * (1.5 - corr));
      A = A * (1 + imit + innov); AF = AF * (1 + p.gF); g = 0.8 * g + 0.3 * (imit + innov);
      K = K + s * (1 - r) * (1 - p.tk) * Yd + (X.fdi_in || 0) * Y + p.hart * p.gR * (1 - r) * Y - p.dK * K;
      const yh = 4.5 * (Y / N) / REF.y; const n = p.n_min + (p.n0 - p.n_min) * Math.exp(-Math.max(yh - 4.5, 0) / 6);
      N *= 1 + n;
      Rs = Math.max(0, Rs - E + p.regen * Rs * (1 - Rs / Math.max(p.R0, 1e-9)) + p.disc * p.gF * Rs * 0.1);
      Zp = Math.max(0, Zp + p.pol * (E / 0.03) * (1 - p.clean) - 0.02 * Zp);
      pdis *= 0.4; wleft = Math.max(0, wleft - 1);
      const conc = p.rev_k * Math.max(0, p.bcrit - b) * r * (1 - rep);
      r = Math.min(p.rmax, Math.max(0, r + p.drift * (p.rmax - r) * (1 - p.hp * (1 - M)) - 0.02 * p.hp * (1 - M) * r - 0.1 * Math.max(innov, 0) * r + 0.05 * leak * T - conc + 0.01 * p.rep_rent * rep * (p.rmax + 0.2 - r)));
      const snap = { t, N, K, A, AF, Yp, R: Rs, Z: Zp, deaths, health, y: Y / N, c: cons, C, b, D, r, s, S, a: A / AF, rep, sR, yhat, M, hp: p.hp, he: p.he, mil: X.mil || 0 };
      t++; return snap;
    };
    return { step, p };
  }
  function runSociety(kw) { const s = society(kw); const out = []; const T = (kw && kw.T) || B.T; for (let i = 0; i < T; i++) out.push(s.step({})); return out; }

  /* ---- A pandemic, week by week, across several societies (fitted to COVID-19 outcomes in the OECD) ---- */
  const E = { R0: 2.6, ifr0: 0.03, psi: 2.0, Icap: 0.004, imp: 0.2, c_elim: 0.8, c_mit: 0.64, c_vol: 0.35, c_trace: 0.6, theta: 1e-5,
    kc: 0.07, kb: 0.008, spill: 0.3, kd: 1.0, wvax: 50, vax_speed: 0.03, vax_eff: 0.85, var_rate: 0.4, weeks: 104, I0: 2e-6, hosp: 3.0 };
  function epidemic(socs, origin, conceal, shareVax, e) {
    e = Object.assign({}, E, e || {}); const n = socs.length; origin = origin || 0; conceal = conceal || 0; shareVax = shareVax !== false;
    const S = new Array(n).fill(1), I = new Array(n).fill(0), V = new Array(n).fill(0), dead = new Array(n).fill(0), cost = new Array(n).fill(0), strict = new Array(n).fill(0), aware = new Array(n).fill(null);
    I[origin] = e.I0; let varmult = 1, tot = 0; const weekly = socs.map(() => []);
    for (let w = 0; w < e.weeks; w++) {
      for (let i = 0; i < n; i++) if (aware[i] == null && (w >= conceal || (i === origin && I[i] > e.theta * 5))) aware[i] = w;
      const nw = new Array(n).fill(0);
      socs.forEach((s, i) => {
        const act = aware[i] != null && w >= aware[i] + s.delay; const load = Math.min(1, I[i] / e.Icap);
        let c, bord;
        if (!act) { c = e.c_vol * load * 0.5; bord = 0; }
        else if (s.strat === 'elim') { c = I[i] > e.theta ? e.c_elim : e.c_trace; bord = 0.995; }
        else if (s.strat === 'mitig') { c = e.c_mit * Math.min(1, 0.3 + load); bord = 0.3; }
        else { c = e.c_vol * load; bord = 0; }
        const Reff = e.R0 * varmult * (1 - c) * (1 - V[i] * e.vax_eff / varmult);
        let im = 0; for (let j = 0; j < n; j++) if (j !== i) im += I[j] * socs[j].open; im = e.imp * s.open * (1 - bord) * im / Math.max(n - 1, 1);
        nw[i] = Math.min(S[i] * 0.5, (Reff * I[i] + im) * S[i]);
        const over = 1 + Math.min(1, e.hosp * Math.max(0, I[i] / e.Icap - 1));
        dead[i] += nw[i] * e.ifr0 / (1 + e.psi * s.health) * over * (1 - 0.8 * V[i]);
        const strictNow = c > e.c_trace + 1e-9 || (s.strat !== 'elim' && c > 0.3);
        cost[i] += (e.kc * (strictNow || s.strat !== 'elim' ? c : 0.15 * c) + e.kb * bord + e.kd * Math.min(I[i], 0.05)) / 52;
        if (strictNow) strict[i]++;
        if (w >= e.wvax) { const sp = e.vax_speed * (s.rich > 0.6 ? 1 : (shareVax ? 0.6 : 0.2)); V[i] = Math.min(0.9, V[i] + sp); }
      });
      for (let i = 0; i < n; i++) { S[i] -= nw[i]; I[i] = nw[i]; tot += nw[i]; weekly[i].push(nw[i]); }
      varmult = 1 + e.var_rate * Math.min(1, tot / (0.6 * n));
    }
    const own = cost.slice();
    for (let i = 0; i < n; i++) { let sp = 0; for (let j = 0; j < n; j++) if (j !== i) sp += own[j] * socs[j].open; cost[i] = own[i] + e.spill * socs[i].open * sp / Math.max(n - 1, 1); }
    return socs.map((_, i) => ({ deaths: dead[i], cost: cost[i], strict_weeks: strict[i], infected: 1 - S[i], weekly: weekly[i] }));
  }

  /* ---- Several societies: trade, investment, migration, nationalism, war, pandemics ---- */
  const I = { phi: 0.3, kF: 0.03, mu_m: 0.003, sel_m: 1.2, nu_speed: 0.2, nu_M: 0.6, nu_b: 0.5, nu_threat: 0.3, nu_cool: 0.5,
    mil0: 0.015, mil_nu: 0.06, close_nu: 0.7, h0: 0.012, kH: 1.5, kB: 0.8, kMul: 0.5, w_int: 0.4, w_dur: 3, conq_ratio: 1.5, conq_k: 0.15,
    trust_war: 0.2, trust_rec: 0.05, demo: 0.2, pand_year: null, pand_origin: 0, conceal: 0, share_vax: true, T: 120, seed: 0 };
  const rng = (seed) => { let a = (seed + 1) * 2654435761 >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  function world(socs, kw) {
    const q = Object.assign({}, I, kw || {}); const n = socs.length; const rand = rng(q.seed);
    const sims = socs.map((s) => society(Object.assign({}, s.kw || {}, { T: q.T, demo: q.demo })));
    let snap = new Array(n).fill(null); const nu = socs.map((s) => (s.nat == null ? 0.2 : s.nat));
    const trust = socs.map(() => new Array(n).fill(1)), warleft = socs.map(() => new Array(n).fill(0)), F = new Array(n).fill(0);
    const hist = socs.map(() => []), events = []; let pend = socs.map(() => ({})), pandRes = null;
    for (let t = 0; t < q.T; t++) {
      const X = pend.map((x) => Object.assign({}, x)); pend = socs.map(() => ({}));
      if (t > 0) {
        const y = snap.map((s) => Math.max(s.y, 1e-9)), c = snap.map((s) => Math.max(s.c, 1e-9));
        snap.forEach((s, i) => {
          let threat = 0; for (let j = 0; j < n; j++) if (j !== i) threat = Math.max(threat, nu[j]);
          let tgt = (socs[i].nat == null ? 0.2 : socs[i].nat) + q.nu_M * s.M * (1 - s.b) + q.nu_b * Math.max(0, 0.5 - s.b) * (1 - s.hp) + q.nu_threat * threat;
          tgt *= 1 - q.nu_cool * s.hp * (1 - s.M);
          if (warleft[i].some((v) => v > 0)) tgt += 0.3;
          nu[i] = clamp(nu[i] + q.nu_speed * (Math.min(1, tgt) - nu[i]), 0, 1);
        });
        const atwar = socs.map((_, i) => warleft[i].some((v) => v > 0));
        const O = socs.map((s, i) => (s.o == null ? 0.5 : s.o) * (1 - q.close_nu * nu[i]) * (atwar[i] ? 0.2 : 1));
        const T = socs.map((_, i) => socs.map((__, j) => (i !== j ? O[i] * O[j] * trust[i][j] * (warleft[i][j] > 0 ? 0 : 1) : 0)));
        snap.forEach((s, i) => {
          X[i].mil = q.mil0 + q.mil_nu * nu[i] + (atwar[i] ? 0.1 : 0);
          let fin = 0; for (let j = 0; j < n; j++) if (j !== i) fin += Math.min(0.05, q.kF * T[i][j] * Math.max(0, Math.log(y[j] / Math.max(y[i], 1e-12))));
          X[i].fdi_in = fin; F[i] = F[i] + fin * s.y * s.N - 0.05 * F[i]; X[i].fdi_out = Math.min(0.3, (1 / 3) * F[i] / Math.max(s.K, 1e-9));
          X[i].diff = Math.max(-0.8, q.phi * Math.log(Math.max(O[i], 0.02) / 0.5));
          let mig = 0, Sin = s.S;
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const out_ = q.mu_m * Math.min(O[i], O[j]) * (1 - nu[j]) * Math.max(0, Math.log(c[j] / Math.max(c[i], 1e-12)));
            const in_ = q.mu_m * Math.min(O[i], O[j]) * (1 - nu[i]) * Math.max(0, Math.log(c[i] / Math.max(c[j], 1e-12))) * snap[j].N / s.N;
            mig += in_ - out_; if (in_ > 0) Sin = snap[j].S * q.sel_m;
          }
          X[i].mig = mig; X[i].S_in = mig > 0 ? Sin : s.S;
          let k = -1; for (let j = 0; j < n; j++) if (j !== i && (k < 0 || y[j] > y[k])) k = j;
          if (k >= 0) X[i].nb = { y: snap[k].y, c: snap[k].c, C: snap[k].C };
        });
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
          warleft[i][j] = Math.max(0, warleft[i][j] - 1); warleft[j][i] = Math.max(0, warleft[j][i] - 1);
          if (warleft[i][j] > 0) { continue; }
          const multi = (O[i] + O[j]) / 2 * (1 - Math.min(1, T[i][j] * 4));
          const hz = q.h0 * (1 + q.kH * (nu[i] + nu[j])) * (1 - q.kB * Math.min(1, T[i][j] * 4)) * (1 + q.kMul * multi);
          if (rand() < hz) {
            warleft[i][j] = warleft[j][i] = q.w_dur; X[i].war = X[j].war = q.w_int; trust[i][j] = trust[j][i] = q.trust_war;
            const P = [i, j].map((k) => snap[k].y * snap[k].N * X[k].mil * (0.5 + 0.5 * snap[k].b));
            const win = P[0] > P[1] ? i : j, lose = win === i ? j : i; const ratio = Math.max(...P) / Math.max(Math.min(...P), 1e-12);
            if (ratio > q.conq_ratio) { const qq = q.conq_k * (1 - 1 / ratio); X[lose].conquest = -qq; X[win].conquest = qq * snap[lose].N / snap[win].N; }
            events.push({ t, kind: 'war', a: i, b: j, winner: ratio > q.conq_ratio ? win : null });
          }
          trust[i][j] = trust[j][i] = Math.min(1, trust[i][j] + q.trust_rec);
        }
        if (q.pand_year != null && t === q.pand_year) {
          const ymax = Math.max(...snap.map((s) => s.yhat));
          const es = socs.map((s, i) => ({ strat: s.strat || 'mitig', delay: s.delay == null ? 2 : s.delay, open: O[i], health: snap[i].AF * snap[i].S / 12, rich: Math.min(1, snap[i].yhat / ymax) }));
          pandRes = epidemic(es, q.pand_origin, q.conceal, q.share_vax);
          pandRes.forEach((r, i) => {
            X[i].pand_mu = 0.6 * r.deaths; X[i].pand_cost = 0.6 * r.cost; pend[i] = { pand_mu: 0.4 * r.deaths, pand_cost: 0.4 * r.cost };
            if (es[i].strat === 'none') for (let j = 0; j < n; j++) if (j !== i) { trust[i][j] *= 0.7; trust[j][i] = trust[i][j]; }
          });
          events.push({ t, kind: 'pandemic', res: pandRes });
        }
      }
      sims.forEach((s, i) => { const o = s.step(X[i]); o.nu = nu[i]; o.O = (socs[i].o == null ? 0.5 : socs[i].o) * (1 - q.close_nu * nu[i]); o.war = !!X[i].war; hist[i].push(o); snap[i] = o; });
    }
    return { hist, events, pand: pandRes };
  }

  const PRESETS = {
    open: { label: 'Open, educated, honest', kw: {} },
    reform: { label: 'Reformer: forced saving, narrow political voice', kw: { forced: 0.42, he: 0.6, hp: 0.1, M: 0.2 } },
    nationalist: { label: 'Nationalist: manipulated, narrow voice', kw: { hp: 0.25, he: 0.5, M: 0.5 } },
    planner: { label: 'Closed planner', kw: { forced: 0.40, he: 0.15, hp: 0.1 } },
    poor: { label: 'Poor and open', kw: { A0: 0.1, S0: 4 } },
  };
  runSociety({});   /* common units from the open baseline's first period */
  root.SM = { B, I, E, society, runSociety, epidemic, world, PRESETS, REF };
})(typeof window !== 'undefined' ? window : globalThis);
