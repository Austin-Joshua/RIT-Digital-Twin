import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import twinService from '../../services/twinService';
import './role-experience.css';

function statusLabel(status) {
    if (status === 'ready') return 'Stored';
    if (status === 'empty') return 'Not stored';
    return 'Not connected';
}

const RoleExperience = () => {
    const [home, setHome] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        twinService.getExperience()
            .then((response) => {
                setHome(response.data);
                setError('');
            })
            .catch(() => setError('This home could not be read. Nothing was invented in its place.'));
    }, []);

    if (error) {
        return <section className="role-experience"><p className="role-note">{error}</p></section>;
    }
    if (!home) {
        return <section className="role-experience"><p className="role-note">Reading stored records for this login.</p></section>;
    }

    return (
        <section className="role-experience">
            <div>
                <h2>Your campus home</h2>
                <p className="role-priorities">{(home.priorities || []).join(' · ')}</p>
                <p className="role-note">{home.because}</p>
            </div>
            <div className="role-grid">
                {(home.sections || []).map((section) => (
                    <article key={section.id} className="role-section">
                        <header>
                            <h3>{section.title}</h3>
                            <span className="role-badge">{section.source || statusLabel(section.status)}</span>
                        </header>
                        <p>{section.because}</p>
                        {(section.items || []).length > 0 && (
                            <ul className="role-items">
                                {section.items.map((item, index) => (
                                    <li key={`${section.id}-${index}`} className="role-item">
                                        <strong>{item.label}</strong>
                                        <span>{item.detail}</span>
                                        {item.meta && <span>{item.meta}</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {section.link?.path && <Link to={section.link.path}>{section.link.label}</Link>}
                    </article>
                ))}
            </div>
        </section>
    );
};

export default RoleExperience;
