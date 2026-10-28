import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '../pages/student/StudentDashboard';

let mockUser = { id: 1, username: '2117240020044', firstName: 'Austin' };
let resolveCgpaPromise;

vi.mock('../hooks/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/academic/student/cgpa')) {
        return new Promise((resolve) => {
          resolveCgpaPromise = resolve;
        });
      }
      if (url.includes('/erp/student/attendance-summary')) {
        return Promise.resolve({ data: [{ percentage: 88 }] });
      }
      if (url.includes('/academic/student/timetable')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    }),
  },
}));

describe('StudentDashboard component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUser = { id: 1, username: '2117240020044', firstName: 'Austin' };
    resolveCgpaPromise = null;
  });

  it('renders instantly from user-isolated sessionStorage cache while fresh data fetches', async () => {
    const cachedData = {
      ts: Date.now(),
      user: '2117240020044',
      data: {
        kpi: { cgpa: 9.15, attendance: 92, arrear: 0, loading: false },
        timetable: [],
      },
    };
    sessionStorage.setItem('rit_student_dashboard_2117240020044', JSON.stringify(cachedData));

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    // Initial render should show cached 9.15 without waiting for network
    expect(screen.getByText('9.15')).toBeTruthy();

    // Now resolve fresh network data
    await act(async () => {
      if (resolveCgpaPromise) {
        resolveCgpaPromise({ data: [{ gpa: 8.5 }] });
      }
    });

    await waitFor(() => {
      expect(screen.getByText('8.50')).toBeTruthy();
    });
  });

  it('ignores cache belonging to a different student user', async () => {
    // Cached data for User B
    const otherUserData = {
      ts: Date.now(),
      user: 'OTHER_STUDENT_999',
      data: {
        kpi: { cgpa: 5.50, attendance: 50, arrear: 3, loading: false },
        timetable: [],
      },
    };
    sessionStorage.setItem('rit_student_dashboard_OTHER_STUDENT_999', JSON.stringify(otherUserData));

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    // Should not show 5.50
    expect(screen.queryByText('5.50')).toBeNull();

    // Resolve network request
    await act(async () => {
      if (resolveCgpaPromise) {
        resolveCgpaPromise({ data: [{ gpa: 8.5 }] });
      }
    });

    await waitFor(() => {
      expect(screen.getByText('8.50')).toBeTruthy();
    });
  });
});
