const BNET_PROFILE_VERSION='1.7.0';
const BNET_PROFILE_KEY='companda-d2r-bnet-profile-v17';
const EQUIP_SLOTS=[
 {id:'head',label:'투구'},{id:'amulet',label:'목걸이'},{id:'body',label:'갑옷'},{id:'weaponMain',label:'주무기'},{id:'weaponOff',label:'보조무기/방패'},
 {id:'gloves',label:'장갑'},{id:'ring1',label:'반지 1'},{id:'ring2',label:'반지 2'},{id:'belt',label:'벨트'},{id:'boots',label:'부츠'},
 {id:'swapMain',label:'스왑 주무기'},{id:'swapOff',label:'스왑 보조무기'}
];
function defaultBnetProfile(){return{battleTag:'',characterName:'',className:'원소술사',level:1,realm:'온라인',ladder:'래더',hardcore:false,equipment:{},updatedAt:null};}
function loadBnetProfile(){try{return Object.assign(defaultBnetProfile(),JSON.parse(localStorage.getItem(BNET_PROFILE_KEY)||'{}'));}catch{return defaultBnetProfile();}}
let bnetProfile=loadBnetProfile();
function saveBnetProfile(){bnetProfile.updatedAt=new Date().toISOString();localStorage.setItem(BNET_PROFILE_KEY,JSON.stringify(bnetProfile));renderBnetProfileSummary();}
function bpEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function addBnetStyles(){if(document.getElementById('bnetStyles'))return;const s=document.createElement('style');s.id='bnetStyles';s.textContent=`
.bnet-head{border-color:#284d73}.bnet-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.bnet-grid label,.equip-profile-grid label{display:grid;gap:6px;color:#c8ced6;font-size:13px}.bnet-grid input,.bnet-grid select,.equip-profile-grid input{width:100%;padding:10px;border-radius:9px;border:1px solid #38414b;background:#0f1419;color:#fff}.equip-profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}.profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.bnet-summary{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.bnet-summary span{border:1px solid #34404b;border-radius:999px;padding:6px 9px;font-size:12px}.api-limit{margin-top:12px;border:1px solid #5b4930;background:#19150f;border-radius:10px;padding:12px;color:#d9c49e}.slot-sim-buttons{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.slot-sim-buttons button{border:1px solid #46515d;background:#131920;color:#e5e9ee;border-radius:8px;padding:7px 9px;cursor:pointer}@media(max-width:900px){.bnet-grid,.equip-profile-grid{grid-template-columns:1fr 1fr}}@media(max-width:580px){.bnet-grid,.equip-profile-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s);}
function buildBnetPanel(){
 addBnetStyles();const nav=document.querySelector('.tabs');if(!nav||document.getElementById('battlenetProfile'))return;
 const btn=document.createElement('button');btn.className='tab';btn.dataset.tab='battlenetProfile';btn.textContent='내 캐릭터';nav.insertBefore(btn,nav.querySelector('[data-tab="about"]'));
 const about=document.getElementById('about');const panel=document.createElement('section');panel.id='battlenetProfile';panel.className='panel';panel.innerHTML=`
 <section class="card bnet-head"><p class="eyebrow">BATTLE.NET CHARACTER PROFILE</p><h2>배틀태그 · 내 캐릭터 장비 프로필</h2><p>배틀태그와 캐릭터 정보를 저장하고 현재 착용 장비를 시뮬레이터에 연결합니다.</p><div class="api-limit"><strong>공식 API 제한:</strong> 현재 공개 Battle.net API에서는 Diablo II: Resurrected 온라인 캐릭터의 장비/인벤토리를 제3자 사이트가 직접 가져오는 프로필 API가 제공되지 않습니다. 따라서 BattleTag는 계정 식별용이며 장비는 카메라 판독 또는 직접 입력으로 등록합니다.</div></section>
 <section class="card"><div class="bnet-grid">
 <label>BattleTag<input id="bpBattleTag" placeholder="예: COMPANDA#1234"></label><label>캐릭터명<input id="bpCharName" placeholder="캐릭터 이름"></label><label>직업<select id="bpClass"><option>원소술사</option><option>아마존</option><option>성기사</option><option>강령술사</option><option>암살자</option><option>야만용사</option><option>드루이드</option><option>악마술사</option></select></label><label>레벨<input id="bpLevel" type="number" min="1" max="99"></label>
 <label>모드<select id="bpRealm"><option>온라인</option><option>오프라인</option></select></label><label>시즌<select id="bpLadder"><option>래더</option><option>비래더</option></select></label><label>하드코어<select id="bpHardcore"><option value="false">소프트코어</option><option value="true">하드코어</option></select></label></div>
 <div id="bpEquipment" class="equip-profile-grid"></div>
 <div class="profile-actions"><button id="bpSave" class="primary-btn" type="button">프로필 저장</button><button id="bpFromScan" class="ghost" type="button">카메라 판독 아이템 넣기</button><button id="bpExport" class="ghost" type="button">프로필 JSON 복사</button><button id="bpReset" class="ghost" type="button">초기화</button></div><div id="bpSummary" class="bnet-summary"></div></section>
 <section class="card"><div class="section-head"><h2>장비 → 3D/딜 시뮬레이터</h2><span class="badge">슬롯 선택 적용</span></div><div id="bpSlotButtons" class="slot-sim-buttons"></div><p class="muted">선택한 장비는 3D 장비 미리보기의 아이템명·부위·직업에 자동 반영됩니다. 옵션 수치는 카메라 OCR 결과 또는 장비 DB가 있는 경우 장비·딜 계산에 연결할 수 있습니다.</p></section>`;
 about.parentNode.insertBefore(panel,about);
 btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab==='battlenetProfile'));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='battlenetProfile'));history.replaceState(null,'','#battlenetProfile');});
 bindBnetProfile();renderBnetProfile();if(location.hash==='#battlenetProfile')btn.click();
}
function bindBnetProfile(){
 const eq=document.getElementById('bpEquipment');eq.innerHTML=EQUIP_SLOTS.map(s=>`<label>${s.label}<input data-bp-slot="${s.id}" placeholder="아이템명"></label>`).join('');
 document.getElementById('bpSave').addEventListener('click',collectAndSaveBnet);
 document.getElementById('bpReset').addEventListener('click',()=>{if(confirm('내 캐릭터 프로필을 초기화할까요?')){bnetProfile=defaultBnetProfile();saveBnetProfile();renderBnetProfile();}});
 document.getElementById('bpFromScan').addEventListener('click',()=>{
   const text=document.getElementById('ocrText')?.value?.trim();if(!text){alert('먼저 카메라·시세 메뉴에서 아이템을 판독하세요.');return;}
   const name=(text.split(/\r?\n/).map(x=>x.trim()).find(Boolean)||'').slice(0,100);const slot=guessSlotFromName(name);const input=document.querySelector(`[data-bp-slot="${slot}"]`);if(input){input.value=name;collectAndSaveBnet();}
 });
 document.getElementById('bpExport').addEventListener('click',async()=>{collectAndSaveBnet();try{await navigator.clipboard.writeText(JSON.stringify(bnetProfile,null,2));alert('캐릭터 프로필 JSON을 복사했습니다.');}catch{alert('클립보드 복사에 실패했습니다.');}});
 document.getElementById('bpSlotButtons').innerHTML=EQUIP_SLOTS.map(s=>`<button type="button" data-bp-apply="${s.id}">${s.label}</button>`).join('');
 document.querySelectorAll('[data-bp-apply]').forEach(b=>b.addEventListener('click',()=>applyProfileSlotToSimulator(b.dataset.bpApply)));
}
function guessSlotFromName(name=''){const n=name.toLowerCase();if(/투구|관모|helm|cap|crown/.test(n))return'head';if(/갑옷|armor|plate|robe/.test(n))return'body';if(/방패|shield/.test(n))return'weaponOff';if(/장갑|glove/.test(n))return'gloves';if(/장화|부츠|boot/.test(n))return'boots';if(/벨트|belt|sash/.test(n))return'belt';if(/목걸이|amulet/.test(n))return'amulet';if(/반지|ring/.test(n))return'ring1';return'weaponMain';}
function collectAndSaveBnet(){bnetProfile.battleTag=document.getElementById('bpBattleTag').value.trim();bnetProfile.characterName=document.getElementById('bpCharName').value.trim();bnetProfile.className=document.getElementById('bpClass').value;bnetProfile.level=Number(document.getElementById('bpLevel').value)||1;bnetProfile.realm=document.getElementById('bpRealm').value;bnetProfile.ladder=document.getElementById('bpLadder').value;bnetProfile.hardcore=document.getElementById('bpHardcore').value==='true';bnetProfile.equipment={};document.querySelectorAll('[data-bp-slot]').forEach(i=>{if(i.value.trim())bnetProfile.equipment[i.dataset.bpSlot]=i.value.trim();});saveBnetProfile();}
function renderBnetProfile(){document.getElementById('bpBattleTag').value=bnetProfile.battleTag||'';document.getElementById('bpCharName').value=bnetProfile.characterName||'';document.getElementById('bpClass').value=bnetProfile.className||'원소술사';document.getElementById('bpLevel').value=bnetProfile.level||1;document.getElementById('bpRealm').value=bnetProfile.realm||'온라인';document.getElementById('bpLadder').value=bnetProfile.ladder||'래더';document.getElementById('bpHardcore').value=String(Boolean(bnetProfile.hardcore));document.querySelectorAll('[data-bp-slot]').forEach(i=>i.value=bnetProfile.equipment?.[i.dataset.bpSlot]||'');renderBnetProfileSummary();}
function renderBnetProfileSummary(){const el=document.getElementById('bpSummary');if(!el)return;const count=Object.keys(bnetProfile.equipment||{}).length;el.innerHTML=`<span>${bpEsc(bnetProfile.battleTag||'BattleTag 미입력')}</span><span>${bpEsc(bnetProfile.characterName||'캐릭터 미입력')}</span><span>${bpEsc(bnetProfile.className)} Lv.${bnetProfile.level}</span><span>장비 ${count}슬롯</span>`;}
function applyProfileSlotToSimulator(slot){collectAndSaveBnet();const name=bnetProfile.equipment?.[slot];if(!name){alert('해당 슬롯에 등록된 장비가 없습니다.');return;}const visualClass=document.getElementById('visualClass');const visualName=document.getElementById('visualItemName');const visualSlot=document.getElementById('visualSlot');if(visualClass)visualClass.value=bnetProfile.className;if(visualName)visualName.value=name;const map={weaponOff:'shield',swapMain:'weaponMain',swapOff:'weaponOff',amulet:'body',ring1:'body',ring2:'body',belt:'body'};if(visualSlot)visualSlot.value=map[slot]||slot;if(typeof applyVisualPreview==='function')applyVisualPreview();if(typeof openSiteTab==='function')openSiteTab('visual3d');}
buildBnetPanel();
console.info(`Companda BattleTag character profile v${BNET_PROFILE_VERSION}`);
