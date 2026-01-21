'use client';

import dynamic from 'next/dynamic';

// Canvas는 클라이언트에서만 로드 (SSR 비활성화)
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="text-4xl mb-4">🌻</div>
        <p className="text-amber-400 text-lg animate-pulse">로딩 중...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <GameCanvas />;
}
