# Companda Battle.net OAuth Worker

이 Worker는 GitHub Pages 정적 사이트에서 Battle.net OAuth를 안전하게 사용하기 위한 중계 계층입니다.

## 보안 원칙
- `BATTLE_NET_CLIENT_SECRET`을 HTML/JavaScript/GitHub 저장소에 직접 넣지 않습니다.
- 브라우저에는 BattleTag와 Battle.net 계정 ID만 반환합니다.
- OAuth access token은 Worker 내부에서 `/oauth/userinfo` 조회 후 폐기합니다.
- D2R 온라인 캐릭터 장비/인벤토리는 현재 공개 Battle.net 프로필 API로 직접 조회하지 않습니다.

## GitHub Actions Secrets
저장소 `Settings > Secrets and variables > Actions`에서 다음 4개를 등록합니다.

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `BATTLE_NET_CLIENT_ID`
- `BATTLE_NET_CLIENT_SECRET`

그 다음 `Actions > Deploy Battle.net OAuth Worker > Run workflow`를 실행합니다.

## Battle.net Redirect URL
배포 후 Worker 주소가 예를 들어 아래와 같다면:

`https://companda-battlenet-oauth.<subdomain>.workers.dev`

Battle.net Developer Portal의 Redirect URL을 정확히 아래 주소로 수정합니다.

`https://companda-battlenet-oauth.<subdomain>.workers.dev/callback`

## 컴판다 사이트 연결
사이트의 `내 캐릭터 > Battle.net 로그인 연결`에서 Worker 루트 주소를 저장합니다.

예:
`https://companda-battlenet-oauth.<subdomain>.workers.dev`

이후 `Battle.net 로그인` 버튼을 누르면:

1. APAC Battle.net OAuth 로그인
2. Worker callback에서 authorization code를 token으로 교환
3. `/oauth/userinfo`로 BattleTag 확인
4. 컴판다 사이트로 BattleTag/계정 ID 반환
5. 브라우저 캐릭터 프로필에 저장

## 테스트
Worker 배포 후 브라우저에서 다음 주소를 열면 JSON 상태가 보여야 합니다.

`https://companda-battlenet-oauth.<subdomain>.workers.dev/health`
