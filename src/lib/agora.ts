// Agora RTC SDK 초기화 (동적 임포트, 오디오 전용)
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

let AgoraRTC: typeof import('agora-rtc-sdk-ng') | null = null;
let client: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;

// Agora SDK 동적 로드 (SSR 방지)
const loadAgoraRTC = async () => {
  if (typeof window === 'undefined') return null;
  if (!AgoraRTC) {
    AgoraRTC = await import('agora-rtc-sdk-ng');
  }
  return AgoraRTC;
};

// RTC 클라이언트 생성 (싱글톤)
export const createClient = async (): Promise<IAgoraRTCClient | null> => {
  const agora = await loadAgoraRTC();
  if (!agora) return null;

  if (!client) {
    client = agora.default.createClient({ mode: 'rtc', codec: 'vp8' });
  }
  return client;
};

// 채널 입장
export const joinChannel = async (
  channelId: string,
  token: string,
  uid: number,
): Promise<void> => {
  const c = await createClient();
  if (!c) throw new Error('Agora 클라이언트를 생성할 수 없습니다');
  if (!APP_ID) throw new Error('Agora App ID가 설정되지 않았습니다');

  await c.join(APP_ID, channelId, token, uid);
  console.log('[10MB] Agora 채널 입장 완료:', channelId);
};

// 마이크 오디오 트랙 생성 + 발행
export const publishMicrophone = async (): Promise<void> => {
  const agora = await loadAgoraRTC();
  const c = await createClient();
  if (!agora || !c) throw new Error('Agora가 초기화되지 않았습니다');

  localAudioTrack = await agora.default.createMicrophoneAudioTrack();
  await c.publish([localAudioTrack]);
  console.log('[10MB] 마이크 발행 완료');
};

// 마이크 음소거 토글
export const setMicEnabled = (enabled: boolean): void => {
  if (localAudioTrack) {
    localAudioTrack.setEnabled(enabled);
  }
};

// 상대방 오디오 구독 + 자동 재생
export const subscribeRemoteAudio = async (
  user: IAgoraRTCRemoteUser,
): Promise<void> => {
  if (!client) return;
  await client.subscribe(user, 'audio');
  user.audioTrack?.play();
  console.log('[10MB] 상대방 오디오 구독 완료');
};

// 채널 퇴장 + 리소스 정리
export const leaveChannel = async (): Promise<void> => {
  if (localAudioTrack) {
    localAudioTrack.close();
    localAudioTrack = null;
  }
  if (client) {
    await client.leave();
    console.log('[10MB] Agora 채널 퇴장 완료');
  }
};

// 이벤트 리스너 등록 (상대방 입장/퇴장/오디오 발행)
export const onUserPublished = (
  callback: (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => void,
): (() => void) => {
  if (!client) return () => {};
  client.on('user-published', callback);
  return () => {
    client?.off('user-published', callback);
  };
};

export const onUserLeft = (
  callback: (user: IAgoraRTCRemoteUser) => void,
): (() => void) => {
  if (!client) return () => {};
  client.on('user-left', callback);
  return () => {
    client?.off('user-left', callback);
  };
};

// 클라이언트 참조 반환 (상태 확인용)
export const getClient = () => client;
