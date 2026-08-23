import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { DollarSign, TrendingUp, Trophy, PieChart, Users } from 'lucide-react';

export const KpiCards = () => {
  const { filteredCompanies, selectedYear } = useData();

  const metrics = useMemo(() => {
    if (!filteredCompanies || filteredCompanies.length === 0) {
      return {
        totalIngresos: 0,
        totalGanancias: 0,
        totalEmpleados: 0,
        topEmpresa: null,
        topSector: '-',
        topSectorShare: 0,
        count: 0
      };
    }

    let ingresos = 0;
    let ganancias = 0;
    let empleados = 0;
    const sectorTotals = {};

    filteredCompanies.forEach((c) => {
      ingresos += c.ingresos || 0;
      ganancias += c.ganancias || 0;
      empleados += c.empleados || 0;

      if (c.sector) {
        sectorTotals[c.sector] = (sectorTotals[c.sector] || 0) + c.ingresos;
      }
    });

    const topEmp = filteredCompanies[0];

    // Find top sector
    let topSecName = '-';
    let topSecVal = 0;
    Object.entries(sectorTotals).forEach(([sec, val]) => {
      if (val > topSecVal) {
        topSecVal = val;
        topSecName = sec;
      }
    });
    const secShare = ingresos > 0 ? ((topSecVal / ingresos) * 100).toFixed(1) : 0;

    return {
      totalIngresos: ingresos.toFixed(2),
      totalGanancias: ganancias.toFixed(2),
      totalEmpleados: empleados,
      topEmpresa: topEmp,
      topSector: topSecName,
      topSectorShare: secShare,
      count: filteredCompanies.length
    };
  }, [filteredCompanies]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {/* Total Revenue */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 hover:border-emerald-500/30 transition-all col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Facturación Total</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-none">
            ${metrics.totalIngresos} <span className="text-[10px] sm:text-xs font-medium text-slate-400">B COP</span>
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
            <span className="text-emerald-400 font-bold">Acumulado</span> ({selectedYear})
          </p>
        </div>
      </div>

      {/* Total Profits */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 hover:border-cyan-500/30 transition-all col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Ganancia Neta</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-none">
            ${metrics.totalGanancias} <span className="text-[10px] sm:text-xs font-medium text-slate-400">B COP</span>
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
            Utilidad o pérdida neta
          </p>
        </div>
      </div>

      {/* Total Employees */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 hover:border-blue-500/30 transition-all col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Empleos Generados</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-xl font-extrabold text-blue-400 tracking-tight leading-none">
            {metrics.totalEmpleados.toLocaleString()}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
            Puestos de trabajo (Est.)
          </p>
        </div>
      </div>

      {/* Top Company */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 hover:border-amber-500/30 transition-all col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Empresa #1 Líder</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xs sm:text-sm font-bold text-amber-300 truncate" title={metrics.topEmpresa?.name || '-'}>
            {metrics.topEmpresa ? metrics.topEmpresa.name : '-'}
          </h3>
          <p className="text-xs text-slate-300 font-semibold mt-0.5">
            ${metrics.topEmpresa?.ingresos || 0} B COP
          </p>
        </div>
      </div>

      {/* Top Sector */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 hover:border-purple-500/30 transition-all col-span-2 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Macrosector Líder</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xs sm:text-sm font-bold text-purple-300 truncate">
            {metrics.topSector}
          </h3>
          <p className="text-xs text-slate-300 font-semibold mt-0.5">
            {metrics.topSectorShare}% <span className="text-[10px] font-normal text-slate-400">del total ({metrics.count.toLocaleString()} emp)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
