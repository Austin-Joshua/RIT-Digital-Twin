import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import { FaChalkboardTeacher, FaUserGraduate, FaChartLine, FaExclamationTriangle, FaStar } from 'react-icons/fa';

const HODDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [classPerformance, setClassPerformance] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [trends, setTrends] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classSort, setClassSort] = useState('highest');
  const [trendBy, setTrendBy] = useState('semester');
  const [studentYear, setStudentYear] = useState('');
  const [studentSection, setStudentSection] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analyticsRes, classRes, studentsRes, facultyRes, heatmapRes, weakRes, trendsRes, rankingsRes] =
        await Promise.all([
          api.get('/hod/department-stats'),
          api.get('/hod/department-analytics'),
          api.get('/hod/class-performance', { params: { sortBy: classSort } }),
          api.get('/hod/students', { params: { year: studentYear || undefined, section: studentSection || undefined } }),
          api.get('/hod/faculty'),
          api.get('/hod/subject-heatmap'),
          api.get('/hod/weak-subjects'),
          api.get('/hod/performance-trends', { params: { by: trendBy } }),
          api.get('/hod/class-rankings'),
        ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setClassPerformance(classRes.data);
      setStudents(studentsRes.data);
      setFaculty(facultyRes.data);
      setHeatmap(heatmapRes.data);
      setWeakSubjects(weakRes.data);
      setTrends(trendsRes.data);
      setRankings(rankingsRes.data);
    } catch (err) {
      console.error('HOD fetch error', err);
      setError(err.response?.data?.message || 'Failed to load department data. Ensure you are assigned to a department.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      api.get('/hod/class-performance', { params: { sortBy: classSort } }).then((r) => setClassPerformance(r.data)).catch(() => {});
    }
  }, [classSort]);

  useEffect(() => {
    if (!loading) {
      api.get('/hod/performance-trends', { params: { by: trendBy } }).then((r) => setTrends(r.data)).catch(() => {});
    }
  }, [trendBy]);

  useEffect(() => {
    if (!loading) {
      api.get('/hod/students', { params: { year: studentYear || undefined, section: studentSection || undefined } })
        .then((r) => setStudents(r.data)).catch(() => {});
    }
  }, [studentYear, studentSection]);

  const perfColor = (perf) => (perf === 'strong' ? '#16a34a' : perf === 'average' ? '#ca8a04' : '#dc2626');

  if (loading && !stats) {
    return (
      <div className="space-y-6" style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--theme-text-muted)' }}>Loading department data...</div>
      </div>
    );
  }

  const isHandS = stats?.isHandS === true;

  return (
    <div className="space-y-6" style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <h1 className="page-header" style={{ fontSize: 'var(--font-size-h1)', color: 'var(--theme-text)' }}>
        HOD Dashboard
        {stats?.departmentCode && (
          <span style={{ fontSize: '0.75em', fontWeight: '600', color: 'var(--theme-text-muted)', marginLeft: '8px' }}>
            {isHandS ? '— H&S (First year)' : `— ${stats.departmentCode} (Year 2–4)`}
          </span>
        )}
      </h1>

      {error && (
        <div
          className="card"
          style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid #dc2626',
            color: 'var(--theme-text)',
            padding: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* Overview cards */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>
          Department Overview
          {isHandS && <span style={{ fontSize: '0.7em', fontWeight: 'normal', color: 'var(--theme-text-muted)', marginLeft: '8px' }}>First year from all branches (reported under H&S)</span>}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <FaChalkboardTeacher size={28} style={{ color: 'var(--color-primary-navy)', marginBottom: '8px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--theme-text)' }}>
              {stats?.totalFaculty ?? 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>Total Faculty</div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <FaUserGraduate size={28} style={{ color: 'var(--color-primary-navy)', marginBottom: '8px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--theme-text)' }}>
              {stats?.totalStudents ?? 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>
              {isHandS ? 'First year (all branches)' : 'Total Students'}
            </div>
          </div>
          {isHandS ? (
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--theme-text)' }}>
                {stats?.year1Count ?? 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>First year (all branches)</div>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--theme-text)' }}>
                  {stats?.year2Count ?? 0}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>2nd Year</div>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--theme-text)' }}>
                  {stats?.year3Count ?? 0}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>3rd Year</div>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--theme-text)' }}>
                  {stats?.year4Count ?? 0}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>4th Year</div>
              </div>
              {stats?.newJoinersCount != null && (
                <div className="card" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid var(--color-accent-gold)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-accent-gold)' }}>
                    {stats.newJoinersCount}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>New joiners (Year 2)</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Department analytics */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>
          Department Analytics
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginBottom: '4px' }}>
              Average Marks
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--theme-text)' }}>
              {analytics?.averageMarks != null ? Number(analytics.averageMarks).toFixed(2) : '—'}
            </div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginBottom: '4px' }}>
              Pass %
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--theme-text)' }}>
              {analytics?.passPercentage != null ? `${Number(analytics.passPercentage)}%` : '—'}
            </div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginBottom: '4px' }}>
              Avg Attendance
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--theme-text)' }}>
              {analytics?.averageAttendance != null ? `${Number(analytics.averageAttendance).toFixed(1)}%` : '—'}
            </div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginBottom: '4px' }}>
              Internal Marks Avg
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--theme-text)' }}>
              {analytics?.internalMarksAverage != null ? Number(analytics.internalMarksAverage).toFixed(2) : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Class performance */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', margin: 0 }}>
            Class Performance
          </h2>
          <select
            value={classSort}
            onChange={(e) => setClassSort(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
              background: 'var(--card-bg)',
              color: 'var(--theme-text)',
            }}
          >
            <option value="highest">Highest performing first</option>
            <option value="lowest">Lowest performing first</option>
            <option value="attendance">By attendance</option>
          </select>
        </div>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Class</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Students</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Academic Avg</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Attendance Avg</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Failing</th>
              </tr>
            </thead>
            <tbody>
              {classPerformance.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'var(--theme-text)' }}>{row.class}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>{row.studentCount}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {row.academicAverage != null ? Number(row.academicAverage).toFixed(2) : '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {row.attendanceAverage != null ? `${Number(row.attendanceAverage).toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: row.failingCount > 0 ? '#dc2626' : 'var(--theme-text)' }}>
                    {row.failingCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classPerformance.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              No class data available.
            </div>
          )}
        </div>
      </section>

      {/* Students */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>
          Students
        </h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="number"
            placeholder="Year"
            value={studentYear}
            onChange={(e) => setStudentYear(e.target.value)}
            min={1}
            max={5}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
              background: 'var(--card-bg)',
              color: 'var(--theme-text)',
              width: '80px',
            }}
          />
          <input
            type="text"
            placeholder="Section"
            value={studentSection}
            onChange={(e) => setStudentSection(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
              background: 'var(--card-bg)',
              color: 'var(--theme-text)',
              width: '100px',
            }}
          />
        </div>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>ID No.</th>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Name</th>
                {isHandS && <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Branch</th>}
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Year</th>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Section</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>
                    <Link to={`/hod/student/${s.studentId}`} style={{ color: 'var(--color-primary-navy)', fontWeight: '600' }}>
                      {s.studentIdNumber}
                    </Link>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{s.name?.trim() || '—'}</td>
                  {isHandS && <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{s.branchCode || s.branchName || '—'}</td>}
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{s.year ?? '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{s.section ?? '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {s.currentCgpa != null ? Number(s.currentCgpa).toFixed(2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              No students in department or no data.
            </div>
          )}
        </div>
      </section>

      {/* Faculty */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>
          Faculty (View Only)
        </h2>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>
                    {((f.firstName || '') + ' ' + (f.lastName || '')).trim() || f.username}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{f.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {faculty.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              No faculty in department.
            </div>
          )}
        </div>
      </section>

      {/* Subject heatmap */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px' }}>
          Subject Performance Heatmap
        </h2>
        <div className="card" style={{ overflowX: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              padding: '16px',
            }}
          >
            {heatmap.map((row, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background:
                    row.performance === 'strong'
                      ? 'rgba(22, 163, 74, 0.2)'
                      : row.performance === 'average'
                      ? 'rgba(202, 138, 4, 0.2)'
                      : 'rgba(220, 38, 38, 0.2)',
                  border: `2px solid ${perfColor(row.performance)}`,
                  color: 'var(--theme-text)',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{row.subject}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>{row.class}</div>
                <div style={{ marginTop: '4px' }}>
                  Avg: {row.averageScore != null ? Number(row.averageScore).toFixed(2) : '—'} —{' '}
                  <span style={{ color: perfColor(row.performance), fontWeight: '600' }}>{row.performance}</span>
                </div>
              </div>
            ))}
          </div>
          {heatmap.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              No subject-class data for heatmap.
            </div>
          )}
        </div>
      </section>

      {/* Weak subjects */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle /> Weak Subject Alerts
        </h2>
        <div className="card" style={{ padding: '16px' }}>
          {weakSubjects.length === 0 ? (
            <div style={{ color: 'var(--theme-text-muted)' }}>No weak subjects identified.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--theme-text)' }}>
              {weakSubjects.map((w, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  <strong>{w.subjectName}</strong> — Avg: {w.averageScore != null ? Number(w.averageScore).toFixed(2) : '—'}, Failure
                  rate: {w.failureRate != null ? `${Number(w.failureRate)}%` : '—'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Trend chart */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', margin: 0 }}>
            Performance Trends
          </h2>
          <select
            value={trendBy}
            onChange={(e) => setTrendBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
              background: 'var(--card-bg)',
              color: 'var(--theme-text)',
            }}
          >
            <option value="semester">By Semester</option>
            <option value="year">By Year</option>
          </select>
        </div>
        <div className="card" style={{ padding: '16px', minHeight: '280px' }}>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={trends.map((t) => ({
                  name: t[trendBy === 'year' ? 'year' : 'semester'] || '—',
                  value: t.averageScore != null ? Number(t.averageScore) : 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                <XAxis dataKey="name" stroke="var(--theme-text-muted)" />
                <YAxis stroke="var(--theme-text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }} />
                <Bar dataKey="value" fill="var(--color-accent-gold)" name="Avg Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              No trend data available.
            </div>
          )}
        </div>
      </section>

      {/* Class rankings */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-accent-gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaStar /> Class Ranking
        </h2>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text-muted)' }}>Class</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Academic Avg</th>
                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--theme-text-muted)' }}>Attendance Avg</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'var(--color-accent-gold)' }}>{row.rank ?? i + 1}</td>
                  <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{row.class}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {row.academicAverage != null ? Number(row.academicAverage).toFixed(2) : '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: 'var(--theme-text)' }}>
                    {row.attendanceAverage != null ? `${Number(row.attendanceAverage).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rankings.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
              No ranking data.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HODDashboard;
