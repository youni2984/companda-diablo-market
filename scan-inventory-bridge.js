const SCAN_INV_BRIDGE_VERSION='1.7.0';
const SCAN_INV_KEY='companda-d2r-inventory-v17';
const SCAN_STORAGE=[['character','캐릭터 인벤'],['personal','개인 창고'],['shared','공유 창고'],['advancedRunes','고급 룬 창고']];
const RUNE_ALIASES={
 El:['El','엘'],Eld:['Eld','엘드'],Tir:['Tir','티르'],Nef:['Nef','네프'],Eth:['Eth','에드','에쓰'],Ith:['Ith','아이드','이스'],Tal:['Tal','탈'],Ral:['Ral','랄'],Ort:['Ort','오르트'],Thul:['Thul','주울','툴'],Amn:['Amn','앰','암'],Sol:['Sol','솔'],Shael:['Shael','샤엘'],Dol:['Dol','돌'],Hel:['Hel','헬'],Io:['Io','이오'],Lum:['Lum','룸'],Ko:['Ko','코'],Fal:['Fal','팔'],Lem:['Lem','렘'],Pul:['Pul','풀'],Um:['Um','우움','움'],Mal:['Mal','말'],Ist:['Ist','이스트'],Gul:['Gul','굴'],Vex:['Vex','벡스'],Ohm:['Ohm','오움'],Lo:['Lo','로'],Sur:['Sur','수르'],Ber:['Ber','베르'],Jah:['Jah','자','자룬'],Cham:['Cham','참'],Zod:['Zod','조드']
};
const GEM_KO={토파즈:'Topaz',자수정:'Amethyst',사파이어:'Sapphire',루비:'Ruby',에메랄드:'Emerald',다이아몬드:'Diamond',해골:'Skull'};
const GRADE_KO={최하급:'Chipped',하급:'Flawed',일반:'Normal',상급:'Flawless',최상급:'Perfect'};

function sibEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function parseQty(line=''){
 const patterns=[/(?:수량|qty|quantity)\s*[:x×]?\s*(\d{1,4})/i,/\b[x×]\s*(\d{1,4})\b/i,/(\d{1,4})\s*개\b/,/\((\d{1,4})\)\s*$/,/\b(\d{1,4})\s*[x×]\b/i];
 for(const p of patterns){const m=line.match(p);if(m)return Math.max(1,Number(m[1])||1);}return 1;
}
function normalizeRune(line=''){
 const clean=line.replace(/룬/g,' ').trim();
 for(const [r,aliases] of Object.entries(RUNE_ALIASES))for(const a of aliases){const re=new RegExp(`(^|[^A-Za-z가-힣])${a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^A-Za-z가-힣]|$)`,'i');if(re.test(` ${clean} `))return r;}
 return null;
}
function normalizeGem(line=''){
 let grade=null,type=null;for(const [ko,en] of Object.entries(GRADE_KO))if(line.includes(ko)){grade=en;break;}for(const [ko,en] of Object.entries(GEM_KO))if(line.includes(ko)){type=en;break;}
 if(!grade){const m=line.match(/\b(Chipped|Flawed|Flawless|Perfect)\b/i);if(m)grade=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();else if(/\bTopaz|Amethyst|Sapphire|Ruby|Emerald|Diamond|Skull\b/i.test(line))grade='Normal';}
 if(!type){const m=line.match(/\b(Topaz|Amethyst|Sapphire|Ruby|Emerald|Diamond|Skull)\b/i);if(m)type=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();}
 return grade&&type?`${grade} ${type}`:null;
}
function cleanDetectedName(line=''){
 return line.replace(/(?:수량|qty|quantity)\s*[:x×]?\s*\d+/ig,'').replace(/[x×]\s*\d+/ig,'').replace(/\d+\s*개/g,'').replace(/\(\d+\)\s*$/,'').trim().replace(/^[-•·\s]+|[-•·\s]+$/g,'');
}
function detectRows(text=''){
 const rows=[];const seen=new Map();
 text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(line=>{
   const rune=normalizeRune(line);const gem=normalizeGem(line);let key,name;
   if(rune){key=`rune:${rune}`;name=`${rune} 룬`;}
   else if(gem){key=`gem:${gem}`;name=gem;}
   else{
     const n=cleanDetectedName(line);
     if(n.length<2||/^(방어력|내구도|필요|요구|피해|공격|시전|저항|기술|레벨|착용|가격|판매|매찬|홈|소켓)/.test(n))return;
     if(/^\+?\d+[%+]?/.test(n))return;
     key=`item:${n.toLowerCase()}`;name=n;
   }
   const qty=parseQty(line);if(seen.has(key)){seen.get(key).qty+=qty;}else{const row={key,name,qty,line};seen.set(key,row);rows.push(row);}
 });
 return rows.slice(0,80);
}
function readInv(){try{const d=JSON.parse(localStorage.getItem(SCAN_INV_KEY)||'{}');SCAN_STORAGE.forEach(([id])=>{if(!d[id]||typeof d[id]!=='object')d[id]={};});return d;}catch{const d={};SCAN_STORAGE.forEach(([id])=>d[id]={});return d;}}
function writeInv(d){localStorage.setItem(SCAN_INV_KEY,JSON.stringify(d));}
function registerRows(rows,storage){
 if(!rows.length)return 0;let count=0;
 if(typeof window.getCount==='function'&&typeof window.setCount==='function'){
   rows.forEach(r=>{window.setCount(storage,r.key,(window.getCount(storage,r.key)||0)+Number(r.qty||1));count+=Number(r.qty||1);});
 }else{
   const inv=readInv();rows.forEach(r=>{inv[storage][r.key]=Number(inv[storage][r.key]||0)+Number(r.qty||1);count+=Number(r.qty||1);});writeInv(inv);
 }
 if(typeof window.renderInventoryAll==='function')window.renderInventoryAll();
 window.dispatchEvent(new CustomEvent('companda-inventory-updated',{detail:{storage,count}}));return count;
}
function buildScanQuantityPanel(){
 const scan=document.getElementById('scan');if(!scan||document.getElementById('scanQtyPanel'))return;
 const panel=document.createElement('section');panel.id='scanQtyPanel';panel.className='card scan-qty-panel';panel.innerHTML=`
 <div class="section-head"><div><p class="eyebrow">OCR → INVENTORY</p><h2>스크린샷 수량 등록</h2></div><span id="scanQtyStatus" class="badge">대기</span></div>
 <div class="scan-qty-tools"><select id="scanQtyStorage">${SCAN_STORAGE.map(([id,l])=>`<option value="${id}">${l}</option>`).join('')}</select><button id="scanQtyDetect" class="ghost" type="button">수량 다시 감지</button><button id="scanQtyRegister" class="primary-btn" type="button">감지 수량 등록</button></div>
 <div id="scanQtyRows" class="scan-qty-rows"><p class="muted">카메라 판독 후 아이템명과 수량을 자동으로 분리합니다.</p></div>
 <p class="muted">등록 전 수량을 직접 수정할 수 있습니다. 동일 아이템은 선택한 보관함의 기존 수량에 더해집니다.</p>`;
 const price=scan.querySelector('.price-card');if(price)scan.insertBefore(panel,price);else scan.appendChild(panel);
 document.getElementById('scanQtyDetect').addEventListener('click',renderScanQtyRows);
 document.getElementById('scanQtyRegister').addEventListener('click',()=>{
   const rows=[...document.querySelectorAll('[data-sib-key]')].map(el=>({key:el.dataset.sibKey,name:el.dataset.sibName,qty:Math.max(0,Number(el.value)||0)})).filter(r=>r.qty>0);
   const storage=document.getElementById('scanQtyStorage').value;const n=registerRows(rows,storage);document.getElementById('scanQtyStatus').textContent=`${n}개 등록`;if(n)document.getElementById('scanQtyRegister').textContent='등록 완료';setTimeout(()=>{const b=document.getElementById('scanQtyRegister');if(b)b.textContent='감지 수량 등록';},900);
 });
 const ocr=document.getElementById('ocrText');ocr?.addEventListener('input',()=>{clearTimeout(window.__sibTimer);window.__sibTimer=setTimeout(renderScanQtyRows,250);});
 const analysis=document.getElementById('itemAnalysis');if(analysis)new MutationObserver(()=>renderScanQtyRows()).observe(analysis,{childList:true,subtree:true});
}
function renderScanQtyRows(){
 const text=document.getElementById('ocrText')?.value||'';const rows=detectRows(text);const out=document.getElementById('scanQtyRows');const status=document.getElementById('scanQtyStatus');if(!out)return;
 status.textContent=rows.length?`${rows.length}종 감지`:'감지 없음';
 out.innerHTML=rows.length?rows.map((r,i)=>`<div class="scan-qty-row"><span><b>${sibEsc(r.name)}</b><small>${sibEsc(r.line)}</small></span><label>수량 <input type="number" min="0" max="9999" value="${r.qty}" data-sib-key="${sibEsc(r.key)}" data-sib-name="${sibEsc(r.name)}"></label></div>`).join(''):'<p class="muted">수량으로 등록할 아이템을 찾지 못했습니다. OCR 텍스트를 수정하거나 직접 수량을 입력하세요.</p>';
}
function addScanQtyStyles(){if(document.getElementById('scanQtyStyles'))return;const s=document.createElement('style');s.id='scanQtyStyles';s.textContent=`
.scan-qty-panel{margin-bottom:14px}.scan-qty-tools{display:grid;grid-template-columns:1fr auto auto;gap:8px;margin-bottom:10px}.scan-qty-tools select{padding:10px;border-radius:9px;border:1px solid #39424d;background:#0e1318;color:#fff}.scan-qty-rows{display:grid;gap:7px;max-height:430px;overflow:auto}.scan-qty-row{display:grid;grid-template-columns:1fr 120px;gap:10px;align-items:center;border:1px solid #303944;background:#10151b;border-radius:10px;padding:9px 11px}.scan-qty-row span{display:grid;gap:2px}.scan-qty-row small{color:#87919c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.scan-qty-row label{display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;font-size:12px}.scan-qty-row input{width:70px;padding:7px;border-radius:7px;border:1px solid #424c58;background:#0c1116;color:#fff}@media(max-width:650px){.scan-qty-tools{grid-template-columns:1fr}.scan-qty-row{grid-template-columns:1fr auto}}
`;document.head.appendChild(s);}
addScanQtyStyles();buildScanQuantityPanel();
window.CompandaScanInventory={version:SCAN_INV_BRIDGE_VERSION,detectRows,registerRows};
console.info(`Companda screenshot quantity bridge v${SCAN_INV_BRIDGE_VERSION}`);
