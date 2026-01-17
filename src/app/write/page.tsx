'use client';

import { Suspense } from 'react';
import WritePageContent from './WritePageContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--kuromi-cream)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 loading-kuromi">★</div>
        <p className="text-[var(--kuromi-dark-purple)]">로딩 중...</p>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WritePageContent />
    </Suspense>
  );
}
