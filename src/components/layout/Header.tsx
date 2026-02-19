// 상단 헤더 (로고 또는 페이지 타이틀 + 뒤로가기)
'use client';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const Header = ({
  title,
  showBack = false,
  onBack,
  rightElement,
}: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-40">
      <div className="max-w-md mx-auto h-full flex items-center justify-between px-4">
        <div className="w-10">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 타이틀이 있으면 타이틀, 없으면 로고 표시 */}
        {title ? (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        ) : (
          <h1 className="text-xl font-bold text-indigo-600">10MB</h1>
        )}

        <div className="w-10 flex justify-end">{rightElement}</div>
      </div>
    </header>
  );
};
