// 내 대화 통계 카드 (총 대화 수, 총 대화 시간)
'use client';

interface StatsCardProps {
  totalCalls: number;
  totalMinutes: number;
}

export const StatsCard = ({ totalCalls, totalMinutes }: StatsCardProps) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 text-white">
      <h3 className="text-sm font-medium text-gray-400 mb-4">내 대화 기록</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* 총 대화 수 */}
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">{totalCalls}</p>
          <p className="text-xs text-gray-400 mt-1">총 대화</p>
        </div>

        {/* 총 대화 시간 */}
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">{totalMinutes}</p>
          <p className="text-xs text-gray-400 mt-1">총 시간(분)</p>
        </div>
      </div>
    </div>
  );
};
