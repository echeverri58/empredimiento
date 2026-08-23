import React, { useState, useMemo } from 'react';
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
import { Award, Filter, Building, Users } from 'lucide-react';

const SECTOR_COLORS = {
  MINERO: '#f59e0b',
  COMERCIO: '#10b981',
  SERVICIOS: '#3b82f6',
  MANUFACTURA: '#8b5cf6',
  AGROPECUARIO: '#84cc16',
  CONSTRUCCION: '#ec4899',
  CONSTRUCCIÓN: '#ec4899',
  OTROS: '#64748b'
};

export const Top100Chart = () => {
  const { 
    currentYearData, 
    sectorsList, 
    selectedSector, 
    setSelectedSector, 
    selectedYear,
    setSelectedCompany 
  } = useData();

  const [metricView, setMetricView] = useState('ingresos');
  const [displayCount, setDisplayCount] = useState(50);

  const top100Data = useMemo(() => {
    if (!currentYearData) return [];
    
    let list = currentYearData;
    if (selectedSector !== 'ALL') {
      list = currentYearData.filter((c) => c.sector === selectedSector);
    }

    if (metricView === 'empleados') {
      list = [...list].sort((a, b) => (b.empleados || 0) - (a.empleados || 0));
    }

    return list.slice(0, 100).map((c, idx) => ({
      ...c,
      displayRank: idx + 1,
      shortName: c.name.length > 16 ? c.name.substring(0, 14) + '...' : c.name
    }));
  }, [currentYearData, selectedSector, metricView]);

  const visibleData = useMemo(() => {
    return top100Data.slice(0, displayCount);
  }, [top100Data, displayCount]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center border border-emerald-500/30">
              #{data.displayRank}
            </span>
            <h4 className="font-bold text-xs text-white truncate">{data.name}</h4>
          </div>
          <div className="mt-1.5 space-y-0.5 text-[11px]">
            <p className="text-slate-300">
              Sector: <span className="font-semibold text-emerald-400">{data.sector}</span>
            </p>
            <p className="text-slate-300">
              Ubicación: {data.city}, {data.dept}
            </p>
            <div className="pt-1 border-t border-slate-800 grid grid-cols-3 gap-1 text-[10px]">
              <div>
                <span className="text-slate-500 block">Facturación</span>
                <span className="font-extrabold text-emerald-400">${data.ingresos} B</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ganancia</span>
                <span className={`font-extrabold ${data.ganancias >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  ${data.ganancias} B
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Empleados</span>
                <span className="font-extrabold text-blue-400">
                  {data.empleados?.toLocaleString() || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 border border-slate-800 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            Top 100 Empresas más Grandes de Colombia
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {selectedYear}
            </span>
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
            {selectedSector === 'ALL'
              ? 'Ranking general de las 100 empresas líderes en Colombia'
              : `Ranking de las 100 empresas líderes en: ${selectedSector}`}
          </p>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* Metric selector */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-[11px] sm:text-xs">
            <button
              onClick={() => setMetricView('ingresos')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                metricView === 'ingresos'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setMetricView('ganancias')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                metricView === 'ganancias'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400'
              }`}
            >
              Ganancia
            </button>
            <button
              onClick={() => setMetricView('empleados')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                metricView === 'empleados'
                  ? 'bg-blue-500 text-slate-950 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <Users className="w-3 h-3" />
              Empleados
            </button>
          </div>

          {/* Count range selector */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-[11px] sm:text-xs">
            {[25, 50, 100].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setDisplayCount(cnt)}
                className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                  displayCount === cnt
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Top {cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Filter Buttons / Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
        <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Sector:
        </span>
        <button
          onClick={() => setSelectedSector('ALL')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
            selectedSector === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800'
          }`}
        >
          🌐 Todos ({currentYearData.slice(0, 100).length})
        </button>

        {sectorsList.map((sec) => {
          const isSel = selectedSector === sec;
          const countSec = currentYearData.filter((c) => c.sector === sec).slice(0, 100).length;
          const secColor = SECTOR_COLORS[sec] || SECTOR_COLORS.OTROS;
          return (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                isSel
                  ? 'bg-slate-800 text-white border-emerald-500'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: secColor }} />
              <span>{sec}</span>
              <span className="text-[9px] opacity-70">({countSec})</span>
            </button>
          );
        })}
      </div>

      {/* Chart Visualization */}
      <div className="w-full h-[420px] sm:h-[520px] pt-1">
        {visibleData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Building className="w-8 h-8 mb-2 opacity-50" />
            <p>No hay empresas para el sector seleccionado en el Top 100.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={visibleData}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: 15 }}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setSelectedCompany(state.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={true} />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                unit={metricView === 'empleados' ? '' : ' B'}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 10 }}
                width={95}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }} />
              <Bar
                dataKey={metricView === 'ingresos' ? 'ingresos' : metricView === 'ganancias' ? 'ganancias' : 'empleados'}
                radius={[0, 4, 4, 0]}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                {visibleData.map((entry, index) => {
                  const color = SECTOR_COLORS[entry.sector] || SECTOR_COLORS.OTROS;
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
