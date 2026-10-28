import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

const ThrowingComponent = ({ shouldThrow, errorMessage }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Normal Content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    });
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} errorMessage="" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeTruthy();
  });

  it('renders standard fallback when a regular error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="Regular runtime crash" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Service Temporarily Interrupted')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('renders update prompt when dynamic chunk import fails', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent
          shouldThrow={true}
          errorMessage="Failed to fetch dynamically imported module: https://digital-twin-lemon.vercel.app/assets/StudentDashboard-CjRZaN2B.js"
        />
      </ErrorBoundary>
    );

    expect(screen.getByText('Portal Update Available')).toBeTruthy();
    expect(screen.getByText('Reload Application')).toBeTruthy();
  });
});
