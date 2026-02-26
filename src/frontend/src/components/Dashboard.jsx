import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HourlyChart from './Charts/HourlyChart';
import WeeklyChart from './Charts/WeeklyChart';
import MonthlyChart from './Charts/MonthlyChart';
import YearlyChart from './Charts/YearlyChart';
import FinancialChart from './Charts/FinancialChart';
import LorChart from './Charts/LorChart';
import Sidebar from './Sidebar';
import KpiCard from './KpiCard';

const Dashboard = () => {
    const [summary, setSummary] = useState({
        total_thefts: 0,
        avg_damage: 0.0,
        most_common_hour: 'N/A',
        top_district: 'N/A'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/stats/summary');
                setSummary(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching summary stats", error);
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <main className="main-content">

                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                            Security Intelligence Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                            Analyzing Berlin Bike Theft Data and Trends
                        </p>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        Last Update: {new Date().toLocaleTimeString()}
                    </div>
                </header>

                <section className="kpi-grid">
                    <KpiCard
                        title="Total Theft Reports"
                        value={summary.total_thefts.toLocaleString()}
                        accentColor="var(--accent-primary)"
                    />
                    <KpiCard
                        title="Average Loss"
                        value={`€${Math.round(summary.avg_damage).toLocaleString()}`}
                        subtitle="Per Incident"
                        accentColor="var(--accent-warning)"
                    />
                    <KpiCard
                        title="Peak Activity"
                        value={`${summary.most_common_hour}:00`}
                        subtitle="Hours"
                        accentColor="var(--accent-secondary)"
                    />
                    <KpiCard
                        title="High-Risk Sector"
                        value={summary.top_district}
                        subtitle="LOR District"
                        accentColor="var(--accent-danger)"
                    />
                </section>

                <div className="chart-grid">
                    <div className="chart-container">
                        <HourlyChart />
                    </div>
                    <div className="chart-container">
                        <WeeklyChart />
                    </div>
                    <div className="chart-container">
                        <MonthlyChart />
                    </div>
                    <div className="chart-container">
                        <YearlyChart />
                    </div>
                    <div className="chart-container" style={{ gridColumn: 'span 2' }}>
                        <LorChart />
                    </div>
                    <div className="chart-container" style={{ gridColumn: 'span 2' }}>
                        <FinancialChart />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;

