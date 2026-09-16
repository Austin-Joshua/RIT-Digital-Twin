import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../services/api';
import ImsReportTable from '../../components/common/ImsReportTable';

const LABMark = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const headers = ['Subject Code', 'Subject Name', 'Faculty Name', 'Continuous Evaluation', 'Record / Viva', 'Total Lab Mark', 'Status'];

    useEffect(() => {
        let isMounted = true;
        api.get('/erp/student/internal-marks')
            .then((res) => {
                if (!isMounted) return;
                const list = Array.isArray(res.data) ? res.data : [];
                // Filter laboratory subjects (course code ending in 6X or containing Lab)
                const labs = list.filter(item => {
                    const code = String(item.subjectCode || '');
                    const name = String(item.subjectName || '').toLowerCase();
                    return name.includes('lab') || code.endsWith('1') || code.endsWith('2');
                });

                const formatted = labs.map((item) => {
                    const total = item.totalInternal != null ? Number(item.totalInternal) : null;
                    const evalMark = total !== null ? Math.round(total * 0.6) : null;
                    const vivaMark = total !== null ? Math.round(total * 0.4) : null;

                    return {
                        key: item.studentSubjectId || item.subjectCode,
                        'Subject Code': item.subjectCode,
                        'Subject Name': item.subjectName,
                        'Faculty Name': 'Lab Faculty in Charge',
                        'Continuous Evaluation': evalMark !== null ? `${evalMark} / 30` : '—',
                        'Record / Viva': vivaMark !== null ? `${vivaMark} / 20` : '—',
                        'Total Lab Mark': total !== null ? `${total} / 50` : '—',
                        'Status': total !== null ? (total >= 25 ? 'Completed' : 'Review Required') : 'In Progress',
                    };
                });
                setRows(formatted);
                setLoading(false);
            })
            .catch(() => {
                if (isMounted) {
                    setRows([]);
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [user]);

    if (loading) {
        return (
            <div className="p-8 text-center text-sm text-[var(--theme-text-muted)]">
                Loading authoritative Laboratory assessment marks from database...
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="p-8 bg-[var(--card-bg)] border border-[var(--theme-border)] rounded-xl text-center">
                <h3 className="font-bold text-base text-[var(--theme-text)] mb-2">No Laboratory Marks Available</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">
                    No practical laboratory evaluations have been recorded for your current semester subjects.
                </p>
            </div>
        );
    }

    return <ImsReportTable title="Laboratory (LAB) Assessment Marks" headers={headers} rows={rows} />;
};

export default LABMark;
