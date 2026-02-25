import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatsCard } from './components/StatsCard';
import { Sidebar } from './components/Sidebar';
import { DayComparison } from './components/DayComparison';
import { getDashboardData, type DashboardData } from './lib/api';

function App() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set([2023, 2024, 2025]));

    // Sidebar state
    const [selectedDate, setSelectedDate] = useState<string>('2026-01-01');
    const [currentView, setCurrentView] = useState<'dashboard' | 'comparison'>('dashboard');

    const YEAR_COLORS: Record<number, string> = { 2023: '#c026d3', 2024: '#10b981', 2025: '#f59e0b' };

    const toggleYear = (yr: number) => {
        setSelectedYears(prev => {
            const next = new Set(prev);
            if (next.has(yr)) {
                if (next.size > 1) next.delete(yr);
            } else {
                next.add(yr);
            }
            return next;
        });
    };

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

    // Full-screen loading / error states (before sidebar renders)
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
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

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const YEARS = [2023, 2024, 2025];
    const timeSeriesChartData = MONTHS.map((month, mi) => {
        const row: Record<string, string | number> = { month };
        YEARS.forEach(yr => {
            const match = timeSeries.find(item => {
                const d = new Date(item.date);
                return d.getFullYear() === yr && d.getMonth() === mi;
            });
            row[yr] = match ? match.count : 0;
        });
        return row;
    });

    const hourlyChartData = hourlyDistribution.map(item => ({
        hour: `${item.hour}:00`,
        count: item.count,
    }));

    const topBicycleTypes = bicycleTypes.slice(0, 10);

    return (
        <div
            className="flex min-h-screen"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
        >
            {/* Persistent Sidebar */}
            <Sidebar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                currentView={currentView}
                onViewChange={setCurrentView}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {currentView === 'comparison' ? (
                    <DayComparison selectedDate={selectedDate} />
                ) : (
                    <div className="p-8">
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
                                value="2023-2025"
                                subtitle={summary.min_date && summary.max_date
                                    ? `${new Date(summary.min_date).toLocaleDateString()} - ${new Date(summary.max_date).toLocaleDateString()}`
                                    : 'No data'}
                            />
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Time Series Chart */}
                            <div className="chart-container">
                                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                                    <h2 className="text-xl font-semibold text-white">Thefts between 2023 - 2025</h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedYears(new Set([2023, 2024, 2025]))}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${selectedYears.size === 3
                                                ? 'bg-slate-500 border-slate-400 text-white'
                                                : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-400'
                                                }`}
                                        >All</button>
                                        {([2023, 2024, 2025] as number[]).map(yr => (
                                            <button
                                                key={yr}
                                                onClick={() => toggleYear(yr)}
                                                className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                                                style={{
                                                    backgroundColor: selectedYears.has(yr) ? YEAR_COLORS[yr] + '33' : 'transparent',
                                                    borderColor: selectedYears.has(yr) ? YEAR_COLORS[yr] : '#4b5563',
                                                    color: selectedYears.has(yr) ? YEAR_COLORS[yr] : '#6b7280',
                                                }}
                                            >{yr}</button>
                                        ))}
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={timeSeriesChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="month" stroke="#9ca3af" interval={0} />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                        />
                                        {([2023, 2024, 2025] as number[]).filter(yr => selectedYears.has(yr)).map(yr => (
                                            <Line key={yr} type="linear" dataKey={String(yr)} stroke={YEAR_COLORS[yr]} strokeWidth={2} name={String(yr)} dot={false} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container">
                                <h2 className="mb-4 text-xl font-semibold text-white">Bike Categories</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topBicycleTypes}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="type" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" name="Count" />
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
                                        <XAxis
                                            dataKey="range"
                                            stroke="#9ca3af"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Bar dataKey="count" fill="#f59e0b" name="Financial Damage" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="mt-8 text-center text-sm text-slate-500">
                            <p>Data source: Berlin Police Department • Dashboard built with React + Recharts + Tailwind CSS</p>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
