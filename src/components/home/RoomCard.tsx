// 대화방 카드 (아이콘, 이름, 참여자 수, 입장 버튼)
'use client';

import type { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const isFull = room.current_participants >= room.max_participants;

  return (
    <button
      onClick={() => !isFull && onJoin(room.id)}
      disabled={isFull}
      className={`bg-gray-900 rounded-2xl p-4 text-left transition-all ${
        isFull
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:bg-gray-800 active:scale-[0.97]'
      }`}
    >
      {/* 아이콘 */}
      <div className="text-4xl mb-3">{room.icon}</div>

      {/* 방 이름 */}
      <h3 className="text-white font-semibold text-sm mb-2">{room.name}</h3>

      {/* 참여자 수 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              room.current_participants > 0 ? 'bg-green-400' : 'bg-gray-600'
            }`}
          />
          <span className="text-xs text-gray-400">
            {room.current_participants}/{room.max_participants}
          </span>
        </div>
        {isFull && (
          <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">
            만석
          </span>
        )}
      </div>
    </button>
  );
};
