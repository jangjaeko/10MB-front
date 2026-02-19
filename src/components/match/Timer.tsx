// 원형 프로그레스 타이머 (SVG 기반, 경고/긴급 색상 전환)
'use client';

interface TimerProps {
  formattedTime: string;
  progress: number;
  isWarning: boolean;
  isUrgent: boolean;
}

// SVG 원 크기
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const Timer = ({
  formattedTime,
  progress,
  isWarning,
  isUrgent,
}: TimerProps) => {
  // 프로그레스 바 offset 계산
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  // 상태별 색상
  const strokeColor = isUrgent
    ? '#ef4444'   // red-500
    : isWarning
      ? '#f97316' // orange-500
      : '#f97316'; // orange-500 (기본도 오렌지)

  const textColor = isUrgent
    ? 'text-red-500'
    : isWarning
      ? 'text-orange-400'
      : 'text-white';

  const glowColor = isUrgent
    ? 'drop-shadow(0 0 8px rgba(239,68,68,0.5))'
    : isWarning
      ? 'drop-shadow(0 0 8px rgba(249,115,22,0.4))'
      : 'drop-shadow(0 0 6px rgba(249,115,22,0.3))';

  return (
    <div
      className={`relative w-36 h-36 ${isUrgent ? 'animate-pulse' : ''}`}
      style={isUrgent ? { animationDuration: '1.5s' } : undefined}
    >
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 120 120"
        style={{ filter: glowColor }}
      >
        {/* 배경 원 */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="#1f2937"
          strokeWidth="6"
        />
        {/* 프로그레스 원 */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>

      {/* 중앙 시간 표시 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums ${textColor}`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
