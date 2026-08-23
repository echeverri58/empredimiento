import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Table as TableIcon, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ArrowUpDown,
  Users
} from 'lucide-react';

const SECTOR_BADGES = {
  MINERO: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMERCIO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SERVICIOS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MANUFACTURA: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  AGROPECUARIO: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  CONSTRUCCION: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  CONSTRUCCIÓN: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  OTROS: 'bg-slate-800 text-slate-400 border-slate-700'
};

export const CompanyTable = () => {
  const { filteredCompanies, selectedYear, setSelectedCompany } = useData();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');

  // Sorting logic
  const sortedCompanies = useMemo(() => {
    if (!filteredCompanies) return [];

    const copy = [...filteredCompanies];
    copy.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filteredCompanies, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCompanies.slice(start, start + pageSize);
  }, [sortedCompanies, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (!filteredCompanies || filteredCompanies.length === 0) return;

    const headers = [
      'Ranking',
      'Razón Social',
      'NIT',
      'Macrosector',
      'Ciudad Domicilio',
      'Departamento Domicilio',
      'Ingresos Operacionales (B COP)',
      'Ganancia Pérdida (B COP)',
      'Empleados Estimados',
      'Total Activos (B COP)',
      'Año de Corte'
    ];

    const rows = filteredCompanies.map((c) => [
      c.rank,
      `"${c.name.replace(/"/g, '""')}"`,
      c.nit,
      `"${c.sector}"`,
      `"${c.city}"`,
      `"${c.dept}"`,
      c.ingresos,
      c.ganancias,
      c.empleados || 0,
      c.activos,
      c.year
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Empresas_Mas_Grandes_Colombia_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header & Export Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-emerald-400" />
            Directorio de las 10.000 Empresas más Grandes
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {selectedYear}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mostrando {filteredCompanies.length.toLocaleString()} registros ordenados por ingresos operacionales y fuerza laboral.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Page size selector */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 text-white rounded-lg px-2 py-1 border border-slate-800 focus:outline-none"
            >
              <option value={25}>25 filas</option>
              <option value={50}>50 filas</option>
              <option value={100}>100 filas</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Rank</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Empresa / Razón Social</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4">NIT</th>
              <th
                onClick={() => handleSort('sector')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Macrosector</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('city')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Ciudad</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ingresos')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Ingresos (B COP)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ganancias')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Ganancias (B COP)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('empleados')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Empleados (Est.)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  No se encontraron empresas con los filtros aplicados.
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((c) => {
                const isTop3 = c.rank <= 3;
                const medal = c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : null;
                const badgeStyle = SECTOR_BADGES[c.sector] || SECTOR_BADGES.OTROS;

                return (
                  <tr
                    key={`${c.nit}-${c.rank}`}
                    onClick={() => setSelectedCompany(c)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 font-bold text-slate-200 whitespace-nowrap">
                      {medal ? (
                        <span className="text-base mr-1">{medal}</span>
                      ) : (
                        <span className="text-slate-500">#{c.rank}</span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-bold text-white group-hover:text-emerald-400 transition-colors">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[240px]" title={c.name}>
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Supervisada por: {c.supervisor || 'Supersociedades'}
                        </span>
                      </div>
                    </td>

                    {/* NIT */}
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {c.nit}
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                        {c.sector}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{c.city}</span>
                        <span className="text-[10px] text-slate-500">{c.dept}</span>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                      ${c.ingresos} B
                    </td>

                    {/* Net Profits */}
                    <td
                      className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                        c.ganancias >= 0 ? 'text-cyan-400' : 'text-rose-400'
                      }`}
                    >
                      ${c.ganancias} B
                    </td>

                    {/* Employees */}
                    <td className="py-3 px-4 text-right font-bold text-blue-400 whitespace-nowrap">
                      {c.empleados?.toLocaleString() || '-'}
                    </td>

                    {/* Detail Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompany(c);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center justify-center border border-slate-800"
                        title="Ver Ficha Completa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div>
          Página <strong className="text-white">{currentPage}</strong> de{' '}
          <strong className="text-white">{totalPages}</strong> ({sortedCompanies.length.toLocaleString()} empresas encontradas)
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-bold text-white bg-slate-800 rounded-xl border border-slate-700">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
