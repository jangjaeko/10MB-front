// 대화방 목록 그리드 (2열, 실시간 인원수 업데이트)
'use client';

import { RoomCard } from './RoomCard';
import type { Room } from '@/types';

interface RoomListProps {
  rooms: Room[];
  onJoin: (roomId: string) => void;
}

export const RoomList = ({ rooms, onJoin }: RoomListProps) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">대화방을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onJoin={onJoin} />
      ))}
    </div>
  );
};
