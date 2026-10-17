const YUPGOOLG_REFERENCE = {
  checkedAt: '2026-10-17',
  latestSkin: 'v5.5',
  latestSkinDate: '2026-08-21',
  source: '엽굵 공개 홈페이지 및 디아블로2 인벤 엽굵 게시물',
  skinParts: [
    {
      title: '01 · 아이템·전리품 필터',
      status: '온라인 스킨',
      items: [
        '전리품 필터 드롭다운 및 텍스트 컬러 지원',
        '신규 유니크 이름 컬러 수정',
        '신규 세트 아이템 부위 표시',
        '룬·보석 가시성 컬러 조정',
        '정예·특급 등급 설명 보강',
        '드랍 아이콘/사운드 보조 기능'
      ]
    },
    {
      title: '02 · 룬·룬워드·도움말',
      status: '온라인 스킨',
      items: [
        '룬워드 도움말과 변동 옵션 표기',
        '모자이크 등 래더 가능 여부 안내 이력',
        'v2.6 룬워드 래더 전용 표기 정리',
        '공허 룬워드 심연 1~3 변동 옵션 안내',
        '의식 룬워드 피해 변동 수치 설명 수정 이력',
        '큐브 내부 룬 업그레이드 정보 보조'
      ]
    },
    {
      title: '03 · 큐브·크래프트',
      status: '온라인 스킨',
      items: [
        '큐브 변환/업그레이드 도움말',
        '캐스터 신발 크래프트 정보',
        '큐브 변환 단축키 관련 보조 기능',
        '싱글 전용 조합식과 온라인용 정보 구분 필요'
      ]
    },
    {
      title: '04 · 직업·스킬·육성',
      status: '온라인 스킨',
      items: [
        '원소술사 육성 가이드 수정 이력',
        '악마술사 스킬 컬러 아이콘',
        '속박 스킬 필요 레벨 안내',
        '암살자 차징 아이콘 가시성 개선',
        '악마술사 및 기존 직업 스킬 UI 보조',
        '버프/상태 아이콘을 통한 유지시간 확인 보조'
      ]
    },
    {
      title: '05 · 버프·상태·전투 UI',
      status: '온라인 스킨',
      items: [
        '소모품 버프 아이콘',
        '뼈 갑옷 버프 아이콘',
        '마법부여·전투지시·마력 보호막·뼈 갑옷 종료 표시',
        '주술·기괴·결계 버프 아이콘',
        '몬스터 체력바 위치/표시 개선',
        '각종 스킬 이펙트와 발동 사운드 조정'
      ]
    },
    {
      title: '06 · 지역·길찾기·퀘스트',
      status: '온라인 스킨',
      items: [
        '길찾기 원/파티클 및 일부 GPU 호환 수정',
        '니흘라탁 던전 층수 표기',
        '탈 라샤 무덤 번호 확대',
        '마을 NPC 이름 가시성 개선',
        '우버 3고대인/특정 보스 표식 보조',
        '퀘스트·난이도·단축키 UI 보조'
      ]
    },
    {
      title: '07 · 패드·콘솔·레이아웃',
      status: '온라인 스킨',
      items: [
        '패드 포션·스킬창 위치 조정',
        '패드 상점 개별 수리 버튼',
        '패드 도박 새로고침 버튼',
        '버튼 누름 유지형 스킬 입력 보조',
        '콘솔 퀘스트/스킬창 레이아웃 정리',
        '각 스킨 테마별 캐릭터 선택창/UI 수정'
      ]
    },
    {
      title: '08 · 외형·사운드·테마',
      status: '온라인 스킨',
      items: [
        'V1/V2/D3/D4/스타2 등 테마형 UI',
        '일부 아이템·몬스터 룩변',
        '드랍/스킬/보스 사운드 조절',
        '보석·아이콘·텍스트 컬러 커스텀',
        '악마술사·신규 아이템 외형 보정'
      ]
    }
  ],
  modParts: [
    '재설계된 스킬 시스템',
    '수백 개 신규/재설계 아이템',
    '새로운 룬어·세트·전설/유니크 장비',
    '맵 기반 엔드게임과 보스 콘텐츠',
    '레벨 110 진행 시스템',
    '단조·재롤링·접두사·소켓 제어 등 복합 크래프팅'
  ]
};

function yupEscape(value='') {
  return String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function buildYupgoolgPanel() {
  const nav = document.querySelector('.tabs');
  if (!nav || document.querySelector('[data-tab="yupgoolg"]')) return;

  const btn = document.createElement('button');
  btn.className = 'tab';
  btn.dataset.tab = 'yupgoolg';
  btn.textContent = '엽굵 정보';
  nav.insertBefore(btn, nav.querySelector('[data-tab="about"]'));
  nav.classList.add('tabs-7');

  const about = document.getElementById('about');
  const panel = document.createElement('section');
  panel.id = 'yupgoolg';
  panel.className = 'panel';
  panel.innerHTML = `
    <section class="card yup-head">
      <div>
        <p class="eyebrow">YUPGOOLG REFERENCE</p>
        <h2>엽굵스킨 정보 · 파트별 확인</h2>
        <p>공개된 엽굵 온라인 스킨 ${yupEscape(YUPGOOLG_REFERENCE.latestSkin)} 기준 기능을 컴판다 도우미 항목과 연결해 정리합니다.</p>
      </div>
      <div class="version">확인 ${yupEscape(YUPGOOLG_REFERENCE.checkedAt)}</div>
    </section>
    <section class="card note yup-warning">
      <h2>정보 구분</h2>
      <p><strong>엽굵 온라인 스킨</strong>은 표시·UI·도움말·필터 중심이며, <strong>엽굵모드</strong>는 스킬·아이템·레벨·엔드게임 규칙 자체가 달라지는 별도 오버홀입니다. 컴판다 D2R 공식 가이드 계산에는 온라인 스킨 정보만 참고하고, 엽굵모드 수치는 별도 모드 전용 데이터로 분리합니다.</p>
    </section>
    <section class="yup-grid">
      ${YUPGOOLG_REFERENCE.skinParts.map(part => `
        <article class="card yup-card">
          <div class="section-head"><h3>${yupEscape(part.title)}</h3><span class="badge">${yupEscape(part.status)}</span></div>
          <ul>${part.items.map(item => `<li>${yupEscape(item)}</li>`).join('')}</ul>
        </article>`).join('')}
    </section>
    <section class="card yup-mod">
      <div class="section-head"><h2>엽굵모드 · 별도 데이터 영역</h2><span class="badge">공식 D2R과 분리</span></div>
      <div class="chips">${YUPGOOLG_REFERENCE.modParts.map(x=>`<span class="chip">${yupEscape(x)}</span>`).join('')}</div>
      <p class="muted">이 영역은 공식 Battle.net D2R 캐릭터/아이템 계산과 혼합하지 않습니다.</p>
    </section>
    <section class="card prose">
      <h2>출처·업데이트 원칙</h2>
      <p>엽굵 홈페이지와 엽굵 본인 명의의 인벤 공개 게시물을 기준으로 항목을 확인합니다. 스킨 패키지 내부 도움말 전체 원문을 복제하지 않고, 컴판다 도우미에 필요한 사실·기능·수치 필드를 구조화합니다.</p>
      <a class="source" href="https://yupgoolg.com/" target="_blank" rel="noopener noreferrer">엽굵 홈페이지</a><br>
      <a class="source" href="https://www.inven.co.kr/board/diablo2/5842/8063" target="_blank" rel="noopener noreferrer">엽굵스킨 v5.5 공개 게시물</a>
    </section>`;
  about.parentNode.insertBefore(panel, about);

  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'yupgoolg'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === 'yupgoolg'));
    history.replaceState(null, '', '#yupgoolg');
  });

  if (location.hash === '#yupgoolg') btn.click();
}

buildYupgoolgPanel();
console.info(`Companda Yupgoolg reference · skin ${YUPGOOLG_REFERENCE.latestSkin} · checked ${YUPGOOLG_REFERENCE.checkedAt}`);
