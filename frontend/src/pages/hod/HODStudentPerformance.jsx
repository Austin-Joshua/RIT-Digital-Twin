import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HODStudentPerformance = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    api
      .get(`/hod/student-performance/${studentId}`)
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load student performance.'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div style={{ padding: '24px', color: 'var(--theme-text-muted)' }}>Loading...</div>;
  if (error) return <div style={{ padding: '24px', color: '#dc2626' }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <button
        type="button"
        onClick={() => navigate('/hod')}
        style={{
          marginBottom: '16px',
          padding: '8px 16px',
          background: 'var(--theme-bg-muted)',
          border: '1px solid var(--theme-border)',
          borderRadius: '8px',
          color: 'var(--theme-text)',
          cursor: 'pointer',
        }}
      >
        ← Back to Dashboard
      </button>
      <h1 className="page-header" style={{ fontSize: 'var(--font-size-h1)', color: 'var(--theme-text)' }}>
        Student Performance
      </h1>
      <p style={{ color: 'var(--theme-text-muted)', marginBottom: '24px' }}>
        {data.studentIdNumber} — Year {data.year}, Section {data.section}
      </p>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>Marks</h2>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Subject</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Semester</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Internal</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {(data.marks || []).map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{m.subjectName}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>{m.semester}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {m.calculatedInternal != null ? Number(m.calculatedInternal).toFixed(2) : '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {m.totalScore != null ? Number(m.totalScore).toFixed(2) : '—'}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{m.grade ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data.marks || []).length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>No marks recorded.</div>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>Attendance</h2>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)' }}>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Attended</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Total</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {(data.attendance || []).map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>{a.attendedClasses ?? '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>{a.totalClasses ?? '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data.attendance || []).length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>No attendance recorded.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HODStudentPerformance;
