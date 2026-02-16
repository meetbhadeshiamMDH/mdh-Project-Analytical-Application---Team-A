import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatsCard } from './components/StatsCard';
import { getDashboardData, type DashboardData } from './lib/api';

function App() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const dashboardData = await getDashboardData();
                setData(dashboardData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto"></div>
                    <p className="text-lg text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
                    <p className="text-lg font-semibold text-red-400">Error loading dashboard</p>
                    <p className="mt-2 text-sm text-slate-400">{error || 'Unknown error'}</p>
                </div>
            </div>
        );
    }

    const { summary, timeSeries, bicycleTypes, hourlyDistribution, financialDamage } = data;

    // Format time series data for Recharts
    const timeSeriesChartData = timeSeries.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: item.count,
    }));

    // Format hourly data
    const hourlyChartData = hourlyDistribution.map(item => ({
        hour: `${item.hour}:00`,
        count: item.count,
    }));

    // Take top 10 bicycle types
    const topBicycleTypes = bicycleTypes.slice(0, 10);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🚴 Berlin Bike Theft Analysis
                    </h1>
                    <p className="text-slate-400">
                        Interactive dashboard analyzing bike theft patterns in Berlin
                    </p>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatsCard
                        title="Total Thefts"
                        value={summary.total_thefts.toLocaleString()}
                        subtitle={`${summary.successful_thefts.toLocaleString()} successful`}
                    />
                    <StatsCard
                        title="Avg. Financial Damage"
                        value={`€${summary.avg_damage.toLocaleString()}`}
                        subtitle="Per incident"
                    />
                    <StatsCard
                        title="Attempt Rate"
                        value={`${summary.attempt_rate.toFixed(1)}%`}
                        subtitle="Unsuccessful thefts"
                    />
                    <StatsCard
                        title="Data Period"
                        value={summary.max_date ? new Date(summary.max_date).getFullYear() : 'N/A'}
                        subtitle={summary.min_date && summary.max_date
                            ? `${new Date(summary.min_date).toLocaleDateString()} - ${new Date(summary.max_date).toLocaleDateString()}`
                            : 'No data'}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Time Series Chart */}
                    <div className="chart-container">
                        <h2 className="mb-4 text-xl font-semibold text-white">Thefts Over Time</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timeSeriesChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Thefts" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bicycle Types Chart */}
                    <div className="chart-container">
                        <h2 className="mb-4 text-xl font-semibold text-white">Top Bicycle Types</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topBicycleTypes}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="type" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                                <Bar dataKey="count" fill="#3b82f6" name="Thefts" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Hourly Distribution Chart */}
                    <div className="chart-container">
                        <h2 className="mb-4 text-xl font-semibold text-white">Hourly Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={hourlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="hour" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                                <Bar dataKey="count" fill="#10b981" name="Thefts" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Financial Damage Chart */}
                    <div className="chart-container">
                        <h2 className="mb-4 text-xl font-semibold text-white">Financial Damage Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={financialDamage}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="range" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                                <Bar dataKey="count" fill="#f59e0b" name="Incidents" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-8 text-center text-sm text-slate-500">
                    <p>Data source: Berlin Police Department • Dashboard built with React + Recharts + Tailwind CSS</p>
                </footer>
            </div>
        </div>
    );
}

export default App;
