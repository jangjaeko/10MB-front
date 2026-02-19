// 홈 환영 카드 (인사말 + 대화 시작 CTA 버튼)
'use client';

import Link from 'next/link';
import { Button } from '@/components/common/Button';

interface WelcomeCardProps {
  nickname?: string;
}

export const WelcomeCard = ({ nickname }: WelcomeCardProps) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* 배경 장식 원 */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-500/20 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-orange-500/10 rounded-full" />

      <div className="relative">
        <p className="text-sm text-gray-400 mb-1">
          {nickname ? `${nickname}님,` : '안녕하세요!'}
        </p>
        <h2 className="text-2xl font-bold mb-1">
          잠깐 쉬어가세요 ☕
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          10분만 낯선 누군가와 가볍게 대화해보세요.
        </p>

        <Link href="/match">
          <Button
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white"
          >
            10분 대화 시작하기
          </Button>
        </Link>
      </div>
    </div>
  );
};
