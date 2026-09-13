import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import './fee-ledger.css';

const TABS = ['Fee', 'Payment History'];

export default function ExamFee() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const parent = String(user?.role || '').replace('ROLE_', '') === 'PARENT';
    const [tab, setTab] = useState('Fee');
    const [payOpen, setPayOpen] = useState(false);
    const [notice, setNotice] = useState('');

    const submitPay = (event) => {
        event.preventDefault();
        setPayOpen(false);
        setNotice('No exam-fee row is stored, so nothing was sent. Official IMS pay is not an RIT Digital Twin record.');
    };

    return (
        <section className="fee-ledger" aria-label="Exam Fee">
            <header>
                <h1>Exam Fee</h1>
                <p className="fee-note">
                    {parent ? 'Parent login uses the same exam-fee layout as the student page.' : 'Same sections as the official IMS exam fee page.'}
                    {' '}Rows are semester, exam month and year, and amount. None are stored for this login.
                </p>
            </header>
            <div className="fee-ledger-tools">
                <button type="button" onClick={() => navigate(-1)}>Back</button>
                <button type="button" onClick={() => setPayOpen(true)}>Pay Exam</button>
            </div>
            <div className="fee-tabs" role="tablist" aria-label="Exam fee sections">
                {TABS.map((item) => (
                    <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
                ))}
            </div>
            {notice ? <p className="fee-note" role="status">{notice}</p> : null}

            {tab === 'Fee' ? (
                <article className="fee-card">
                    <h2>Fee Details</h2>
                    <dl className="fee-lines">
                        <dt>Total Fee</dt>
                        <dd>Not stored</dd>
                        <dt>Paid Amount</dt>
                        <dd>Not stored</dd>
                        <dt>Balance Amount</dt>
                        <dd>Not stored</dd>
                    </dl>
                </article>
            ) : (
                <article className="fee-card">
                    <h2>Payment History</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="fee-table">
                            <thead>
                                <tr>
                                    <th>Semester</th>
                                    <th>Exam Month & Year</th>
                                    <th>Amount</th>
                                    <th>Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={4}>No exam-fee row is stored. A sample semester is not listed.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </article>
            )}

            {payOpen ? (
                <div className="fee-scrim" role="presentation" onMouseDown={() => setPayOpen(false)}>
                    <form className="fee-modal" role="dialog" aria-modal="true" aria-label="Pay exam fee" onMouseDown={(event) => event.stopPropagation()} onSubmit={submitPay}>
                        <h2>Pay Exam</h2>
                        <p>Semester, exam month, and amount are not stored, so Pay cannot submit a charge.</p>
                        <div className="fee-ledger-tools">
                            <button type="button" onClick={() => setPayOpen(false)}>Back</button>
                            <button type="submit" className="primary">Pay</button>
                        </div>
                    </form>
                </div>
            ) : null}
        </section>
    );
}
