import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../services/api';
import ImsReportTable from '../../components/common/ImsReportTable';

const CATMark = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const headers = [
        'Subject Code',
        'Subject Name',
        'Faculty Name',
        'CAT-1 (50)',
        'CAT-2 (50)',
        'CAT-3 (50)',
        'Internal Weightage',
        'Status',
    ];

    useEffect(() => {
        let isMounted = true;
        api.get('/erp/student/internal-marks')
            .then((res) => {
                if (!isMounted) return;
                const list = Array.isArray(res.data) ? res.data : [];
                const formatted = list.map((item) => {
                    const c1 = item.cat1Marks != null ? Number(item.cat1Marks) : null;
                    const c2 = item.cat2Marks != null ? Number(item.cat2Marks) : null;
                    const c3 = item.cat3Marks != null ? Number(item.cat3Marks) : null;
                    const total = item.totalInternal != null ? Number(item.totalInternal) : null;

                    return {
                        key: item.studentSubjectId || item.subjectCode,
                        'Subject Code': item.subjectCode,
                        'Subject Name': item.subjectName,
                        'Faculty Name': 'Department Faculty',
                        'CAT-1 (50)': c1 !== null ? c1 : '—',
                        'CAT-2 (50)': c2 !== null ? c2 : '—',
                        'CAT-3 (50)': c3 !== null ? c3 : '—',
                        'Internal Weightage': total !== null ? total.toFixed(1) : '—',
                        'Status': total !== null ? (total >= 10 ? 'Eligible' : 'Needs Improvement') : 'Pending',
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
                Loading authoritative CAT marks from ERP database...
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="p-8 bg-[var(--card-bg)] border border-[var(--theme-border)] rounded-xl text-center">
                <h3 className="font-bold text-base text-[var(--theme-text)] mb-2">No CAT Marks Available</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">
                    Faculty has not published continuous assessment marks for your enrolled subjects yet.
                </p>
            </div>
        );
    }

    return <ImsReportTable title="Continuous Assessment Test (CAT) Marks" headers={headers} rows={rows} />;
};

export default CATMark;
