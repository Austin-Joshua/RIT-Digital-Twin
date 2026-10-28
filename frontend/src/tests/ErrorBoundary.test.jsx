import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      value: { reload: vi.fn(), href: '/' },
    });
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>All Good</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('All Good')).toBeInTheDocument();
  });

  it('renders update prompt when dynamic chunk import fails', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent
          shouldThrow={true}
          errorMessage="Failed to fetch dynamically imported module: https://domain/assets/StudentDashboard-old.js"
        />
      </ErrorBoundary>
    );

    expect(screen.getByText('Portal Update Available')).toBeInTheDocument();
    expect(screen.getByText(/A newer version of the digital twin platform has been deployed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Application/i })).toBeInTheDocument();
  });

  it('renders standard error message for generic runtime errors', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent
          shouldThrow={true}
          errorMessage="Null pointer in calculation"
        />
      </ErrorBoundary>
    );

    expect(screen.getByText('Service Temporarily Interrupted')).toBeInTheDocument();
    expect(screen.getByText('Null pointer in calculation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
