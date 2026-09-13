export default function AssignmentGrading() {
    return (
        <section className="space-y-4" style={{ padding: 'clamp(12px, 3vw, 24px)', maxWidth: 720 }}>
            <h1 className="page-header">Assignment assessment</h1>
            <p style={{ color: 'var(--theme-text-muted)', lineHeight: 1.5 }}>
                Submissions are not stored for this page, so no student files or scores are listed.
                Upload marks from the marks page when a roster is available. Nothing is substituted.
            </p>
        </section>
    );
}
