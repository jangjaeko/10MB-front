// 매칭 성공 화면 (상대방 닉네임 + 공통 관심사 표시)
'use client';

interface MatchFoundProps {
  partnerNickname: string;
  commonInterests: string[];
}

export const MatchFound = ({
  partnerNickname,
  commonInterests,
}: MatchFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* 성공 아이콘 */}
      <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 animate-bounce">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        매칭 성공!
      </h2>

      {/* 상대방 정보 */}
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-xs mt-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-xl text-white font-bold">
            {partnerNickname[0]}
          </span>
        </div>
        <p className="text-lg font-bold text-white mb-3">
          {partnerNickname}
        </p>

        {/* 공통 관심사 */}
        {commonInterests.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">공통 관심사</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {commonInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400 mt-6 animate-pulse">
        잠시 후 음성 연결이 시작됩니다...
      </p>
    </div>
  );
};
