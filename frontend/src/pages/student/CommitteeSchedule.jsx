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
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                        Class Committee Schedule
                    </h2>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '6px 12px 6px 30px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                width: '200px'
                            }}
                        />
                        <LuSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'center', width: '50px' }}>S.No</th>
                                <th style={{ padding: '12px 10px' }}>Meeting Details</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Academic Year / Sem</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Date & Time</th>
                                <th style={{ padding: '12px 10px' }}>Venue</th>
                                <th style={{ padding: '12px 10px' }}>Chairperson</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center', width: '100px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, idx) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#6c757d' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: '500', color: '#007bff' }}>{s.meetingNo}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#495057' }}>{s.ay} / Sem {s.sem} ({s.section})</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#212529' }}>
                                        {s.date} <br />
                                        <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>{s.time}</span>
                                    </td>
                                    <td style={{ padding: '12px 10px', color: '#495057' }}>{s.venue}</td>
                                    <td style={{ padding: '12px 10px', color: '#495057' }}>{s.chairperson}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: '#28a745',
                                            color: '#ffffff'
                                        }}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommitteeSchedule;
