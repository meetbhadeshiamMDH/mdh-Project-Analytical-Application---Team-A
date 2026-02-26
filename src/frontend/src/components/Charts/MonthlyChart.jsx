import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const MonthlyChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/monthly');
                const formattedData = Object.entries(response.data).map(([month, count]) => ({
                    month,
                    count
                }));
                const monthOrder = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                formattedData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

                setData(formattedData);
            } catch (error) {
                console.error("Error fetching monthly data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Monthly Theft Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="var(--accent-warning)" strokeWidth={3} dot={{ fill: 'var(--accent-warning)', r: 4 }} activeDot={{ r: 6 }} name="Thefts" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyChart;
