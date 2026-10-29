import { useState, type ReactNode } from 'react';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  flipped?: boolean;
  onFlip?: () => void;
  showHint?: boolean;
}

export function FlipCard({
  front,
  back,
  className = '',
  flipped: controlledFlipped,
  onFlip,
  showHint = true,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;

  const handleToggle = () => {
    if (onFlip) {
      onFlip();
    }
    if (!isControlled) {
      setInternalFlipped((f) => !f);
    }
  };

  const hasExplicitSize = className.includes('aspect-') || className.includes('h-');
  const sizeClasses = hasExplicitSize ? '' : 'max-w-xs aspect-square';

  return (
    <div
      className={`relative w-full [perspective:1000px] select-none cursor-pointer ${sizeClasses} ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
      onClick={handleToggle}
      aria-label="Otočte kartičku"
    >
      <div
        className="relative w-full h-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 sm:p-4 flex flex-col items-center justify-center text-center overflow-hidden [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
        >
          <div className="w-full max-h-full overflow-y-auto flex flex-col items-center justify-center break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {front}
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 sm:p-4 flex flex-col items-center justify-center text-center overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
        >
          <div className="w-full max-h-full overflow-y-auto flex flex-col items-center justify-center break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {back}
          </div>
        </div>
      </div>
      {showHint && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Kliknite pre otočenie / Click to flip
        </p>
      )}
    </div>
  );
}

