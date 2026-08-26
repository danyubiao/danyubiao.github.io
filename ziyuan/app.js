(() => {
  const nav = document.getElementById("charNav");
  const speakBtn = document.getElementById("speakBtn");

  const els = {
    heroChar: document.getElementById("heroChar"),
    heroLead: document.getElementById("heroLead"),
    glyphShadow: document.getElementById("glyphShadow"),
    metaStructure: document.getElementById("metaStructure"),
    metaRadical: document.getElementById("metaRadical"),
    metaStrokes: document.getElementById("metaStrokes"),
    metaMethod: document.getElementById("metaMethod"),
    meaningText: document.getElementById("meaningText"),
    usageText: document.getElementById("usageText"),
    pinyinText: document.getElementById("pinyinText"),
    exampleList: document.getElementById("exampleList"),
    evoTrack: document.getElementById("evoTrack"),
    evoNote: document.getElementById("evoNote"),
    hero: document.getElementById("hero"),
  };

  let currentIndex = 0;

  function renderNav() {
    nav.innerHTML = CHARACTERS.map(
      (item, i) =>
        `<button type="button" data-index="${i}" aria-pressed="${i === currentIndex}">${item.char}</button>`
    ).join("");
  }

  function renderExamples(examples) {
    els.exampleList.innerHTML = examples
      .map(
        (ex) =>
          `<li><span class="word">${ex.word}</span><span class="gloss">${ex.gloss}</span></li>`
      )
      .join("");
  }

  function renderEvolution(steps) {
    els.evoTrack.innerHTML = steps
      .map(
        (step, i) =>
          `<li style="animation-delay:${0.08 * i}s"><span class="evo-form">${step.form}</span><span class="evo-era">${step.era}</span></li>`
      )
      .join("");
  }

  function setActiveNav() {
    [...nav.querySelectorAll("button")].forEach((btn, i) => {
      const active = i === currentIndex;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function renderCharacter(index) {
    const data = CHARACTERS[index];
    if (!data) return;

    currentIndex = index;
    els.hero.classList.remove("is-switching");
    void els.hero.offsetWidth;
    els.hero.classList.add("is-switching");

    els.heroChar.textContent = data.char;
    els.glyphShadow.textContent = data.char;
    els.heroLead.textContent = data.lead;
    els.metaStructure.textContent = data.structure;
    els.metaRadical.textContent = data.radical;
    els.metaStrokes.textContent = data.strokes;
    els.metaMethod.textContent = data.method;
    els.meaningText.textContent = data.meaning;
    els.usageText.textContent = data.usage;
    els.pinyinText.textContent = data.pinyin;
    els.evoNote.textContent = data.evoNote;
    renderExamples(data.examples);
    renderEvolution(data.evolution);
    setActiveNav();
    document.title = `字源 · ${data.char}`;
  }

  function speakCurrent() {
    const data = CHARACTERS[currentIndex];
    if (!data || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(data.char);
    utter.lang = "zh-CN";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-index]");
    if (!btn) return;
    renderCharacter(Number(btn.dataset.index));
  });

  speakBtn.addEventListener("click", speakCurrent);

  renderNav();
  renderCharacter(0);
})();
