const VERSION = '1.1.0';
const $ = (id) => document.getElementById(id);

const AUTH_SESSION_KEY = 'companda-d2r-pattern-auth';
const USER_PATTERN = [4, 2, 1, 5, 7];
let patternPath = [];
let patternDragging = false;

function setAuthStatus(message, state = '') {
  const el = $('authStatus');
  el.textContent = message;
  el.className = `auth-status ${state}`.trim();
}

function paintPattern() {
  document.querySelectorAll('.pattern-dot').forEach((dot) => {
    dot.classList.toggle('selected', patternPath.includes(Number(dot.dataset.node)));
  });
  $('patternLength').textContent = `${patternPath.length}개 선택`;
}

function resetPattern(message = '첫 점을 누른 상태로 드래그하세요.') {
  patternPath = [];
  patternDragging = false;
  paintPattern();
  setAuthStatus(message);
}

function addPatternNode(dot) {
  if (!dot) return;
  const node = Number(dot.dataset.node);
  if (!patternPath.includes(node)) {
    patternPath.push(node);
    paintPattern();
  }
}

function unlockApp() {
  sessionStorage.setItem(AUTH_SESSION_KEY, 'ok');
  $('authGate').classList.add('authenticated');
  $('appShell').classList.remove('app-locked');
  $('appShell').setAttribute('aria-hidden', 'false');
}

function validatePattern() {
  if (!patternPath.length) return;
  const valid = patternPath.length === USER_PATTERN.length &&
    patternPath.every((node, index) => node === USER_PATTERN[index]);

  if (valid) {
    setAuthStatus('인증되었습니다.', 'success');
    setTimeout(unlockApp, 180);
  } else {
    setAuthStatus('패턴이 일치하지 않습니다. 다시 입력하세요.', 'error');
    document.querySelectorAll('.pattern-dot.selected').forEach((dot) => dot.classList.add('wrong'));
    setTimeout(() => resetPattern(), 650);
  }
}

function initPatternAuth() {
  if (sessionStorage.getItem(AUTH_SESSION_KEY) === 'ok') {
    unlockApp();
    return;
  }

  const grid = $('patternGrid');
  grid.addEventListener('pointerdown', (event) => {
    const dot = event.target.closest('.pattern-dot');
    if (!dot) return;
    event.preventDefault();
    patternPath = [];
    patternDragging = true;
    document.querySelectorAll('.pattern-dot').forEach((el) => el.classList.remove('wrong'));
    addPatternNode(dot);
    setAuthStatus('드래그 중…');
    try { grid.setPointerCapture(event.pointerId); } catch {}
  });

  grid.addEventListener('pointermove', (event) => {
    if (!patternDragging) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY);
    addPatternNode(target?.closest?.('.pattern-dot'));
  });

  const finish = (event) => {
    if (!patternDragging) return;
    event.preventDefault();
    patternDragging = false;
    try { grid.releasePointerCapture(event.pointerId); } catch {}
    validatePattern();
  };

  grid.addEventListener('pointerup', finish);
  grid.addEventListener('pointercancel', () => resetPattern());
  $('patternReset').addEventListener('click', () => resetPattern());
}

const RUNES = ['El','Eld','Tir','Nef','Eth','Ith','Tal','Ral','Ort','Thul','Amn','Sol','Shael','Dol','Hel','Io','Lum','Ko','Fal','Lem','Pul','Um','Mal','Ist','Gul','Vex','Ohm','Lo','Sur','Ber','Jah','Cham','Zod'];

const RUNEWORDS = [
  {name:'고대인의 서약', en:'Ancients Pledge', runes:['Ral','Ort','Tal'], sockets:3, level:21, types:['방패']},
  {name:'권위', en:'Authority', runes:['Hel','Shael','Ral'], sockets:3, level:29, types:['갑옷'], tag:'3.0 신규'},
  {name:'뼈', en:'Bone', runes:['Sol','Um','Um'], sockets:3, level:47, types:['갑옷']},
  {name:'찔레', en:'Bramble', runes:['Ral','Ohm','Sur','Eth'], sockets:4, level:61, types:['갑옷']},
  {name:'명예의 굴레', en:'Chains of Honor', runes:['Dol','Um','Ber','Ist'], sockets:4, level:63, types:['갑옷']},
  {name:'착란', en:'Delirium', runes:['Lem','Ist','Io'], sockets:3, level:51, types:['투구']},
  {name:'용', en:'Dragon', runes:['Sur','Lo','Sol'], sockets:3, level:61, types:['갑옷','방패']},
  {name:'꿈', en:'Dream', runes:['Io','Jah','Pul'], sockets:3, level:65, types:['투구','방패']},
  {name:'협박', en:'Duress', runes:['Shael','Um','Thul'], sockets:3, level:47, types:['갑옷']},
  {name:'수수께끼', en:'Enigma', runes:['Jah','Ith','Ber'], sockets:3, level:65, types:['갑옷']},
  {name:'깨우침', en:'Enlightenment', runes:['Pul','Ral','Sol'], sockets:3, level:45, types:['갑옷']},
  {name:'추방', en:'Exile', runes:['Vex','Ohm','Ist','Dol'], sockets:4, level:57, types:['방패']},
  {name:'꺼져가는 불길', en:'Flickering Flame', runes:['Nef','Pul','Vex'], sockets:3, level:55, types:['투구'], tag:'래더 S1–2'},
  {name:'인내', en:'Fortitude', runes:['El','Sol','Dol','Lo'], sockets:4, level:59, types:['갑옷']},
  {name:'어스름', en:'Gloom', runes:['Fal','Um','Pul'], sockets:3, level:47, types:['갑옷']},
  {name:'신화', en:'Myth', runes:['Hel','Amn','Nef'], sockets:3, level:25, types:['갑옷']},
  {name:'평화', en:'Peace', runes:['Shael','Thul','Amn'], sockets:3, level:29, types:['갑옷']},
  {name:'원칙', en:'Principle', runes:['Ral','Gul','Eld'], sockets:3, level:53, types:['갑옷']},
  {name:'신중', en:'Prudence', runes:['Mal','Tir'], sockets:2, level:49, types:['갑옷']},
  {name:'비', en:'Rain', runes:['Ort','Mal','Ith'], sockets:3, level:49, types:['갑옷']},
  {name:'연기', en:'Smoke', runes:['Nef','Lum'], sockets:2, level:37, types:['갑옷']},
  {name:'잠행', en:'Stealth', runes:['Tal','Eth'], sockets:2, level:17, types:['갑옷']},
  {name:'돌', en:'Stone', runes:['Shael','Um','Pul','Lum'], sockets:4, level:47, types:['갑옷']},
  {name:'배신', en:'Treachery', runes:['Shael','Thul','Lem'], sockets:3, level:43, types:['갑옷']},
  {name:'부', en:'Wealth', runes:['Lem','Ko','Tir'], sockets:3, level:43, types:['갑옷']},
  {name:'용맹', en:'Lionheart', runes:['Hel','Lum','Fal'], sockets:3, level:41, types:['갑옷']},
  {name:'전승', en:'Lore', runes:['Ort','Sol'], sockets:2, level:27, types:['투구']},
  {name:'천저', en:'Nadir', runes:['Nef','Tir'], sockets:2, level:13, types:['투구']},
  {name:'찬란한 빛', en:'Radiance', runes:['Nef','Sol','Ith'], sockets:3, level:27, types:['투구']},
  {name:'지혜', en:'Wisdom', runes:['Pul','Ith','Eld'], sockets:3, level:45, types:['투구'], tag:'래더 S1–2'},
  {name:'마녀단', en:'Coven', runes:['Ist','Ral','Io'], sockets:3, level:51, types:['투구'], tag:'3.0 신규'},
  {name:'각운', en:'Rhyme', runes:['Shael','Eth'], sockets:2, level:29, types:['방패']},
  {name:'성역', en:'Sanctuary', runes:['Ko','Ko','Mal'], sockets:3, level:49, types:['방패']},
  {name:'영혼', en:'Spirit', runes:['Tal','Thul','Ort','Amn'], sockets:4, level:25, types:['방패']},
  {name:'광채', en:'Splendor', runes:['Eth','Lum'], sockets:2, level:37, types:['방패']},
  {name:'불사조', en:'Phoenix', runes:['Vex','Vex','Lo','Jah'], sockets:4, level:65, types:['방패']}
];

function runeCounts(list) {
  return list.reduce((acc, rune) => (acc[rune] = (acc[rune] || 0) + 1, acc), {});
}

function renderRunewords() {
  const q = $('rwSearch').value.trim().toLowerCase();
  const type = $('rwType').value;
  const sockets = $('rwSockets').value;
  const maxLevel = Math.max(1, Math.min(99, Number($('rwLevel').value) || 99));

  const rows = RUNEWORDS.filter((rw) => {
    const hay = `${rw.name} ${rw.en} ${rw.runes.join(' ')} ${rw.types.join(' ')}`.toLowerCase();
    return (!q || hay.includes(q)) &&
      (type === 'all' || rw.types.includes(type)) &&
      (sockets === 'all' || rw.sockets === Number(sockets)) &&
      rw.level <= maxLevel;
  });

  $('rwCount').textContent = `${rows.length}개`;
  $('runewordGrid').innerHTML = rows.map((rw) => `
    <article class="card rw-card">
      <div class="rw-top"><div><h3>${rw.name}</h3><p>${rw.en}</p></div>${rw.tag ? `<span class="badge">${rw.tag}</span>` : ''}</div>
      <div class="rune-line">${rw.runes.map((r) => `<span>${r}</span>`).join('<b>+</b>')}</div>
      <dl><div><dt>홈</dt><dd>${rw.sockets}</dd></div><div><dt>레벨</dt><dd>${rw.level}</dd></div><div><dt>부위</dt><dd>${rw.types.join(' · ')}</dd></div></dl>
    </article>`).join('');
}

function loadInventory() {
  try { return JSON.parse(localStorage.getItem('companda-d2r-runes') || '{}'); }
  catch { return {}; }
}

let inventory = loadInventory();

function saveInventory() {
  localStorage.setItem('companda-d2r-runes', JSON.stringify(inventory));
}

function renderRunes() {
  $('runeGrid').innerHTML = RUNES.map((rune) => `
    <label class="rune-item ${inventory[rune] ? 'owned' : ''}">
      <input type="checkbox" data-rune="${rune}" ${inventory[rune] ? 'checked' : ''}/>
      <span>${rune}</span>
    </label>`).join('');

  document.querySelectorAll('[data-rune]').forEach((el) => el.addEventListener('change', () => {
    inventory[el.dataset.rune] = el.checked;
    saveInventory();
    renderRunes();
    renderCraftable();
  }));
}

function canCraft(rw) {
  const needed = runeCounts(rw.runes);
  return Object.keys(needed).every((rune) => Boolean(inventory[rune])) && Object.values(needed).every((count) => count === 1);
}

function renderCraftable() {
  const ready = RUNEWORDS.filter(canCraft);
  const note = '<p class="muted">현재 룬 보유는 체크 방식이라 같은 룬이 2개 이상 필요한 조합은 자동 완성 판정에서 제외됩니다.</p>';
  $('craftable').innerHTML = note + (ready.length
    ? `<div class="chips">${ready.map((rw) => `<span class="chip">${rw.name} · ${rw.runes.join('+')}</span>`).join('')}</div>`
    : '<p>체크된 룬으로 바로 만들 수 있는 등록 룬워드가 없습니다.</p>');
}

function effectiveMF(mf, factor) { return (mf * factor) / (mf + factor); }

function renderMF() {
  const mf = Math.max(0, Number($('mfValue').value) || 0);
  const runs = Math.max(1, Number($('runs').value) || 1);
  const data = [
    ['유니크', effectiveMF(mf, 250)],
    ['세트', effectiveMF(mf, 500)],
    ['레어', effectiveMF(mf, 600)],
    ['매직', mf]
  ];
  $('mfResults').innerHTML = data.map(([name, eff]) => {
    const multiplier = 1 + eff / 100;
    return `<article class="card stat"><h3>${name}</h3><div class="value">${eff.toFixed(1)}%</div><p>실효 MF</p><p>품질 가중치 약 <strong>${multiplier.toFixed(2)}배</strong></p><p>시간당 상대 기대지수 <strong>${(runs * multiplier).toFixed(1)}</strong></p></article>`;
  }).join('');
}

function activateTab(id) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === id));
  history.replaceState(null, '', `#${id}`);
}

initPatternAuth();
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => activateTab(b.dataset.tab)));
['rwSearch','rwType','rwSockets','rwLevel'].forEach((id) => $(id).addEventListener('input', renderRunewords));
['mfValue','runs'].forEach((id) => $(id).addEventListener('input', renderMF));
$('clearRunes').addEventListener('click', () => { inventory = {}; saveInventory(); renderRunes(); renderCraftable(); });

const initialTab = location.hash.replace('#','');
if (['runewords','runes','mf','about'].includes(initialTab)) activateTab(initialTab);
renderRunewords();
renderRunes();
renderCraftable();
renderMF();
console.info(`Companda D2R Helper v${VERSION} · static/no-server · pattern-gate`);
