// 매칭 페이지 (관심사 선택 → 대기 → 매칭 성공 → 음성 통화 → 평가)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { InterestSelector } from '@/components/match/InterestSelector';
import { MatchingLoader } from '@/components/match/MatchingLoader';
import { MatchFound } from '@/components/match/MatchFound';
import { VoiceRoom } from '@/components/match/VoiceRoom';
import { RatingModal } from '@/components/match/RatingModal';
import { ReportModal } from '@/components/match/ReportModal';
import { Button } from '@/components/common/Button';
import { useMatchStore } from '@/stores/useMatchStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useVoice } from '@/hooks/useVoice';
import { useTimer } from '@/hooks/useTimer';
import { api } from '@/lib/api';
import type { Rating, ReportReason } from '@/types';

// 매칭 성공 화면 표시 시간 (ms)
const MATCH_FOUND_DELAY = 2000;

export default function MatchPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { user } = useAuthStore();
  const {
    phase,
    endReason,
    sessionId,
    partnerId,
    selectedInterests,
    partner,
    commonInterests,
    waitingCount,
    searchStartTime,
    setSelectedInterests,
    setEnded,
    startSearching,
    reset,
  } = useMatchStore();
  const { startMatch, cancelMatch, leaveMatch } = useSocket();
  const { isConnected, isMicOn, connectionError, leave, toggleMic } = useVoice();
  const { remainingSeconds, formattedTime, progress, isWarning, isUrgent } = useTimer();

  // "아무거나" 토글 상태
  const [isRandom, setIsRandom] = useState(false);
  // Agora 정리 완료 여부
  const [voiceCleaned, setVoiceCleaned] = useState(false);
  // 중복 정리 방지
  const cleanupRef = useRef(false);
  // 신고 모달 표시
  const [showReportModal, setShowReportModal] = useState(false);
  // 매칭 타임아웃 (60초)
  const [searchTimedOut, setSearchTimedOut] = useState(false);

  // 매칭 성공 → 일정 시간 후 active 전환 (useVoice가 agoraChannelId 감지해 자동 입장)
  useEffect(() => {
    if (phase !== 'matched') return;
    const timer = setTimeout(() => {
      useMatchStore.getState().setPhase('active');
    }, MATCH_FOUND_DELAY);
    return () => clearTimeout(timer);
  }, [phase]);

  // ended 진입 시 Agora 채널 정리
  useEffect(() => {
    if (phase !== 'ended') return;
    if (cleanupRef.current) return;
    cleanupRef.current = true;

    leave().then(() => {
      setVoiceCleaned(true);
    });
  }, [phase, leave]);

  // 브라우저 종료/새로고침 시 경고 (통화 중일 때만)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { phase } = useMatchStore.getState();
      if (phase === 'active' || phase === 'matched' || phase === 'searching') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 매칭 타임아웃 (60초 경과 시 안내)
  useEffect(() => {
    if (phase !== 'searching') {
      setSearchTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setSearchTimedOut(true);
    }, 60000);
    return () => clearTimeout(timer);
  }, [phase]);

  // 로딩 중이거나 비인증 상태면 빈 화면 (useAuth에서 리다이렉트 처리)
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // 매칭 시작 핸들러
  const handleStartMatch = () => {
    const interests = isRandom ? (user?.interests ?? []) : selectedInterests;
    if (interests.length === 0) return;
    startSearching();
    startMatch(interests);
  };

  // 매칭 취소 핸들러
  const handleCancelMatch = () => {
    cancelMatch();
    reset();
  };

  // 매칭 재시도 핸들러 (타임아웃 후)
  const handleRetryMatch = () => {
    setSearchTimedOut(false);
    startSearching();
    const interests = isRandom ? (user?.interests ?? []) : selectedInterests;
    if (interests.length === 0) return;
    startMatch(interests);
  };

  // "아무거나" 토글
  const handleRandomToggle = () => {
    setIsRandom((prev) => !prev);
    if (!isRandom) {
      setSelectedInterests([]);
    }
  };

  // 나가기 핸들러 (소켓 leave → ended + self_left)
  const handleLeave = async () => {
    leaveMatch();
    setEnded('self_left');
  };

  // 평가 핸들러
  const handleRate = async (rating: Rating) => {
    if (!sessionId) return;
    try {
      await api.rateMatch(sessionId, rating);
    } catch (err) {
      console.error('[10MB] 평가 실패:', err);
    }
  };

  // 신고 제출 핸들러
  const handleReportSubmit = async (reason: ReportReason, description?: string) => {
    if (!partnerId) return;
    await api.submitReport({
      reportedId: partnerId,
      sessionId: sessionId ?? undefined,
      reason,
      description,
    });
  };

  // 다시 매칭 핸들러
  const handleRematch = () => {
    cleanupRef.current = false;
    setVoiceCleaned(false);
    reset();
  };

  // 홈으로 이동 핸들러
  const handleGoHome = () => {
    cleanupRef.current = false;
    setVoiceCleaned(false);
    reset();
    router.push('/');
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (phase === 'searching') {
      handleCancelMatch();
    } else {
      router.push('/');
    }
  };

  // ---- 관심사 선택 화면 (idle / selecting) ----
  if (phase === 'idle' || phase === 'selecting') {
    const canStart = isRandom || selectedInterests.length > 0;

    return (
      <>
        <Header title="10분 대화" showBack onBack={() => router.push('/')} />
        <div className="pt-16 pb-8 px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            어떤 주제로 대화할까요?
          </h2>

          <InterestSelector
            selectedInterests={selectedInterests}
            onSelect={setSelectedInterests}
            userInterests={user?.interests ?? []}
            isRandom={isRandom}
            onRandomToggle={handleRandomToggle}
          />

          <Button
            onClick={handleStartMatch}
            disabled={!canStart}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white"
            size="lg"
          >
            매칭 시작
          </Button>
        </div>
      </>
    );
  }

  // ---- 매칭 대기 화면 (searching) ----
  if (phase === 'searching') {
    return (
      <>
        <Header title="매칭 중" showBack onBack={handleBack} />
        <div className="pt-16">
          <MatchingLoader
            waitingCount={waitingCount}
            searchStartTime={searchStartTime}
            isTimedOut={searchTimedOut}
            onCancel={handleCancelMatch}
            onRetry={handleRetryMatch}
            onGoHome={() => { cancelMatch(); reset(); router.push('/'); }}
          />
        </div>
      </>
    );
  }

  // ---- 매칭 성공 화면 (matched → 2초 후 active 전환) ----
  if (phase === 'matched' && partner) {
    return (
      <>
        <Header title="매칭 완료" />
        <div className="pt-16">
          <MatchFound
            partnerNickname={partner.nickname}
            commonInterests={commonInterests}
          />
        </div>
      </>
    );
  }

  // ---- 음성 통화 화면 (active) ----
  if (phase === 'active' && partner) {
    return (
      <>
        <Header title="대화 중" />
        <div className="pt-14">
          <VoiceRoom
            partner={partner}
            commonInterests={commonInterests}
            isConnected={isConnected}
            connectionError={connectionError}
            isMicOn={isMicOn}
            formattedTime={formattedTime}
            progress={progress}
            isWarning={isWarning}
            isUrgent={isUrgent}
            remainingSeconds={remainingSeconds}
            onToggleMic={toggleMic}
            onLeave={handleLeave}
            onReport={() => setShowReportModal(true)}
          />
        </div>

        {/* 통화 중 신고 모달 */}
        {showReportModal && (
          <ReportModal
            onSubmit={handleReportSubmit}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </>
    );
  }

  // ---- 통화 종료 → 평가 화면 (ended) ----
  if (phase === 'ended') {
    return (
      <>
        <RatingModal
          endReason={endReason}
          onRate={handleRate}
          onRematch={handleRematch}
          onGoHome={handleGoHome}
          onReport={() => setShowReportModal(true)}
        />

        {/* 종료 후 신고 모달 */}
        {showReportModal && (
          <ReportModal
            onSubmit={handleReportSubmit}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </>
    );
  }

  return null;
}
