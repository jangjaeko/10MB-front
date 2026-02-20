// 홈 페이지 (환영 카드 + 10분 매칭 CTA + 테마 대화방 목록)
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WelcomeCard } from '@/components/home/WelcomeCard';
import { RoomList } from '@/components/home/RoomList';
import { ActiveRoomView } from '@/components/home/ActiveRoomView';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { useVoice } from '@/hooks/useVoice';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Room } from '@/types';

// userId → Agora uid 해시 (백엔드와 동일한 로직)
function userIdToAgoraUid(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash) % 1000000;
}

interface RoomParticipant {
  userId: string;
  nickname: string;
  interests: string[];
}

export default function HomePage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { user, accessToken } = useAuthStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [speakingUserIds, setSpeakingUserIds] = useState<Set<string>>(new Set());

  const activeRoomRef = useRef<Room | null>(null);
  activeRoomRef.current = activeRoom;

  const { isConnected, isMicOn, connectionError, speakingUids, myUid, join, leave, toggleMic } = useVoice('room');

  // Agora speakingUids → userId 변환
  useEffect(() => {
    if (participants.length === 0 || speakingUids.size === 0) {
      setSpeakingUserIds(new Set());
      return;
    }
    const uidToUser = new Map<number, string>();
    for (const p of participants) {
      uidToUser.set(userIdToAgoraUid(p.userId), p.userId);
    }
    const speaking = new Set<string>();
    for (const uid of speakingUids) {
      const userId = uidToUser.get(uid);
      if (userId) speaking.add(userId);
    }
    setSpeakingUserIds(speaking);
  }, [speakingUids, participants]);

  // 대화방 목록 조회
  const fetchRooms = useCallback(async () => {
    try {
      const data = await api.getRooms() as Room[];
      setRooms(data);
    } catch (err) {
      console.error('[10MB] 대화방 목록 조회 실패:', err);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (accessToken) {
      fetchRooms();
    }
  }, [accessToken, fetchRooms]);

  // 실시간 소켓 이벤트 (인원수 + 참여자 + 입퇴장 토스트)
  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket();

    // 인원수 업데이트
    const handleRoomUpdate = (data: { roomId: string; currentParticipants: number }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId
            ? { ...r, current_participants: data.currentParticipants }
            : r,
        ),
      );
      setActiveRoom((prev) =>
        prev?.id === data.roomId
          ? { ...prev, current_participants: data.currentParticipants }
          : prev,
      );
    };

    // 참여자 목록 갱신
    const handleParticipants = (data: { roomId: string; participants: RoomParticipant[] }) => {
      if (activeRoomRef.current?.id === data.roomId) {
        setParticipants(data.participants);
      }
    };

    // 유저 입장 토스트
    const handleUserJoined = (data: { roomId: string; user: { userId: string; nickname: string } }) => {
      if (activeRoomRef.current?.id === data.roomId && data.user.userId !== user?.id) {
        window.dispatchEvent(
          new CustomEvent('room:toast', {
            detail: { message: `${data.user.nickname}님이 들어왔어요`, type: 'join' },
          }),
        );
      }
    };

    // 유저 퇴장 토스트
    const handleUserLeft = (data: { roomId: string; user: { userId: string; nickname: string } }) => {
      if (activeRoomRef.current?.id === data.roomId && data.user.userId !== user?.id) {
        window.dispatchEvent(
          new CustomEvent('room:toast', {
            detail: { message: `${data.user.nickname}님이 나갔어요`, type: 'leave' },
          }),
        );
      }
    };

    socket.on('room:update', handleRoomUpdate);
    socket.on('room:participants', handleParticipants);
    socket.on('room:user_joined', handleUserJoined);
    socket.on('room:user_left', handleUserLeft);

    return () => {
      socket.off('room:update', handleRoomUpdate);
      socket.off('room:participants', handleParticipants);
      socket.off('room:user_joined', handleUserJoined);
      socket.off('room:user_left', handleUserLeft);
    };
  }, [accessToken, user?.id]);

  // 로딩 중이거나 비인증 상태면 빈 화면 (useAuth에서 리다이렉트 처리)
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // 대화방 입장 핸들러
  const handleJoinRoom = async (roomId: string) => {
    if (isJoining) return;
    setIsJoining(true);

    try {
      await api.joinRoom(roomId);
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        setActiveRoom(room);
        setParticipants([]);
        // Agora 채널 입장
        await join(`room_${roomId}`);
      }

      // 소켓으로도 입장 알림
      const socket = getSocket();
      socket.emit('room:join', { roomId });
    } catch (err) {
      console.error('[10MB] 방 입장 실패:', err);
    } finally {
      setIsJoining(false);
    }
  };

  // 대화방 퇴장 핸들러
  const handleLeaveRoom = async () => {
    if (!activeRoom) return;

    try {
      // Agora 퇴장
      await leave();
      // REST API 퇴장
      await api.leaveRoom(activeRoom.id);
      // 소켓 퇴장 알림
      const socket = getSocket();
      socket.emit('room:leave', { roomId: activeRoom.id });
    } catch (err) {
      console.error('[10MB] 방 퇴장 실패:', err);
    } finally {
      setActiveRoom(null);
      setParticipants([]);
      setSpeakingUserIds(new Set());
      fetchRooms();
    }
  };

  // 방 안에 있을 때 전체 화면
  if (activeRoom) {
    return (
      <ActiveRoomView
        room={activeRoom}
        isConnected={isConnected}
        connectionError={connectionError}
        isMicOn={isMicOn}
        participants={participants}
        speakingUserIds={speakingUserIds}
        myUserId={user?.id}
        onToggleMic={toggleMic}
        onLeave={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="space-y-5">
        {/* 환영 카드 (축소) */}
        <WelcomeCard nickname={user?.nickname} />

        {/* 대화방 목록 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">쉬는 공간</h3>
          <RoomList rooms={rooms} onJoin={handleJoinRoom} />
        </div>
      </div>
    </div>
  );
}
