// 매칭 상태 관리 스토어 (매칭 단계, 파트너 정보, Agora 연결 정보)
import { create } from 'zustand';
import type { MatchStatus, MatchFoundEvent } from '@/types';

type MatchPhase = 'idle' | 'selecting' | 'searching' | 'matched' | 'active' | 'ended';
type EndReason = 'timer' | 'partner_left' | 'self_left' | null;
type ExtendStatus = 'none' | 'requested' | 'received' | 'approved' | 'rejected';

interface MatchState {
  phase: MatchPhase;
  endReason: EndReason;
  sessionId: string | null;
  selectedInterests: string[];
  partner: MatchFoundEvent['partner'] | null;
  partnerId: string | null;
  commonInterests: string[];
  agoraChannelId: string | null;
  agoraToken: string | null;
  remainingSeconds: number;
  isMuted: boolean;
  waitingCount: number;
  searchStartTime: number | null;
  extendStatus: ExtendStatus;
  isExtended: boolean;
  totalSeconds: number;

  // Actions
  setPhase: (phase: MatchPhase) => void;
  setSelectedInterests: (interests: string[]) => void;
  setMatchFound: (data: MatchFoundEvent) => void;
  setRemainingSeconds: (seconds: number) => void;
  setMuted: (muted: boolean) => void;
  setWaitingCount: (count: number) => void;
  setEnded: (reason: EndReason) => void;
  startSearching: () => void;
  setExtendStatus: (status: ExtendStatus) => void;
  setExtended: () => void;
  setTotalSeconds: (seconds: number) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as MatchPhase,
  endReason: null as EndReason,
  sessionId: null,
  selectedInterests: [],
  partner: null,
  partnerId: null,
  commonInterests: [],
  agoraChannelId: null,
  agoraToken: null,
  remainingSeconds: 600,
  isMuted: false,
  waitingCount: 0,
  searchStartTime: null,
  extendStatus: 'none' as ExtendStatus,
  isExtended: false,
  totalSeconds: 600,
};

export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setSelectedInterests: (interests) => set({ selectedInterests: interests }),

  setMatchFound: (data) =>
    set({
      phase: 'matched',
      sessionId: data.sessionId,
      partnerId: data.partnerId,
      partner: data.partner,
      commonInterests: data.commonInterests,
      agoraChannelId: data.agoraChannelId,
      agoraToken: data.agoraToken,
      remainingSeconds: 600,
      totalSeconds: 600,
      extendStatus: 'none',
      isExtended: false,
    }),

  setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),

  setMuted: (muted) => set({ isMuted: muted }),

  setWaitingCount: (count) => set({ waitingCount: count }),

  // 종료 사유와 함께 ended 상태로 전환
  setEnded: (reason) => set({ phase: 'ended', endReason: reason }),

  startSearching: () =>
    set({
      phase: 'searching',
      searchStartTime: Date.now(),
    }),

  setExtendStatus: (status) => set({ extendStatus: status }),

  setExtended: () => set({ isExtended: true }),

  setTotalSeconds: (seconds) => set({ totalSeconds: seconds }),

  reset: () => set(initialState),
}));
