import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { ThemeContext } from '../hooks/ThemeContext';

vi.mock('../hooks/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' }),
    googleLogin: vi.fn().mockResolvedValue({ success: false, message: 'Google failed' }),
  }),
}));

const renderLogin = () =>
  render(
    <BrowserRouter>
      <ThemeContext.Provider value={{ isDarkMode: false }}>
        <LoginPage />
      </ThemeContext.Provider>
    </BrowserRouter>
  );

describe('Login page', () => {
  it('renders username and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
  });

  it('renders sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy();
  });

  it('submits form and stays on screen', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/username or email/i), { target: { value: 'FAC-001' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'FAC-001' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy();
    });
  });
});
