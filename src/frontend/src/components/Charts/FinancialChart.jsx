import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const FinancialChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/financial');
                // Data format: { "2023-01": 1000, "2023-02": 2000 }
                const formattedData = Object.entries(response.data).map(([date, amount]) => ({
                    date,
                    amount
                })).sort((a, b) => a.date.localeCompare(b.date));
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching financial data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Financial Impact Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                        formatter={(value) => `€${value.toLocaleString()}`}
                    />
                    <Line type="monotone" dataKey="amount" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} activeDot={{ r: 6 }} name="Total Loss (€)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FinancialChart;
