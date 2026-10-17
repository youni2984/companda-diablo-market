const GUIDE_VERSION = '2026.10 / Patch 3.3';

const CLASS_GUIDES = {
  '원소술사': {
    en: 'Sorceress', build: '화염구 → 냉기/번개 전환', role: '빠른 이동·원거리 마법 파밍',
    stats: ['힘: 장비 요구치까지만', '민첩: 일반적으로 최소, 막기 세팅이면 목표 방패 기준', '활력: 나머지 대부분', '마력: 초반 부족할 때만 소량, 최종은 장비/통찰로 보완'],
    skills: ['1~17: 화염탄/화염구 중심', '18~29: 순간이동 1, 정적 파장 1, 화염구 강화', '30~60: 눈보라 또는 번개 계열 주력 선택', '61~99: 주력 기술과 시너지, 냉기 숙련/번개 숙련 등 마스터'],
    route: ['1~15: 1막 퀘스트·백작·트리스트럼', '15~24: 2막 무덤·3막 진행', '24~40: 일반 바알 반복 후 악몽 진입', '40~60: 악몽 백작·안다리엘·메피스토·바알', '60~75: 지옥 진행, 안전한 고대 토굴/영묘/구덩이', '75~99: 공포의 영역·보스·85레벨 지역 반복'],
    gear: ['초반: 시전 속도·마나·저항', '중반: 영혼 검/방패, 전승, 잠행/연기', '후반: +기술, 시전 속도, 저항, 적 저항 감소/속성 피해 장비'],
    notes: '순간이동으로 동선 단축이 가장 큰 장점. 면역 대응을 위해 용병 또는 2속성 운영을 고려.'
  },
  '아마존': {
    en: 'Amazon', build: '번개 창 투척(자벨마)', role: '다수 몬스터·보스 동시 처리',
    stats: ['힘: 장비 요구치', '민첩: 무기/방패 요구치 및 막기 세팅만', '활력: 나머지', '마력: 거의 투자하지 않음'],
    skills: ['1~17: 독 투창/찌르기 계열로 진행', '18~29: 역병 투창·번개의 일격 준비', '30~60: 번개의 격노/번개의 일격 집중', '61~99: 시너지와 패시브 보강'],
    route: ['1~15: 1막 필드·트리스트럼', '15~24: 탈 라샤 무덤', '24~40: 카우/바알', '40~60: 악몽 카우·바알', '60~75: 지옥 구덩이·피트·카오스 진행', '75~99: 카우·공포의 영역·보스 반복'],
    gear: ['공격 속도, +투창 기술, 관통, 저항', '중후반에는 번개 피해 증폭과 적 번개 저항 감소가 체감이 큼'],
    notes: '밀집 몬스터에서 번개의 격노 효율이 매우 높음. 번개 면역 대비 장비/용병 필요.'
  },
  '성기사': {
    en: 'Paladin', build: '신성한 불꽃 → 축복받은 망치', role: '안정적인 진행·고저항·광역 마법',
    stats: ['힘: 장비 요구치', '민첩: 신성한 방패 포함 최대 막기 목표 시 조정', '활력: 나머지', '마력: 최소'],
    skills: ['1~17: 신성한 불꽃 + 열의', '18~29: 집중/축복받은 망치 준비', '30~60: 축복받은 망치·집중 마스터', '61~99: 활력/축복받은 조준 등 시너지'],
    route: ['1~18: 1막~2막 빠른 퀘스트', '18~30: 무덤·일반 바알', '30~50: 악몽 진행 및 바알', '50~75: 지옥 진행·카오스', '75~99: 카오스 성역·공포의 영역'],
    gear: ['시전 속도, +기술, 저항, 막기', '영혼 검/성기사 방패는 가성비가 뛰어남'],
    notes: '축복받은 망치는 위치 잡기가 중요하며 집중 오라가 핵심.'
  },
  '강령술사': {
    en: 'Necromancer', build: '소환 + 시체 폭발', role: '안전한 솔로 진행·장비 의존도 낮음',
    stats: ['힘: 장비 요구치', '민첩: 최소 또는 막기 선택', '활력: 대부분', '마력: 초반 소량 가능'],
    skills: ['1~17: 해골 숙련/해골 되살리기', '18~29: 시체 폭발 범위 확보, 점토 골렘·저항 감소', '30~60: 해골/숙련 마스터, 시체 폭발 확대', '61~99: 저주·골렘·보조 소환 보강'],
    route: ['1~24: 퀘스트 진행 중심', '24~40: 바알 반복', '40~60: 악몽 보스/바알', '60~75: 지옥 구덩이·영묘·카오스 진입', '75~99: 공포의 영역·밀집 지역'],
    gear: ['+소환 기술, 시전 속도, 저항', '용병 공격력과 통찰/긍지 등 오라 장비가 전체 화력에 큰 영향'],
    notes: '첫 시체 생성 후 시체 폭발로 전투가 급격히 빨라지는 구조.'
  },
  '암살자': {
    en: 'Assassin', build: '화염 덫 → 번개 덫', role: '안전한 원거리 설치형 전투',
    stats: ['힘/민첩: 장비 요구치', '활력: 대부분', '마력: 최소'],
    skills: ['1~17: 화염 작렬/불의 파동', '18~29: 번개 파수기 준비', '30~60: 번개 파수기 + 죽음 파수기', '61~99: 시너지 및 그림자 보조'],
    route: ['1~24: 일반 진행·무덤', '24~40: 일반 바알', '40~60: 악몽 카우·바알', '60~75: 지옥 구덩이/카오스', '75~99: 공포의 영역·밀집 사냥터'],
    gear: ['+덫 기술, 시전 속도보다 공격 속도/설치 프레임 관련 장비 확인', '저항·달리기 속도·생존 보강'],
    notes: '죽음 파수기의 시체 폭발로 다수전 효율이 급상승.'
  },
  '야만용사': {
    en: 'Barbarian', build: '이중 타격/광분 또는 전장의 함성', role: '높은 생존·아이템 발견·근접 전투',
    stats: ['힘/민첩: 무기 요구치', '활력: 대부분', '마력: 함성형 외에는 최소'],
    skills: ['1~17: 이중 타격/무기 숙련', '18~29: 광분 또는 전장의 함성 준비', '30~60: 주력 공격 + 전투 명령', '61~99: 숙련/시너지/아이템 발견 보강'],
    route: ['1~24: 퀘스트·무덤', '24~40: 바알', '40~60: 악몽 바알/트라빈컬 준비', '60~75: 지옥 진행', '75~99: 트라빈컬·공포의 영역·보스'],
    gear: ['무기 기본 피해, 공격 속도, 명중률, 생명력 흡수', '함성형은 +기술/시전 속도 비중 증가'],
    notes: '근접형은 무기 업그레이드가 딜 상승의 핵심. 아이템 발견으로 파밍 효율 특화 가능.'
  },
  '드루이드': {
    en: 'Druid', build: '불 원소 → 회오리바람/허리케인', role: '광역 원소·높은 생명력 보조',
    stats: ['힘: 장비 요구치', '민첩: 최소 또는 막기 선택', '활력: 대부분', '마력: 최소'],
    skills: ['1~17: 불폭풍/균열', '18~29: 화산 계열 또는 바람 전환 준비', '30~60: 회오리바람·허리케인', '61~99: 시너지 + 참나무 현자'],
    route: ['1~24: 일반 진행', '24~40: 바알', '40~60: 악몽 보스·바알', '60~75: 지옥 구덩이·고대 토굴', '75~99: 공포의 영역'],
    gear: ['+원소 기술, 시전 속도, 저항, 생명력', '바람 드루이드는 물리+냉기 혼합으로 면역 대응이 비교적 편함'],
    notes: '허리케인과 회오리바람의 실전 적중 위치를 익히는 것이 중요.'
  },
  '악마술사': {
    en: 'Warlock', build: '혼돈(Chaos) 원거리 또는 악마 속박', role: '3.3 최신 확장 직업·원거리/소환/무기 혼합',
    stats: ['힘/민첩: 선택 무기·마도서 요구치 중심', '활력: 생존을 위해 우선', '마력: 실제 자원 소모와 장비에 맞춰 조정'],
    skills: ['1~17: 혼돈 기본 투사체 또는 기괴 무기 강화', '18~29: 주력 계열 집중, 생존/제어 1포인트 확보', '30~60: 주력 기술과 직접 시너지 우선', '61~99: 보조 계열·저항 대응·소환 강화'],
    route: ['1~24: 일반 퀘스트 진행', '24~40: 일반 바알', '40~60: 악몽 진행·바알', '60~75: 지옥 안전 지역/공포의 영역 진입', '75~99: 공포의 영역·위압적인 고대인 준비'],
    gear: ['마도서(Grimoire) 및 +악마술사 기술', '혼돈형: 속성 피해/적 저항 감소', '기괴형: 무기 피해·공격 속도·저주/인장 연계'],
    notes: '공식 3.3에서 악마 속박 추가 피해, 인장: 죽음의 화염 기술 적용 등 버그가 수정됨. 세부 최적 빌드는 패치 변화에 따라 재조정 필요.'
  }
};

const LEVEL_PHASES = [
  {min:1,max:15,title:'초기 성장',goal:'주력 초반 기술 확보 · 생존 장비 우선'},
  {min:16,max:24,title:'일반 중반',goal:'이동/보조 기술 확보 · 2막/3막 경험치 구간'},
  {min:25,max:40,title:'일반 후반 → 악몽',goal:'핵심 기술 개방 · 일반 바알 반복 후 악몽'},
  {min:41,max:60,title:'악몽 성장',goal:'주력 기술/시너지 집중 · 저항 장비 준비'},
  {min:61,max:75,title:'지옥 진입',goal:'면역 대응 · 생존/저항 75 목표 · 안전 파밍'},
  {min:76,max:99,title:'종반 파밍',goal:'공포의 영역 · 고레벨 지역 · 최종 장비 최적화'}
];

function phaseFor(level){ return LEVEL_PHASES.find(p=>level>=p.min&&level<=p.max)||LEVEL_PHASES.at(-1); }

function renderClassGuide(){
  const select = document.getElementById('guideClass');
  if(!select) return;
  const name = select.value;
  const g = CLASS_GUIDES[name];
  const level = Math.max(1,Math.min(99,Number(document.getElementById('guideLevel').value)||1));
  const phase = phaseFor(level);
  document.getElementById('guideBuildTitle').textContent = `${name} · ${g.build}`;
  document.getElementById('guideSummary').innerHTML = `<strong>${g.en}</strong> · ${g.role}<br><span class="badge">Lv.${level} ${phase.title}</span> ${phase.goal}`;
  const block=(title,arr)=>`<section class="card guide-block"><h3>${title}</h3>${arr.map(x=>`<p>${x}</p>`).join('')}</section>`;
  document.getElementById('guideGrid').innerHTML = [block('스탯 배분',g.stats),block('레벨별 기술',g.skills),block('필드·사냥 동선',g.route),block('장비 우선순위',g.gear)].join('');
  document.getElementById('guideNotes').textContent = g.notes;
}

function populateClassGuide(){
  const select=document.getElementById('guideClass'); if(!select)return;
  select.innerHTML=Object.keys(CLASS_GUIDES).map((k,i)=>`<option value="${k}" ${i===0?'selected':''}>${k} · ${CLASS_GUIDES[k].en}</option>`).join('');
  ['guideClass','guideLevel'].forEach(id=>document.getElementById(id).addEventListener('input',renderClassGuide));
  renderClassGuide();
}

function clamp(n,min,max){return Math.min(max,Math.max(min,n));}
function nval(id){return Number(document.getElementById(id)?.value)||0;}

function renderDamageSim(){
  if(!document.getElementById('simBaseMin')) return;
  const min=Math.max(0,nval('simBaseMin')), max=Math.max(min,nval('simBaseMax'));
  const weaponED=Math.max(-100,nval('simWeaponED'))/100;
  const offED=Math.max(-100,nval('simOffED'))/100;
  const skillPct=Math.max(-100,nval('simSkillPct'))/100;
  const deadly=clamp(nval('simDeadly'),0,100)/100;
  const enemyRes=clamp(nval('simEnemyRes'),-100,100);
  const minusRes=Math.max(0,nval('simMinusRes'));
  const afterRes=Math.max(-100,enemyRes-minusRes);
  const physMul=(1+weaponED)*(1+offED)*(1+deadly);
  const elemMul=(1+skillPct)*(1-afterRes/100);
  const beforeAvg=(min+max)/2;
  const physMin=min*physMul, physMax=max*physMul;
  const elemMin=min*elemMul, elemMax=max*elemMul;
  const mode=document.getElementById('simMode').value;
  const outMin=mode==='physical'?physMin:elemMin;
  const outMax=mode==='physical'?physMax:elemMax;
  const gain=beforeAvg>0?(((outMin+outMax)/2/beforeAvg)-1)*100:0;
  document.getElementById('simResult').innerHTML=`<div class="sim-big">${outMin.toFixed(0)} ~ ${outMax.toFixed(0)}</div><p>기준 ${min.toFixed(0)} ~ ${max.toFixed(0)} 대비 예상 변화 <strong>${gain>=0?'+':''}${gain.toFixed(1)}%</strong></p><p>적용 후 적 저항: ${afterRes}% · 치명적/치명타 계열 기대값은 평균 배율로 계산</p>`;
}

function initDamageSim(){
  ['simMode','simBaseMin','simBaseMax','simWeaponED','simOffED','simSkillPct','simDeadly','simEnemyRes','simMinusRes'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderDamageSim));
  renderDamageSim();
}

document.addEventListener('DOMContentLoaded',()=>{ populateClassGuide(); initDamageSim(); });
