// 재사용 가능한 태그 컴포넌트 (관심사 선택 등)
'use client';

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export const Tag = ({ label, selected = false, onClick, size = 'md' }: TagProps) => {
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizeStyles[size]}
        rounded-full font-medium transition-all duration-200
        ${
          selected
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {label}
    </button>
  );
};
