import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useData } from '../context/DataContext';
import { Map as MapIcon, Filter } from 'lucide-react';

export const ColombiaMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const { filteredCompanies, selectedYear, selectedCity, setSelectedCity } = useData();

  // Aggregate companies by city coordinates
  const cityClusters = useMemo(() => {
    if (!filteredCompanies) return [];

    const clusters = {};
    filteredCompanies.forEach((c) => {
      if (!c.lat || !c.lng) return;
      const key = `${c.lat.toFixed(3)},${c.lng.toFixed(3)}`;
      
      if (!clusters[key]) {
        clusters[key] = {
          key,
          city: c.city,
          dept: c.dept,
          lat: c.lat,
          lng: c.lng,
          totalIngresos: 0,
          totalGanancias: 0,
          companies: []
        };
      }

      clusters[key].totalIngresos += c.ingresos || 0;
      clusters[key].totalGanancias += c.ganancias || 0;
      clusters[key].companies.push(c);
    });

    return Object.values(clusters).map((clust) => ({
      ...clust,
      totalIngresos: parseFloat(clust.totalIngresos.toFixed(2)),
      totalGanancias: parseFloat(clust.totalGanancias.toFixed(2)),
      topCompanies: clust.companies.sort((a, b) => b.ingresos - a.ingresos).slice(0, 5)
    }));
  }, [filteredCompanies]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [4.5709, -74.2973],
      zoom: 5.5,
      zoomControl: true,
      minZoom: 4.5,
      maxZoom: 14
    });

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    cityClusters.forEach((cluster) => {
      const radius = Math.max(6, Math.min(28, Math.sqrt(cluster.totalIngresos) * 2.2));
      const isSelected = selectedCity === cluster.city;

      const circle = L.circleMarker([cluster.lat, cluster.lng], {
        radius: radius,
        fillColor: isSelected ? '#10b981' : cluster.totalIngresos > 20 ? '#059669' : '#0284c7',
        color: isSelected ? '#34d399' : '#38bdf8',
        weight: isSelected ? 3 : 1.5,
        opacity: 0.9,
        fillOpacity: isSelected ? 0.85 : 0.65
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1.5 space-y-1.5 min-w-[200px] text-xs';

      popupContent.innerHTML = `
        <div class="border-b border-slate-700 pb-1">
          <h4 class="font-bold text-xs text-white">📍 ${cluster.city}</h4>
          <p class="text-[10px] text-slate-400">${cluster.dept}</p>
        </div>
        <div class="space-y-0.5 text-[11px] text-slate-300">
          <div class="flex justify-between">
            <span class="text-slate-400">Facturación:</span>
            <span class="font-extrabold text-emerald-400">$${cluster.totalIngresos} B COP</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Empresas:</span>
            <span class="font-bold text-white">${cluster.companies.length}</span>
          </div>
        </div>
        <button id="btn-filter-${cluster.city.replace(/[^a-zA-Z0-9]/g, '')}" class="w-full mt-1.5 py-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px]">
          Filtrar por ${cluster.city}
        </button>
      `;

      circle.bindPopup(popupContent);

      circle.on('popupopen', () => {
        const btnId = `btn-filter-${cluster.city.replace(/[^a-zA-Z0-9]/g, '')}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.onclick = () => {
            setSelectedCity(cluster.city);
            circle.closePopup();
          };
        }
      });

      markersGroupRef.current.addLayer(circle);
    });
  }, [cityClusters, selectedCity, setSelectedCity]);

  return (
    <div className="glass-panel rounded-2xl p-3 sm:p-5 border border-slate-800 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
            <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            Mapa Interactivo (OpenStreetMap)
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {selectedYear}
            </span>
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
            Georreferenciación empresarial en más de 350 municipios de Colombia.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {selectedCity !== 'ALL' && (
            <button
              onClick={() => setSelectedCity('ALL')}
              className="text-[11px] sm:text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              Toda Colombia
            </button>
          )}
          <span className="text-[10px] sm:text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 font-medium">
            Ciudades: <strong className="text-white">{cityClusters.length}</strong>
          </span>
        </div>
      </div>

      {/* Leaflet Map Box */}
      <div className="relative w-full h-[360px] sm:h-[520px] rounded-xl overflow-hidden border border-slate-800">
        <div ref={mapRef} className="w-full h-full z-10" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[10px] sm:text-xs shadow-xl space-y-1 max-w-[220px]">
          <p className="font-bold text-white text-[10px] mb-0.5">Concentración Facturación:</p>
          <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-400 inline-block" />
            <span>&gt; $20B COP (Sedes Principales)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 border border-sky-400 inline-block" />
            <span>Facturación Intermedia</span>
          </div>
        </div>
      </div>
    </div>
  );
};
