import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSearch, LuX, LuArrowRight } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = ({ navItems = [], placeholder = "Search functionalities..." }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.trim().length > 0) {
            const filtered = navItems.filter(item =>
                item.label.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setIsOpen(true);
            setSelectedIndex(0);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query, navItems]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results.length > 0) {
            handleNavigate(results[selectedIndex].path);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="global-search-container" ref={searchRef} style={{ position: 'relative', width: '100%' }}>
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
                <LuSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-icon-color)', opacity: 0.6 }} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '10px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--theme-border)',
                        background: 'var(--card-bg)',
                        color: 'var(--theme-text)',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                />
                {query && (
                    <LuX
                        onClick={() => setQuery('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--ims-icon-color)', opacity: 0.6 }}
                    />
                )}
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '8px',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            border: '1px solid var(--theme-border)',
                            zIndex: 1000,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            padding: '8px'
                        }}
                    >
                        <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', padding: '4px 12px 8px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                            Navigation Results
                        </div>
                        {results.map((result, index) => (
                            <div
                                key={result.path}
                                onClick={() => handleNavigate(result.path)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: index === selectedIndex ? 'rgba(11, 44, 107, 0.1)' : 'transparent',
                                    color: index === selectedIndex ? 'var(--color-primary-navy)' : 'var(--theme-text)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{result.icon}</span>
                                <span style={{ flex: 1, fontSize: '14px', fontWeight: index === selectedIndex ? '600' : '500' }}>{result.label}</span>
                                {index === selectedIndex && <LuArrowRight size={14} />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .global-search-container input::placeholder {
                    color: var(--ims-icon-color);
                    opacity: 0.5;
                }
                @media (max-width: 768px) {
                    .global-search-container input {
                        font-size: 13px !important;
                        padding: 8px 32px !important;
                    }
                    .global-search-container div[style*="maxHeight: '300px'"] {
                        max-height: 250px !important;
                        width: calc(100vw - 40px) !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        position: fixed !important;
                        top: 60px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default GlobalSearch;
