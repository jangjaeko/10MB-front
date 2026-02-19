// 라우트 보호 미들웨어 (비로그인 유저를 /auth/login으로 리다이렉트)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증 없이 접근 가능한 경로
  const publicPaths = ['/auth/login', '/auth/callback', '/onboarding'];

  // API 라우트 및 정적 파일은 건너뛰기
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 공개 경로는 그대로 통과
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    // 인증된 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트
    const token = request.cookies.get('sb-access-token')?.value;
    if (token && pathname.startsWith('/auth/login')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 쿠키에서 인증 토큰 확인
  const token = request.cookies.get('sb-access-token')?.value;

  // 보호된 경로에 미인증 접근 시 로그인으로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
