'use client';

import { Suspense } from 'react';
import OffersContentClient from './OffersContentClient';
import { Loader2 } from 'lucide-react';

export default function OffersContent(props: any) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OffersContentClient {...props} />
    </Suspense>
  );
}
