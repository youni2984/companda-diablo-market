const YUPGOOLG_REFERENCE={checkedAt:'2026-10-17',latestSkin:'v5.5',latestSkinDate:'2026-08-21',skinParts:[
{title:'01 · 아이템·전리품 필터',items:['전리품 필터/컬러','유니크·세트 표시','룬·보석 가시성','드랍 아이콘/사운드']},
{title:'02 · 룬·룬워드·도움말',items:['룬워드 도움말','래더 표기','변동 옵션','룬 업그레이드 보조']},
{title:'03 · 큐브·크래프트',items:['큐브 변환/업그레이드','크래프트 도움말','온라인/싱글 구분']},
{title:'04 · 직업·스킬·육성',items:['직업별 스킬 UI','악마술사 표시','버프 유지시간 보조']},
{title:'05 · 버프·상태·전투 UI',items:['버프 아이콘','몬스터 체력바','스킬/발동 표시']},
{title:'06 · 지역·길찾기·퀘스트',items:['길찾기','던전 층수','무덤 번호','보스 표식']},
{title:'07 · 패드·콘솔·레이아웃',items:['패드 UI','수리/도박 보조','콘솔 레이아웃']},
{title:'08 · 외형·사운드·테마',items:['테마 UI','아이템/몬스터 룩변','사운드/아이콘 커스텀']}
],modParts:['재설계 스킬','신규/재설계 아이템','별도 룬어·세트','맵 기반 엔드게임','레벨 110','복합 크래프팅']};
function yupEscape(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function addYupgoolgStyles(){if(document.getElementById('yupgoolgStyles'))return;const s=document.createElement('style');s.id='yupgoolgStyles';s.textContent='.yup-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.yup-card ul{padding-left:20px}.yup-warning{margin-bottom:14px}@media(max-width:720px){.yup-grid{grid-template-columns:1fr}}';document.head.appendChild(s);}
function buildYupgoolgPanel(){addYupgoolgStyles();const nav=document.querySelector('.tabs');if(!nav||document.querySelector('[data-tab="yupgoolg"]'))return;const b=document.createElement('button');b.className='tab';b.dataset.tab='yupgoolg';b.textContent='엽굵 정보';nav.insertBefore(b,nav.querySelector('[data-tab="about"]'));const about=document.getElementById('about');const p=document.createElement('section');p.id='yupgoolg';p.className='panel';p.innerHTML=`<section class="card"><p class="eyebrow">YUPGOOLG REFERENCE</p><h2>엽굵스킨 정보 · 파트별 확인</h2><p>온라인 스킨 ${YUPGOOLG_REFERENCE.latestSkin} 기준이며 엽굵모드 데이터는 공식 D2R 계산과 분리합니다.</p></section><section class="yup-grid">${YUPGOOLG_REFERENCE.skinParts.map(x=>`<article class="card yup-card"><h3>${yupEscape(x.title)}</h3><ul>${x.items.map(i=>`<li>${yupEscape(i)}</li>`).join('')}</ul></article>`).join('')}</section><section class="card yup-warning"><h2>엽굵모드 별도 영역</h2><p>${YUPGOOLG_REFERENCE.modParts.map(yupEscape).join(' · ')}</p></section>`;about.parentNode.insertBefore(p,about);b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='yupgoolg'));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id==='yupgoolg'));history.replaceState(null,'','#yupgoolg');});if(location.hash==='#yupgoolg')b.click();}
buildYupgoolgPanel();
function loadCompandaExtension(src,marker,onload){if(document.querySelector(`script[data-companda-ext="${marker}"]`)){onload?.();return;}const s=document.createElement('script');s.src=src;s.defer=true;s.dataset.compandaExt=marker;if(onload)s.onload=onload;document.body.appendChild(s);}
loadCompandaExtension('inventory-cube.js','inventory-cube',()=>{
  loadCompandaExtension('cube-official-corrections.js','cube-official-corrections');
  const oldTab=document.querySelector('[data-tab="runes"]');if(oldTab)oldTab.style.display='none';const oldPanel=document.getElementById('runes');if(oldPanel)oldPanel.style.display='none';
  document.querySelectorAll('[data-open-tab="runes"]').forEach(el=>{el.dataset.openTab='inventoryCube';const t=el.querySelector('b');const s=el.querySelector('span');if(t)t.textContent='인벤·큐빙';if(s)s.textContent='룬 수량·캐릭터/개인/공유 창고·큐빙';});
  loadCompandaExtension('battlenet-profile.js','battlenet-profile');
  loadCompandaExtension('scan-inventory-bridge.js','scan-inventory-bridge');
  const ver=document.querySelector('.site-hero .version');if(ver)ver.textContent='v1.7.0 · PATCH 3.3';
});
console.info(`Companda extensions v1.7.0 · Yupgoolg ${YUPGOOLG_REFERENCE.latestSkin}`);
