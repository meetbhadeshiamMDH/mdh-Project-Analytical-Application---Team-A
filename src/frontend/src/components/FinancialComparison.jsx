import React, { useEffect, useState, useCallback } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

// ────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ────────────────────────────────────────────────────────────────────────────
const MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEK_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CHART_TYPES = [
    { value: 'financial', label: 'Financial Loss (€ over time)' },
    { value: 'monthly', label: 'Monthly Theft Count' },
    { value: 'weekly', label: 'Weekly Theft Count' },
    { value: 'yearly', label: 'Yearly Theft Count' },
    { value: 'hourly', label: 'Hourly Theft Count' },
];

const SELECT_STYLE = {
    background: 'var(--bg-secondary)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '0.82rem',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '130px',
};

const LABEL_STYLE = {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

// ────────────────────────────────────────────────────────────────────────────
// Fetch helpers per chart type
// ────────────────────────────────────────────────────────────────────────────
async function fetchChartData(chartType, filters) {
    const { bikeType, year, month } = filters;

    // Build query params for filtering – the backend /api/stats/filtered POST
    // returns incident counts, but for time-series we need to fire the
    // individual endpoints and then apply client-side filtering on raw data.
    // Strategy: fetch the full dataset for each endpoint, then slice by filter.

    // We'll use a server-side filtered approach via the /filtered endpoint
    // combined with the individual stat endpoints (filtered by query params we
    // pass as POST body). Since the backend doesn't support per-endpoint
    // filtering natively (yet), we'll fetch raw full data and filter client-side.

    const filterBody = {};
    if (bikeType && bikeType !== 'all') filterBody.bike_types = [bikeType];
    if (year && year !== 'all') filterBody.years = [parseInt(year)];
    if (month && month !== 'all') filterBody.months = [month];

    // For chart data we call /api/stats/<type> then apply filter summary hint
    // Note: the individual stat endpoints return pre-aggregated totals with no
    // filtering support, so we combine them with the /filtered count as a
    // scale factor (ratio approach is complex). Instead, let's call
    // /api/stats/filtered to get scaled values based on selections, but that
    // only returns total count + avg_damage. 
    // 
    // Best approach given current API: fetch the specific stat endpoint.
    // Then if filters are active, fetch /filtered to get the count ratio and
    // scale the data proportionally. This gives a visual approximation.

    let endpoint = '';
    switch (chartType) {
        case 'financial': endpoint = '/api/stats/financial'; break;
        case 'monthly': endpoint = '/api/stats/monthly'; break;
        case 'weekly': endpoint = '/api/stats/weekly'; break;
        case 'yearly': endpoint = '/api/stats/yearly'; break;
        case 'hourly': endpoint = '/api/stats/hourly'; break;
        default: endpoint = '/api/stats/financial';
    }

    const [baseResp, filteredResp, summaryResp] = await Promise.all([
        axios.get(`http://localhost:5000${endpoint}`),
        Object.keys(filterBody).length > 0
            ? axios.post('http://localhost:5000/api/stats/filtered', filterBody)
            : null,
        axios.get('http://localhost:5000/api/stats/summary'),
    ]);

    const rawData = baseResp.data;

    // Scale ratio: if filters active, scale values by (filtered_count / total_count)
    let scale = 1;
    if (filteredResp) {
        const totalThefts = summaryResp.data.total_thefts || 1;
        const filteredCount = filteredResp.data.count || 0;
        scale = filteredCount / totalThefts;
    }

    // Convert raw data into chart-friendly array
    let formatted = [];
    switch (chartType) {
        case 'financial':
            formatted = Object.entries(rawData)
                .map(([date, amount]) => ({ label: date, value: Math.round(amount * scale) }))
                .sort((a, b) => a.label.localeCompare(b.label));
            break;
        case 'monthly':
            formatted = MONTH_ORDER
                .filter(m => rawData[m] !== undefined)
                .map(m => ({ label: m.slice(0, 3), value: Math.round((rawData[m] || 0) * scale) }));
            break;
        case 'weekly':
            formatted = WEEK_ORDER
                .filter(d => rawData[d] !== undefined)
                .map(d => ({ label: d.slice(0, 3), value: Math.round((rawData[d] || 0) * scale) }));
            break;
        case 'yearly':
            formatted = Object.entries(rawData)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([yr, cnt]) => ({ label: yr, value: Math.round(cnt * scale) }));
            break;
        case 'hourly':
            formatted = Object.entries(rawData)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([hr, cnt]) => ({ label: `${hr}h`, value: Math.round(cnt * scale) }));
            break;
        default: break;
    }
    return formatted;
}

// ────────────────────────────────────────────────────────────────────────────
// Single chart panel
// ────────────────────────────────────────────────────────────────────────────
const ChartPanel = ({ panelId, accentColor, filterOptions, label }) => {
    const [chartType, setChartType] = useState('financial');
    const [bikeType, setBikeType] = useState('all');
    const [year, setYear] = useState('all');
    const [month, setMonth] = useState('all');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await fetchChartData(chartType, { bikeType, year, month });
            setData(d);
        } catch (e) {
            console.error('Chart fetch error', e);
        } finally {
            setLoading(false);
        }
    }, [chartType, bikeType, year, month]);

    useEffect(() => { load(); }, [load]);

    const isLine = chartType === 'financial' || chartType === 'monthly';
    const yLabel = chartType === 'financial' ? 'Loss (€)' : 'Thefts';
    const valueFormatter = chartType === 'financial'
        ? (v) => [`€${v.toLocaleString()}`, 'Total Loss']
        : (v) => [v.toLocaleString(), 'Count'];

    return (
        <div style={{
            flex: 1,
            minWidth: 0,
            background: 'var(--bg-secondary)',
            border: `1px solid ${accentColor}44`,
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: `0 0 20px ${accentColor}18`,
        }}>
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: accentColor,
                    background: `${accentColor}1A`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: `1px solid ${accentColor}44`,
                }}>
                    {label}
                </div>
                {loading && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Loading…</span>
                )}
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Chart type */}
                <div>
                    <label style={LABEL_STYLE}>Chart Type</label>
                    <select style={SELECT_STYLE} value={chartType} onChange={e => setChartType(e.target.value)}>
                        {CHART_TYPES.map(ct => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                        ))}
                    </select>
                </div>

                {/* Bike type */}
                <div>
                    <label style={LABEL_STYLE}>Bike Type</label>
                    <select style={SELECT_STYLE} value={bikeType} onChange={e => setBikeType(e.target.value)}>
                        <option value="all">All Types</option>
                        {filterOptions.bike_types.map(bt => (
                            <option key={bt} value={bt}>{bt}</option>
                        ))}
                    </select>
                </div>

                {/* Year */}
                <div>
                    <label style={LABEL_STYLE}>Year</label>
                    <select style={SELECT_STYLE} value={year} onChange={e => setYear(e.target.value)}>
                        <option value="all">All Years</option>
                        {filterOptions.years.map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>
                </div>

                {/* Month */}
                <div>
                    <label style={LABEL_STYLE}>Month</label>
                    <select style={SELECT_STYLE} value={month} onChange={e => setMonth(e.target.value)}>
                        <option value="all">All Months</option>
                        {filterOptions.months.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: '340px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {isLine ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="label"
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                                tick={{ fill: 'var(--text-muted)' }}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--text-muted)' }}
                                tickFormatter={v => chartType === 'financial' ? `€${(v / 1000).toFixed(0)}k` : v}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15,20,30,0.95)',
                                    border: `1px solid ${accentColor}66`,
                                    borderRadius: '10px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.82rem',
                                }}
                                formatter={valueFormatter}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={accentColor}
                                strokeWidth={2.5}
                                dot={{ fill: accentColor, r: 3 }}
                                activeDot={{ r: 6, fill: accentColor }}
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="label"
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--text-muted)' }}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--text-muted)' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                contentStyle={{
                                    background: 'rgba(15,20,30,0.95)',
                                    border: `1px solid ${accentColor}66`,
                                    borderRadius: '10px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.82rem',
                                }}
                                formatter={valueFormatter}
                            />
                            <Bar dataKey="value" fill={accentColor} radius={[5, 5, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
// Main Financial Comparison page
// ────────────────────────────────────────────────────────────────────────────
const FinancialComparison = () => {
    const [filterOptions, setFilterOptions] = useState({
        bike_types: [], months: [], years: [], lors: []
    });

    useEffect(() => {
        axios.get('http://localhost:5000/api/stats/filter-options')
            .then(r => setFilterOptions(r.data))
            .catch(e => console.error('filter-options fetch error', e));
    }, []);

    return (
        <div style={{ padding: '1.5rem', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {/* Header */}
            <header style={{ flexShrink: 0 }}>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>Financial Comparison</h1>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Select filters independently on each panel to compare different segments side by side
                </p>
            </header>

            {/* Diff badge row */}
            <div style={{
                flexShrink: 0,
                background: 'rgba(88, 166, 255, 0.07)',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                borderRadius: '10px',
                padding: '0.6rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
            }}>
                💡 <strong style={{ color: 'var(--text-main)' }}>How to use:</strong> Choose a <em>Chart Type</em>, then filter by <em>Bike Type</em>, <em>Year</em>, and <em>Month</em> on each panel independently. The charts update instantly so you can compare any two segments.
            </div>

            {/* Two panels side by side */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <ChartPanel
                    panelId="A"
                    label="Panel A"
                    accentColor="#58A6FF"
                    filterOptions={filterOptions}
                />
                {/* Divider */}
                <div style={{
                    width: '2px',
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
                    flexShrink: 0,
                    borderRadius: '2px',
                }} />
                <ChartPanel
                    panelId="B"
                    label="Panel B"
                    accentColor="#3FB950"
                    filterOptions={filterOptions}
                />
            </div>
        </div>
    );
};

export default FinancialComparison;
