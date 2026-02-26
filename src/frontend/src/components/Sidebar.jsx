import React from 'react';

const Sidebar = ({ activeView, setActiveView }) => {
    return (
        <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="sidebar-brand" style={{ padding: '0 1rem' }}>
                <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    BIKE<span style={{ color: 'var(--text-main)' }}>GUARD</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Berlin Analytics v1.0</p>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Dashboard', 'Statistics', 'Geodata', 'Financials', 'Historical'].map((item) => (
                        <li key={item}
                            onClick={() => setActiveView(item)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: item === activeView ? 'var(--accent-primary)' : 'var(--text-muted)',
                                backgroundColor: item === activeView ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 500
                            }}
                            onMouseEnter={(e) => {
                                if (item !== activeView) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = 'var(--text-main)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (item !== activeView) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Same status bar as before */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Security Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>System Active</span>
                </div>
            </div>
        </div>
    );
};


export default Sidebar;
