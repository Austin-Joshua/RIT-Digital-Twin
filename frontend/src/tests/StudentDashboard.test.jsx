import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '../pages/student/StudentDashboard';

let mockUser = { id: 1, username: '2117240020044', email: 'austin@ritchennai.edu.in' };
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
      return Promise.resolve({ data: [] });
    }),
  },
}));

describe('StudentDashboard component', () => {
  beforeEach(() => {
    mockUser = { id: 1, username: '2117240020044', email: 'austin@ritchennai.edu.in' };
    resolveCgpaPromise = null;
  });

  it('renders KPI cards and updates CGPA upon API resolution', async () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    // Verify key KPI cards are rendered
    expect(screen.getByText(/CGPA/i)).toBeTruthy();
    expect(screen.getByText(/Average Attendance/i)).toBeTruthy();
    expect(screen.getByText(/Arrears In Hand/i)).toBeTruthy();
    expect(screen.getByText(/Taken Leave/i)).toBeTruthy();

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

  it('renders student navigation links and academic sections', () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/View Full Gradebook/i)).toBeTruthy();
    expect(screen.getByText(/Club & EC Involvement/i)).toBeTruthy();
    expect(screen.getByText(/Campus Bulletins/i)).toBeTruthy();
  });
});

