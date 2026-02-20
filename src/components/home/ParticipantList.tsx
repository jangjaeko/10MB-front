// 대화방 참여자 목록 (닉네임, 관심사, 말하기 감지, 마이크 상태)
'use client';

interface Participant {
  userId: string;
  nickname: string;
  interests: string[];
}

interface ParticipantListProps {
  participants: Participant[];
  speakingUserIds: Set<string>;
  myUserId?: string;
  isMicOn: boolean;
}

export const ParticipantList = ({
  participants,
  speakingUserIds,
  myUserId,
  isMicOn,
}: ParticipantListProps) => {
  if (participants.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">아직 참여자가 없어요</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map((p) => {
        const isMe = p.userId === myUserId;
        const isSpeaking = speakingUserIds.has(p.userId);

        return (
          <div
            key={p.userId}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isSpeaking
                ? 'bg-orange-500/10 ring-1 ring-orange-500/50'
                : 'bg-gray-800/50'
            }`}
          >
            {/* 아바타 */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                isSpeaking
                  ? 'bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-950'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {p.nickname.charAt(0)}
            </div>

            {/* 닉네임 + 관심사 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-sm font-medium truncate">
                  {p.nickname}
                </span>
                {isMe && (
                  <span className="text-[10px] text-orange-400 font-medium shrink-0">나</span>
                )}
              </div>
              {p.interests.length > 0 && (
                <div className="flex gap-1 mt-0.5 overflow-hidden">
                  {p.interests.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded-full truncate"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 마이크 상태 (본인만) / 말하기 인디케이터 */}
            <div className="shrink-0">
              {isMe ? (
                isMicOn ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )
              ) : isSpeaking ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-3 bg-orange-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-4 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <span className="w-0.5 h-2.5 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
