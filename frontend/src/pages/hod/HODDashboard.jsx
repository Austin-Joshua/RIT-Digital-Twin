import React from 'react';

/**
 * HOD (Head of Department) Dashboard – placeholder.
 * HOD plays an intermediate role between Admin and Faculty.
 * Features (e.g. revaluation flow: Student → HOD → Admin → grade change) will be added later.
 */
const HODDashboard = () => {
  return (
    <div className="space-y-6" style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <h1 className="page-header" style={{ fontSize: 'var(--font-size-h1, 1.75rem)', color: 'var(--theme-text)' }}>
        HOD Dashboard
      </h1>
      <div
        className="stu-info-card"
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--theme-text-muted)',
        }}
      >
        <p style={{ margin: 0, fontSize: '1rem' }}>
          This page is reserved for Head of Department features. You will be able to manage revaluation requests,
          act as an intermediate between faculty and admin, and access department-level approvals here.
        </p>
      </div>
    </div>
  );
};

export default HODDashboard;
