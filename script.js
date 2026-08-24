(function () {
  const D = window.OH;
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  /* modes */
  $("#modeGrid").innerHTML = D.modes.map((m) => `
    <article class="card mode" style="--tint:${m.tint}">
      <span class="tag" style="background:${m.tint}">${m.tag}</span>
      <h3>${m.title}</h3>
      <p>${m.blurb}</p>
      <ul>${m.points.map((p) => `<li>${p}</li>`).join("")}</ul>
      <p class="price-hint">${m.priceHint}</p>
    </article>`).join("");

  /* flows */
  function renderSteps(which) {
    $("#steps").innerHTML = D.flows[which].map((s, i) => `
      <li style="animation-delay:${i * 40}ms"><h4>${s.h}</h4><p>${s.p}</p></li>`).join("");
  }
  renderSteps("host");
  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
      renderSteps(t.dataset.flow);
    });
  });

  /* profile */
  $("#topicRow").innerHTML = D.topics
    .map((t) => `<span class="topic ${t.cls}">${t.label}</span>`).join("");
  $("#anno").innerHTML = D.anno.map((a) => `
    <li style="border-left-color:${a.c}"><strong>${a.t}</strong><span>${a.d}</span></li>`).join("");

  /* fees, specs, policies, roadmap, faq */
  $("#feeGrid").innerHTML = D.fees.map((f) => `<div class="fee"><h4>${f.h}</h4><p>${f.p}</p></div>`).join("");

  $("#specList").innerHTML = D.specs.map((s, i) => `
    <section class="spec${i === 0 ? " open" : ""}">
      <button class="spec-head">
        <span class="spec-num">${String(i + 1).padStart(2, "0")}</span>
        ${s.title}
        <span class="chev">+</span>
      </button>
      <div class="spec-body">
        ${s.body ? `<p>${s.body}</p>` : ""}
        ${s.list ? `<ul>${s.list.map((l) => `<li>${l}</li>`).join("")}</ul>` : ""}
        ${s.code ? `<div class="mono-block">${s.code.replace(/</g, "&lt;")}</div>` : ""}
      </div>
    </section>`).join("");
  document.querySelectorAll(".spec-head").forEach((h) => {
    h.addEventListener("click", () => h.parentElement.classList.toggle("open"));
  });

  $("#policyGrid").innerHTML = D.policies.map((p) => `
    <div class="policy"><span class="pill ${p.pill}">policy</span><h3>${p.h}</h3><p>${p.p}</p></div>`).join("");

  $("#road").innerHTML = D.roadmap.map((r) => `
    <div class="phase"><span class="pill ${r.pill}">${r.label}</span><h3>${r.title}</h3>
      <ul>${r.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`).join("");

  $("#faqList").innerHTML = D.faq.map((f) => `
    <div class="faq"><h3>${f.q}</h3><p>${f.a}</p></div>`).join("");

  /* calculator */
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

  /* demo modal */
  const modal = $("#modal");
  function openDemo(kind) {
    const d = D.demos[kind];
    $("#modalBody").innerHTML = `
      <h3>${d.title}</h3>
      <ol>${d.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <div class="receipt">${d.receipt}</div>`;
    modal.hidden = false;
  }
  document.querySelectorAll("[data-demo]").forEach((b) => {
    b.addEventListener("click", () => openDemo(b.dataset.demo));
  });
  $("#modalX").addEventListener("click", () => (modal.hidden = true));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.hidden = true; });
})();
