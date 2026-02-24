// 대화 주제 선택 컴포넌트 (내 관심사에서 1~3개 선택 + "아무거나" 옵션)
'use client';

import { Tag } from '@/components/common/Tag';
import { useT } from '@/hooks/useT';

interface InterestSelectorProps {
  selectedInterests: string[];
  onSelect: (interests: string[]) => void;
  userInterests: string[];
  maxSelect?: number;
  isRandom: boolean;
  onRandomToggle: () => void;
}

export const InterestSelector = ({
  selectedInterests,
  onSelect,
  userInterests,
  maxSelect = 3,
  isRandom,
  onRandomToggle,
}: InterestSelectorProps) => {
  const { t, ti } = useT();
  // 관심사 토글
  const handleToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onSelect(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < maxSelect) {
      onSelect([...selectedInterests, interest]);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-400">
        {t('match.interestPrompt', { n: maxSelect })}
      </p>

      {/* "아무거나" 토글 */}
      <button
        type="button"
        onClick={onRandomToggle}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
          isRandom
            ? 'bg-orange-500 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        {t('match.anyTopic')}
      </button>

      {/* 관심사 태그 목록 */}
      {!isRandom && (
        <div className="flex flex-wrap gap-2">
          {userInterests.map((interest) => (
            <Tag
              key={interest}
              label={ti(interest)}
              selected={selectedInterests.includes(interest)}
              onClick={() => handleToggle(interest)}
            />
          ))}
        </div>
      )}

      {isRandom && (
        <p className="text-center text-sm text-gray-500">
          {t('match.anyTopicDesc')}
        </p>
      )}
    </div>
  );
};
