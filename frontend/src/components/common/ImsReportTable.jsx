const ImsReportTable = ({ title, headers, rows, emptyLabel = "NO Exam Result Available" }) => (
    <div className="stu-report-page">
        <div className="stu-info-card ims-calendar-card" style={{ marginTop: "20px", padding: 0, overflow: "hidden" }}>
            <div style={{
                padding: "14px 16px",
                fontWeight: 800,
                fontSize: "15px",
                borderBottom: "1px solid var(--theme-border)",
                color: "var(--theme-text)"
            }}>
                {title}
            </div>
            <div style={{ overflowX: "auto" }}>
                <table className="ims-report-table">
                    <thead>
                        <tr>
                            {headers.map((header) => <th key={header}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} style={{ textAlign: "center", padding: "28px" }}>{emptyLabel}</td>
                            </tr>
                        ) : rows.map((row, index) => (
                            <tr key={row.key || index}>
                                {headers.map((header) => <td key={header}>{row[header] ?? "—"}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default ImsReportTable;
