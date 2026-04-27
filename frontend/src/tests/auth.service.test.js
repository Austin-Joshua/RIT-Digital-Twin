import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '../services/auth.service';
import apiClient from '../services/api.service';

vi.mock('../services/api.service', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.test';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('isAuthenticated returns false when no token', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns true when token exists', () => {
    localStorage.setItem('accessToken', mockToken);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('getCurrentUser returns null when not logged in', () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('getCurrentUser returns parsed user from localStorage', () => {
    const user = { id: 1, email: 'test@rit.edu', role: 'STUDENT' };
    localStorage.setItem('user', JSON.stringify(user));
    expect(authService.getCurrentUser()).toEqual(user);
  });

  it('logout clears localStorage', async () => {
    localStorage.setItem('accessToken', mockToken);
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    apiClient.post.mockResolvedValue({ data: {} });
    await authService.logout();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
