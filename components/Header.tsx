"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between min-h-[52px]">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 -ml-2"
            aria-label="戻る"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold truncate">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
