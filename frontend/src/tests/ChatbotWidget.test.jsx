import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChatbotWidget from '../features/ai/components/ChatbotWidget';
import api from '../services/api';

vi.mock('../hooks/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin1', role: 'ROLE_ADMIN', fullName: 'Dr. Administrator' }
  }),
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
  },
}));

// Mock window.HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderChatbot = async () => {
  let result;
  await act(async () => {
    result = render(
      <BrowserRouter>
        <ChatbotWidget />
      </BrowserRouter>
    );
  });
  return result;
};

describe('ChatbotWidget Digital Twin Copilot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating launcher button', async () => {
    await renderChatbot();
    const launcher = screen.getByRole('button', { name: /open rit digital twin copilot/i });
    expect(launcher).toBeTruthy();
  });

  it('opens panel and displays header and suggestions upon clicking launcher', async () => {
    await renderChatbot();
    const launcher = screen.getByRole('button', { name: /open rit digital twin copilot/i });
    await act(async () => {
      fireEvent.click(launcher);
    });

    expect(screen.getByText(/Digital Twin Copilot/i)).toBeTruthy();
    expect(screen.getByText(/Smart Campus Intelligence/i)).toBeTruthy();
    expect(screen.getByText(/Which classrooms have the lowest utilization today\?/i)).toBeTruthy();
  });

  it('submits query to /ai/copilot/ask and renders provenance, cards, and tables', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        answer: 'Room 102 has the lowest utilization at 22.5%.',
        provenance: 'ESTIMATED',
        confidence: 0.95,
        cards: [
          { title: 'Room', value: 'Room 102' },
          { title: 'Utilization', value: '22.5%' }
        ],
        table: {
          headers: ['Room', 'Building', 'Utilization'],
          rows: [['Room 102', 'Main Block', '22.5%']]
        },
        actions: [
          { label: 'View Classroom Allocation', path: '/classrooms/allocation' }
        ],
        citations: [
          { title: 'Campus Facility Handbook', section: 'Sec 4.2' }
        ],
        because: 'Calculated from 9 booked periods against 40 weekly slots.'
      }
    });

    await renderChatbot();
    const launcher = screen.getByRole('button', { name: /open rit digital twin copilot/i });
    await act(async () => {
      fireEvent.click(launcher);
    });

    const input = screen.getByPlaceholderText(/Ask about classrooms, energy, crowd, ESG/i);
    const sendBtn = screen.getByRole('button', { name: /send message/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Which classrooms have lowest utilization?' } });
      fireEvent.click(sendBtn);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/ai/copilot/ask',
        expect.objectContaining({ query: 'Which classrooms have lowest utilization?' }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Room 102 has the lowest utilization at 22.5%./i)).toBeTruthy();
      expect(screen.getByText(/ESTIMATED DATA/i)).toBeTruthy();
      expect(screen.getByText(/Campus Facility Handbook/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /View Classroom Allocation/i })).toBeTruthy();
    });
  });

  it('falls back to offline campus guide if backend call fails', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'));

    await renderChatbot();
    const launcher = screen.getByRole('button', { name: /open rit digital twin copilot/i });
    await act(async () => {
      fireEvent.click(launcher);
    });

    const input = screen.getByPlaceholderText(/Ask about classrooms, energy, crowd, ESG/i);
    const sendBtn = screen.getByRole('button', { name: /send message/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Where is user accounts?' } });
      fireEvent.click(sendBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Fallback response generated from local offline catalog/i)).toBeTruthy();
    });
  });
});
