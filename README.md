# 컴판다 디아블로2 레저렉션 도우미

버전: **v1.0.0 Static**

Diablo II: Resurrected 참고용 정적 웹 도우미입니다. 별도 서버나 설치 없이 `index.html`만으로 실행할 수 있고 GitHub Pages 같은 정적 호스팅에도 배포할 수 있습니다.

## 주요 기능

- 방어구 룬워드 검색
- 갑옷 / 투구 / 방패 필터
- 홈 수 / 요구 레벨 필터
- 룬 순서 표시
- 33개 룬 보유 체크
- 현재 체크한 룬 기준 제작 가능 룬워드 표시
- Magic Find(MF) 실효 효율 계산
- PC / 스마트폰 반응형 화면
- 버전 표시

## 인증 구조

현재 저장소에는 사용자 인증이 없습니다.

- 로그인 없음
- 세션 없음
- OAuth 없음
- JWT 없음
- API Key 없음
- refresh token 없음
- 서버에 저장되는 사용자 자격증명 없음

브라우저의 룬 보유 체크 상태만 `localStorage`에 저장하며 외부 서버로 전송하지 않습니다.

## 요청 흐름

1. 브라우저가 `index.html`을 연다.
2. `styles.css`와 `app.js`를 로드한다.
3. 룬워드 검색과 MF 계산은 브라우저 JavaScript에서 처리한다.
4. 룬 체크 상태는 같은 브라우저의 `localStorage`에서 읽고 쓴다.
5. 인증 서버, 데이터베이스, 별도 API 서버와 통신하지 않는다.

## 데이터 참고

룬워드 이름, 룬 순서, 홈 수, 요구 레벨, 부위 정보는 Diablo II: Resurrected 공개 게임 정보와 D2Lab 룬워드 페이지를 참고하여 컴판다 도우미 형식으로 재구성했습니다.

참고: https://d2lab.dev-inventory.com/runewords?tab=armor

## 기존 MF 계산식

- Unique: `250 * MF / (250 + MF)`
- Set: `500 * MF / (500 + MF)`
- Rare: `600 * MF / (600 + MF)`
- Magic: `MF`

## 실행

`index.html`을 직접 열거나 정적 웹 호스팅에 올리면 됩니다. Node.js, PHP, Python 서버가 필요하지 않습니다.

## 안전 범위

게임 프로세스, 메모리, 패킷, Battle.net 서버 값을 변경하지 않습니다. 드랍률 강제 변경이나 게임 데이터 변조 기능은 포함하지 않습니다.
