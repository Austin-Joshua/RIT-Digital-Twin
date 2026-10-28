import React, { useState } from 'react';
import { LuCalendarCheck2, LuSearch } from 'react-icons/lu';

const COMMITTEE_SCHEDULE_DATA = [
    {
        id: 1,
        batch: '2024-2028',
        ay: '2026-2027',
        course: 'B.E. CSE',
        sem: '5',
        section: 'A',
        meetingNo: 'Class Committee Meeting - 2',
        date: '28-09-2026',
        time: '02:30 PM - 03:30 PM',
        venue: 'CSE Department Seminar Hall (Block 2, Level 3)',
        chairperson: 'DR. MADHAN V. (Professor & HOD)',
        status: 'Completed'
    },
    {
        id: 2,
        batch: '2024-2028',
        ay: '2026-2027',
        course: 'B.E. CSE',
        sem: '5',
        section: 'A',
        meetingNo: 'Class Committee Meeting - 1',
        date: '14-08-2026',
        time: '11:00 AM - 12:00 PM',
        venue: 'CSE Department Seminar Hall (Block 2, Level 3)',
        chairperson: 'DR. MADHAN V. (Professor & HOD)',
        status: 'Completed'
    }
];

const CommitteeSchedule = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = COMMITTEE_SCHEDULE_DATA.filter(s =>
        s.meetingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.date.includes(searchTerm) ||
        s.chairperson.toLowerCase().includes(searchTerm.toLowerCase())
    );

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuCalendarCheck2 />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Class Committee Schedule</h1>
                        <p className="ims-header-subtitle">Meeting timelines, chairperson details, and student representative sessions</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Class : B.E. CSE / 5 / A
                    </span>
                </div>
            </div>

            {/* Main Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                        Scheduled Meetings
                    </h3>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search meetings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ims-candy-search"
                            style={{ paddingLeft: '36px', width: '220px' }}
                        />
                        <LuSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                </div>

                {/* Table with Curvy Outer Box */}
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.86rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px', fontWeight: '700' }}>S.No</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Meeting Details</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '120px', fontWeight: '700' }}>Academic Year / Sem</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '180px', fontWeight: '700' }}>Date & Time</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Venue</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Chairperson</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '110px', fontWeight: '700' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        No committee meetings scheduled.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0B2C6B' }}>{item.meetingNo}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>{item.ay} / {item.sem}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>{item.date} <br /><span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.time}</span></td>
                                        <td style={{ padding: '12px 14px', color: '#1e293b' }}>{item.venue}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: '500', color: '#1e293b' }}>{item.chairperson}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span className="ims-candy-badge" style={{
                                                backgroundColor: '#dcfce7',
                                                color: '#166534',
                                                border: '1px solid #bbf7d0'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommitteeSchedule;
