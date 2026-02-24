// 프로필 수정 페이지 (닉네임 중복 체크 + 관심사 변경)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common/Button';
import { Tag } from '@/components/common/Tag';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { INTEREST_TAGS } from '@/types';
import { useT } from '@/hooks/useT';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, ti } = useT();

  // 닉네임 중복 체크 상태
  const [nicknameStatus, setNicknameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // 닉네임 변경 시 300ms 디바운스 중복 체크
  useEffect(() => {
    // 기존 닉네임과 같으면 체크 불필요
    if (nickname === user?.nickname) {
      setNicknameStatus('idle');
      return;
    }
    if (nickname.length < 2) {
      setNicknameStatus('idle');
      return;
    }

    setNicknameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await api.checkNickname(nickname);
        setNicknameStatus(result.available ? 'available' : 'taken');
      } catch {
        setNicknameStatus('idle');
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname, user?.nickname]);

  const handleToggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // 프로필 저장 처리
  const handleSave = async () => {
    if (nickname.length < 2) {
      setError(t('profile.nicknameTooShort'));
      return;
    }
    if (nicknameStatus === 'taken') {
      setError(t('profile.nicknameTaken'));
      return;
    }
    if (interests.length < 3) {
      setError(t('profile.interestRequired'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedUser = await api.updateProfile({ nickname, interests });
      setUser(updatedUser as any);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || t('profile.editFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 닉네임 입력 테두리 색상
  const nicknameBorderClass =
    nicknameStatus === 'available'
      ? 'border-green-500 focus:ring-green-500'
      : nicknameStatus === 'taken'
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-200 focus:ring-indigo-500';

  return (
    <>
      <Header
        title={t('profile.editTitle')}
        showBack
        onBack={() => router.push('/profile')}
      />
      <div className="pt-16 pb-8 px-4">
        {/* 닉네임 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.nickname')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${nicknameBorderClass}`}
              placeholder={t('profile.nicknamePlaceholder')}
              maxLength={20}
            />
            {/* 상태 아이콘 */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {nicknameStatus === 'checking' && (
                <svg className="w-5 h-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {nicknameStatus === 'available' && (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {nicknameStatus === 'taken' && (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          {nicknameStatus === 'taken' && (
            <p className="text-red-500 text-xs mt-1">{t('profile.nicknameTaken')}</p>
          )}
          {nicknameStatus === 'available' && (
            <p className="text-green-500 text-xs mt-1">{t('profile.nicknameAvailable')}</p>
          )}
        </div>

        {/* 관심사 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('profile.interestLabel', { n: interests.length })}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((interest) => (
              <Tag
                key={interest}
                label={ti(interest)}
                selected={interests.includes(interest)}
                onClick={() => handleToggleInterest(interest)}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <Button
          onClick={handleSave}
          isLoading={isLoading}
          disabled={nicknameStatus === 'checking' || nicknameStatus === 'taken'}
          className="w-full"
          size="lg"
        >
          {t('profile.save')}
        </Button>
      </div>
    </>
  );
}
