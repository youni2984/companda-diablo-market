const SITE_VERSION = '1.5.0';

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
if (['home','guide','simulator','scan','visual3d','runewords','runes','mf','about'].includes(siteHash)) {
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
  const detected = ITEM_KEYWORDS.find(([name]) => lower.includes(name.toLowerCase()));
  const name = detected?.[0] || (text.split(/\r?\n/).map(v=>v.trim()).find(Boolean) || '아이템명 확인 필요');
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
    </div>
    <p class="muted">OCR은 촬영 각도·글꼴·색상에 따라 오인식할 수 있으므로 거래 전에 실제 게임 옵션을 다시 확인하세요.</p>`;
  updateMarketLinks(name);
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
}
document.getElementById('applyVisual')?.addEventListener('click', applyVisualPreview);
['visualClass','visualItemName','visualSlot','visualQuality','visualMaterial','visualColor'].forEach(id => document.getElementById(id)?.addEventListener('input', applyVisualPreview));
applyVisualPreview();

console.info(`Companda integrated site v${SITE_VERSION}`);
