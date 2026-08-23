import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  X, 
  MapPin, 
  Calendar
} from 'lucide-react';

export const CompanyModal = () => {
  const { selectedCompany, setSelectedCompany, getCompanyHistory } = useData();

  if (!selectedCompany) return null;

  const history = useMemo(() => {
    return getCompanyHistory(selectedCompany.nit);
  }, [selectedCompany, getCompanyHistory]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-base sm:text-lg shadow-inner shrink-0">
              #{selectedCompany.rank}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedCompany.sector}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                  NIT: {selectedCompany.nit}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-white mt-1 leading-tight">
                {selectedCompany.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{selectedCompany.city}, {selectedCompany.dept}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCompany(null)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-xs">
          {/* Main Financial & Employee Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Facturación</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5 block">
                ${selectedCompany.ingresos} B COP
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">Ingresos ({selectedCompany.year})</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Ganancia / Pérdida</span>
              <span className={`text-sm sm:text-base font-extrabold mt-0.5 block ${selectedCompany.ganancias >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                ${selectedCompany.ganancias} B COP
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">Utilidad Neta</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Personal Ocupado</span>
              <span className="text-sm sm:text-base font-extrabold text-blue-400 mt-0.5 block">
                {selectedCompany.empleados?.toLocaleString() || '-'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">Empleados Est.</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Total Activos</span>
              <span className="text-sm sm:text-base font-extrabold text-indigo-400 mt-0.5 block">
                ${selectedCompany.activos} B COP
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500">Balance General</span>
            </div>
          </div>

          {/* Secondary Financial Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/40 p-3 sm:p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Pasivos:</span>
              <span className="font-bold text-slate-200">${selectedCompany.pasivos} B COP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Patrimonio:</span>
              <span className="font-bold text-slate-200">${selectedCompany.patrimonio} B COP</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t sm:border-t-0 border-slate-800">
              <span className="text-slate-400">Código CIIU:</span>
              <span className="font-mono text-emerald-400 font-bold">{selectedCompany.ciiu}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 sm:border-t-0 border-slate-800">
              <span className="text-slate-400">Supervisada por:</span>
              <span className="font-semibold text-slate-300">{selectedCompany.supervisor}</span>
            </div>
          </div>

          {/* Historical Progression Table */}
          {history.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Histórico Financiero y Fuerza Laboral (2021 - 2024)
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Año</th>
                      <th className="py-2 px-3">Rank</th>
                      <th className="py-2 px-3 text-right">Facturación</th>
                      <th className="py-2 px-3 text-right">Ganancia</th>
                      <th className="py-2 px-3 text-right">Empleados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {history.map((item) => (
                      <tr key={item.year} className={item.year === selectedCompany.year ? 'bg-emerald-500/10 font-bold' : ''}>
                        <td className="py-2 px-3 text-white flex items-center gap-1">
                          {item.year}
                        </td>
                        <td className="py-2 px-3 text-slate-300">#{item.rank}</td>
                        <td className="py-2 px-3 text-right text-emerald-400">${item.ingresos} B</td>
                        <td className={`py-2 px-3 text-right ${item.ganancias >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                          ${item.ganancias} B
                        </td>
                        <td className="py-2 px-3 text-right text-blue-400">{item.empleados?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setSelectedCompany(null)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
