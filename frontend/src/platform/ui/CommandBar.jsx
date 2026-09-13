import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuSearch } from 'react-icons/lu';
import { useAuth } from '../../hooks/AuthContext';
import { searchCatalog } from '../navCatalog';

export default function CommandBar({ open, onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const listId = useId();
    const [query, setQuery] = useState('');
    const [index, setIndex] = useState(0);
    const results = useMemo(() => searchCatalog(user?.role, query), [user?.role, query]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return undefined;
        setQuery('');
        setIndex(0);
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [open]);

    useEffect(() => {
        setIndex(0);
    }, [query]);

    const go = (item) => {
        if (!item?.path) return;
        navigate(item.path);
        onClose();
    };

    const onKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIndex((current) => (results.length ? (current + 1) % results.length : 0));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setIndex((current) => (results.length ? (current - 1 + results.length) % results.length : 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            go(results[index]);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="command-scrim"
                    role="presentation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    onMouseDown={onClose}
                >
                    <motion.div
                        className="command-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search the campus"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.16 }}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="command-input-row">
                            <LuSearch aria-hidden="true" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Jump to a page"
                                aria-controls={listId}
                                aria-activedescendant={results[index] ? `${listId}-${index}` : undefined}
                            />
                            <kbd>Esc</kbd>
                        </div>
                        <ul id={listId} className="command-results" role="listbox">
                            {results.length === 0 && <li className="command-empty">No matching page</li>}
                            {results.map((item, itemIndex) => {
                                const Icon = item.icon;
                                return (
                                    <li key={`${item.path}-${item.label}`} id={`${listId}-${itemIndex}`} role="option" aria-selected={itemIndex === index}>
                                        <button
                                            type="button"
                                            className={itemIndex === index ? 'active' : ''}
                                            onMouseEnter={() => setIndex(itemIndex)}
                                            onClick={() => go(item)}
                                        >
                                            {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                                            <span>{item.label}</span>
                                            <em>{item.section}</em>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
