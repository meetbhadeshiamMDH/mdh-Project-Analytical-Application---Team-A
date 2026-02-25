import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { fetchLORGeoJSON, fetchBZRGeoJSON, LORMetric } from '../lib/api';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LORMapProps {
    metrics: LORMetric[];
    level: 'plr' | 'bzr';
    title: string;
    date: string;
    onLevelChange: (level: 'plr' | 'bzr') => void;
}

const LORMap: React.FC<LORMapProps> = ({ metrics, level, title, date, onLevelChange }) => {
    const [geojsonData, setGeojsonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMapData = async () => {
            setLoading(true);
            setGeojsonData(null); // Clear old data to prevent showing wrong boundaries
            try {
                const data = level === 'plr' ? await fetchLORGeoJSON() : await fetchBZRGeoJSON();
                setGeojsonData(data);
            } catch (err) {
                console.error(`Failed to load ${level} GeoJSON:`, err);
            } finally {
                setLoading(false);
            }
        };
        loadMapData();
    }, [level]);

    const findMetric = (id: string) => metrics.find(m => m.id === id);

    const onEachFeature = (feature: any, layer: any) => {
        const id = level === 'plr' ? feature.properties.plr_id : feature.properties.bzr_id;
        const name = level === 'plr' ? feature.properties.plr_name : feature.properties.bzr_name;
        const metric = findMetric(id);

        layer.on({
            mouseover: (e: any) => {
                const l = e.target;
                const m = findMetric(id);
                l.setStyle({
                    weight: 3,
                    color: '#3b82f6',
                    fillOpacity: m && m.cases > 0 ? 0.9 : 0.4
                });
                l.bringToFront();
            },
            mouseout: (e: any) => {
                const l = e.target;
                l.setStyle(mapStyle(feature));
            }
        });

        layer.bindPopup(`
            <div style="font-family: 'Outfit', sans-serif; color: #1e293b; background: white; padding: 4px; border-radius: 4px;">
                <strong style="font-size: 1.1em; color: #2563eb;">${name}</strong><br/>
                <span style="color: #64748b; font-size: 0.8em;">ID: ${id}</span>
                <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                    <div style="display: flex; justify-content: space-between; gap: 20px;">
                        <span style="color: #475569;">Total Case Count:</span>
                        <strong style="color: #000;">${metric ? metric.cases : 0}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 20px; margin-top: 4px;">
                        <span style="color: #475569;">Theft Damage:</span>
                        <strong style="color: #059669;">€${metric ? metric.damage.toLocaleString('en-DE', { minimumFractionDigits: 2 }) : '0.00'}</strong>
                    </div>
                </div>
            </div>
        `, { className: 'custom-map-popup' });
    };

    const mapStyle = (feature: any) => {
        const id = level === 'plr' ? feature.properties.plr_id : feature.properties.bzr_id;
        const metric = findMetric(id);
        const hasIncidents = metric && metric.cases > 0;

        return {
            fillColor: hasIncidents ? '#ef4444' : '#64748b',
            weight: 1,
            opacity: 1,
            color: '#334155',
            fillOpacity: hasIncidents ? 0.6 : 0.2, // Slightly more visible grey
            className: 'map-region-interactive'
        };
    };

    // Berlin Centroid
    const position: [number, number] = [52.5200, 13.4050];

    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                    <p className="text-xs text-slate-400 font-medium">{date}</p>
                </div>

                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => onLevelChange('plr')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${level === 'plr' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        PLR
                    </button>
                    <button
                        onClick={() => onLevelChange('bzr')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${level === 'bzr' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        BZR
                    </button>
                </div>
            </div>

            <div className="map-comparison-container relative flex-grow min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 rounded-xl backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-sm font-bold text-blue-400">Loading Map...</span>
                        </div>
                    </div>
                )}
                <MapContainer
                    center={position}
                    zoom={10}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    style={{ background: '#0f172a' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {geojsonData && (
                        <GeoJSON
                            key={`${level}-${date}-${metrics.length}-${metrics.reduce((acc, m) => acc + m.cases, 0)}`}
                            data={geojsonData}
                            style={mapStyle}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapContainer>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <span className="text-slate-300">Affected Areas ({metrics.length})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500/80"></div>
                    <span className="text-blue-400">Total City Cases ({metrics.reduce((acc, m) => acc + m.cases, 0)})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500/20 border border-slate-600"></div>
                    <span className="text-slate-500">No Incidents</span>
                </div>
                <div className="ml-auto text-slate-500 italic">
                    Level: {level.toUpperCase()}
                </div>
            </div>
        </div>
    );
};

export default LORMap;
