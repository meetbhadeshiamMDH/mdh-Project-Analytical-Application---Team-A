import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const WeeklyChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/weekly');
                // Data is already { "Monday": 10, "Tuesday": 20... }
                const formattedData = Object.entries(response.data).map(([day, count]) => ({
                    day,
                    count
                }));
                // Order is guaranteed by backend, but explicit ordering in frontend is safer
                const weekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                formattedData.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));

                setData(formattedData);
            } catch (error) {
                console.error("Error fetching weekly data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Weekly Theft Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                    <Bar dataKey="count" fill="var(--accent-success)" radius={[4, 4, 0, 0]} name="Thefts" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyChart;
