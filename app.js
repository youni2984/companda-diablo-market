const $ = (id) => document.getElementById(id);

function effectiveMF(mf, factor) {
  return (mf * factor) / (mf + factor);
}

function card(title, effective, multiplier, hourly) {
  return `
    <article class="card stat">
      <h2>${title}</h2>
      <div class="value">${effective.toFixed(1)}%</div>
      <p>실효 MF</p>
      <p>기본 대비 품질 가중치 약 <strong>${multiplier.toFixed(2)}배</strong></p>
      <p>시간당 상대 기대지수 <strong>${hourly.toFixed(1)}</strong></p>
    </article>`;
}

function calculate() {
  const mf = Math.max(0, Number($("mf").value) || 0);
  const runs = Math.max(1, Number($("runs").value) || 1);

  const unique = effectiveMF(mf, 250);
  const set = effectiveMF(mf, 500);
  const rare = effectiveMF(mf, 600);
  const magic = mf;

  const data = [
    ["유니크", unique],
    ["세트", set],
    ["레어", rare],
    ["매직", magic],
  ];

  $("results").innerHTML = data.map(([name, eff]) => {
    const multiplier = 1 + eff / 100;
    return card(name, eff, multiplier, runs * multiplier);
  }).join("");
}

$("calc").addEventListener("click", calculate);
$("mf").addEventListener("input", calculate);
$("runs").addEventListener("input", calculate);
calculate();
