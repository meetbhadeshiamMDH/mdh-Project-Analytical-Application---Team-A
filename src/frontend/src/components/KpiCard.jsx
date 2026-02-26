import React from 'react';

const KpiCard = ({ title, value, subtitle, accentColor }) => {
    return (
        <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: `radial-gradient(circle at top right, ${accentColor}22, transparent)`,
                zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {value}
                    </span>
                    {subtitle && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {subtitle}
                        </span>
                    )}
                </div>
                <div style={{
                    height: '2px',
                    width: '40px',
                    background: accentColor || 'var(--accent-primary)',
                    marginTop: '15px'
                }}></div>
            </div>
        </div>
    );
};

export default KpiCard;
