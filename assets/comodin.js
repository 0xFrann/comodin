// Comodín — lógica compartida: link, tarjeta 3D, imagen para WhatsApp y utilidades.
(function () {
  const C = window.COMODIN_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);
  const pad = (n) => String(n).padStart(3, "0");
  const today = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); };
  const fmtFecha = (f) => f && f.length === 8 ? f.slice(6, 8) + "." + f.slice(4, 6) + "." + f.slice(0, 4) : "—";
  // Nombre tal como se cargó (todas las palabras), con los espacios normalizados.
  const firstName = (s) => (s || "").trim().replace(/\s+/g, " ");

  /* ---------- link: #007-<nombre y fecha ofuscados> ---------- */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const keyBytes = enc.encode(C.clave || "comodin");
  const xor = (bytes) => bytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
  const toB64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const fromB64u = (s) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
  function payload(nombre, fecha) { return toB64u(xor(enc.encode(JSON.stringify([nombre || "", fecha || ""])))); }
  function readPayload(p) {
    try {
      const v = JSON.parse(dec.decode(xor(fromB64u(p))));
      if (Array.isArray(v) && typeof v[0] === "string" && /^(\d{8})?$/.test(v[1] || "")) return { nombre: v[0].slice(0, 40), fecha: v[1] || "" };
    } catch (_) {}
    return null;
  }
  function parse(hash) {
    const m = /^(\d{1,4})(?:-([A-Za-z0-9_-]+))?$/.exec((hash || "").replace(/^#/, ""));
    if (!m) return null;
    const p = m[2] ? readPayload(m[2]) : null;
    return { n: parseInt(m[1], 10), nombre: p ? p.nombre : "", fecha: p ? p.fecha : "" };
  }
  const linkOf = (c) => C.base + "#" + pad(c.n) + "-" + payload(c.nombre, c.fecha);
  const passLinkOf = (c) => C.base + "#" + pad(c.n) + "-" + payload("", c.fecha); // sin nombre, para regalarlo

  /* ---------- WhatsApp ---------- */
  function normPhone(raw) {
    let d = String(raw || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("00")) d = d.slice(2);
    if (d.startsWith("0")) d = d.slice(1);
    if (d.length === 10) d = "549" + d;                                   // 351 788 1648 → Argentina celular
    if (d.length === 12 && d.startsWith("54") && d[2] !== "9") d = "549" + d.slice(2);
    return d;
  }
  function prettyPhone(d) {
    d = String(d || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.length === 13 && d.startsWith("549")) return `+54 9 ${d.slice(3, 6)} ${d.slice(6, 9)}-${d.slice(9)}`;
    return "+" + d;
  }
  const waLink = (phone, text) => "https://wa.me/" + (phone || "") + "?text=" + encodeURIComponent(text);

  /* ---------- texturas del papel ---------- */
  const ASSETS = (document.currentScript && document.currentScript.src) || location.href;
  const texImg = {};
  const texturesReady = Promise.all([["base", "papel.jpg?v=20261021153632"], ["luz", "papel-luz.jpg?v=20261021153632"]].map(([k, f]) => new Promise((res) => {
    const im = new Image(); im.onload = () => { texImg[k] = im; res(); }; im.onerror = () => res(); im.src = new URL(f, ASSETS).href;
  })));

  /* ---------- tarjeta ---------- */
  const INK = "#172644", TERRA = "#C98255", PAPER = "#D9C4A0";
  const STAR = "M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z";
  const EXAMPLES = ["Reunión de trabajo · café ·", "charla de bar · lavar el auto", "· vos proponés ·"];
  const RULES = [
    "Te doy una mano por un día con lo que necesites: tu negocio, un proyecto o esa idea que te da vueltas. Si es lavar el auto mientras charlamos, también vale. Confío en tu criterio.",
    "Para canjearlo, escribime y armamos el plan juntos.",
    "Se puede regalar. Si conocés a alguien a quien le sirva más, pasáselo.",
    "No vence, pero no lo dejes juntando polvo en el chat."
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  // Contorno con esquinas cóncavas, concéntricas al corte del boleto (unidades: ancho 100 × alto 140).
  function framePath(d, R) {
    const k = Math.sqrt(R * R - d * d).toFixed(2), W = 100, H = 140;
    return `M${k},${d} H${(W - k).toFixed(2)} A${R} ${R} 0 0 0 ${W - d},${k} V${(H - k).toFixed(2)} A${R} ${R} 0 0 0 ${(W - k).toFixed(2)},${H - d} H${k} A${R} ${R} 0 0 0 ${d},${(H - k).toFixed(2)} V${k} A${R} ${R} 0 0 0 ${k},${d} Z`;
  }
  const frameSVG = `<svg class="frame ink" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true"><path d="${framePath(4.6, 10.6)}" fill="none" style="stroke:var(--ink)" stroke-width="1.1"/></svg>`;
  const starSVG = `<svg class="f-star" viewBox="0 0 100 100" aria-hidden="true"><path d="${STAR}" style="fill:var(--ink)"/></svg>`;
  const perfHTML = `<i class="sheen" aria-hidden="true"><i class="sh-shade"></i><i class="sh-glint"><i class="sh-band"></i></i></i><span class="notch l"></span><span class="notch r"></span><div class="perf"></div>`;
  const cardHTML = () => `
  <div class="card" id="card" tabindex="0" role="button" aria-label="Comodín. Tocá para darlo vuelta.">
    <div class="face front"><div class="shadow"><div class="shape"><div class="paper">
      ${frameSVG}
      <div class="f-top ink">
        <div class="f-row">
          <div class="f-serial"><span class="f-num" data-num>—</span></div>
          <div class="f-transf"><span class="fill" data-fill="spread" data-max="9">Transferible</span></div>
        </div>
        <div class="f-rule"></div>
        <div class="f-vale-row">${starSVG}<span class="f-vale fill" data-fill="spread" data-max="32" data-inset="star">VALE</span>${starSVG}</div>
        <span class="f-canje fill" data-fill="spread" data-max="9">Canjeable por</span>
        <div class="f-rule"></div>
        <div class="f-ex">${EXAMPLES.map((t) => `<span class="fill" data-fill="spread" data-max="7.5" data-group="ex">${esc(t)}</span>`).join("")}</div>
      </div>
      ${perfHTML}
      <div class="f-bot ink">
        <div class="f-data">
          <span class="f-lbl">PARA</span>
          <span class="f-para fill" data-fill="shrink" data-max="9" data-para>vos</span>
          <div class="f-issued"><span class="f-lbl">EMITIDO</span><span class="f-fecha" data-fecha>—</span></div>
        </div>
        <div class="f-big"><span class="f-num" data-num>—</span></div>
      </div>
    </div></div></div></div>
    <div class="face back"><div class="shadow"><div class="shape"><div class="paper">
      ${frameSVG}
      <div class="b-body ink">
        <h3 class="b-title fill" data-fill="shrink" data-max="12">Términos y condiciones</h3>
        <ul class="b-rules">${RULES.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>
      ${perfHTML}
      <div class="b-sign ink"><span class="b-name">${esc(C.nombre)}</span><span class="b-role">${esc(C.rol)}</span></div>
    </div></div></div></div>
  </div>`;

  // Cada línea con data-fill ocupa todo su ancho: "spread" agranda la letra hasta un tope y reparte el sobrante como
  // espaciado; "shrink" solo achica. Las líneas de un mismo data-group comparten tamaño. Mide sin transformaciones 3D.
  function fit(root) {
    root = root || document;
    root.querySelectorAll(".face").forEach((face) => {
      const u = face.clientWidth / 100;
      if (!u) return;
      const boxOf = (el) => el.dataset.inset === "star"
        ? el.parentElement.clientWidth - 24 * u
        : el.parentElement.clientWidth;
      const reset = (el, fs) => { el.style.letterSpacing = "0px"; el.style.marginRight = "0px"; el.style.fontSize = fs + "px"; };
      const groups = {};
      face.querySelectorAll(".fill[data-group]").forEach((el) => {
        reset(el, parseFloat(el.dataset.max) * u);
        const r = boxOf(el) / el.offsetWidth;
        groups[el.dataset.group] = Math.min(groups[el.dataset.group] ?? 1, r);
      });
      face.querySelectorAll(".fill").forEach((el) => {
        const max = parseFloat(el.dataset.max) * u * (el.dataset.group ? Math.min(1, groups[el.dataset.group]) : 1);
        reset(el, max);
        const box = boxOf(el), w = el.offsetWidth, n = [...el.textContent].length;
        if (w > box) { el.style.fontSize = (max * box / w) + "px"; return; }
        if (el.dataset.fill === "spread" && n > 1) {
          const ls = (box - w) / (n - 1);
          el.style.letterSpacing = ls + "px"; el.style.marginRight = -ls + "px";
        }
      });
    });
  }

  let current = { n: 0, nombre: "", fecha: "" };
  function render(c) {
    current = { n: c.n || 0, nombre: c.nombre || "", fecha: c.fecha || "" };
    $$("[data-num]").forEach((el) => el.textContent = current.n ? pad(current.n) : "—");
    $("[data-para]").textContent = current.nombre || "vos";
    $("[data-fecha]").textContent = fmtFecha(current.fecha);
    $("#card").setAttribute("aria-label", `Comodín${current.n ? " Nº " + pad(current.n) : ""}${current.nombre ? " para " + current.nombre : ""}. Tocá para darlo vuelta.`);
    fit($("#card"));
  }

  /* ---------- interacción 3D ---------- */
  // Dos capas: .tilt inclina la tarjeta al pasar el mouse (solo desktop) y .card gira al tocar o arrastrar.
  // Así la inclinación nunca interrumpe la animación del giro.
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let card, tilt, pop, base = 0, ry = 0, rx = 0, drag = null;
  function apply(mode) {
    card.style.transition = reduced ? "none"
      : mode === "snap" ? "transform .75s cubic-bezier(.2,.85,.25,1)"
      : mode === "deal" ? "transform 1.3s cubic-bezier(.2,.8,.2,1)"
      : mode === "intro" ? "transform 2.4s cubic-bezier(.3,.6,.2,1)" : "none";
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    if (tilt) wake();
  }
  // Luz y sombra: se lee la orientación real (giro + inclinación, también durante las transiciones)
  // y se mueve un barrido de luz en cada cara. Solo corre mientras la tarjeta se mueve.
  let raf = 0, calm = 0, lastN = "";
  const M = (el) => { const t = getComputedStyle(el).transform; return t && t !== "none" ? new DOMMatrix(t) : new DOMMatrix(); };
  function light() {
    const m = M(tilt).multiply(M(card));
    const o = m.transformPoint(new DOMPoint(0, 0, 0)), z = m.transformPoint(new DOMPoint(0, 0, 1));
    const nx = z.x - o.x, ny = z.y - o.y;
    const k = nx.toFixed(3) + ny.toFixed(3);
    const amt = Math.min(1, IDLE + Math.hypot(nx, ny) * 2.2);
    card.style.setProperty("--sheen-o", amt.toFixed(3));
    card.style.setProperty("--sheen-f", (REST + nx * 25).toFixed(2) + "%");
    card.style.setProperty("--sheen-b", (REST - nx * 25).toFixed(2) + "%");
    calm = k === lastN ? calm + 1 : 0; lastN = k;
    raf = calm < 12 ? requestAnimationFrame(light) : 0;
  }
  // En reposo la luz queda prendida, como una lámpara arriba a la izquierda; al moverse parte de ahí.
  const IDLE = .5, REST = 9;
  function wake() { calm = 0; if (!raf && !reduced) raf = requestAnimationFrame(light); }
  function lean(px, py) { if (!reduced) { tilt.style.transform = `rotateX(${-py * 10}deg) rotateY(${px * 14}deg)`; wake(); } }
  function unlean() { tilt.style.transform = "rotateX(0deg) rotateY(0deg)"; wake(); }
  function flip() { base += 180; ry = base; rx = 0; apply("snap"); }
  function showFront() { base = Math.round(base / 360) * 360; ry = base; rx = 0; apply("snap"); }
  function mount(stage, opts = {}) {
    stage.innerHTML = `<div class="pop${opts.intro ? " pending" : ""}"><div class="tilt">${cardHTML()}</div></div>`;
    pop = $(".pop", stage);
    tilt = $(".tilt", stage);
    card = $("#card", stage);
    try { new ResizeObserver(() => fit(card)).observe(card); } catch (_) {}
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fit(card));
    card.addEventListener("dragstart", (e) => e.preventDefault());
    card.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      drag = { x: e.clientX, y: e.clientY, ry0: ry, rx0: rx, base0: base, moved: false, lt: e.timeStamp, pts: [[e.timeStamp, e.clientX]] };
      try { card.setPointerCapture(e.pointerId); } catch (_) {}
      unlean();
    });
    card.addEventListener("pointermove", (e) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 6) drag.moved = true;
        drag.lt = e.timeStamp; drag.pts.push([e.timeStamp, e.clientX]);
        while (drag.pts.length > 2 && e.timeStamp - drag.pts[0][0] > 100) drag.pts.shift();
        if (!drag.moved) return;
        ry = drag.ry0 + dx * 0.6;
        rx = Math.max(-32, Math.min(32, drag.rx0 - dy * 0.35));
        apply("none");
      } else if (e.pointerType === "mouse") {
        const r = tilt.getBoundingClientRect();
        lean((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5);
      }
    });
    const end = (e) => {
      if (!drag) return;
      if (!drag.moved) base += 180;
      else {
        base = Math.round(ry / 180) * 180;
        // deslizamiento rápido: gira hacia ese lado aunque no haya pasado la mitad
        // velocidad real de los últimos 100 ms (no depende de cuántos cuadros logre el teléfono)
        const t = e && e.timeStamp ? e.timeStamp : performance.now(), a = drag.pts[0], z = drag.pts[drag.pts.length - 1];
        const vx = z[0] > a[0] ? (z[1] - a[1]) / (z[0] - a[0]) : 0;
        if (t - drag.lt < 120 && Math.abs(vx) > .3 && base === drag.base0) base += Math.sign(vx) * 180;
      }
      ry = base; rx = 0; drag = null; apply("snap");
    };
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
    // solo si la tarjeta misma pierde el puntero (el aviso de un hijo también sube y cortaba el gesto)
    card.addEventListener("lostpointercapture", (e) => { if (e.target === card) end(e); });
    card.addEventListener("pointerleave", (e) => { if (!drag && e.pointerType === "mouse") unlean(); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    wake();
    if (opts.intro) intro();
    return card;
  }
  // Entrada: espera tipografías y textura (o 2,5 s como máximo), aparece con un rebote y da un giro completo.
  function intro() {
    const fontsOk = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const ready = Promise.all([fontsOk, texturesReady]);
    const timeout = new Promise((res) => setTimeout(res, 2500));
    Promise.race([ready, timeout]).then(() => {
      fit(card);
      requestAnimationFrame(() => {
        pop.classList.remove("pending");
        if (reduced) return;
        setTimeout(() => { base += 360; ry = base; rx = 0; apply("intro"); }, 420);
      });
    });
  }
  function deal() {
    if (reduced) { apply("none"); return; }
    ry = -200; rx = 8; apply("none");
    requestAnimationFrame(() => requestAnimationFrame(() => { ry = base; rx = 0; apply("deal"); }));
  }

  /* ---------- toast / copiar ---------- */
  let toastT;
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }
  function selectText(el) { try { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (_) {} }
  async function copyText(text, el, ok) {
    try { await navigator.clipboard.writeText(text); toast(ok); }
    catch (_) { if (el) selectText(el); toast("Seleccioné el texto: copialo a mano."); }
  }

  /* ---------- imagen (canvas) ---------- */
  const DISP = '"Big Shoulders Display", "Arial Narrow", sans-serif', MONO = '"IBM Plex Mono", Menlo, monospace';
  async function fontsReady() {
    const f = ['900 40px "Big Shoulders Display"', '800 40px "Big Shoulders Display"', '500 40px "Big Shoulders Display"', '600 40px "IBM Plex Mono"', '700 40px "IBM Plex Mono"', '500 40px "Barlow"', 'italic 600 40px "Barlow"', '600 40px "Barlow"'];
    try { await Promise.all(f.map((s) => document.fonts.load(s, "ÍÉÓÚÑº0"))); } catch (_) {}
    await texturesReady;
  }
  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  const ls0 = (x) => { if ("letterSpacing" in x) x.letterSpacing = "0px"; };
  // Contorno con esquinas cóncavas: arcos centrados en las esquinas del boleto.
  function concave(x, W, H, d, R) {
    const k = Math.sqrt(R * R - d * d), at = (cx, cy, px, py) => Math.atan2(py - cy, px - cx);
    x.beginPath();
    x.moveTo(k, d); x.lineTo(W - k, d);
    x.arc(W, 0, R, at(W, 0, W - k, d), at(W, 0, W - d, k), true);
    x.lineTo(W - d, H - k);
    x.arc(W, H, R, at(W, H, W - d, H - k), at(W, H, W - k, H - d), true);
    x.lineTo(k, H - d);
    x.arc(0, H, R, at(0, H, k, H - d), at(0, H, d, H - k), true);
    x.lineTo(d, k);
    x.arc(0, 0, R, at(0, 0, d, k), at(0, 0, k, d), true);
    x.closePath();
  }
  function shape(x, W, H, r) {
    x.beginPath();
    x.moveTo(r, 0); x.lineTo(W - r, 0); x.arc(W, 0, r, Math.PI, Math.PI / 2, true);
    x.lineTo(W, H - r); x.arc(W, H, r, 3 * Math.PI / 2, Math.PI, true);
    x.lineTo(r, H); x.arc(0, H, r, 0, -Math.PI / 2, true);
    x.lineTo(0, r); x.arc(0, 0, r, Math.PI / 2, 0, true);
    x.closePath();
  }
  const measure = (x, t, font) => { x.font = font; ls0(x); return x.measureText(t).width; };
  // Dibuja el texto ocupando `width`: si sobra lugar reparte espaciado entre letras; centrado en `cy`.
  function spread(x, t, font, left, width, cy) {
    x.font = font; ls0(x); x.textBaseline = "middle"; x.textAlign = "left";
    const chars = [...t], ws = chars.map((ch) => x.measureText(ch).width), nat = x.measureText(t).width;
    if (chars.length < 2 || nat >= width - .5) { x.fillText(t, left + Math.max(0, (width - nat) / 2), cy); return; }
    const gap = (width - ws.reduce((a, b) => a + b, 0)) / (chars.length - 1);
    let px = left; chars.forEach((ch, i) => { x.fillText(ch, px, cy); px += ws[i] + gap; });
  }
  const fitFs = (x, t, weight, fam, maxFs, width) => { const w = measure(x, t, `${weight} ${maxFs}px ${fam}`); return w > width ? maxFs * width / w : maxFs; };
  function spaced(x, t, font, left, baseline, ls) {
    x.font = font; ls0(x); x.textBaseline = "alphabetic"; x.textAlign = "left";
    let px = left; for (const ch of t) { x.fillText(ch, px, baseline); px += x.measureText(ch).width + ls; }
    return px - ls - left;
  }
  // Frente del boleto en un canvas transparente de ancho W (alto 1,4·W), con agujeros reales.
  function ticketCanvas(c, W) {
    const H = Math.round(W * 1.4), u = W / 100;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const pc = cv.getContext("2d");
    pc.fillStyle = TERRA; shape(pc, W, H, 6 * u); pc.fill();
    // la tinta se dibuja en su propia capa para poder gastarla
    const ink = document.createElement("canvas"); ink.width = W; ink.height = H;
    const x = ink.getContext("2d");
    const cover = (img) => { const r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r; return [(W - w) / 2, (H - h) / 2, w, h]; };
    const paperLayer = (img, mode, alpha) => { if (!img) return; pc.save(); shape(pc, W, H, 6 * u); pc.clip(); pc.globalCompositeOperation = mode; pc.globalAlpha = alpha; pc.drawImage(img, ...cover(img)); pc.restore(); };
    paperLayer(texImg.base, "soft-light", .68);
    // filete
    x.strokeStyle = INK; x.lineWidth = 1.1 * u; concave(x, W, H, 4.6 * u, 10.6 * u); x.stroke();
    x.fillStyle = INK;
    const L = 10 * u, R = 90 * u, CW = 80 * u, up = (t) => t.toUpperCase();
    const num = c.n ? pad(c.n) : "—";
    // medidas de cada fila (mismo criterio que la tarjeta en pantalla)
    const fNum = `600 ${10 * u}px ${MONO}`, numW = measure(x, num, fNum);
    const tx0 = L + numW + 9 * u, tW = R - tx0;
    const fsT = fitFs(x, "TRANSFERIBLE", 800, DISP, 9 * u, tW);
    const h1 = Math.max(8 * u, .9 * fsT);
    const valeW = CW - 24 * u, fsV = fitFs(x, "VALE", 900, DISP, 32 * u, valeW), hv = Math.max(9 * u, .8 * fsV + u);
    const canje = up("Canjeable por"), fsC = fitFs(x, canje, 900, DISP, 9 * u, CW), hc = .9 * fsC;
    const ex = EXAMPLES.map(up), fsE = Math.min(...ex.map((t) => fitFs(x, t, 700, DISP, 7.5 * u, CW))), he = 3 * .92 * fsE + 4.8 * u;
    const gap = (91 * u - (h1 + u + hv + hc + u + he)) / 5;
    let y = 10.5 * u;
    // fila 1: número | transferible
    x.textBaseline = "middle"; x.font = fNum; ls0(x); x.fillText(num, L, y + h1 / 2);
    x.fillRect(L + numW + 4 * u, y, u, h1);
    spread(x, "TRANSFERIBLE", `800 ${fsT}px ${DISP}`, tx0, tW, y + h1 / 2);
    y += h1 + gap; x.fillRect(L, y, CW, u); y += u + gap;
    // VALE entre estrellas
    const star = new Path2D(STAR);
    [[L, y + hv / 2], [R - 9 * u, y + hv / 2]].forEach(([sx, sy]) => { x.save(); x.translate(sx, sy - 4.5 * u); x.scale(.09 * u, .09 * u); x.fill(star); x.restore(); });
    spread(x, "VALE", `900 ${fsV}px ${DISP}`, L + 12 * u, valeW, y + u + .4 * fsV);
    y += hv + gap;
    spread(x, canje, `900 ${fsC}px ${DISP}`, L, CW, y + .45 * fsC);
    y += hc + gap; x.fillRect(L, y, CW, u); y += u + gap;
    ex.forEach((t) => { spread(x, t, `700 ${fsE}px ${DISP}`, L, CW, y + .46 * fsE); y += .92 * fsE + 2.4 * u; });
    // talón
    const y0 = 112 * u, y1 = H - 10.5 * u;
    const fBig = `600 ${12 * u}px ${MONO}`, bigW = measure(x, num, fBig), bx = R - bigW - 5 * u;
    x.fillRect(bx, y0, u, y1 - y0);
    x.font = fBig; x.textBaseline = "middle"; x.fillText(num, bx + 5 * u, (y0 + y1) / 2);
    const dataW = bx - 4 * u - L, fLbl = `700 ${3.1 * u}px ${MONO}`;
    spaced(x, "PARA", fLbl, L, y0 + 2.3 * u, .14 * 3.1 * u);
    const who = up(c.nombre || "vos"), fsN = fitFs(x, who, 900, DISP, 9 * u, dataW);
    const gapD = (y1 - y0 - 3.1 * u - .9 * fsN - 3.9 * u) / 2;
    x.font = `900 ${fsN}px ${DISP}`; ls0(x); x.textBaseline = "middle"; x.fillText(who, L, y0 + 3.1 * u + gapD + .45 * fsN);
    const lw = spaced(x, "EMITIDO", fLbl, L, y1 - .7 * u, .14 * 3.1 * u);
    x.font = `600 ${3.9 * u}px ${MONO}`; ls0(x); x.textBaseline = "alphabetic"; x.fillText(fmtFecha(c.fecha), L + lw + 2 * u, y1 - .7 * u);
    pc.save(); pc.globalAlpha = .95; pc.drawImage(ink, 0, 0); pc.restore();
    paperLayer(texImg.base, "soft-light", .55);
    paperLayer(texImg.luz, "screen", .36);
    // perforación, muescas y dientes: agujeros de verdad
    const xx = x; { const x = pc;
    x.globalCompositeOperation = "destination-out";
    const hole = (cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
    for (let k = -13; k <= 13; k++) hole(50 * u + k * 3.4 * u, 108 * u, .85 * u);
    hole(0, 108 * u, 3.6 * u); hole(W, 108 * u, 3.6 * u);
    for (let px = W / 2 - Math.ceil(W / 2 / (3 * u)) * 3 * u; px <= W; px += 3 * u) { hole(px, 0, 1.15 * u); hole(px, H, 1.15 * u); }
    x.globalCompositeOperation = "source-over"; }
    return cv;
  }
  async function makePNG(c) {
    await fontsReady();
    const CW = 1080, CH = 1350, W = 840, ox = 120, oy = 52, BG = "#0B1222";
    const cv = document.createElement("canvas"); cv.width = CW; cv.height = CH;
    const x = cv.getContext("2d");
    x.fillStyle = BG; x.fillRect(0, 0, CW, CH);
    const tk = ticketCanvas(c, W);
    x.save(); x.shadowColor = "rgba(3,6,16,.65)"; x.shadowBlur = 44; x.shadowOffsetY = 22; x.drawImage(tk, ox, oy); x.restore();
    x.fillStyle = "#A7B1C4"; x.textAlign = "left";
    const t = "ABRILO Y DALO VUELTA ↻", f = `600 24px ${MONO}`, w = measure(x, t, f) + (t.length - 1) * 4;
    spaced(x, t, f, (CW - w) / 2, CH - 46, 4);
    return new Promise((res) => cv.toBlob(res, "image/png"));
  }

  const use = async (n) => { try { return window.claude && window.claude.use ? await window.claude.use(n) : null; } catch (_) { return null; } };

  window.Comodin = { C, use, $, $$, pad, today, fmtFecha, firstName, esc, parse, linkOf, passLinkOf, normPhone, prettyPhone, waLink, mount, render, fit, deal, flip, showFront, toast, copyText, selectText, makePNG, ticketCanvas, fontsReady, rr, get current() { return current; } };
})();
