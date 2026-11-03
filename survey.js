// ============================================================
// 설문 화면 공통 렌더러 (index.html 과 survey.html 이 같이 쓴다)
// runSurvey({ sections, card, bar, submitLabel, onSubmit, stepOffset, stepTotal })
// ============================================================

function runSurvey({ sections, card, bar, submitLabel = "제출", onSubmit, stepOffset = 0, stepTotal }) {
  const total = stepTotal || sections.length;
  const answers = {};
  let step = 0;

  const field = q => {
    const v = answers[q.id];
    if (q.type === "choice")
      return `<div class="choices">${q.options.map(o => `<label><input type="radio" name="${q.id}" value="${o}" ${v === o ? "checked" : ""}>${o}</label>`).join("")}</div>`;
    if (q.type === "likert")
      return `<div class="likert">${Array.from({ length: q.points }, (_, i) => i + 1).map(n =>
        `<label><input type="radio" name="${q.id}" value="${n}" ${+v === n ? "checked" : ""}>${n}</label>`).join("")}</div>
        <div class="ends"><span>${q.left}</span><span>${q.right}</span></div>`;
    if (q.type === "slider")
      return `<input type="range" name="${q.id}" min="0" max="100" value="${v ?? 50}">
        <div class="range-val ${v == null ? "untouched" : ""}" data-val="${q.id}">${v ?? "막대를 움직여 주세요"}</div>
        <div class="ends"><span>${q.left}</span><span>${q.right}</span></div>`;
  };

  function render() {
    if (bar) bar.style.width = `${((stepOffset + step + 1) / (total + 1)) * 100}%`;
    const sec = sections[step];
    const last = step === sections.length - 1;
    card.innerHTML = `<h1>${sec.title}</h1><div class="desc">${sec.desc || ""}</div>
      ${sec.questions.map(q => `<div class="q" data-id="${q.id}"><div class="q-text">${q.text}</div>${field(q)}</div>`).join("")}
      <div class="err" id="err"></div>
      <div class="nav">${step > 0 ? `<button class="ghost" id="prev">이전</button>` : "<span></span>"}<button id="next">${last ? submitLabel : "다음"}</button></div>`;
    card.querySelectorAll("input").forEach(el => el.addEventListener("input", () => {
      answers[el.name] = el.type === "range" ? +el.value : el.value;
      if (el.type === "range") { const v = card.querySelector(`[data-val="${el.name}"]`); v.textContent = el.value; v.classList.remove("untouched"); }
      el.closest(".q").classList.remove("missing");
    }));
    const prev = card.querySelector("#prev"); if (prev) prev.onclick = () => { step--; render(); scrollTo(0, 0); };
    card.querySelector("#next").onclick = next;
  }

  function next() {
    const missing = sections[step].questions.filter(q => answers[q.id] == null);
    missing.forEach(q => card.querySelector(`[data-id="${q.id}"]`).classList.add("missing"));
    if (missing.length) {
      card.querySelector("#err").textContent = `빨간색 문항 ${missing.length}개에 답해 주세요.`;
      return card.querySelector(".missing").scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (step < sections.length - 1) { step++; render(); return scrollTo(0, 0); }
    const btn = card.querySelector("#next");
    btn.disabled = true; btn.textContent = "저장 중…";
    onSubmit({ ...answers }).catch(() => {
      btn.disabled = false; btn.textContent = "다시 시도";
      card.querySelector("#err").textContent = "저장하지 못했습니다. 연구 서버(python3 server.py)가 켜져 있는지 확인해 주세요.";
    });
  }

  render();
}
