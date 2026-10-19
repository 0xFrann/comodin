// Comodín — lógica compartida: link, tarjeta 3D, imagen para WhatsApp y utilidades.
(function () {
  const C = window.COMODIN_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);
  const pad = (n) => String(n).padStart(3, "0");
  const today = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); };
  const fmtFecha = (f) => f && f.length === 8 ? f.slice(6, 8) + "." + f.slice(4, 6) + "." + f.slice(0, 4) : "—";
  const firstName = (s) => (s || "").trim().split(/\s+/)[0] || "";

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

  /* ---------- tarjeta ---------- */
  const SUN = "#FFD23F", PINK = "#FF6FA8";
  function ticksSVG() {
    let h = "";
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, r1 = 40.5, r2 = i % 3 === 0 ? 35.5 : 37.5;
      h += `<line x1="${(50 + r1 * Math.sin(a)).toFixed(2)}" y1="${(50 - r1 * Math.cos(a)).toFixed(2)}" x2="${(50 + r2 * Math.sin(a)).toFixed(2)}" y2="${(50 - r2 * Math.cos(a)).toFixed(2)}"/>`;
    }
    return h;
  }
  const cardHTML = () => `
  <div class="card" id="card" tabindex="0" role="button" aria-label="Comodín. Tocá para darlo vuelta.">
    <div class="face front">
      <div class="frame"></div>
      <div class="corner tl"><span class="no">Nº</span><span class="num" data-num>—</span></div>
      <div class="stamp">TRANSFERIBLE</div>
      <svg class="emblem" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke="${SUN}" stroke-width="3"/>
        <g stroke="${SUN}" stroke-width="1.6" stroke-linecap="round">${ticksSVG()}</g>
        <polygon points="30,22 70,22 50,50" fill="${PINK}"/>
        <polygon points="50,50 30,78 70,78" fill="${PINK}"/>
        <polygon points="42,44 58,44 50,50" fill="${SUN}"/>
        <line x1="50" y1="50" x2="50" y2="67" stroke="${SUN}" stroke-width="1.6"/>
        <polygon points="38,78 62,78 50,66" fill="${SUN}"/>
        <rect x="26" y="18.5" width="48" height="3.5" rx="1.5" fill="${SUN}"/>
        <rect x="26" y="78" width="48" height="3.5" rx="1.5" fill="${SUN}"/>
      </svg>
      <div class="word">COMODÍN</div>
      <div class="sub">Vale por 1 día de ${esc(C.corto)}</div>
      <p class="uses">Un desafío de tu negocio · un proyecto · esa idea que te da vueltas · lavarte el auto</p>
      <span class="notch l"></span><span class="notch r"></span>
      <div class="perf"></div>
      <span class="lbl">PARA</span><span class="val para" data-para>vos</span>
      <div class="issued"><span class="lbl">EMITIDO</span><span class="fecha" data-fecha>—</span></div>
      <div class="corner br"><span class="no">Nº</span><span class="num" data-num>—</span></div>
    </div>
    <div class="face back">
      <div class="frame"></div>
      <div class="top-row"><span>LETRA CHICA</span><span>Nº <span data-num>—</span></span></div>
      <h3>Términos y condiciones</h3>
      <ul class="rules">
        <li>Vale por un día mío. Vos elegís para qué: un desafío de tu negocio, un proyecto, esa idea que te da vueltas o lavarte el auto.</li>
        <li>Para canjearlo, escribime y armamos el plan juntos.</li>
        <li>Se puede regalar. Si conocés a alguien a quien le sirva más, pasáselo.</li>
        <li>No vence, pero no lo dejes juntando polvo en el chat.</li>
        <li>Casi todo vale. Las mudanzas de piano las charlamos.</li>
      </ul>
      <span class="notch l"></span><span class="notch r"></span>
      <div class="perf"></div>
      <div class="thanks">Gracias por tu tiempo.</div>
      <div class="sign">${esc(C.nombre)} · ${esc(C.rol)}</div>
    </div>
  </div>`;
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  let current = { n: 0, nombre: "", fecha: "" };
  function render(c) {
    current = { n: c.n || 0, nombre: c.nombre || "", fecha: c.fecha || "" };
    $$("[data-num]").forEach((el) => el.textContent = current.n ? pad(current.n) : "—");
    $("[data-para]").textContent = current.nombre || "vos";
    $("[data-fecha]").textContent = fmtFecha(current.fecha);
    $("#card").setAttribute("aria-label", `Comodín${current.n ? " Nº " + pad(current.n) : ""}${current.nombre ? " para " + current.nombre : ""}. Tocá para darlo vuelta.`);
  }

  /* ---------- interacción 3D ---------- */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let card, base = 0, ry = 0, rx = 0, drag = null;
  function apply(mode) {
    card.style.transition = reduced ? "none"
      : mode === "snap" ? "transform .75s cubic-bezier(.2,.85,.25,1)"
      : mode === "hover" ? "transform .18s ease-out"
      : mode === "deal" ? "transform 1.3s cubic-bezier(.2,.8,.2,1)" : "none";
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.setProperty("--gx", (50 + Math.sin(ry * Math.PI / 180) * 45) + "%");
    card.style.setProperty("--gy", (35 - rx * 1.4) + "%");
  }
  function flip() { base += 180; ry = base; rx = 0; apply("snap"); }
  function showFront() { base = Math.round(base / 360) * 360; ry = base; rx = 0; apply("snap"); }
  function mount(stage) {
    stage.innerHTML = cardHTML();
    card = $("#card", stage);
    card.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY, ry0: ry, rx0: rx, moved: false };
      try { card.setPointerCapture(e.pointerId); } catch (_) {}
    });
    card.addEventListener("pointermove", (e) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 6) drag.moved = true;
        if (!drag.moved) return;
        ry = drag.ry0 + dx * 0.6;
        rx = Math.max(-32, Math.min(32, drag.rx0 - dy * 0.35));
        apply("none");
      } else if (e.pointerType === "mouse") {
        const r = card.getBoundingClientRect();
        ry = base + ((e.clientX - r.left) / r.width - .5) * 16;
        rx = -((e.clientY - r.top) / r.height - .5) * 12;
        apply("hover");
      }
    });
    const end = () => {
      if (!drag) return;
      if (!drag.moved) base += 180; else base = Math.round(ry / 180) * 180;
      ry = base; rx = 0; drag = null; apply("snap");
    };
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
    card.addEventListener("pointerleave", (e) => { if (!drag && e.pointerType === "mouse") { ry = base; rx = 0; apply("snap"); } });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    return card;
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
  function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  function wrap(x, text, maxW) {
    const words = text.split(" "), lines = []; let line = "";
    for (const w of words) { const t = line ? line + " " + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line); return lines;
  }
  const ls = (x, v) => { if ("letterSpacing" in x) x.letterSpacing = v; };
  async function fontsReady() {
    const f = ['400 40px "Bowlby One"', 'italic 500 40px "Instrument Sans"', '600 40px "Instrument Sans"', '700 40px "JetBrains Mono"', '500 40px "JetBrains Mono"'];
    try { await Promise.all(f.map((s) => document.fonts.load(s, "ÍÑº0"))); } catch (_) {}
  }
  // Dibuja el frente de la tarjeta con el origen en (0,0) y ancho W. `notchColor` = fondo detrás.
  function drawFront(x, c, W, notchColor) {
    const H = W * 1.4, u = W / 100, COB = "#2338C9", WHITE = "#FFFFFF";
    x.save(); rr(x, 0, 0, W, H, 5 * u); x.clip();
    const g = x.createLinearGradient(0, 0, W * .55, H); g.addColorStop(0, "#2A41D8"); g.addColorStop(.45, COB); g.addColorStop(1, "#1A2BA6");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const sh = x.createRadialGradient(W * .3, H * .2, 0, W * .3, H * .2, W * .9); sh.addColorStop(0, "rgba(255,255,255,.12)"); sh.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = sh; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(255,210,63,.35)"; x.lineWidth = .5 * u; rr(x, 3.25 * u, 3.25 * u, W - 6.5 * u, H - 6.5 * u, 3 * u); x.stroke();
    x.textBaseline = "top";
    const num = c.n ? pad(c.n) : "—";
    const corner = () => {
      x.font = `700 ${3.2 * u}px "JetBrains Mono"`; ls(x, "0px"); const wNo = x.measureText("Nº").width;
      x.font = `400 ${8.5 * u}px "Bowlby One"`; const wNum = x.measureText(num).width;
      const cx = 6 * u + Math.max(wNo, wNum) / 2;
      x.fillStyle = SUN; x.textAlign = "center";
      x.font = `700 ${3.2 * u}px "JetBrains Mono"`; x.fillText("Nº", cx, 5 * u);
      x.font = `400 ${8.5 * u}px "Bowlby One"`; x.fillText(num, cx, 9 * u);
    };
    corner(); x.save(); x.translate(W, H); x.rotate(Math.PI); corner(); x.restore();
    // sello
    x.font = `700 ${2.6 * u}px "JetBrains Mono"`; ls(x, `${.08 * 2.6 * u}px`);
    const sw = x.measureText("TRANSFERIBLE").width + 4 * u, shh = 2.6 * 1.25 * u + 2.2 * u;
    x.save(); x.translate(W - 6 * u - sw / 2, 6 * u + shh / 2); x.rotate(-8 * Math.PI / 180);
    x.strokeStyle = PINK; x.lineWidth = .55 * u; rr(x, -sw / 2, -shh / 2, sw, shh, 1.2 * u); x.stroke();
    x.fillStyle = PINK; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("TRANSFERIBLE", 0, .1 * u);
    x.restore(); x.textBaseline = "top"; ls(x, "0px");
    // emblema
    x.save(); x.translate(34 * u, 20 * u); const s = 32 * u / 100; x.scale(s, s);
    x.strokeStyle = SUN; x.lineWidth = 3; x.beginPath(); x.arc(50, 50, 46, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 1.6; x.lineCap = "round";
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r1 = 40.5, r2 = i % 3 === 0 ? 35.5 : 37.5; x.beginPath(); x.moveTo(50 + r1 * Math.sin(a), 50 - r1 * Math.cos(a)); x.lineTo(50 + r2 * Math.sin(a), 50 - r2 * Math.cos(a)); x.stroke(); }
    const tri = (p, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[2], p[3]); x.lineTo(p[4], p[5]); x.closePath(); x.fill(); };
    tri([30, 22, 70, 22, 50, 50], PINK); tri([50, 50, 30, 78, 70, 78], PINK); tri([42, 44, 58, 44, 50, 50], SUN);
    x.beginPath(); x.moveTo(50, 50); x.lineTo(50, 67); x.stroke(); tri([38, 78, 62, 78, 50, 66], SUN);
    x.fillStyle = SUN; rr(x, 26, 18.5, 48, 3.5, 1.5); x.fill(); rr(x, 26, 78, 48, 3.5, 1.5); x.fill();
    x.restore();
    // textos
    x.textAlign = "center"; x.fillStyle = SUN; x.font = `400 ${14.5 * u}px "Bowlby One"`; ls(x, `${.01 * 14.5 * u}px`); x.fillText("COMODÍN", W / 2, 58 * u); ls(x, "0px");
    x.fillStyle = WHITE; x.font = `italic 500 ${5.6 * u}px "Instrument Sans"`; x.fillText(`Vale por 1 día de ${C.corto}`, W / 2, 76 * u);
    x.fillStyle = SUN; x.font = `500 ${2.7 * u}px "JetBrains Mono"`; ls(x, `${.08 * 2.7 * u}px`);
    wrap(x, "UN DESAFÍO DE TU NEGOCIO · UN PROYECTO · ESA IDEA QUE TE DA VUELTAS · LAVARTE EL AUTO", 80 * u).forEach((l, i) => x.fillText(l, W / 2, 89.6 * u + i * 2.7 * 1.6 * u));
    ls(x, "0px");
    // troquel
    x.strokeStyle = "rgba(255,210,63,.6)"; x.lineWidth = .45 * u; x.setLineDash([1.4 * u, 1.2 * u]);
    x.beginPath(); x.moveTo(7 * u, 108 * u); x.lineTo(93 * u, 108 * u); x.stroke(); x.setLineDash([]);
    x.fillStyle = notchColor; [0, W].forEach((px) => { x.beginPath(); x.arc(px, 108 * u, 3.2 * u, 0, Math.PI * 2); x.fill(); });
    // talón
    x.textAlign = "left"; x.fillStyle = "rgba(255,210,63,.8)"; x.font = `700 ${2.4 * u}px "JetBrains Mono"`; ls(x, `${.14 * 2.4 * u}px`);
    x.fillText("PARA", 6.5 * u, 113 * u);
    x.fillStyle = WHITE; let fs = 6; const who = c.nombre || "vos";
    ls(x, "0px");
    do { x.font = `600 ${fs * u}px "Instrument Sans"`; fs -= .25; } while (x.measureText(who).width > 64 * u && fs > 3.5);
    x.fillText(who, 6.5 * u, 116.6 * u);
    x.textBaseline = "alphabetic";
    x.fillStyle = "rgba(255,210,63,.8)"; x.font = `700 ${2.4 * u}px "JetBrains Mono"`; ls(x, `${.14 * 2.4 * u}px`);
    const lw = x.measureText("EMITIDO").width;
    x.fillText("EMITIDO", 6.5 * u, 128 * u); ls(x, "0px");
    x.fillStyle = WHITE; x.font = `500 ${3.2 * u}px "JetBrains Mono"`; x.fillText(fmtFecha(c.fecha), 6.5 * u + lw + 2 * u, 128 * u);
    x.textBaseline = "top";
    x.restore();
  }
  async function makePNG(c) {
    await fontsReady();
    const CW = 1080, CH = 1350, W = 840, ox = 120, oy = 62, BG = "#E7E9F2";
    const cv = document.createElement("canvas"); cv.width = CW; cv.height = CH;
    const x = cv.getContext("2d");
    x.fillStyle = BG; x.fillRect(0, 0, CW, CH);
    x.save(); x.shadowColor = "rgba(14,20,80,.32)"; x.shadowBlur = 70; x.shadowOffsetY = 26; rr(x, ox, oy, W, W * 1.4, 5 * W / 100); x.fillStyle = "#2338C9"; x.fill(); x.restore();
    x.save(); x.translate(ox, oy); drawFront(x, c, W, BG); x.restore();
    x.textAlign = "center"; x.textBaseline = "alphabetic"; x.fillStyle = "#585E7E"; x.font = '700 22px "JetBrains Mono"'; ls(x, "4px");
    x.fillText("ABRÍ EL LINK Y DALO VUELTA ↻", CW / 2, CH - 52);
    return new Promise((res) => cv.toBlob(res, "image/png"));
  }

  const use = async (n) => { try { return window.claude && window.claude.use ? await window.claude.use(n) : null; } catch (_) { return null; } };

  window.Comodin = { C, use, $, $$, pad, today, fmtFecha, firstName, esc, parse, linkOf, passLinkOf, normPhone, prettyPhone, waLink, mount, render, deal, flip, showFront, toast, copyText, selectText, makePNG, drawFront, fontsReady, rr, get current() { return current; } };
})();
