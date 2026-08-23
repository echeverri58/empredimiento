import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { PieChart as PieIcon, Layers, TrendingUp, Building } from 'lucide-react';

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

export const SectorCharts = () => {
  const { filteredCompanies, selectedYear, setSelectedSector } = useData();

  const sectorData = useMemo(() => {
    if (!filteredCompanies) return [];

    const map = {};
    filteredCompanies.forEach((c) => {
      const sec = c.sector || 'OTROS';
      if (!map[sec]) {
        map[sec] = {
          name: sec,
          ingresos: 0,
          ganancias: 0,
          count: 0,
          topCompany: c
        };
      }
      map[sec].ingresos += c.ingresos || 0;
      map[sec].ganancias += c.ganancias || 0;
      map[sec].count += 1;
      if (c.ingresos > map[sec].topCompany.ingresos) {
        map[sec].topCompany = c;
      }
    });

    const totalIngresos = Object.values(map).reduce((acc, curr) => acc + curr.ingresos, 0);

    return Object.values(map)
      .map((item) => ({
        ...item,
        ingresos: parseFloat(item.ingresos.toFixed(2)),
        ganancias: parseFloat(item.ganancias.toFixed(2)),
        percentage: totalIngresos > 0 ? parseFloat(((item.ingresos / totalIngresos) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  }, [filteredCompanies]);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-emerald-400 font-extrabold">
            ${data.ingresos} B COP ({data.percentage}%)
          </p>
          <p className="text-slate-400 mt-1">
            Empresas en sector: <span className="text-white font-bold">{data.count.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Sector Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Share Pie Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                Participación de Facturación por Macrosector
              </h3>
              <p className="text-xs text-slate-400">Distribución porcentual del volumen de ingresos ({selectedYear})</p>
            </div>
          </div>

          <div className="w-full h-[320px] my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="ingresos"
                >
                  {sectorData.map((entry) => (
                    <Cell key={entry.name} fill={SECTOR_COLORS[entry.name] || SECTOR_COLORS.OTROS} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sector Legend Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800">
            {sectorData.map((sec) => (
              <button
                key={sec.name}
                onClick={() => setSelectedSector(sec.name)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[sec.name] || SECTOR_COLORS.OTROS }} />
                <span className="text-slate-300 font-semibold">{sec.name}</span>
                <span className="text-emerald-400 font-bold">{sec.percentage}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Financial Performance Bar Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Ingresos vs Ganancias por Sector
              </h3>
              <p className="text-xs text-slate-400">Comparativa financiera agregada en Billones COP</p>
            </div>
          </div>

          <div className="w-full h-[320px] my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ingresos" name="Facturación Total ($ B)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ganancias" name="Ganancia Neta ($ B)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-800">
            * El sector Minero e Industrial registran los mayores márgenes brutos operacionales.
          </p>
        </div>
      </div>

      {/* Sector Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectorData.map((sec) => {
          const color = SECTOR_COLORS[sec.name] || SECTOR_COLORS.OTROS;
          return (
            <div
              key={sec.name}
              className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    {sec.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                    {sec.count.toLocaleString()} empresas
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Facturación Total</span>
                    <span className="text-sm font-extrabold text-emerald-400">${sec.ingresos} B COP</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Ganancia Neta</span>
                    <span className={`text-sm font-extrabold ${sec.ganancias >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                      ${sec.ganancias} B COP
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Empresa Líder:</span>
                <span className="font-bold text-amber-300 truncate max-w-[170px]" title={sec.topCompany?.name}>
                  {sec.topCompany?.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
