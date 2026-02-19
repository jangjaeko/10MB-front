// 온보딩 페이지 (닉네임 → 관심사 → 마이크 권한 3단계)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Tag } from '@/components/common/Tag';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { INTEREST_TAGS } from '@/types';

type Step = 'nickname' | 'interests' | 'microphone';
const STEPS: Step[] = ['nickname', 'interests', 'microphone'];

export default function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState<Step>('nickname');
  const [nickname, setNickname] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 마이크 테스트 관련 상태
  const [micPermission, setMicPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // 닉네임 실시간 중복 체크 (디바운스 300ms)
  const checkNickname = useCallback(async (value: string) => {
    if (value.length < 2) {
      setNicknameStatus('error');
      setNicknameMessage('닉네임은 2자 이상이어야 합니다');
      return;
    }

    setNicknameStatus('checking');
    setNicknameMessage('확인 중...');

    try {
      const result = await api.checkNickname(value);
      setNicknameStatus(result.available ? 'available' : 'taken');
      setNicknameMessage(result.message);
    } catch {
      setNicknameStatus('error');
      setNicknameMessage('중복 확인에 실패했습니다');
    }
  }, []);

  // 닉네임 입력 시 디바운스 처리
  const handleNicknameChange = (value: string) => {
    setNickname(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length === 0) {
      setNicknameStatus('idle');
      setNicknameMessage('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      checkNickname(value);
    }, 300);
  };

  // 닉네임 단계 → 관심사 단계
  const handleNicknameSubmit = () => {
    if (nicknameStatus !== 'available') {
      if (nickname.length < 2) {
        setError('닉네임은 2자 이상이어야 합니다.');
      } else if (nicknameStatus === 'taken') {
        setError('이미 사용 중인 닉네임입니다.');
      } else {
        setError('닉네임 확인이 필요합니다.');
      }
      return;
    }
    setError('');
    setStep('interests');
  };

  // 관심사 토글
  const handleToggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // 관심사 단계 → 마이크 단계
  const handleInterestsSubmit = () => {
    if (interests.length < 3) {
      setError('관심사를 3개 이상 선택해주세요.');
      return;
    }
    setError('');
    setStep('microphone');
  };

  // 마이크 권한 요청 + 볼륨 레벨 모니터링
  const handleMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');
      setError('');

      // 볼륨 레벨 분석 시작
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        // 0~100 범위로 정규화
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch {
      setMicPermission('denied');
      setError('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
    }
  };

  // 마이크 스트림 정리
  const stopMicStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopMicStream();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [stopMicStream]);

  // 온보딩 완료 요청
  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      stopMicStream();
      const userData = await api.completeOnboarding({
        nickname,
        interests,
      });
      setUser(userData as any);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '온보딩 완료에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 닉네임 상태 색상
  const nicknameStatusColor = {
    idle: 'text-gray-400',
    checking: 'text-gray-400',
    available: 'text-green-600',
    taken: 'text-red-500',
    error: 'text-red-500',
  }[nicknameStatus];

  // 볼륨 바 색상
  const getVolumeBarColor = (index: number) => {
    const threshold = (index + 1) * 20;
    if (volumeLevel < threshold) return 'bg-gray-200';
    if (index < 2) return 'bg-green-400';
    if (index < 4) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* 진행 바 */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= STEPS.indexOf(step) ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: 닉네임 */}
      {step === 'nickname' && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">반가워요!</h1>
          <p className="text-gray-500 mb-8">
            대화할 때 사용할 닉네임을 정해주세요.
          </p>

          <div className="relative mb-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                nicknameStatus === 'available'
                  ? 'border-green-400 focus:ring-green-500'
                  : nicknameStatus === 'taken' || nicknameStatus === 'error'
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-indigo-500'
              }`}
              placeholder="닉네임 (2~20자)"
              maxLength={20}
              autoFocus
            />
            {nicknameStatus === 'checking' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            {nicknameStatus === 'available' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* 닉네임 상태 메시지 */}
          {nicknameMessage && (
            <p className={`text-sm mb-4 ${nicknameStatusColor}`}>{nicknameMessage}</p>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mt-auto">
            <Button
              onClick={handleNicknameSubmit}
              disabled={nicknameStatus !== 'available'}
              className="w-full"
              size="lg"
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: 관심사 선택 */}
      {step === 'interests' && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">관심사 선택</h1>
          <p className="text-gray-500 mb-8">
            비슷한 관심사를 가진 사람과 매칭해드려요. (3개 이상)
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {INTEREST_TAGS.map((interest) => (
              <Tag
                key={interest}
                label={interest}
                selected={interests.includes(interest)}
                onClick={() => handleToggleInterest(interest)}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mt-auto flex gap-3">
            <Button
              onClick={() => { setError(''); setStep('nickname'); }}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              이전
            </Button>
            <Button
              onClick={handleInterestsSubmit}
              disabled={interests.length < 3}
              className="flex-1"
              size="lg"
            >
              다음 ({interests.length}/3)
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 마이크 권한 + 테스트 */}
      {step === 'microphone' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* 마이크 아이콘 */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${
            micPermission === 'granted' ? 'bg-green-100' : 'bg-indigo-100'
          }`}>
            <svg
              className={`w-12 h-12 ${micPermission === 'granted' ? 'text-green-600' : 'text-indigo-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">마이크 테스트</h1>
          <p className="text-gray-500 mb-8">
            {micPermission === 'granted'
              ? '말해보세요! 볼륨이 표시됩니다.'
              : '음성 대화를 위해 마이크 권한이 필요합니다.'}
          </p>

          {/* 볼륨 레벨 바 */}
          {micPermission === 'granted' && (
            <div className="w-full max-w-xs mb-8">
              <div className="flex gap-1 items-end justify-center h-12">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-8 rounded-t transition-all duration-100 ${getVolumeBarColor(i)}`}
                    style={{ height: `${Math.max(8, Math.min(48, volumeLevel * 0.48 * ((i + 1) / 3)))}px` }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">마이크가 정상 작동 중입니다</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="w-full mt-auto flex gap-3">
            <Button
              onClick={() => { setError(''); stopMicStream(); setMicPermission('idle'); setStep('interests'); }}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              이전
            </Button>

            {micPermission !== 'granted' ? (
              <Button
                onClick={handleMicrophonePermission}
                className="flex-1"
                size="lg"
              >
                마이크 허용
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                isLoading={isLoading}
                className="flex-1"
                size="lg"
              >
                완료
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
