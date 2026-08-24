(function () {
  const D = window.OH;
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  /* ---------- modes ---------- */
  $("#modeGrid").innerHTML = D.modes.map((m) => `
    <article class="card mode" style="--tint:${m.tint}">
      <span class="tag">${m.tag}</span>
      <h3>${m.title}</h3>
      <p>${m.blurb}</p>
      <ul>${m.points.map((p) => `<li>${p}</li>`).join("")}</ul>
      <p class="price-hint">${m.priceHint}</p>
    </article>`).join("");

  /* ---------- flows (real tabs) ---------- */
  const steps = $("#steps");
  const tabs = [...document.querySelectorAll(".tab")];

  function renderSteps(which) {
    steps.innerHTML = D.flows[which].map((s, i) => `
      <li style="animation-delay:${i * 35}ms"><h4>${s.h}</h4><p>${s.p}</p></li>`).join("");
  }

  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    steps.setAttribute("aria-labelledby", tab.id);
    renderSteps(tab.dataset.flow);
    if (focus) tab.focus();
  }

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t, false));
    t.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      selectTab(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });
  renderSteps("host");

  /* ---------- profile ---------- */
  $("#topicRow").innerHTML = D.topics
    .map((t) => `<span class="topic ${t.cls}">${t.label}</span>`).join("");
  $("#anno").innerHTML = D.anno.map((a) => `
    <li><strong>${a.t}</strong><span>${a.d}</span></li>`).join("");

  /* ---------- fees, policies, roadmap ---------- */
  $("#feeGrid").innerHTML = D.fees
    .map((f) => `<div class="fee"><h4>${f.h}</h4><p>${f.p}</p></div>`).join("");

  $("#policyGrid").innerHTML = D.policies.map((p) => `
    <div class="policy"><span class="pill ${p.pill}">policy</span><h3>${p.h}</h3><p>${p.p}</p></div>`).join("");

  $("#road").innerHTML = D.roadmap.map((r) => `
    <div class="phase"><span class="pill ${r.pill}">${r.label}</span><h3>${r.title}</h3>
      <ul>${r.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`).join("");

  /* ---------- spec accordion ---------- */
  $("#specList").innerHTML = D.specs.map((s, i) => {
    const open = i === 0;
    return `
    <section class="spec${open ? " open" : ""}">
      <h3 class="spec-h">
        <button class="spec-head" aria-expanded="${open}" aria-controls="spec-body-${i}">
          <span class="spec-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="spec-title">${s.title}</span>
          <span class="chev" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="spec-body" id="spec-body-${i}">
        <div class="spec-inner">
          ${s.body ? `<p>${s.body}</p>` : ""}
          ${s.list ? `<ul>${s.list.map((l) => `<li>${l}</li>`).join("")}</ul>` : ""}
          ${s.code ? `<div class="mono-block" tabindex="0" role="region" aria-label="${s.title} schema">${s.code.replace(/</g, "&lt;")}</div>` : ""}
        </div>
      </div>
    </section>`;
  }).join("");

  document.querySelectorAll(".spec-head").forEach((h) => {
    h.addEventListener("click", () => {
      const sec = h.closest(".spec");
      const open = sec.classList.toggle("open");
      h.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- calculator ---------- */
  const inputs = ["inLive", "inLiveQty", "inJelly", "inJellyQty"].map((id) => document.getElementById(id));
  function calc() {
    const [live, liveQty, jelly, jellyQty] = inputs.map((i) => +i.value);
    $("#outLive").textContent = money(live);
    $("#outLiveQty").textContent = liveQty;
    $("#outJelly").textContent = money(jelly);
    $("#outJellyQty").textContent = jellyQty;

    const weekly = live * liveQty + jelly * jellyQty;
    const gross = weekly * 4.33;
    const txns = (liveQty + jellyQty) * 4.33;
    const net = Math.max(0, gross * 0.9 - (gross * 0.029 + txns * 0.3));
    $("#outGross").textContent = money(gross);
    $("#outNet").textContent = money(net);
    const hrs = (liveQty * 30) / 60;
    $("#outHours").textContent = `\u2248 ${hrs % 1 ? hrs.toFixed(1) : hrs} hrs of live time + ${jellyQty} jellies a week`;
  }
  inputs.forEach((i) => i.addEventListener("input", calc));
  calc();

  /* ---------- shared modal ---------- */
  const modal = $("#modal");
  const card = modal.querySelector(".modal-card");
  let lastFocus = null;

  function openModal(html) {
    lastFocus = document.activeElement;
    $("#modalBody").innerHTML = html;
    modal.hidden = false;
    document.body.classList.add("is-locked");
    $("#modalX").focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* keep tab focus inside the dialog */
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = [...card.querySelectorAll('button,[href],iframe,input,[tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  $("#modalX").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* shared with firehose.js */
  window.OHModal = { open: openModal, close: closeModal };

  /* ---------- demo receipts ---------- */
  document.querySelectorAll("[data-demo]").forEach((b) => {
    b.addEventListener("click", () => {
      const d = D.demos[b.dataset.demo];
      openModal(`
        <h3 id="modalTitle">${d.title}</h3>
        <ol>${d.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
        <div class="receipt" tabindex="0">${d.receipt}</div>
        <p class="modal-note">Illustrative. Real checkout needs a backend.</p>`);
    });
  });
})();
