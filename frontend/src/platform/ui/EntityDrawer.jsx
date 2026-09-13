import './foundation.css';

export default function EntityDrawer({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="campus-drawer" role="presentation" onClick={onClose}>
      <aside
        className="campus-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Details'}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="campus-panel-title" style={{ margin: 0 }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">Close</button>
        </header>
        {children}
      </aside>
    </div>
  );
}
