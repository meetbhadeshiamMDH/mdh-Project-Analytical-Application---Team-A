import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KpiCard from './KpiCard';

const StatisticsDashboard = () => {
    const [options, setOptions] = useState({ bike_types: [], months: [], years: [], lors: [] });
    const [selected, setSelected] = useState({ bike_types: [], months: [], years: [], lors: [] });
    const [result, setResult] = useState({ count: 0, avg_damage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/filter-options');
                setOptions(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching options", error);
                setLoading(false);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const fetchFiltered = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/stats/filtered', selected);
                setResult(response.data);
            } catch (error) {
                console.error("Error fetching filtered stats", error);
            }
        };
        fetchFiltered();
    }, [selected]);

    const handleToggle = (category, value) => {
        setSelected(prev => {
            const current = prev[category];
            const next = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: next };
        });
    };

    const handleReset = () => {
        setSelected({ bike_types: [], months: [], years: [], lors: [] });
    };

    const FilterSection = ({ title, items, category, scrollable = false }) => (
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <span
                        onClick={() => {
                            const allSelected = selected[category].length === items.length;
                            setSelected(prev => ({ ...prev, [category]: allSelected ? [] : [...items] }));
                        }}
                        style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', cursor: 'pointer' }}
                    >
                        {selected[category].length === items.length && items.length > 0 ? 'Deselect All' : 'Select All'}
                    </span>
                    {selected[category].length > 0 && (
                        <span
                            onClick={() => setSelected(prev => ({ ...prev, [category]: [] }))}
                            style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', cursor: 'pointer' }}
                        >
                            Clear
                        </span>
                    )}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.5rem',
                maxHeight: scrollable ? '150px' : 'auto',
                overflowY: scrollable ? 'auto' : 'visible',
                paddingRight: scrollable ? '10px' : 0
            }}>
                {items.map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <input
                            type="checkbox"
                            checked={selected[category].includes(item)}
                            onChange={() => handleToggle(category, item)}
                            style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        {item}
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <main className="main-content">
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>Statistical Analysis</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Advanced filtering and case discovery</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <FilterSection title="Bicycle Types" items={options.bike_types} category="bike_types" />
                            <FilterSection title="Years" items={options.years} category="years" />
                        </div>
                        <FilterSection title="Months" items={options.months} category="months" />
                        <FilterSection title="District Area (LOR)" items={options.lors} category="lors" scrollable={true} />

                        <button
                            onClick={handleReset}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid var(--accent-danger)',
                                color: 'var(--accent-danger)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Reset All Filters
                        </button>
                    </div>


                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '2px solid var(--accent-primary)', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--text-main)' }}>{result.count}</h2>
                            <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }}>Total Cases</p>
                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.5rem 0' }}></div>
                            <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>€{Math.round(result.avg_damage).toLocaleString()}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Avg. Financial Damage</p>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
                            Data updates automatically as you adjust filters
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatisticsDashboard;
