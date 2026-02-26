import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const YearlyChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/yearly');
                const formattedData = Object.entries(response.data).map(([year, count]) => ({
                    year,
                    count
                })).sort((a, b) => a.year.localeCompare(b.year));
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching yearly data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Yearly Theft Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <defs>
                        <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="year"
                        stroke="var(--text-muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(26, 32, 44, 0.9)',
                            backdropFilter: 'blur(8px)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#yearlyGradient)"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                        name="Thefts"
                    />
                </BarChart>

            </ResponsiveContainer>
        </div>
    );
};

export default YearlyChart;
