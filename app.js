(() => {
  "use strict";
  const C = window.INVITE_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  if (params.has("og")) document.body.classList.add("og");   // used only to render the share image

  /* ---------- Dates (computed in the VENUE timezone, not the guest's) ---------- */
  function tzOffset(ts, tz) {
    const p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })
      .formatToParts(new Date(ts)).forEach(x => { p[x.type] = +x.value; });
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000;
  }
  function zonedToUtc(y, mo, d, hhmm, tz) {
    const [hh, mm] = hhmm.split(":").map(Number);
    const wall = Date.UTC(y, mo - 1, d, hh, mm);
    try { let t = wall; for (let i = 0; i < 3; i++) t = wall - tzOffset(t, tz); return t; }
    catch (e) { console.warn("Invalid timezone in config.js, using device time.", e); return new Date(y, mo - 1, d, hh, mm).getTime(); }
  }
  const start = zonedToUtc(C.year, C.month, C.day, C.startTime, C.timezone);
  const end = zonedToUtc(C.year, C.month, C.day, C.endTime, C.timezone);
  const clockSkew = params.get("now") ? Date.parse(params.get("now")) - Date.now() : 0; // preview helper: ?now=2026-11-14T17:00:00Z
  const now = () => Date.now() + (isNaN(clockSkew) ? 0 : clockSkew);

  const dateLong = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(C.year, C.month - 1, C.day)));
  const t12 = s => { const [h, m] = s.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
  const text = { dateLong, timeRange: `${t12(C.startTime)} – ${t12(C.endTime)}`, venueName: C.venueName };
  $$("[data-bind]").forEach(el => { el.textContent = text[el.dataset.bind]; });
  $("#maps").href = C.mapsUrl;

  // Split the promise into words for a staggered reveal (text content stays identical)
  const pr = $("#promise"); const sentence = pr.textContent.trim();
  pr.setAttribute("aria-label", sentence);
  pr.innerHTML = sentence.split(" ").map((w, i, a) => `<span class="w" aria-hidden="true" style="--w:${i}">${w}${i < a.length - 1 ? " " : ""}</span>`).join("");

  /* ---------- Music ---------- */
  const audio = $("#song"), mBtn = $("#music"), toastEl = $("#toast");
  C.audioSources.forEach(s => { const e = document.createElement("source"); e.src = s.src; e.type = s.type; audio.appendChild(e); });
  let toastT, fadeT, musicBroken = false;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 3800); };
  const ui = on => { mBtn.classList.toggle("on", on); mBtn.setAttribute("aria-pressed", on); mBtn.setAttribute("aria-label", on ? "Pause music" : "Play music"); };
  audio.lastElementChild.addEventListener("error", () => { musicBroken = true; ui(false); toast("The music couldn’t be loaded."); });
  function fadeTo(v) { clearInterval(fadeT); try { audio.volume = 0; let x = 0; fadeT = setInterval(() => { x += .05; audio.volume = Math.min(v, x * v); if (x >= 1) clearInterval(fadeT); }, 100); } catch (e) {} }
  async function play(first) {
    if (musicBroken) return;
    try { await audio.play(); ui(true); if (first) fadeTo(C.musicVolume); else try { audio.volume = C.musicVolume; } catch (e) {} }
    catch (e) { ui(false); if (!musicBroken) toast("Tap the ♪ button to play the music"); }
  }
  mBtn.addEventListener("click", () => { if (audio.paused) play(false); else { audio.pause(); ui(false); } });
  audio.addEventListener("pause", () => ui(false));
  audio.addEventListener("playing", () => ui(true));

  /* ---------- Curtain ---------- */
  const curtain = $("#curtain"), stage = $("#stage");
  let opened = false;
  function openInvitation() {
    if (opened) return; opened = true;
    play(true);                                   // same tap that opens the curtain → allowed by browsers
    document.body.classList.add("opening");
    stage.removeAttribute("inert");
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("opened")));
    setTimeout(() => { curtain.hidden = true; root.style.setProperty("--d0", ".12s"); $("#t-invite").focus({ preventScroll: true }); }, reduce ? 800 : 4300);
    curtain.classList.add("done");
  }
  curtain.addEventListener("click", openInvitation);

  /* ---------- Sections ---------- */
  const tabs = $$('[role="tab"]'), panels = $$(".panel");
  tabs.forEach(t => t.setAttribute("aria-label", t.textContent.trim()));
  function show(id) {
    tabs.forEach(t => { const on = t.dataset.p === id; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    panels.forEach(p => { const on = p.id === id; p.classList.toggle("is-active", on); p.toggleAttribute("inert", !on); });
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t.dataset.p));
    t.addEventListener("keydown", e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
      const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); show(n.dataset.p);
    });
  });
  $("#home").addEventListener("click", () => show("p-invite"));

  /* ---------- Countdown (never resets when switching sections) ---------- */
  const cdEl = $("#cd"), cdMsg = $("#cd-msg"), cells = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function setCell(el, v) { if (el.textContent !== v) { el.textContent = v; if (el.dataset.ready) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); } el.dataset.ready = 1; } }
  function tick() {
    const diff = start - now();
    if (diff > 0) {
      const s = Math.floor(diff / 1000), p = n => String(n).padStart(2, "0");
      setCell(cells.d, String(Math.floor(s / 86400))); setCell(cells.h, p(Math.floor(s % 86400 / 3600)));
      setCell(cells.m, p(Math.floor(s % 3600 / 60))); setCell(cells.s, p(s % 60));
      cdEl.hidden = false; cdMsg.hidden = true;
    } else {
      cdEl.hidden = true; cdMsg.hidden = false;
      cdMsg.textContent = now() < end ? C.messageDuring : C.messageAfter;
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- RSVP ---------- */
  const form = $("#rsvp"), status = $("#status"), send = $("#send"), gIn = $("#guests"), gOut = $("#guests-out"), gRow = $("#guests-row");
  const setStatus = (m, err) => { status.textContent = m; status.classList.toggle("err", !!err); };
  const connected = /^https?:\/\//.test(C.rsvpEndpoint || "");
  if (!connected) { send.disabled = true; setStatus("RSVP isn’t connected yet — hosts: see README, step 5."); }
  $$("[data-step]", form).forEach(b => b.addEventListener("click", () => {
    const v = Math.max(1, Math.min(C.maxGuests, +gIn.value + +b.dataset.step)); gIn.value = v; gOut.textContent = v;
  }));
  form.addEventListener("change", e => {
    if (e.target.name === "attendance") { const no = e.target.value.startsWith("Regret"); gRow.classList.toggle("off", no); gIn.value = no ? 0 : Math.max(1, +gIn.value); gOut.textContent = no ? "–" : gIn.value; }
  });
  form.addEventListener("submit", async e => {
    e.preventDefault(); if (!connected || send.disabled) return;
    const name = form.name.value.trim(), att = form.attendance.value;
    if (name.length < 2) { setStatus("Please tell us your name.", 1); form.name.focus(); return; }
    if (!att) { setStatus("Please choose accepts or declines.", 1); return; }
    if (form._gotcha.value) { return showDone(att); }           // spam trap
    send.disabled = true; send.textContent = "Sending…"; setStatus("");
    try {
      const r = await fetch(C.rsvpEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      if (!r.ok) throw new Error(r.status);
      showDone(att);
    } catch (err) { setStatus("Sorry, that didn’t go through. Please try again.", 1); send.disabled = false; send.textContent = "Send Reply"; }
  });
  function showDone(att) {
    const yes = att.startsWith("Joy");
    $("#done-title").textContent = yes ? "With joy, thank you" : "Thank you";
    $("#done-text").textContent = yes ? "We can’t wait to celebrate with you." : "You will be missed, and we’re grateful you let us know.";
    form.hidden = true; $("#done").hidden = false; $("#p-rsvp > h2").hidden = true;
  }
})();
