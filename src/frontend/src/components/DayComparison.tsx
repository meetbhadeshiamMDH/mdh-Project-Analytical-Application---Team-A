import { useEffect, useState } from 'react';
import {
    fetchDailyStats,
    fetchWeeklyComparison,
    fetchBikeCategories,
    DailyStats,
    WeeklyComparisonDay
} from '../lib/api';
import LORMap from './LORMap';
import { Map as MapIcon, Filter } from 'lucide-react';

interface Props {
    selectedDate: string; // YYYY-MM-DD
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string, short = false): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: short ? 'short' : 'long',
        year: short ? undefined : 'numeric',
        month: short ? 'short' : 'long',
        day: 'numeric',
    });
}

function StatCard({
    title,
    date,
    stats,
    loading,
    accentColor,
}: {
    title: string;
    date: string;
    stats: DailyStats | null;
    loading: boolean;
    accentColor: string;
}) {
    return (
        <div
            className="flex-1 rounded-2xl p-6 border transition-all duration-300"
            style={{
                background: 'rgba(15,23,42,0.7)',
                borderColor: `${accentColor}44`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 1px ${accentColor}`,
            }}
        >
            <div className="mb-4 flex items-center gap-3">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: accentColor }}
                />
                <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
            </div>

            <p className="text-sm mb-5 font-medium opacity-80" style={{ color: accentColor }}>
                {formatDate(date)}
            </p>

            {loading ? (
                <div className="flex gap-4 flex-col">
                    <div className="h-20 rounded-xl bg-slate-800/40 animate-pulse" />
                    <div className="h-20 rounded-xl bg-slate-800/40 animate-pulse" />
                </div>
            ) : stats && stats.has_data ? (
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1 font-bold">Total Cases</p>
                        <p className="text-4xl font-bold text-white tracking-tighter">{stats.case_count.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/30">
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1 font-bold">Theft Value</p>
                        <p className="text-4xl font-bold tracking-tighter" style={{ color: accentColor }}>
                            €{stats.total_damage.toLocaleString('en-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-slate-800/40 border border-dashed border-slate-700">
                    <span className="text-3xl mb-2 grayscale opacity-50">📭</span>
                    <p className="text-slate-500 text-sm font-medium">No data available</p>
                </div>
            )}
        </div>
    );
}

export function DayComparison({ selectedDate }: Props) {
    const yesterday = addDays(selectedDate, -1);
    const prevWeekSameDay = addDays(selectedDate, -8);

    const [stats1, setStats1] = useState<DailyStats | null>(null);
    const [stats2, setStats2] = useState<DailyStats | null>(null);
    const [weeklyData, setWeeklyData] = useState<WeeklyComparisonDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapLevel, setMapLevel] = useState<'plr' | 'bzr'>('bzr');
    const [bikeCategories, setBikeCategories] = useState<string[]>([]);
    const [selectedBikeType, setSelectedBikeType] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetchBikeCategories()
            .then(setBikeCategories)
            .catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchDailyStats(yesterday, selectedBikeType),
            fetchDailyStats(prevWeekSameDay, selectedBikeType),
            fetchWeeklyComparison(selectedDate, selectedBikeType)
        ])
            .then(([s1, s2, w]) => {
                setStats1(s1);
                setStats2(s2);
                setWeeklyData(w);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedDate, yesterday, prevWeekSameDay, selectedBikeType]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Last 7 Day Comparison</h2>
                    <div className="flex items-center gap-2 text-slate-400">
                        <p className="text-sm">
                            Comparing <span className="text-blue-400 font-semibold">{formatDate(yesterday)}</span> vs the same weekday one week prior
                        </p>
                        <div className="h-1 w-1 rounded-full bg-slate-600" />
                        <p className="text-xs uppercase tracking-widest font-bold">Reference: {selectedDate}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[240px]">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Filter className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-black">Filter by Bike Category</span>
                    </div>
                    <select
                        value={selectedBikeType || ''}
                        onChange={(e) => setSelectedBikeType(e.target.value || undefined)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-sm font-bold rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:border-slate-600 appearance-none shadow-lg"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 1rem center',
                            backgroundSize: '1em'
                        }}
                    >
                        <option value="">All Categories</option>
                        {bikeCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-8 mb-12">
                <StatCard
                    title="Yesterday"
                    date={yesterday}
                    stats={stats1}
                    loading={loading}
                    accentColor="#3b82f6"
                />
                <StatCard
                    title="Same Day — Previous Week"
                    date={prevWeekSameDay}
                    stats={stats2}
                    loading={loading}
                    accentColor="#10b981"
                />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Detailed Comparison (Last 14 Days)</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Current (W1)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Previous (W2)</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-800/50">
                                <th className="px-6 py-4">Weekday</th>
                                <th className="px-6 py-4 text-center text-blue-400 bg-blue-400/5 items-center">Cases (W1)</th>
                                <th className="px-6 py-4 text-center text-emerald-400 bg-emerald-400/5">Cases (W2)</th>
                                <th className="px-6 py-4 text-right text-blue-400 bg-blue-400/5">Damage (W1)</th>
                                <th className="px-6 py-4 text-right text-emerald-400 bg-emerald-400/5">Damage (W2)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                Array(7).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                                        <td className="px-6 py-4 bg-blue-400/5"><div className="h-4 w-12 bg-slate-800 rounded mx-auto" /></td>
                                        <td className="px-6 py-4 bg-emerald-400/5"><div className="h-4 w-12 bg-slate-800 rounded mx-auto" /></td>
                                        <td className="px-6 py-4 bg-blue-400/5 text-right"><div className="h-4 w-20 bg-slate-800 rounded ml-auto" /></td>
                                        <td className="px-6 py-4 bg-emerald-400/5 text-right"><div className="h-4 w-20 bg-slate-800 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : weeklyData.length > 0 ? (
                                weeklyData.map((day, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-white font-bold">{day.weekday}</p>
                                            <p className="text-[10px] text-slate-500">{formatDate(day.w1.date, true)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-lg text-white bg-blue-400/5 group-hover:bg-blue-400/10 transition-colors">
                                            {day.w1.cases}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-lg text-white bg-emerald-400/5 group-hover:bg-emerald-400/10 transition-colors">
                                            {day.w2.cases}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-blue-400 bg-blue-400/5 group-hover:bg-blue-400/10 transition-colors">
                                            €{day.w1.damage.toLocaleString('en-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-emerald-400 bg-emerald-400/5 group-hover:bg-emerald-400/10 transition-colors">
                                            €{day.w2.damage.toLocaleString('en-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        No comparison data available for this range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Area Visualization Section */}
                <div className="mt-12 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <MapIcon className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white tracking-tight">Affected Areas Map</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <LORMap
                            title="Yesterday's Areas"
                            date={yesterday}
                            level={mapLevel}
                            metrics={stats1?.lor_stats?.[mapLevel] || []}
                            onLevelChange={setMapLevel}
                        />
                        <LORMap
                            title="Previous Week (Same Weekday)"
                            date={prevWeekSameDay}
                            level={mapLevel}
                            metrics={stats2?.lor_stats?.[mapLevel] || []}
                            onLevelChange={setMapLevel}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
