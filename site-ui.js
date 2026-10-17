const SITE_VERSION = '1.6.0';

const siteStyle = document.createElement('link');
siteStyle.rel = 'stylesheet';
siteStyle.href = 'site.css';
document.head.appendChild(siteStyle);

function openSiteTab(id) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === id));
  history.replaceState(null, '', `#${id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-open-tab]').forEach((el) => {
  el.addEventListener('click', () => openSiteTab(el.dataset.openTab));
});

const siteHash = location.hash.replace('#', '');
if (['home','guide','simulator','scan','visual3d','runewords','runes','mf','about','yupgoolg'].includes(siteHash)) {
  openSiteTab(siteHash);
} else if (!location.hash) {
  openSiteTab('home');
}

const imageInput = document.getElementById('itemImage');
const preview = document.getElementById('itemPreview');
const runOcr = document.getElementById('runOcr');
const ocrText = document.getElementById('ocrText');
const ocrProgress = document.getElementById('ocrProgress');
let imageObjectUrl = null;

if (imageInput) {
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
    imageObjectUrl = URL.createObjectURL(file);
    preview.src = imageObjectUrl;
    preview.hidden = false;
    runOcr.disabled = false;
    ocrProgress.textContent = '이미지 준비 완료';
  });
}

if (runOcr) {
  runOcr.addEventListener('click', async () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    if (!window.Tesseract) {
      ocrProgress.textContent = 'OCR 라이브러리를 불러오지 못했습니다. 아래 입력창에 옵션을 직접 붙여넣어도 분석할 수 있습니다.';
      return;
    }
    runOcr.disabled = true;
    try {
      const result = await Tesseract.recognize(file, 'kor+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') ocrProgress.textContent = `문자 판독 ${(m.progress * 100).toFixed(0)}%`;
          else ocrProgress.textContent = m.status || '판독 중';
        }
      });
      ocrText.value = result.data.text.trim();
      ocrProgress.textContent = '판독 완료 · 결과를 확인한 뒤 아이템 분석을 누르세요.';
      analyzeDetectedItem();
    } catch (error) {
      console.error(error);
      ocrProgress.textContent = '자동 판독에 실패했습니다. 이미지를 더 크게 촬영하거나 옵션 문자를 직접 입력하세요.';
    } finally {
      runOcr.disabled = false;
    }
  });
}

const ITEM_KEYWORDS = [
  ['할리퀸 관모','unique'], ['수수께끼','runeword'], ['영혼','runeword'], ['불사조','runeword'], ['꿈','runeword'], ['인내','runeword'], ['명예의 굴레','runeword'],
  ['Harlequin Crest','unique'], ['Enigma','runeword'], ['Spirit','runeword'], ['Phoenix','runeword'], ['Dream','runeword'], ['Fortitude','runeword'], ['Chains of Honor','runeword']
];

function parseNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1].replace(',', ''));
  }
  return null;
}

function analyzeDetectedItem() {
  const text = ocrText?.value || '';
  const lower = text.toLowerCase();
  const marketHit = playnoteItems.find((item) => lower.includes(String(item.name || '').toLowerCase()));
  const detected = ITEM_KEYWORDS.find(([name]) => lower.includes(name.toLowerCase()));
  const name = marketHit?.name || detected?.[0] || (text.split(/\r?\n/).map(v=>v.trim()).find(Boolean) || '아이템명 확인 필요');
  const quality = detected?.[1] || (/룬어|runeword/i.test(text) ? 'runeword' : /고유|unique/i.test(text) ? 'unique' : /세트|set/i.test(text) ? 'set' : 'normal');
  const allSkills = parseNumber(text, [/(?:모든 기술|all skills)[^+\d]*\+?(\d+)/i, /\+(\d+)\s*(?:모든 기술|to all skills)/i]);
  const fcr = parseNumber(text, [/(\d+)\s*%?\s*(?:시전 속도|faster cast rate|fcr)/i]);
  const ias = parseNumber(text, [/(\d+)\s*%?\s*(?:공격 속도|increased attack speed|ias)/i]);
  const mf = parseNumber(text, [/(\d+)\s*%?\s*(?:마법 아이템|better chance|magic find|mf)/i]);
  const res = parseNumber(text, [/(?:모든 저항|all resistances?)[^+\d]*\+?(\d+)/i, /\+(\d+)\s*(?:모든 저항|all resistances?)/i]);
  const result = document.getElementById('itemAnalysis');
  result.innerHTML = `
    <div class="detected-name">${escapeSite(name)}</div>
    <div class="analysis-tags">
      <span>${qualityLabel(quality)}</span>
      ${allSkills !== null ? `<span>모든 기술 +${allSkills}</span>` : ''}
      ${fcr !== null ? `<span>시전 속도 ${fcr}%</span>` : ''}
      ${ias !== null ? `<span>공격 속도 ${ias}%</span>` : ''}
      ${mf !== null ? `<span>매찬 ${mf}%</span>` : ''}
      ${res !== null ? `<span>모든 저항 +${res}</span>` : ''}
      ${marketHit ? `<span>Playnote 등록 ${marketHit.listingCount}건</span>` : ''}
    </div>
    ${marketHit ? `<p class="market-price-line">Playnote 등록가 중앙값 <strong>${Number(marketHit.price?.median || 0).toLocaleString()}P</strong> · ${Number(marketHit.price?.min || 0).toLocaleString()}~${Number(marketHit.price?.max || 0).toLocaleString()}P</p>` : ''}
    <p class="muted">OCR은 촬영 각도·글꼴·색상에 따라 오인식할 수 있으므로 거래 전에 실제 게임 옵션을 다시 확인하세요.</p>`;
  updateMarketLinks(name);
  if (marketHit) usePlaynoteItem(marketHit, false);
}

document.getElementById('analyzeItem')?.addEventListener('click', analyzeDetectedItem);
document.getElementById('clearScan')?.addEventListener('click', () => {
  if (ocrText) ocrText.value = '';
  if (preview) { preview.hidden = true; preview.removeAttribute('src'); }
  if (imageInput) imageInput.value = '';
  if (runOcr) runOcr.disabled = true;
  document.getElementById('itemAnalysis').innerHTML = '';
  ocrProgress.textContent = '';
});

function escapeSite(value='') {
  return String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function qualityLabel(q) {
  return ({normal:'일반',magic:'마법',rare:'희귀',set:'세트',unique:'고유',runeword:'룬어',crafted:'제작'})[q] || q;
}
function updateMarketLinks(name) {
  const traderie = document.getElementById('traderieLink');
  if (traderie) traderie.href = `https://traderie.com/diablo2resurrected/products?search=${encodeURIComponent(name)}`;
}

const priceSamples = document.getElementById('priceSamples');
function renderPriceMedian() {
  const values = (priceSamples?.value || '').split(/[\s,;/]+/).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
  const out = document.getElementById('priceResult');
  if (!values.length) { out.textContent = '표본을 입력하세요.'; return; }
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 ? values[mid] : (values[mid-1] + values[mid]) / 2;
  const min = values[0], max = values[values.length-1];
  out.innerHTML = `<strong>중앙값 ${median.toLocaleString()}</strong><span>표본 ${values.length}개 · 범위 ${min.toLocaleString()} ~ ${max.toLocaleString()}</span>`;
}
priceSamples?.addEventListener('input', renderPriceMedian);

function applyVisualPreview() {
  const name = document.getElementById('visualItemName')?.value.trim() || '장비';
  const slot = document.getElementById('visualSlot')?.value || 'body';
  const quality = document.getElementById('visualQuality')?.value || 'normal';
  const materialPreset = document.getElementById('visualMaterial')?.value || 'steel';
  const visualColor = document.getElementById('visualColor')?.value || '#73777c';
  const charName = document.getElementById('visualClass')?.value || '캐릭터';
  const visual = window.CompandaItemVisual?.build({nameKo:name, slot, quality, materialPreset, visualColor}) || {baseColor:visualColor,materialPreset};
  const mannequin = document.getElementById('mannequin');
  if (!mannequin) return;
  mannequin.dataset.slot = slot;
  mannequin.style.setProperty('--gear-color', visual.baseColor);
  mannequin.style.setProperty('--gear-accent', visual.accentColor || visual.baseColor);
  mannequin.style.setProperty('--gear-shine', String(Math.max(0.08, 1 - (visual.roughness || .5))));
  mannequin.classList.remove('pulse-equip'); void mannequin.offsetWidth; mannequin.classList.add('pulse-equip');
  document.getElementById('visualInfo').innerHTML = `<strong>${escapeSite(charName)} · ${escapeSite(name)}</strong><span>${qualityLabel(quality)} · ${escapeSite(visual.materialPreset || materialPreset)} · ${escapeSite(visual.baseColor)}</span>`;
  applyCharacterMotion(currentMotion || preferredMotionFor(charName, slot, name));
}
document.getElementById('applyVisual')?.addEventListener('click', applyVisualPreview);
['visualClass','visualItemName','visualSlot','visualQuality','visualMaterial','visualColor'].forEach(id => document.getElementById(id)?.addEventListener('input', applyVisualPreview));

// ---- Playnote public item learning layer ----
let playnoteItems = [];
let playnoteMeta = null;

function createPlaynotePanel() {
  const scan = document.getElementById('scan');
  if (!scan || document.getElementById('playnotePanel')) return;
  const panel = document.createElement('section');
  panel.id = 'playnotePanel';
  panel.className = 'card playnote-panel';
  panel.innerHTML = `
    <div class="section-head"><div><p class="eyebrow">PLAYNOTE PUBLIC MARKET</p><h2>등록 아이템 자동 학습 DB</h2></div><span id="playnoteStatus" class="badge">데이터 불러오는 중</span></div>
    <p class="muted">로그인 우회 없이 공개 아이템 마켓에 표시되는 아이템명·서버·상태·수량·등록가·공개 옵션만 주기적으로 저장합니다.</p>
    <div class="playnote-tools">
      <input id="playnoteSearch" type="search" placeholder="Playnote 등록 아이템 검색" autocomplete="off" />
      <select id="playnoteCategory"><option value="all">전체 분류</option></select>
    </div>
    <div id="playnoteResults" class="playnote-results"></div>`;
  const priceCard = scan.querySelector('.price-card');
  if (priceCard) scan.insertBefore(panel, priceCard);
  else scan.appendChild(panel);
  document.getElementById('playnoteSearch')?.addEventListener('input', renderPlaynoteItems);
  document.getElementById('playnoteCategory')?.addEventListener('input', renderPlaynoteItems);
}

async function loadPlaynoteItems() {
  createPlaynotePanel();
  const status = document.getElementById('playnoteStatus');
  try {
    const res = await fetch(`data/playnote-items.json?v=${Date.now()}`, {cache:'no-store'});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    playnoteMeta = await res.json();
    playnoteItems = Array.isArray(playnoteMeta.items) ? playnoteMeta.items : [];
    const cats = [...new Set(playnoteItems.map(x => x.category).filter(Boolean))].sort();
    const select = document.getElementById('playnoteCategory');
    if (select) select.innerHTML = '<option value="all">전체 분류</option>' + cats.map(c=>`<option value="${escapeSite(c)}">${escapeSite(c)}</option>`).join('');
    if (status) status.textContent = `${playnoteMeta.itemCount || playnoteItems.length}종 · 등록 ${playnoteMeta.listingCount || 0}건`;
    renderPlaynoteItems();
  } catch (err) {
    console.error('Playnote snapshot load failed', err);
    if (status) status.textContent = '스냅샷 없음';
    const out = document.getElementById('playnoteResults');
    if (out) out.innerHTML = '<p class="muted">아직 첫 자동 동기화 전이거나 데이터를 불러오지 못했습니다.</p>';
  }
}

function renderPlaynoteItems() {
  const q = (document.getElementById('playnoteSearch')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('playnoteCategory')?.value || 'all';
  const out = document.getElementById('playnoteResults');
  if (!out) return;
  const rows = playnoteItems.filter(x => (!q || `${x.name} ${x.category} ${(x.optionLabels||[]).join(' ')}`.toLowerCase().includes(q)) && (cat === 'all' || x.category === cat)).slice(0, 60);
  out.innerHTML = rows.length ? rows.map((x,i)=>`
    <button class="market-item-card" type="button" data-market-index="${playnoteItems.indexOf(x)}">
      <span class="market-item-main"><b>${escapeSite(x.name)}</b><small>${escapeSite(x.category || '기타')} · 등록 ${x.listingCount || 0}건</small></span>
      <span class="market-item-price"><b>${Number(x.price?.median || 0).toLocaleString()}P</b><small>${Number(x.price?.min || 0).toLocaleString()}~${Number(x.price?.max || 0).toLocaleString()}P</small></span>
    </button>`).join('') : '<p class="muted">검색 결과가 없습니다.</p>';
  out.querySelectorAll('[data-market-index]').forEach(btn => btn.addEventListener('click', () => usePlaynoteItem(playnoteItems[Number(btn.dataset.marketIndex)])));
}

function usePlaynoteItem(item, openVisual = true) {
  if (!item) return;
  if (priceSamples) priceSamples.value = (item.samples || []).map(x => x.unitPriceP).filter(Number.isFinite).join(', ');
  renderPriceMedian();
  const visualName = document.getElementById('visualItemName');
  if (visualName) visualName.value = item.name || '';
  const inferred = inferWearSlot(item);
  const slotEl = document.getElementById('visualSlot');
  if (slotEl && inferred.slot) slotEl.value = inferred.slot;
  const qualityEl = document.getElementById('visualQuality');
  if (qualityEl && inferred.quality) qualityEl.value = inferred.quality;
  applyVisualPreview();
  updateMarketLinks(item.name || '');
  const analysis = document.getElementById('itemAnalysis');
  if (analysis) analysis.innerHTML = `<div class="detected-name">${escapeSite(item.name)}</div><div class="analysis-tags"><span>Playnote ${escapeSite(item.category || '기타')}</span><span>등록 ${item.listingCount || 0}건</span><span>중앙 ${Number(item.price?.median || 0).toLocaleString()}P</span></div><p class="muted">등록가 표본이며 실제 체결가는 다를 수 있습니다.</p>`;
  if (openVisual) openSiteTab('visual3d');
}

function inferWearSlot(item = {}) {
  const n = `${item.name || ''} ${item.category || ''} ${(item.optionLabels || []).join(' ')}`;
  let slot = 'body';
  if (/투구|관모|바이저|헬름|머리|뚜껑|circlet|tiara|diadem/i.test(n)) slot = 'head';
  else if (/방패|쉴드|모너크|세이크리드 타아지|성기사 방패/i.test(n)) slot = 'shield';
  else if (/장갑|글러브/i.test(n)) slot = 'gloves';
  else if (/부츠|신발|greaves/i.test(n)) slot = 'boots';
  else if (/갑옷|아머|플레이트|메일|수수께끼|인내|명예의 굴레/i.test(n)) slot = 'body';
  else if (/도검|검|소드|도끼|액스|철퇴|메이스|창|스피어|폴암|싸이드|활|보우|석궁|클러|완드|셉터|지팡이|스태프|오브|무한|영혼\(도검\)/i.test(n)) slot = 'weaponMain';
  const quality = /룬워드|수수께끼|무한|영혼|불사조|인내|꿈/i.test(n) ? 'runeword' : /유니크|고유/i.test(n) ? 'unique' : /세트/i.test(n) ? 'set' : 'normal';
  return {slot, quality};
}

// ---- Character equipment motion layer ----
const CHARACTER_MOTION_PROFILES = {
  '원소술사': {attack:'cast', weaponMain:'cast', shield:'block', body:'idle'},
  '아마존': {attack:'shoot', weaponMain:'shoot', shield:'block', body:'idle'},
  '성기사': {attack:'slash', weaponMain:'slash', shield:'block', body:'aura'},
  '강령술사': {attack:'cast', weaponMain:'cast', shield:'cast', body:'summon'},
  '암살자': {attack:'martial', weaponMain:'martial', shield:'block', body:'idle'},
  '야만용사': {attack:'heavy', weaponMain:'heavy', shield:'block', body:'warcry'},
  '드루이드': {attack:'cast', weaponMain:'slash', shield:'block', body:'transform'},
  '악마술사': {attack:'cast', weaponMain:'cast', shield:'cast', body:'ritual'}
};
let currentMotion = 'idle';

function ensureMotionControls() {
  const card = document.querySelector('.mannequin-card');
  if (!card || document.getElementById('motionControls')) return;
  const box = document.createElement('div');
  box.id = 'motionControls';
  box.className = 'motion-controls';
  box.innerHTML = `
    <button type="button" data-motion="idle">대기</button>
    <button type="button" data-motion="run">달리기</button>
    <button type="button" data-motion="attack">공격</button>
    <button type="button" data-motion="cast">시전</button>
    <button type="button" data-motion="block">막기</button>
    <button type="button" data-motion="auto">자동</button>`;
  card.appendChild(box);
  box.querySelectorAll('[data-motion]').forEach(btn => btn.addEventListener('click', () => {
    const mode = btn.dataset.motion;
    const charName = document.getElementById('visualClass')?.value || '원소술사';
    const slot = document.getElementById('visualSlot')?.value || 'body';
    const itemName = document.getElementById('visualItemName')?.value || '';
    applyCharacterMotion(mode === 'auto' ? preferredMotionFor(charName, slot, itemName) : mode);
  }));
}

function preferredMotionFor(charName, slot, itemName='') {
  const profile = CHARACTER_MOTION_PROFILES[charName] || {};
  if (/활|보우|석궁|crossbow/i.test(itemName)) return 'shoot';
  if (/지팡이|스태프|완드|오브|마도서|grimoire/i.test(itemName)) return 'cast';
  return profile[slot] || profile.attack || 'idle';
}

function applyCharacterMotion(mode='idle') {
  currentMotion = mode;
  const mannequin = document.getElementById('mannequin');
  if (!mannequin) return;
  [...mannequin.classList].filter(c => c.startsWith('motion-')).forEach(c => mannequin.classList.remove(c));
  mannequin.classList.add(`motion-${mode}`);
  mannequin.dataset.motion = mode;
  const box = document.getElementById('motionControls');
  box?.querySelectorAll('[data-motion]').forEach(b => b.classList.toggle('active', b.dataset.motion === mode));
  const info = document.getElementById('visualInfo');
  if (info) info.dataset.motion = mode;
}

ensureMotionControls();
loadPlaynoteItems();
applyVisualPreview();
applyCharacterMotion('idle');

console.info(`Companda integrated site v${SITE_VERSION} · Playnote public DB + character motion`);