import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import './fee-ledger.css';

const TABS = ['Fee', 'Payment History', 'Consolidated Receipt'];

function money(value) {
    if (value == null || Number.isNaN(Number(value))) return 'Not stored';
    return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function AcademicFee() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const parent = String(user?.role || '').replace('ROLE_', '') === 'PARENT';
    const [tab, setTab] = useState('Fee');
    const [payOpen, setPayOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [notice, setNotice] = useState('');

    const details = [
        ['Course', 'Not stored'],
        ['Admitted Mode', 'Not stored'],
        ['Scholarship', 'Not stored'],
        ['GQG', 'Not stored'],
        ['FG', 'Not stored'],
        ['Hosteler', 'Not stored'],
    ];
    const lines = [
        ['Current AY', 'Not stored'],
        ['Opening Balance', 'Not stored'],
        ['Tuition Fee', 'Not stored'],
        ['Hostel Fee', 'Not stored'],
        ['Other Fee', 'Not stored'],
        ['AU / Library Fee', 'Not stored'],
        ['Fine & Breakage', 'Not stored'],
        ['Total Fee', 'Not stored'],
        ['Paid Amount', 'Not stored'],
        ['Reversal Amount', 'Not stored'],
        ['Balance Amount', 'Not stored'],
        ['Wallet Balance', 'Not stored'],
        ['Last Updated On', 'Not stored'],
    ];

    const submitPay = (event) => {
        event.preventDefault();
        setPayOpen(false);
        setAmount('');
        setNotice('No balance is stored for this login, so nothing was sent. The official IMS pay action uses the Worldline gateway, which is not connected here.');
    };

    return (
        <section className="fee-ledger" aria-label="Academic Fee">
            <header>
                <h1>Academic Fee</h1>
                <p className="fee-note">
                    {parent ? 'Parent login uses the same fee layout as the student ledger.' : 'Same sections as the official IMS academic fee page.'}
                    {' '}A stored ledger is not connected, so no tuition figure is substituted.
                </p>
            </header>
            <div className="fee-ledger-tools">
                <button type="button" onClick={() => navigate(-1)}>Back</button>
                <button type="button" onClick={() => setPayOpen(true)}>Pay</button>
            </div>
            <div className="fee-tabs" role="tablist" aria-label="Fee sections">
                {TABS.map((item) => (
                    <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
                ))}
            </div>
            {notice ? <p className="fee-note" role="status">{notice}</p> : null}

            {tab === 'Fee' ? (
                <>
                    <article className="fee-card">
                        <h2>Student Details</h2>
                        <div className="fee-grid">
                            {details.map(([label, value]) => (
                                <p key={label}><strong>{label}</strong> : {value}</p>
                            ))}
                        </div>
                    </article>
                    <article className="fee-card">
                        <h2>Fee Details</h2>
                        <dl className="fee-lines">
                            {lines.map(([label, value]) => (
                                <span key={label} style={{ display: 'contents' }}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </span>
                            ))}
                        </dl>
                    </article>
                </>
            ) : null}

            {tab === 'Payment History' ? (
                <article className="fee-card">
                    <h2>Payment History</h2>
                    <p>No payment is stored for this login. Sample transactions are not listed.</p>
                </article>
            ) : null}

            {tab === 'Consolidated Receipt' ? (
                <article className="fee-card">
                    <h2>Consolidated Receipts</h2>
                    <p>No receipt is stored for this login. A receipt is not generated from a sample payment.</p>
                </article>
            ) : null}

            {payOpen ? (
                <div className="fee-scrim" role="presentation" onMouseDown={() => setPayOpen(false)}>
                    <form className="fee-modal" role="dialog" aria-modal="true" aria-label="Pay academic fee" onMouseDown={(event) => event.stopPropagation()} onSubmit={submitPay}>
                        <h2>Pay</h2>
                        <p>Balance : Not stored</p>
                        <p>Wallet Balance : Not stored</p>
                        <label>
                            Enter Amount
                            <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
                        </label>
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
