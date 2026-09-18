import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { ThemeContext } from '../hooks/ThemeContext';

vi.mock('../hooks/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' }),
    googleLogin: vi.fn().mockResolvedValue({ success: false, message: 'Google failed' }),
  }),
}));

const renderLogin = async () => {
  let result;
  await act(async () => {
    result = render(
      <BrowserRouter>
        <ThemeContext.Provider value={{ isDarkMode: false }}>
          <LoginPage />
        </ThemeContext.Provider>
      </BrowserRouter>
    );
  });
  return result;
};

describe('Login page', () => {
  it('renders user id and password fields', async () => {
    await renderLogin();
    expect(screen.getByPlaceholderText(/Register No \/ Email \/ User ID/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
  });

  it('renders sign in button', async () => {
    await renderLogin();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy();
  });

  it('submits form and stays on screen', async () => {
    await renderLogin();
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Register No \/ Email \/ User ID/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy();
    });
  });
});
