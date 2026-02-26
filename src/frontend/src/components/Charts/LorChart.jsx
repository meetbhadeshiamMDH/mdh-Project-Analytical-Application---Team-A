import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const LorChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/lor');
                // Format and sort to show top 10
                const formattedData = Object.entries(response.data)
                    .map(([lor, count]) => ({
                        lor: lor,
                        thefts: count
                    }))
                    .sort((a, b) => b.thefts - a.thefts)
                    .slice(0, 10);
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching LOR data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{
            width: '100%',
            height: 380,
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
            {/* Decorative accent line */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(to bottom, var(--accent-danger), transparent)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    Critical Hotspots
                    <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--accent-danger)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>Top 10 Sector Analysis</span>
                </h3>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, bottom: 20 }}>
                    <defs>
                        <linearGradient id="lorGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--accent-danger)" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="var(--accent-danger)" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} hide />
                    <YAxis
                        dataKey="lor"
                        type="category"
                        stroke="var(--text-main)"
                        fontSize={11}
                        width={80}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(26, 32, 44, 0.95)',
                            backdropFilter: 'blur(8px)',
                            borderColor: 'var(--accent-danger)',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                        labelStyle={{ color: 'var(--accent-danger)', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar
                        dataKey="thefts"
                        fill="url(#lorGradient)"
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                <span>Geospatial Risk Distribution</span>
                <span style={{ color: 'var(--accent-danger)' }}>Total: {data.reduce((acc, curr) => acc + curr.thefts, 0).toLocaleString()} Incidents</span>
            </div>
        </div>
    );

};

export default LorChart;
