import React, { useState } from 'react';

const Input = ({ label, error, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{ marginBottom: 'var(--spacing-md)', width: '100%' }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: '600',
                    color: 'var(--theme-text)',
                    marginBottom: 'var(--spacing-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </label>
            )}
            <input
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'var(--theme-bg)',
                    border: `1px solid ${error ? 'var(--color-danger)' : (isFocused ? 'var(--color-primary-navy)' : 'var(--theme-border)')}`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-body)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isFocused ? '0 0 0 4px rgba(11, 44, 107, 0.1)' : 'none'
                }}
                {...props}
            />
            {error && (
                <span style={{
                    fontSize: '12px',
                    color: 'var(--color-danger)',
                    marginTop: '4px',
                    display: 'block'
                }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
