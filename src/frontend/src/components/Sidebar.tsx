interface Props {
    selectedDate: string;
    onDateChange: (date: string) => void;
    currentView: 'dashboard' | 'comparison';
    onViewChange: (view: 'dashboard' | 'comparison') => void;
}

export function Sidebar({ selectedDate, onDateChange, currentView, onViewChange }: Props) {
    const navItems: { id: 'dashboard' | 'comparison'; label: string; icon: string }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'comparison', label: 'Last 7 Day Comparison', icon: '📊' },
    ];

    return (
        <aside
            className="flex flex-col h-screen sticky top-0 border-r border-slate-700/60"
            style={{
                width: '220px',
                minWidth: '220px',
                background: 'rgba(10,15,30,0.85)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Brand */}
            <div className="px-5 py-6 border-b border-slate-700/60">
                <p className="text-xl font-bold text-white leading-tight">🚴 Berlin</p>
                <p className="text-xs text-slate-400 mt-0.5">Bike Theft Analysis</p>
            </div>

            {/* Date selector */}
            <div className="px-5 py-5 border-b border-slate-700/60">
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">
                    Reference Date
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ background: 'rgba(30,41,59,0.8)' }}
                />
                <p className="text-xs text-slate-500 mt-1.5">
                    Used for day comparison
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest px-2 mb-2">Views</p>
                <ul className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onViewChange(item.id)}
                                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: currentView === item.id
                                        ? 'rgba(59,130,246,0.18)'
                                        : 'transparent',
                                    color: currentView === item.id ? '#60a5fa' : '#94a3b8',
                                    borderLeft: currentView === item.id
                                        ? '3px solid #3b82f6'
                                        : '3px solid transparent',
                                }}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-700/60">
                <p className="text-xs text-slate-600">Data: 2023–2025</p>
            </div>
        </aside>
    );
}
