export interface JwtPayload {
  sub: string; // 사용자 ID
  email: string; // 사용자 이메일
  name: string;
  iat: number; // 토큰 발급 시간
  type: 'access' | 'refresh'; // 토큰 타입
}
