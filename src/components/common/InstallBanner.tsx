'use client';

import { useState, useEffect } from 'react';

const VISIT_KEY = '10mb_visit_count';
const DISMISSED_KEY = '10mb_install_dismissed';
const SHOW_AFTER_VISITS = 3;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallBanner = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 이미 설치됨 (standalone 모드)
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // 이미 닫음
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // 방문 횟수 증가
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));
    if (visits < SHOW_AFTER_VISITS) return;

    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    if (ios) {
      // iOS Safari에서만 표시 (Chrome/Firefox 제외)
      const isSafari = /safari/.test(ua) && !/crios|fxios/.test(ua);
      if (isSafari) setShow(true);
      return;
    }

    // Android Chrome: beforeinstallprompt 이벤트 대기
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  };

  const handleAdd = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold mb-0.5">홈 화면에 추가하세요</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            {isIOS
              ? "Safari 하단의 공유 버튼 → '홈 화면에 추가'를 탭하세요"
              : '홈 화면에 추가하면 더 빠르게 시작할 수 있어요'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={dismiss}
          className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-400 text-sm font-medium"
        >
          나중에
        </button>
        {!isIOS && (
          <button
            onClick={handleAdd}
            className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold"
          >
            추가하기
          </button>
        )}
      </div>
    </div>
  );
};
