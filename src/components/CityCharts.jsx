import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { MapPin, Building, Trophy, Filter } from 'lucide-react';

export const CityCharts = () => {
  const { filteredCompanies, selectedYear, setSelectedCity, setSelectedCompany } = useData();

  const citySummary = useMemo(() => {
    if (!filteredCompanies) return [];

    const map = {};
    filteredCompanies.forEach((c) => {
      const city = c.city || 'DESCONOCIDA';
      if (!map[city]) {
        map[city] = {
          city,
          dept: c.dept,
          ingresos: 0,
          ganancias: 0,
          count: 0,
          topCompany: c
        };
      }
      map[city].ingresos += c.ingresos || 0;
      map[city].ganancias += c.ganancias || 0;
      map[city].count += 1;
      if (c.ingresos > map[city].topCompany.ingresos) {
        map[city].topCompany = c;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        ingresos: parseFloat(item.ingresos.toFixed(2)),
        ganancias: parseFloat(item.ganancias.toFixed(2))
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  }, [filteredCompanies]);

  const top15Cities = useMemo(() => {
    return citySummary.slice(0, 15);
  }, [citySummary]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            {data.city} ({data.dept})
          </h4>
          <div className="mt-2 space-y-1">
            <p className="text-slate-300">
              Facturación Acumulada:{' '}
              <span className="font-bold text-emerald-400">${data.ingresos} B COP</span>
            </p>
            <p className="text-slate-300">
              Ganancia Neta Total:{' '}
              <span className="font-bold text-cyan-400">${data.ganancias} B COP</span>
            </p>
            <p className="text-slate-400">
              Empresas registradas: <span className="font-bold text-white">{data.count.toLocaleString()}</span>
            </p>
            <p className="text-slate-400 pt-1 border-t border-slate-800 text-[11px]">
              Empresa Líder: <span className="font-bold text-amber-300">{data.topCompany?.name}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top 15 Cities Bar Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Top 15 Ciudades Líderes en Facturación Empresarial
            </h3>
            <p className="text-xs text-slate-400">
              Concentración del volumen de ingresos por municipio sede ({selectedYear})
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            Total Ciudades: <strong className="text-white">{citySummary.length}</strong>
          </span>
        </div>

        <div className="w-full h-[400px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top15Cities}
              margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setSelectedCity(state.activePayload[0].payload.city);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="city"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" B" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }} />
              <Bar dataKey="ingresos" radius={[6, 6, 0, 0]} className="cursor-pointer">
                {top15Cities.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#10b981' : index < 5 ? '#3b82f6' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cities Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {top15Cities.map((city, rank) => (
          <div
            key={city.city}
            onClick={() => setSelectedCity(city.city)}
            className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  #{rank + 1}
                </span>
                <span className="text-[11px] text-slate-400">{city.dept}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">
                {city.city}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {city.count.toLocaleString()} empresas en sede
              </p>

              <div className="mt-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Facturación:</span>
                  <span className="font-extrabold text-emerald-400">${city.ingresos} B COP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ganancia:</span>
                  <span className="font-bold text-cyan-400">${city.ganancias} B COP</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
              <span className="truncate max-w-[140px]" title={city.topCompany?.name}>
                🥇 {city.topCompany?.name}
              </span>
              <span className="text-indigo-400 font-medium group-hover:underline">Filtrar →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
