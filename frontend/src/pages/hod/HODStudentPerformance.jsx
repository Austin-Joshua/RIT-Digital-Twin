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
    <div className="ims-page-container">
      {/* Header Banner */}
      <div className="ims-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="ims-header-icon-box">
            <span style={{ fontSize: '20px' }}>🎓</span>
          </div>
          <div>
            <h1 className="ims-header-title">Student Performance Evaluation</h1>
            <p className="ims-header-subtitle">
              Comprehensive academic transcript and attendance metrics for <strong style={{ color: 'var(--theme-text)' }}>{data.studentIdNumber}</strong> (Year {data.year}, Section {data.section})
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/hod')}
          className="ims-candy-btn ims-candy-neutral ims-candy-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>Marks</h2>
        <div className="ims-card-elevated" style={{ overflowX: 'auto' }}>
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
        <div className="ims-card-elevated" style={{ overflowX: 'auto' }}>
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
