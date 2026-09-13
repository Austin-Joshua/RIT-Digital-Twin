import { useState } from 'react';
import { Link } from 'react-router-dom';
import './campus-os.css';

const STEPS = [
    {
        id: 'normal',
        label: 'Normal',
        title: 'Campus within capacity',
        body: 'A scheduled room at or under its stored capacity produces no alert. The Campus step is the operating picture.',
        example: 'Example room · 42 of 60 seats · modeled from a timetable, not a sensor.',
    },
    {
        id: 'anomaly',
        label: 'Anomaly',
        title: 'Modeled overflow',
        body: 'An alert is an open condition when modeled occupancy exceeds the room at a class change. This card is not a building on the map.',
        example: 'Example room · 67 of 60 seats · DEMO. Not a stored campus alert.',
    },
    {
        id: 'prediction',
        label: 'Prediction',
        title: 'Only a stored model',
        body: 'A congestion forecast appears only when stored crowd samples exist. This step does not invent a forecast or a confidence score.',
        example: 'Open Alerts to see whether the stored model actually scored one.',
    },
    {
        id: 'explanation',
        label: 'Explanation',
        title: 'Ask from this login',
        body: 'The copilot answers from records this session can already see. If the record is missing, it says so.',
        example: 'Ask what is driving a room, not for a campus-wide story.',
    },
    {
        id: 'simulation',
        label: 'Simulation',
        title: 'A labeled what-if',
        body: 'The simulation lab runs a scenario. The result is simulated and does not replace today’s campus state.',
        example: 'Extra rooms in a scenario are not drawn on the map and do not move today’s classes.',
    },
    {
        id: 'recommendation',
        label: 'Recommendation',
        title: 'Scored options only',
        body: 'A recommendation is chosen only among options the existing scenario lab can score. Corridor and redirect options stay unscored.',
        example: 'No impact figure is invented for an option the lab cannot run.',
    },
    {
        id: 'decision',
        label: 'Decision',
        title: 'A planning choice',
        body: 'Authorization stores a planning choice. It does not change the timetable, rooms, transport, or broadcasts.',
        example: 'Use Decisions on a real open condition. This demo does not write one.',
    },
    {
        id: 'resolution',
        label: 'Resolution',
        title: 'A measured check',
        body: 'An outcome check compares the current model with the stored expectation and states that campus systems were not changed.',
        example: 'Resolution is a comparison, not a claim that a room was rebuilt.',
    },
];

export default function DigitalTwinDemo({ onOpen }) {
    const [index, setIndex] = useState(0);
    const step = STEPS[index];

    return (
        <section className="twin-demo" aria-label="Digital twin demo">
            <header>
                <p className="campus-os-kicker">Digital twin demo</p>
                <h2>A script, not campus records</h2>
                <p>Every card on this strip is labeled demo. It does not write alerts, decisions, or crowd history, and it does not replace the campus picture.</p>
            </header>
            <ol className="twin-demo-rail">
                {STEPS.map((item, itemIndex) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            className={itemIndex === index ? 'active' : ''}
                            aria-current={itemIndex === index ? 'step' : undefined}
                            onClick={() => setIndex(itemIndex)}
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ol>
            <article>
                <p className="twin-demo-badge">Demo · simulated story · not live data</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <p className="twin-demo-example">{step.example}</p>
                <div className="twin-demo-actions">
                    <button type="button" onClick={() => setIndex((index + STEPS.length - 1) % STEPS.length)}>Previous</button>
                    <button type="button" onClick={() => setIndex((index + 1) % STEPS.length)}>Next</button>
                    {step.id === 'anomaly' || step.id === 'prediction' ? (
                        <button type="button" onClick={() => onOpen('alerts')}>Open alerts</button>
                    ) : null}
                    {step.id === 'normal' ? (
                        <button type="button" onClick={() => onOpen('campus')}>Open campus</button>
                    ) : null}
                    {step.id === 'simulation' ? <Link to="/simulations">Open simulation lab</Link> : null}
                    {step.id === 'recommendation' || step.id === 'decision' || step.id === 'resolution' ? (
                        <button type="button" onClick={() => onOpen('decisions')}>Open decisions</button>
                    ) : null}
                </div>
            </article>
        </section>
    );
}
