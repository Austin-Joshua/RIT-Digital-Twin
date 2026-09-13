import { lazy, Suspense } from 'react';

const CampusCopilotPanel = lazy(() => import('./components/CampusCopilotPanel'));

export default function CampusAssistant() {
  return (
    <Suspense fallback={null}>
      <CampusCopilotPanel />
    </Suspense>
  );
}
