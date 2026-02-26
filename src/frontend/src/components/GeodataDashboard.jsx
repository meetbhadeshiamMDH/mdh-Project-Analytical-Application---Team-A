import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const GeodataDashboard = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [geoResponse, statsResponse] = await Promise.all([
                    axios.get('/berlin_lor.json'),
                    axios.get('http://localhost:5000/api/stats/geospatial')
                ]);
                setGeoJsonData(geoResponse.data);
                setStats(statsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching geospatial data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Color scaling for the heatmap - adjusted for real data distribution (~30-300 per LOR)
    const getColor = (count) => {
        if (!count) return '#1a202c'; // Empty/Default
        return count > 200 ? '#ef4444' : // Red (Critical)
            count > 150 ? '#f97316' : // Orange (High)
                count > 100 ? '#f59e0b' : // Amber (Moderate)
                    count > 50 ? '#eab308' : // Yellow (Low-Moderate)
                        '#22c55e';   // Green (Low)
    };


    const style = (feature) => {
        const loreId = feature.properties.PLR_ID;
        const data = stats[loreId] || { count: 0 };
        return {
            fillColor: getColor(data.count),
            weight: 1,
            opacity: 1,
            color: 'rgba(255,255,255,0.1)',
            fillOpacity: 0.6
        };
    };

    const onEachFeature = (feature, layer) => {
        const lorId = feature.properties.PLR_ID;
        const lorName = feature.properties.PLR_NAME;
        const data = stats[lorId] || { count: 0, damage: 0 };

        layer.bindTooltip(
            `<strong>${lorName}</strong><br/>
             District ID: ${lorId}<br/>
             Thefts: ${data.count.toLocaleString()}<br/>
             Financial Damage: €${Math.round(data.damage).toLocaleString()}`,
            { sticky: true, className: 'map-tooltip' }
        );

        layer.on({
            mouseover: (e) => {
                const l = e.target;
                l.setStyle({
                    fillOpacity: 0.9,
                    weight: 2,
                    color: 'var(--accent-primary)'
                });
            },
            mouseout: (e) => {
                const l = e.target;
                l.setStyle({
                    fillOpacity: 0.6,
                    weight: 1,
                    color: 'rgba(255,255,255,0.1)'
                });
            }
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
                Loading Map Data...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1.5rem', boxSizing: 'border-box', gap: '1rem' }}>
            {/* Header */}
            <header style={{ flexShrink: 0 }}>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>Geospatial Intelligence</h1>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Interactive Heatmap of Berlin Bike Theft Hotspots</p>
            </header>

            {/* Map — fills all remaining vertical space */}
            <div style={{
                flex: 1,
                minHeight: 0,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <MapContainer
                    center={[52.5200, 13.4050]}
                    zoom={11}
                    style={{ height: '100%', width: '100%', background: '#1a1d23' }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {geoJsonData && (
                        <GeoJSON
                            data={geoJsonData}
                            style={style}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Legend */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Risk Intensity:</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                        { c: '#22c55e', l: '< 50' },
                        { c: '#eab308', l: '50+' },
                        { c: '#f59e0b', l: '100+' },
                        { c: '#f97316', l: '150+' },
                        { c: '#ef4444', l: '200+' }
                    ].map(item => (
                        <div key={item.c} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '14px', height: '14px', background: item.c, borderRadius: '3px' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.l}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .map-tooltip {
                    background: rgba(26, 32, 44, 0.95) !important;
                    border: 1px solid var(--border-color) !important;
                    color: var(--text-main) !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
                    border-radius: 6px !important;
                    padding: 8px 12px !important;
                    font-family: inherit !important;
                }
                .leaflet-container {
                    background: #1a1d23 !important;
                }
            `}</style>
        </div>
    );
};

export default GeodataDashboard;
