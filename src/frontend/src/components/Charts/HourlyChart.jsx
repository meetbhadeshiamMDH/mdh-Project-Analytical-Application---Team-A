import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';


const HourlyChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/hourly');
                // Convert object { "0": 10, "1": 20 } to array [{ hour: "0", count: 10 }, ...]
                const formattedData = Object.entries(response.data).map(([hour, count]) => ({
                    hour: parseInt(hour),
                    count: count
                })).sort((a, b) => a.hour - b.hour);
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching hourly data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Hourly Theft Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                    <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} name="Thefts" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HourlyChart;
