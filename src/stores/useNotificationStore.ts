// 알림 상태 관리 (읽지 않은 수 + 배지용)
import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrementBy: (by: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementBy: (by) => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),
}));
