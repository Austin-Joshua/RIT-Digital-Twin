import React, { useState } from 'react';
import { FaFileInvoice, FaReceipt } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';
import { academicYearLabel, examFees } from '../../utils/studentFees';

const ExamFee = () => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [paidIds, setPaidIds] = useState(() => new Set());
    const year = academicYearLabel();
    const pending = examFees.filter((fee) => fee.status === 'UNPAID' && !paidIds.has(fee.id));
    const pendingTotal = pending.reduce((sum, fee) => sum + fee.amount, 0);

    const pay = () => {
        setPaidIds(new Set(examFees.map((fee) => fee.id)));
        addToast(`Exam fee of ₹${pendingTotal.toLocaleString('en-IN')} recorded for ${year}.`, 'success');
    };

    return (
        <div className="stu-dashboard">
            <div className="ims-page-head">
                <div>
                    <h1><FaFileInvoice /> Exam Fee</h1>
                    <p>Theory, practical, and arrear exam fees for {user?.registerNo || 'your register number'}.</p>
                </div>
                <div className="ims-year-pill">
                    <span>Academic Year</span>
                    <strong>{year}</strong>
                </div>
            </div>

            <div className="ims-stat-row">
                <article className="ims-stat-card">
                    <div className="ims-ring" style={{ '--ring': pendingTotal === 0 ? '#2ecc71' : '#e63946', '--pct': pendingTotal === 0 ? '100%' : '28%' }}>
                        <span>{pendingTotal === 0 ? 'Paid' : 'Due'}</span>
                    </div>
                    <div>
                        <div className="ims-stat-label">Exam Fees Pending</div>
                        <div className="ims-stat-value">₹{pendingTotal.toLocaleString('en-IN')}</div>
                        <div className="ims-stat-sub">{year}</div>
                    </div>
                </article>
            </div>

            <div className="stu-info-card">
                <div className="info-header">Exam fee breakdown</div>
                <div className="info-body" style={{ padding: 0 }}>
                    <table className="stu-data-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Deadline</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examFees.map((fee) => {
                                const status = paidIds.has(fee.id) ? 'PAID' : fee.status;
                                return (
                                    <tr key={fee.id}>
                                        <td>{fee.label}</td>
                                        <td>{fee.deadline}</td>
                                        <td>₹{fee.amount.toLocaleString('en-IN')}</td>
                                        <td>{status}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="info-footer">
                    <button type="button" className="ims-pay-btn" onClick={pay} disabled={pendingTotal === 0}>
                        <FaReceipt /> {pendingTotal === 0 ? 'No exam fee pending' : `Pay ₹${pendingTotal.toLocaleString('en-IN')}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamFee;
