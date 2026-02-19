// 홈 페이지 (환영 카드 + 통계)
'use client';

import { WelcomeCard } from '@/components/home/WelcomeCard';
import { StatsCard } from '@/components/home/StatsCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  useAuth();
  const { user } = useAuthStore();

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="space-y-4">
        <WelcomeCard nickname={user?.nickname} />
        <StatsCard
          totalCalls={user?.total_calls ?? 0}
          totalMinutes={user?.total_minutes ?? 0}
        />
      </div>
    </div>
  );
}
