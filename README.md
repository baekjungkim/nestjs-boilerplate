# NestJs Backend

NestJS와 Prisma를 사용한 백엔드 서버입니다.

## 기술 스택

- NestJS
- Prisma
- PostgreSQL (Supabase)
- TypeScript

## 시작하기

### 사전 요구사항

- Node.js (v18 이상)
- pnpm
- PostgreSQL (Supabase)

### 설치

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 수정하여 필요한 환경 변수를 설정하세요
```

### 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
pnpm prisma generate

# 데이터베이스 마이그레이션
pnpm prisma migrate dev
```

### 개발 서버 실행

```bash
# 개발 모드
pnpm start:dev

# 프로덕션 모드
pnpm build
pnpm start:prod
```

## API 문서

서버가 실행되면 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:3000/api
- ReDoc: http://localhost:3000/api-json

## 프로젝트 구조

```
src/
├── modules/          # 기능별 모듈
├── common/           # 공통 모듈
├── config/           # 설정 파일
└── main.ts           # 애플리케이션 진입점
```

## 데이터베이스 스키마

Prisma 스키마는 `prisma/schema.prisma` 파일에서 관리됩니다.

## 테스트

```bash
# 단위 테스트
pnpm test

# e2e 테스트
pnpm test:e2e

# 테스트 커버리지
pnpm test:cov
```

## 배포

1. 환경 변수 설정
2. 빌드
3. 데이터베이스 마이그레이션
4. 서버 실행

## 라이선스

이 프로젝트는 [UNLICENSED](LICENSE) 라이선스를 따릅니다.
