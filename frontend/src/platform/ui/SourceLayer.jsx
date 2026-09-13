import StatusBadge from './StatusBadge';
import './source-layer.css';

function reading(point) {
    if (point.value == null || point.value === '') return point.detail || 'Not placed';
    const unit = point.unit ? ` ${point.unit}` : '';
    return `${point.value}${unit}`;
}

export default function SourceLayer({ sources }) {
    if (!sources) {
        return (
            <section className="source-layer">
                <p className="source-note">The simulated source layer was not in this campus record.</p>
            </section>
        );
    }

    const outlook = sources.outlook || {};

    return (
        <section className="source-layer" aria-label="Simulated sources">
            <div>
                <h2>Simulated infrastructure</h2>
                <p className="source-note">Not sensors. {sources.because}</p>
                <StatusBadge source="SIMULATED" />
            </div>
            <p className="source-note">
                Five minutes ahead the simulated crowd curve {outlook.movement || 'is not scored'}.
                {' '}{outlook.because}
            </p>
            <div className="source-pipeline">
                {(sources.pipeline || []).map((stage) => (
                    <article key={stage.name}>
                        <header>
                            <strong>{stage.name}</strong>
                            <StatusBadge source={stage.source} />
                        </header>
                        <p className="source-note">{stage.because}</p>
                    </article>
                ))}
            </div>
            <div className="source-points">
                {(sources.points || []).map((point, index) => (
                    <article key={`${point.metric}-${point.location}-${index}`} className="source-point">
                        <header>
                            <span>{point.metric}</span>
                            <StatusBadge source={point.source} />
                        </header>
                        <strong>{point.location}</strong>
                        <span>{reading(point)}{point.phase ? ` · ${point.phase}` : ''}{point.detail ? ` · ${point.detail}` : ''}</span>
                        <span>{point.because}</span>
                    </article>
                ))}
            </div>
        </section>
    );
}
