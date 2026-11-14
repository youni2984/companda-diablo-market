# 컴판다 중고PC 마켓 MVP

컴퓨터·노트북·부품 중고거래와 카카오페이 단건 결제를 연결하는 MVP입니다.

## 현재 구현
- PC/스마트폰 반응형 상품 목록
- 상품명/사양 검색 및 카테고리 필터
- 중고 상품 즉시 등록(현재 메모리 저장)
- 카카오페이 단건 결제 준비(ready)
- PC/모바일 결제창 이동
- 결제 인증 후 승인(approve)
- 결제 취소(cancel) 서버 API
- Secret Key 서버 환경변수 분리

## 실행
```bash
cd used-pc-market
npm install
cp .env.example .env
npm start
```

브라우저에서 `http://localhost:3000` 접속.

## 카카오페이 테스트 설정
`.env`에 개발자센터에서 발급한 `Secret key(dev)`를 넣습니다.

```env
PORT=3000
BASE_URL=http://localhost:3000
KAKAOPAY_CID=TC0ONETIME
KAKAOPAY_SECRET_KEY=발급받은_DEV_SECRET_KEY
```

테스트 단건 결제 CID는 `TC0ONETIME`을 사용합니다. 운영 전환 시 실제 가맹점 CID와 운영 Secret Key를 환경변수로 설정해야 합니다.

## 운영 전 필수 작업
현재 상품/결제 상태는 서버 메모리에만 저장됩니다. 실제 거래 서비스에서는 PostgreSQL 같은 DB로 이전해야 합니다.

권장 추가 항목:
1. 회원가입/로그인 및 판매자 인증
2. PostgreSQL 상품·주문·결제 DB
3. 상품 이미지 업로드(Object Storage)
4. 찜/채팅/신고/관리자 기능
5. 주문 상태 및 배송/직거래 방식
6. 카카오페이 운영 가맹점 심사 및 도메인 등록
7. 결제 금액을 클라이언트 입력값이 아니라 DB 주문금액으로 고정 검증
8. 중복 승인 방지, 결제 상태 조회, 환불 이력 및 감사 로그
9. CSRF/CSP/Rate Limit/보안 헤더/입력 검증
10. 개인정보처리방침·이용약관·전자상거래 관련 고지
