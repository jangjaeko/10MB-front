// 마이페이지 (프로필, 통계, 로그아웃, 계정 삭제)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tag } from '@/components/common/Tag';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useT } from '@/hooks/useT';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { isLoading, isAuthenticated, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t, ti } = useT();

  if (isLoading || !isAuthenticated) return null;

  // 계정 삭제 처리
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      await signOut();
    } catch {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 프로필 카드 */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {user?.nickname?.[0] ?? '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {user?.nickname ?? t('profile.noNickname')}
            </h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {user?.interests?.map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
            >
              {ti(interest)}
            </span>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">{t('profile.statsTitle')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <p className="text-2xl font-bold text-orange-400">
              {user?.total_calls ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('profile.totalCalls')}</p>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <p className="text-2xl font-bold text-orange-400">
              {user?.total_minutes ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('profile.totalMinutes')}</p>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-3">
        <Link href="/profile/edit">
          <Button
            variant="outline"
            className="w-full border-gray-700 text-gray-900 hover:bg-gray-50"
          >
            {t('profile.editProfile')}
          </Button>
        </Link>

        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700"
        >
          {t('profile.logout')}
        </Button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full text-center text-sm text-red-400 hover:text-red-500 py-2"
        >
          {t('profile.deleteAccount')}
        </button>
      </div>

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('profile.deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('profile.deleteConfirmBody')}
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
