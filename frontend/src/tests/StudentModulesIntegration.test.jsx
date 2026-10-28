import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Certificates from '../pages/student/Certificates';
import CATMark from '../pages/student/CATMark';
import Messages from '../pages/student/Messages';
import AcademicFee from '../pages/student/AcademicFee';
import ExamFee from '../pages/student/ExamFee';
import api from '../services/api';
import { workflowApi } from '../services/enterpriseApi';

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

vi.mock('../services/enterpriseApi', () => ({
    workflowApi: {
        getCertificates: vi.fn(),
        requestCertificate: vi.fn()
    }
}));

vi.mock('../hooks/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 101,
            username: '2117240020001',
            firstName: 'STUDENT',
            lastName: 'CANDIDATE',
            email: 'student.cse@ritchennai.edu.in',
            role: 'ROLE_STUDENT'
        }
    })
}));

vi.mock('../hooks/ToastContext', () => ({
    useToast: () => ({
        addToast: vi.fn()
    })
}));

describe('REA Student Modules Backend Integration & Audit Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Certificates module calls workflowApi.getCertificates on mount', async () => {
        workflowApi.getCertificates.mockResolvedValueOnce({
            data: [
                {
                    id: 99,
                    certificateType: 'BONAFIDE',
                    purpose: 'Passport Application',
                    status: 'APPROVED',
                    remarks: 'Verified by Principal',
                    createdAt: '2026-10-15T10:00:00Z'
                }
            ]
        });

        render(
            <MemoryRouter>
                <Certificates />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(workflowApi.getCertificates).toHaveBeenCalledWith(101);
        });
        expect(screen.getByText('Bonafide Certificate')).toBeDefined();
    });

    it('CATMark module calls /erp/student/internal-marks on mount and renders marks table', async () => {
        api.get.mockResolvedValueOnce({
            data: [
                {
                    subjectCode: 'CS23511',
                    subjectName: 'Computer Networks',
                    facultyName: 'Dr. Test Faculty',
                    cat1Marks: 45,
                    cat2Marks: 40,
                    cat3Marks: 42
                }
            ]
        });

        render(
            <MemoryRouter>
                <CATMark />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/erp/student/internal-marks');
        });
        expect(screen.getByText('Continuous Assessment Test (CAT) Marks')).toBeDefined();
    });

    it('Messages module queries inbox and outbox endpoints on mount', async () => {
        api.get.mockResolvedValueOnce({ data: [] }); // inbox
        api.get.mockResolvedValueOnce({ data: [] }); // outbox

        render(
            <MemoryRouter>
                <Messages />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/messages/inbox');
            expect(api.get).toHaveBeenCalledWith('/messages/outbox');
        });
        expect(screen.getAllByText('All Messages').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('New message')).toBeDefined();
        expect(screen.getByText('You have no messages.')).toBeDefined();
    });

    it('AcademicFee renders explicit simulation sandbox banner', () => {
        render(
            <MemoryRouter>
                <AcademicFee />
            </MemoryRouter>
        );

        expect(screen.getByText(/Demonstration Sandbox:/i)).toBeDefined();
        expect(screen.getByText(/Simulation Mode/i)).toBeDefined();
    });

    it('ExamFee renders explicit simulation sandbox banner', () => {
        render(
            <MemoryRouter>
                <ExamFee />
            </MemoryRouter>
        );

        expect(screen.getByText(/Demonstration Sandbox:/i)).toBeDefined();
    });
});

