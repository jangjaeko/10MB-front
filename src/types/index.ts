// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  interests: string[];
  total_calls: number;
  total_minutes: number;
  is_online: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

// Match types
export type MatchStatus = 'waiting' | 'matched' | 'active' | 'completed' | 'cancelled';

export interface MatchSession {
  id: string;
  status: MatchStatus;
  interests: string[];
  agora_channel_id: string | null;
  started_at: string | null;
  ends_at: string | null;
  actual_ended_at: string | null;
  created_at: string;
}

export interface MatchParticipant {
  id: string;
  session_id: string;
  user_id: string;
  rating: 'good' | 'neutral' | null;
  reported: boolean;
  joined_at: string;
}

// Rating type
export type Rating = 'good' | 'neutral';

// Report types
export type ReportReason = 'harassment' | 'spam' | 'inappropriate' | 'other';

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  session_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

// Room types
export interface Room {
  id: string;
  name: string;
  theme: string;
  icon: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  created_at: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

// Interest tags
export const INTEREST_TAGS = [
  '잡담',
  '고민상담',
  '유머',
  '연애',
  '직장생활',
  '게임',
  '음악',
  '스포츠',
  '영화/드라마',
  '맛집',
  '여행',
  'IT/개발',
  '운동',
  '독서',
  '반려동물',
] as const;

export type InterestTag = (typeof INTEREST_TAGS)[number];

// Socket events
// 매칭 성공 이벤트 데이터
export interface MatchFoundEvent {
  sessionId: string;
  partnerId: string;
  partner: {
    nickname: string;
    interests: string[];
  };
  commonInterests: string[];
  agoraChannelId: string;
  agoraToken: string;
}

export interface TimerSyncEvent {
  remainingSeconds: number;
}
