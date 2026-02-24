// 홈 환영 카드 (인사말 + 대화 시작 CTA 버튼)
'use client';

import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { useT } from '@/hooks/useT';

interface WelcomeCardProps {
  nickname?: string;
}

export const WelcomeCard = ({ nickname }: WelcomeCardProps) => {
  const { t } = useT();
  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* 배경 장식 원 */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-500/20 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-orange-500/10 rounded-full" />

      <div className="relative">
        <p className="text-sm text-gray-400 mb-1">
          {nickname ? t('home.greeting', { nickname }) : t('home.greetingFallback')}
        </p>
        <h2 className="text-2xl font-bold mb-1">
          {t('home.tagline')}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {t('home.taglineBody')}
        </p>

        <Link href="/match">
          <Button
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white"
          >
            {t('home.startButton')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
