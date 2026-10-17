const INVENTORY_CUBE_VERSION='1.7.0';
const INV_STORE_KEY='companda-d2r-inventory-v17';
const STORAGE_LOCATIONS=[
  {id:'character',label:'캐릭터 인벤'},
  {id:'personal',label:'개인 창고'},
  {id:'shared',label:'공유 창고'},
  {id:'advancedRunes',label:'고급 룬 창고'}
];
const GEM_TYPES=['Topaz','Amethyst','Sapphire','Ruby','Emerald','Diamond','Skull'];
const GEM_GRADES=[['Chipped','최하급'],['Flawed','하급'],['Normal','일반'],['Flawless','상급'],['Perfect','최상급']];
const GEM_LABEL={Topaz:'토파즈',Amethyst:'자수정',Sapphire:'사파이어',Ruby:'루비',Emerald:'에메랄드',Diamond:'다이아몬드',Skull:'해골'};
const RUNE_UPGRADES=[
['El',3,'Eld'],['Eld',3,'Tir'],['Tir',3,'Nef'],['Nef',3,'Eth'],['Eth',3,'Ith'],['Ith',3,'Tal'],['Tal',3,'Ral'],['Ral',3,'Ort'],['Ort',3,'Thul'],
['Thul',3,'Amn','Chipped Topaz'],['Amn',3,'Sol','Chipped Amethyst'],['Sol',3,'Shael','Chipped Sapphire'],['Shael',3,'Dol','Chipped Ruby'],['Dol',3,'Hel','Chipped Emerald'],['Hel',3,'Io','Chipped Diamond'],['Io',3,'Lum','Flawed Topaz'],['Lum',3,'Ko','Flawed Amethyst'],['Ko',3,'Fal','Flawed Sapphire'],['Fal',3,'Lem','Flawed Ruby'],['Lem',3,'Pul','Flawed Emerald'],['Pul',2,'Um','Flawed Diamond'],['Um',2,'Mal','Normal Topaz'],['Mal',2,'Ist','Normal Amethyst'],['Ist',2,'Gul','Normal Sapphire'],['Gul',2,'Vex','Normal Ruby'],['Vex',2,'Ohm','Normal Emerald'],['Ohm',2,'Lo','Normal Diamond'],['Lo',2,'Sur','Flawless Topaz'],['Sur',2,'Ber','Flawless Amethyst'],['Ber',2,'Jah','Flawless Sapphire'],['Jah',2,'Cham','Flawless Ruby'],['Cham',2,'Zod','Flawless Emerald']
];

function cubeRecipe(category,name,inputs,result,note=''){return{category,name,inputs,result,note};}
const CUBE_RECIPES=[];
RUNE_UPGRADES.forEach(([r,c,out,gem])=>CUBE_RECIPES.push(cubeRecipe('룬 업그레이드',`${r} → ${out}`,[{key:`rune:${r}`,count:c},...(gem?[{key:`gem:${gem}`,count:1}]:[])],`${out} 룬`,gem?`${r} ${c}개 + ${gem}`:`${r} ${c}개`)));
CUBE_RECIPES.push(
 cubeRecipe('소켓','일반 갑옷 소켓',[{key:'rune:Tal',count:1},{key:'rune:Thul',count:1},{key:'gem:Perfect Topaz',count:1},{key:'generic:Normal Body Armor',count:1}],'동일 갑옷에 랜덤 소켓','일반·무소켓만. 저급/고급 제외.'),
 cubeRecipe('소켓','일반 무기 소켓',[{key:'rune:Ral',count:1},{key:'rune:Amn',count:1},{key:'gem:Perfect Amethyst',count:1},{key:'generic:Normal Weapon',count:1}],'동일 무기에 랜덤 소켓','일반·무소켓만. 저급/고급 제외.'),
 cubeRecipe('소켓','일반 투구 소켓',[{key:'rune:Ral',count:1},{key:'rune:Thul',count:1},{key:'gem:Perfect Sapphire',count:1},{key:'generic:Normal Helm',count:1}],'동일 투구에 랜덤 소켓'),
 cubeRecipe('소켓','일반 방패 소켓',[{key:'rune:Tal',count:1},{key:'rune:Amn',count:1},{key:'gem:Perfect Ruby',count:1},{key:'generic:Normal Shield',count:1}],'동일 방패에 랜덤 소켓'),
 cubeRecipe('소켓','희귀 아이템 소켓',[{key:'gem:Perfect Skull',count:3},{key:'generic:Rare Item',count:1},{key:'generic:Stone of Jordan',count:1}],'희귀 아이템 소켓 +1','원래 소켓이 없는 희귀 아이템만.'),
 cubeRecipe('재설정','마법 아이템 재굴림',[{key:'generic:Perfect Gem Any',count:3},{key:'generic:Magic Item',count:1}],'같은 종류의 새 마법 아이템','입력 아이템 ilvl 유지.'),
 cubeRecipe('재설정','희귀 아이템 재굴림',[{key:'gem:Perfect Skull',count:6},{key:'generic:Rare Item',count:1}],'같은 종류 희귀 아이템','출력 ilvl은 캐릭터/입력 ilvl의 영향을 받음.'),
 cubeRecipe('재설정','고급 희귀 재굴림',[{key:'gem:Perfect Skull',count:1},{key:'generic:Rare Item',count:1},{key:'generic:Stone of Jordan',count:1}],'같은 종류 희귀 아이템'),
 cubeRecipe('업그레이드','노멀 고유 무기 → 익셉셔널',[{key:'rune:Ral',count:1},{key:'rune:Sol',count:1},{key:'gem:Perfect Emerald',count:1},{key:'generic:Normal Unique Weapon',count:1}],'익셉셔널 베이스 고유 무기'),
 cubeRecipe('업그레이드','노멀 고유 방어구 → 익셉셔널',[{key:'rune:Tal',count:1},{key:'rune:Shael',count:1},{key:'gem:Perfect Diamond',count:1},{key:'generic:Normal Unique Armor',count:1}],'익셉셔널 베이스 고유 방어구'),
 cubeRecipe('업그레이드','익셉셔널 고유 무기 → 엘리트',[{key:'rune:Lum',count:1},{key:'rune:Pul',count:1},{key:'gem:Perfect Emerald',count:1},{key:'generic:Exceptional Unique Weapon',count:1}],'엘리트 베이스 고유 무기'),
 cubeRecipe('업그레이드','익셉셔널 고유 방어구 → 엘리트',[{key:'rune:Ko',count:1},{key:'rune:Lem',count:1},{key:'gem:Perfect Diamond',count:1},{key:'generic:Exceptional Unique Armor',count:1}],'엘리트 베이스 고유 방어구'),
 cubeRecipe('업그레이드','노멀 희귀 무기 → 익셉셔널',[{key:'rune:Ort',count:1},{key:'rune:Amn',count:1},{key:'gem:Perfect Sapphire',count:1},{key:'generic:Normal Rare Weapon',count:1}],'익셉셔널 희귀 무기'),
 cubeRecipe('업그레이드','노멀 희귀 방어구 → 익셉셔널',[{key:'rune:Ral',count:1},{key:'rune:Thul',count:1},{key:'gem:Perfect Amethyst',count:1},{key:'generic:Normal Rare Armor',count:1}],'익셉셔널 희귀 방어구'),
 cubeRecipe('업그레이드','익셉셔널 희귀 무기 → 엘리트',[{key:'rune:Fal',count:1},{key:'rune:Um',count:1},{key:'gem:Perfect Sapphire',count:1},{key:'generic:Exceptional Rare Weapon',count:1}],'엘리트 희귀 무기'),
 cubeRecipe('업그레이드','익셉셔널 희귀 방어구 → 엘리트',[{key:'rune:Ko',count:1},{key:'rune:Pul',count:1},{key:'gem:Perfect Amethyst',count:1},{key:'generic:Exceptional Rare Armor',count:1}],'엘리트 희귀 방어구'),
 cubeRecipe('수리','무기 완전 수리',[{key:'rune:Ort',count:1},{key:'generic:Weapon',count:1}],'완전 수리된 무기','에테리얼 제외.'),
 cubeRecipe('수리','방어구 완전 수리',[{key:'rune:Ral',count:1},{key:'generic:Armor',count:1}],'완전 수리된 방어구','에테리얼 제외.'),
 cubeRecipe('수리','무기 수리 + 충전',[{key:'rune:Ort',count:1},{key:'generic:Chipped Gem Any',count:1},{key:'generic:Weapon',count:1}],'수리·충전된 무기'),
 cubeRecipe('수리','방어구 수리 + 충전',[{key:'rune:Ral',count:1},{key:'generic:Flawed Gem Any',count:1},{key:'generic:Armor',count:1}],'수리·충전된 방어구'),
 cubeRecipe('소켓','소켓 내용 제거',[{key:'rune:Hel',count:1},{key:'generic:Town Portal Scroll',count:1},{key:'generic:Socketed Item',count:1}],'빈 소켓 아이템','기존 룬/보석/주얼은 파괴됨.'),
 cubeRecipe('보석','동일 등급 보석 3개 업그레이드',[{key:'generic:3 Same Gems',count:1}],'한 단계 높은 같은 보석'),
 cubeRecipe('물약','소형 활력 물약 3개',[{key:'generic:Small Rejuvenation Potion',count:3}],'완전 활력 물약'),
 cubeRecipe('물약','활력 물약 제작',[{key:'generic:Health Potion',count:3},{key:'generic:Mana Potion',count:3},{key:'generic:Chipped Gem Any',count:1}],'활력 물약'),
 cubeRecipe('물약','완전 활력 물약 제작',[{key:'generic:Health Potion',count:3},{key:'generic:Mana Potion',count:3},{key:'generic:Normal Gem Any',count:1}],'완전 활력 물약'),
 cubeRecipe('특수','비밀의 젖소방',[{key:'generic:Wirts Leg',count:1},{key:'generic:Tome of Town Portal',count:1}],'비밀의 젖소방 포털','해당 난이도 액트 I 마을에서 사용.'),
 cubeRecipe('특수','공포의 영역/보스 재료는 패치별 확인',[{key:'generic:Patch-specific Material',count:1}],'패치별 결과','최신 패치에서 변경될 수 있어 별도 최신 표시.'),
 cubeRecipe('기타','마법 반지 3개 → 마법 목걸이',[{key:'generic:Magic Ring',count:3}],'무작위 마법 목걸이'),
 cubeRecipe('기타','마법 목걸이 3개 → 마법 반지',[{key:'generic:Magic Amulet',count:3}],'무작위 마법 반지'),
 cubeRecipe('기타','볼트 2통 → 화살',[{key:'generic:Bolts Quiver',count:2}],'화살통'),
 cubeRecipe('기타','화살 2통 → 볼트',[{key:'generic:Arrows Quiver',count:2}],'볼트통'),
 cubeRecipe('기타','창 + 화살 → 투창',[{key:'generic:Spear',count:1},{key:'generic:Arrows Quiver',count:1}],'투창 묶음'),
 cubeRecipe('기타','도끼 + 단검 → 투척 도끼',[{key:'generic:Axe',count:1},{key:'generic:Dagger',count:1}],'투척 도끼')
);

const CRAFTED_BASES=[
 {family:'Blood',ko:'블러드',rune:'Nef',gem:'Perfect Ruby',items:['Helm','Gloves','Boots','Belt','Shield','Body Armor','Amulet','Ring','Weapon']},
 {family:'Caster',ko:'캐스터',rune:'Tir',gem:'Perfect Amethyst',items:['Helm','Gloves','Boots','Belt','Shield','Body Armor','Amulet','Ring','Weapon']},
 {family:'Hit Power',ko:'히트 파워',rune:'Ith',gem:'Perfect Sapphire',items:['Helm','Gloves','Boots','Belt','Shield','Body Armor','Amulet','Ring','Weapon']},
 {family:'Safety',ko:'세이프티',rune:'Ort',gem:'Perfect Emerald',items:['Helm','Gloves','Boots','Belt','Shield','Body Armor','Amulet','Ring','Weapon']}
];
CRAFTED_BASES.forEach(f=>f.items.forEach(item=>CUBE_RECIPES.push(cubeRecipe('크래프트',`${f.ko} ${item}`,[{key:`rune:${f.rune}`,count:1},{key:`gem:${f.gem}`,count:1},{key:'generic:Jewel',count:1},{key:`generic:Magic ${item}`,count:1}],`${f.ko} 제작 ${item}`,'정확한 베이스 종류와 고정 옵션은 블리자드 Crafted Items 표 기준.'))));

function emptyInventory(){const base={};STORAGE_LOCATIONS.forEach(l=>base[l.id]={});return base;}
function loadInventoryV17(){
 let data;try{data=JSON.parse(localStorage.getItem(INV_STORE_KEY)||'null');}catch{}
 if(!data||typeof data!=='object')data=emptyInventory();
 STORAGE_LOCATIONS.forEach(l=>{if(!data[l.id]||typeof data[l.id]!=='object')data[l.id]={};});
 try{const legacy=JSON.parse(localStorage.getItem('companda-d2r-runes')||'{}');for(const [r,v] of Object.entries(legacy)){if(v&&!data.shared[`rune:${r}`])data.shared[`rune:${r}`]=1;}}catch{}
 return data;
}
let inv17=loadInventoryV17();let activeStorage='advancedRunes';let activeResource='runes';
function saveInventoryV17(){localStorage.setItem(INV_STORE_KEY,JSON.stringify(inv17));}
function getCount(loc,key){return Number(inv17[loc]?.[key]||0);}
function totalCount(key){return STORAGE_LOCATIONS.reduce((s,l)=>s+getCount(l.id,key),0);}
function setCount(loc,key,n){inv17[loc][key]=Math.max(0,Math.min(9999,Number(n)||0));saveInventoryV17();renderInventoryResources();renderCraftability();}
function addCount(loc,key,delta){setCount(loc,key,getCount(loc,key)+delta);}
function displayKey(key){if(key.startsWith('rune:'))return key.slice(5);if(key.startsWith('gem:')){const raw=key.slice(4);const [grade,type]=raw.split(' ');const g=GEM_GRADES.find(x=>x[0]===grade)?.[1]||grade;return `${g} ${GEM_LABEL[type]||type}`;}return key.replace('generic:','');}
function trackedCountForInput(input){return input.key.startsWith('rune:')||input.key.startsWith('gem:')?totalCount(input.key):null;}
function recipeReady(recipe){return recipe.inputs.every(i=>{const n=trackedCountForInput(i);return n===null?true:n>=i.count;});}

function addInventoryCubeStyles(){if(document.getElementById('invCubeStyles'))return;const s=document.createElement('style');s.id='invCubeStyles';s.textContent=`
.inv-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.inv-tab,.resource-tab{border:1px solid #3b434d;background:#10151b;color:#cbd1d9;border-radius:9px;padding:9px 12px;cursor:pointer}.inv-tab.active,.resource-tab.active{border-color:#b98b3a;color:#f2cb7a;background:#1b1710}.inv-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.inv-row{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:center;border:1px solid #2f363f;background:#0f1419;border-radius:10px;padding:9px}.inv-row b{font-size:14px}.inv-row small{color:#8f98a4}.qty-btn{width:30px;height:30px;border:1px solid #4b5561;background:#171d24;color:#fff;border-radius:8px;cursor:pointer}.qty-input{width:58px!important;text-align:center;padding:7px!important}.cube-tools{display:grid;grid-template-columns:1fr 180px 150px;gap:10px;margin-bottom:12px}.cube-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cube-card{border:1px solid #303843;background:#10151b;border-radius:12px;padding:13px}.cube-card.ready{border-color:#4f805d}.cube-card h3{margin:0 0 8px;font-size:16px}.cube-ingredients{display:flex;gap:6px;flex-wrap:wrap}.cube-ingredients span{font-size:12px;border:1px solid #38414b;border-radius:999px;padding:5px 8px}.cube-card .ok{color:#87d79a}.cube-card .need{color:#d7a6a6}.storage-summary{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.storage-summary span{border:1px solid #343b45;border-radius:999px;padding:6px 9px;font-size:12px}.official-inv-note{border-color:#4c4027}.craft-ready-list{display:flex;gap:7px;flex-wrap:wrap}.craft-ready-list span{border:1px solid #42614a;background:#101a13;border-radius:999px;padding:6px 9px;font-size:12px}@media(max-width:900px){.inv-grid,.cube-grid{grid-template-columns:1fr 1fr}.cube-tools{grid-template-columns:1fr 1fr}}@media(max-width:600px){.inv-grid,.cube-grid,.cube-tools{grid-template-columns:1fr}.inv-row{grid-template-columns:1fr auto auto auto}}
`;document.head.appendChild(s);}
function buildInventoryCubePanel(){
 addInventoryCubeStyles();const nav=document.querySelector('.tabs');if(!nav||document.getElementById('inventoryCube'))return;
 const btn=document.createElement('button');btn.className='tab';btn.dataset.tab='inventoryCube';btn.textContent='인벤·큐빙';nav.insertBefore(btn,nav.querySelector('[data-tab="about"]'));
 const about=document.getElementById('about');const panel=document.createElement('section');panel.id='inventoryCube';panel.className='panel';panel.innerHTML=`
 <section class="card official-inv-note"><p class="eyebrow">PATCH 3.3 / REIGN OF THE WARLOCK</p><h2>캐릭터·개인·공유·고급 창고 통합 인벤토리</h2><p>룬은 실제 개수로 누적합니다. 최신 고급 창고의 룬/보석/재료/소모품 스택 구조를 반영하고, 제작 가능 여부는 모든 보관 위치 수량을 합산해 계산합니다.</p></section>
 <section class="card"><div class="section-head"><h2>보관 위치</h2><button id="invReset" class="ghost" type="button">수량 전체 초기화</button></div><div id="storageTabs" class="inv-tabs"></div><div id="resourceTabs" class="inv-tabs"></div><div id="inventoryResourceGrid" class="inv-grid"></div><div id="storageSummary" class="storage-summary"></div></section>
 <section class="card"><div class="section-head"><h2>현재 룬으로 제작 가능한 룬워드</h2><span class="badge">중복 룬 수량 반영</span></div><div id="craftReadyV17" class="craft-ready-list"></div></section>
 <section class="card"><div class="section-head"><h2>호라드림의 함 큐빙 정보</h2><span class="badge">공식 레시피 구조화</span></div><div class="cube-tools"><input id="cubeSearch" type="search" placeholder="룬·소켓·업그레이드·크래프트 검색"><select id="cubeCategory"></select><select id="cubeReady"><option value="all">전체 레시피</option><option value="ready">보유 재료 가능</option></select></div><div id="cubeGrid" class="cube-grid"></div><p class="muted">룬/보석은 보유 수량을 자동 판정합니다. 장비·주얼·물약처럼 개별 아이템은 자동 판정 대상에서 제외하고 공식 조합식 안내만 표시합니다.</p></section>`;
 about.parentNode.insertBefore(panel,about);
 btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab==='inventoryCube'));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='inventoryCube'));history.replaceState(null,'','#inventoryCube');});
 document.getElementById('invReset').addEventListener('click',()=>{if(confirm('저장한 인벤토리 수량을 모두 0으로 초기화할까요?')){inv17=emptyInventory();saveInventoryV17();renderInventoryAll();}});
 document.getElementById('cubeSearch').addEventListener('input',renderCubeRecipes);document.getElementById('cubeCategory').addEventListener('input',renderCubeRecipes);document.getElementById('cubeReady').addEventListener('input',renderCubeRecipes);
 renderInventoryAll();if(location.hash==='#inventoryCube')btn.click();
}
function renderStorageTabs(){const el=document.getElementById('storageTabs');el.innerHTML=STORAGE_LOCATIONS.map(l=>`<button class="inv-tab ${activeStorage===l.id?'active':''}" data-storage="${l.id}" type="button">${l.label}</button>`).join('');el.querySelectorAll('[data-storage]').forEach(b=>b.addEventListener('click',()=>{activeStorage=b.dataset.storage;renderInventoryAll();}));}
function renderResourceTabs(){const el=document.getElementById('resourceTabs');el.innerHTML=`<button class="resource-tab ${activeResource==='runes'?'active':''}" data-resource="runes">룬</button><button class="resource-tab ${activeResource==='gems'?'active':''}" data-resource="gems">보석</button>`;el.querySelectorAll('[data-resource]').forEach(b=>b.addEventListener('click',()=>{activeResource=b.dataset.resource;renderInventoryAll();}));}
function resourceKeys(){if(activeResource==='runes')return RUNES.map(r=>`rune:${r}`);const a=[];GEM_GRADES.forEach(([grade])=>GEM_TYPES.forEach(type=>a.push(`gem:${grade} ${type}`)));return a;}
function renderInventoryResources(){const el=document.getElementById('inventoryResourceGrid');if(!el)return;el.innerHTML=resourceKeys().map(key=>`<div class="inv-row"><div><b>${displayKey(key)}</b><small> 전체 ${totalCount(key)}</small></div><button class="qty-btn" data-delta="-1" data-key="${key}">−</button><input class="qty-input" data-count-key="${key}" type="number" min="0" max="9999" value="${getCount(activeStorage,key)}"><button class="qty-btn" data-delta="1" data-key="${key}">+</button></div>`).join('');el.querySelectorAll('[data-delta]').forEach(b=>b.addEventListener('click',()=>addCount(activeStorage,b.dataset.key,Number(b.dataset.delta))));el.querySelectorAll('[data-count-key]').forEach(i=>i.addEventListener('change',()=>setCount(activeStorage,i.dataset.countKey,i.value)));
 const sum=document.getElementById('storageSummary');sum.innerHTML=STORAGE_LOCATIONS.map(l=>{const n=resourceKeys().reduce((s,k)=>s+getCount(l.id,k),0);return`<span>${l.label} ${n}개</span>`;}).join('');}
function renderCraftability(){const el=document.getElementById('craftReadyV17');if(!el)return;let list=[];try{list=RUNEWORDS.filter(rw=>{const need={};rw.runes.forEach(r=>need[r]=(need[r]||0)+1);return Object.entries(need).every(([r,n])=>totalCount(`rune:${r}`)>=n);});}catch{}el.innerHTML=list.length?list.map(rw=>`<span>${rw.name} · ${rw.runes.join('+')}</span>`).join(''):'<p class="muted">현재 전체 보관함 수량으로 완성 가능한 등록 룬워드가 없습니다.</p>';}
function renderCubeFilters(){const cats=[...new Set(CUBE_RECIPES.map(r=>r.category))];const el=document.getElementById('cubeCategory');el.innerHTML='<option value="all">전체 분류</option>'+cats.map(c=>`<option>${c}</option>`).join('');}
function renderCubeRecipes(){const q=(document.getElementById('cubeSearch')?.value||'').toLowerCase();const cat=document.getElementById('cubeCategory')?.value||'all';const readyOnly=document.getElementById('cubeReady')?.value==='ready';const rows=CUBE_RECIPES.filter(r=>(cat==='all'||r.category===cat)&&(!q||`${r.name} ${r.result} ${r.note} ${r.inputs.map(i=>i.key).join(' ')}`.toLowerCase().includes(q))&&(!readyOnly||recipeReady(r)));const el=document.getElementById('cubeGrid');el.innerHTML=rows.map(r=>{const ready=recipeReady(r);return`<article class="cube-card ${ready?'ready':''}"><div class="section-head"><h3>${r.name}</h3><span class="${ready?'ok':'need'}">${ready?'보유 재료 가능':'재료 확인'}</span></div><div class="cube-ingredients">${r.inputs.map(i=>{const have=trackedCountForInput(i);return`<span>${displayKey(i.key)} ×${i.count}${have!==null?` · 보유 ${have}`:''}</span>`;}).join('')}</div><p><strong>→ ${r.result}</strong></p>${r.note?`<p class="muted">${r.note}</p>`:''}</article>`;}).join('');}
function renderInventoryAll(){renderStorageTabs();renderResourceTabs();renderInventoryResources();renderCraftability();renderCubeFilters();renderCubeRecipes();}
buildInventoryCubePanel();
console.info(`Companda inventory/cube v${INVENTORY_CUBE_VERSION}`);
