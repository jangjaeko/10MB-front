// REST API 클라이언트 (토큰 자동 주입, 인증/유저/매칭/음성/신고)
import { useAuthStore } from '@/stores/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 스토어에서 현재 토큰을 자동으로 가져오기
  private getStoredToken(): string | null {
    return useAuthStore.getState().accessToken;
  }

  // 공통 요청 메서드 (토큰 자동 주입)
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, skipAuth, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 토큰 우선순위: 직접 전달 > 스토어 자동 조회
    const authToken = token || (!skipAuth ? this.getStoredToken() : null);
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `요청 실패 (${response.status})`);
    }

    return response.json();
  }

  // --- Auth ---

  // 현재 로그인된 유저 정보 조회
  async getMe(token?: string) {
    return this.request('/api/auth/me', { token });
  }

  // 토큰 검증
  async verifyToken(token: string) {
    return this.request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
      skipAuth: true,
    });
  }

  // --- Users ---

  // 프로필 수정
  async updateProfile(data: { nickname?: string; interests?: string[] }) {
    return this.request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 온보딩 완료
  async completeOnboarding(data: { nickname: string; interests: string[] }) {
    return this.request('/api/users/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 닉네임 중복 체크
  async checkNickname(nickname: string): Promise<{ available: boolean; message: string }> {
    return this.request(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  }

  // 유저 통계 조회
  async getMyStats() {
    return this.request('/api/users/me/stats');
  }

  // 계정 삭제
  async deleteAccount() {
    return this.request('/api/users/me', { method: 'DELETE' });
  }

  // --- Match ---

  // 매칭 시작
  async startMatch(interests: string[]) {
    return this.request('/api/match/start', {
      method: 'POST',
      body: JSON.stringify({ interests }),
    });
  }

  // 매칭 취소
  async cancelMatch() {
    return this.request('/api/match/cancel', { method: 'DELETE' });
  }

  // 매칭 평가
  async rateMatch(sessionId: string, rating: 'good' | 'neutral') {
    return this.request(`/api/match/${sessionId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  // 온라인 유저 수 조회
  async getOnlineCount(): Promise<{ count: number }> {
    return this.request('/api/match/online-count', { skipAuth: true });
  }

  // --- Voice ---

  // Agora 음성 토큰 발급
  async getVoiceToken(channelId: string) {
    return this.request('/api/voice/token', {
      method: 'POST',
      body: JSON.stringify({ channelId }),
    });
  }

  // --- Rooms ---

  // 대화방 목록 조회
  async getRooms() {
    return this.request('/api/rooms');
  }

  // 대화방 입장
  async joinRoom(roomId: string) {
    return this.request(`/api/rooms/${roomId}/join`, { method: 'POST' });
  }

  // 대화방 퇴장
  async leaveRoom(roomId: string) {
    return this.request(`/api/rooms/${roomId}/leave`, { method: 'POST' });
  }

  // --- Reports ---

  // 유저 신고
  async submitReport(data: {
    reportedId: string;
    sessionId?: string;
    reason: string;
    description?: string;
  }) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Community ---

  // 게시글 목록 조회
  async getPosts(params?: { category?: string; cursor?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.request(`/api/posts${qs ? `?${qs}` : ''}`);
  }

  // 게시글 상세 조회
  async getPost(postId: string) {
    return this.request(`/api/posts/${postId}`);
  }

  // 게시글 작성
  async createPost(data: { category: string; title: string; content: string }) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 게시글 수정
  async updatePost(postId: string, data: { title?: string; content?: string }) {
    return this.request(`/api/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 게시글 삭제
  async deletePost(postId: string) {
    return this.request(`/api/posts/${postId}`, { method: 'DELETE' });
  }

  // 댓글 작성
  async createComment(postId: string, content: string) {
    return this.request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // 댓글 삭제
  async deleteComment(commentId: string) {
    return this.request(`/api/posts/comments/${commentId}`, { method: 'DELETE' });
  }

  // 좋아요 토글
  async toggleLike(postId: string) {
    return this.request(`/api/posts/${postId}/like`, { method: 'POST' });
  }
}

export const api = new ApiClient(API_URL);
