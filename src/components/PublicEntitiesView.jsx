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
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Landmark, 
  Users, 
  Award, 
  Filter, 
  Download, 
  Building2, 
  BookOpen, 
  ShieldAlert, 
  Briefcase, 
  ArrowUpDown,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const SECTOR_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', 
  '#ec4899', '#84cc16', '#6366f1', '#14b8a6', '#f43f5e', '#64748b'
];

export const PublicEntitiesView = () => {
  const { 
    publicEntities, 
    filteredPublicEntities, 
    publicSectorsList, 
    selectedPublicSector, 
    setSelectedPublicSector,
    publicSearchQuery,
    setPublicSearchQuery
  } = useData();

  const [topRange, setTopRange] = useState(50); // 50 | 100 | 295
  const [chartMetric, setChartMetric] = useState('totalCargos'); // 'totalCargos' | 'plantaPermanente' | 'plantaTemporal' | 'docentes' | 'carreraAdministrativa'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('totalCargos');
  const [sortDirection, setSortDirection] = useState('desc');

  // KPI Calculations
  const metrics = useMemo(() => {
    if (!filteredPublicEntities || filteredPublicEntities.length === 0) {
      return {
        totalEmpleados: 0,
        totalPermanente: 0,
        totalTemporal: 0,
        totalDocentes: 0,
        totalCarrera: 0,
        topEntidad: null,
        count: 0
      };
    }

    let total = 0;
    let perm = 0;
    let temp = 0;
    let doc = 0;
    let carrera = 0;

    filteredPublicEntities.forEach((e) => {
      total += e.totalCargos || 0;
      perm += e.plantaPermanente || 0;
      temp += e.plantaTemporal || 0;
      doc += e.docentes || 0;
      carrera += e.carreraAdministrativa || 0;
    });

    return {
      totalEmpleados: total,
      totalPermanente: perm,
      totalTemporal: temp,
      totalDocentes: doc,
      totalCarrera: carrera,
      topEntidad: filteredPublicEntities[0],
      count: filteredPublicEntities.length
    };
  }, [filteredPublicEntities]);

  // Top Entities Chart Data
  const topEntitiesChartData = useMemo(() => {
    let list = filteredPublicEntities;
    if (chartMetric === 'docentes') {
      list = [...list].sort((a, b) => b.docentes - a.docentes);
    } else if (chartMetric === 'plantaTemporal') {
      list = [...list].sort((a, b) => b.plantaTemporal - a.plantaTemporal);
    } else if (chartMetric === 'carreraAdministrativa') {
      list = [...list].sort((a, b) => b.carreraAdministrativa - a.carreraAdministrativa);
    } else if (chartMetric === 'plantaPermanente') {
      list = [...list].sort((a, b) => b.plantaPermanente - a.plantaPermanente);
    }

    return list.slice(0, topRange).map((e, idx) => ({
      ...e,
      displayRank: idx + 1,
      shortName: e.name.length > 25 ? e.name.substring(0, 23) + '...' : e.name
    }));
  }, [filteredPublicEntities, topRange, chartMetric]);

  // Public Sector Aggregate Data
  const sectorAggregateData = useMemo(() => {
    if (!publicEntities) return [];

    const map = {};
    publicEntities.forEach((e) => {
      const sec = e.sector || 'OTROS';
      if (!map[sec]) {
        map[sec] = { name: sec, empleados: 0, count: 0 };
      }
      map[sec].empleados += e.totalCargos || 0;
      map[sec].count += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.empleados - a.empleados)
      .slice(0, 10);
  }, [publicEntities]);

  // Plant Type Distribution Data for Pie Chart
  const plantTypeDistribution = useMemo(() => {
    let perm = 0;
    let temp = 0;
    let doc = 0;
    let ofic = 0;
    let otros = 0;

    filteredPublicEntities.forEach((e) => {
      perm += e.plantaPermanente || 0;
      temp += e.plantaTemporal || 0;
      doc += e.docentes || 0;
      ofic += e.trabajadoresOficiales || 0;
      otros += (e.totalCargos || 0) - (e.plantaPermanente + e.plantaTemporal + e.docentes + e.trabajadoresOficiales);
    });

    return [
      { name: 'Planta Permanente', value: perm, color: '#10b981' },
      { name: 'Docentes (ESAP/Institutos)', value: doc, color: '#3b82f6' },
      { name: 'Trabajadores Oficiales', value: ofic, color: '#f59e0b' },
      { name: 'Planta Temporal', value: temp, color: '#8b5cf6' },
      { name: 'Otras Modalidades', value: Math.max(0, otros), color: '#64748b' }
    ];
  }, [filteredPublicEntities]);

  // Sorting & Pagination for Table
  const sortedTableData = useMemo(() => {
    const copy = [...filteredPublicEntities];
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
  }, [filteredPublicEntities, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTableData.length / pageSize) || 1;
  const paginatedTableData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTableData.slice(start, start + pageSize);
  }, [sortedTableData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    if (!filteredPublicEntities || filteredPublicEntities.length === 0) return;

    const headers = [
      'Ranking',
      'Código SIGEP',
      'Entidad Pública',
      'Sector',
      'Orden',
      'Clasificación',
      'Total Cargos Planta',
      'Planta Permanente',
      'Planta Temporal',
      'Trabajadores Oficiales',
      'Docentes',
      'Carrera Administrativa',
      'Libre Nombramiento'
    ];

    const rows = filteredPublicEntities.map((e) => [
      e.rank,
      e.code,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.sector}"`,
      `"${e.orden}"`,
      `"${e.clasificacion}"`,
      e.totalCargos,
      e.plantaPermanente,
      e.plantaTemporal,
      e.trabajadoresOficiales,
      e.docentes,
      e.carreraAdministrativa,
      e.libreNombramiento
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Entidades_Publicas_Colombia_SIGEP.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 max-w-xs">
          <h4 className="font-bold text-white text-sm">{data.name}</h4>
          <p className="text-slate-400">
            Sector: <span className="text-emerald-400 font-semibold">{data.sector}</span>
          </p>
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Total Cargos</span>
              <span className="font-extrabold text-emerald-400 text-sm">{data.totalCargos?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Planta Permanente</span>
              <span className="font-bold text-white">{data.plantaPermanente?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Docentes / Educadores</span>
              <span className="font-bold text-blue-400">{data.docentes?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Carrera Adm.</span>
              <span className="font-bold text-cyan-400">{data.carreraAdministrativa?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-emerald-400" />
            Sector Público de Colombia (SIGEP - Función Pública)
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              295 Entidades del Estado
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Planta de personal, empleos públicos y modalidades de vinculación registradas oficialmente.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Public Sector Filter */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedPublicSector}
              onChange={(e) => setSelectedPublicSector(e.target.value)}
              className="w-full bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">🏛️ Todos los Sectores Estado</option>
              {publicSectorsList.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Public Sector KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Empleos Públicos</span>
          <h3 className="text-xl font-extrabold text-white mt-2">
            {metrics.totalEmpleados.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            Cargos de planta reportados
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Planta Permanente</span>
          <h3 className="text-xl font-extrabold text-emerald-400 mt-2">
            {metrics.totalPermanente.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Cargos permanentes fijados
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Docentes / Educadores</span>
          <h3 className="text-xl font-extrabold text-blue-400 mt-2">
            {metrics.totalDocentes.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            ESAP, Universidades e Institutos
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Carrera Administrativa</span>
          <h3 className="text-xl font-extrabold text-cyan-400 mt-2">
            {metrics.totalCarrera.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Vinculación por mérito
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Entidad Líder en Personal</span>
          <h3 className="text-sm font-bold text-amber-300 truncate mt-2" title={metrics.topEntidad?.name}>
            {metrics.topEntidad ? metrics.topEntidad.name : '-'}
          </h3>
          <p className="text-xs font-semibold text-slate-200 mt-0.5">
            {metrics.topEntidad?.totalCargos?.toLocaleString()} cargos
          </p>
        </div>
      </div>

      {/* Main Top Public Entities Chart (Top 50 / Top 100 / Top 1000) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Ranking de Entidades Públicas con Más Empleados
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa de nómina y cargos de planta en el Estado Colombiano.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Metric selector */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setChartMetric('totalCargos')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  chartMetric === 'totalCargos'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Total Cargos
              </button>
              <button
                onClick={() => setChartMetric('plantaPermanente')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  chartMetric === 'plantaPermanente'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Permanente
              </button>
              <button
                onClick={() => setChartMetric('docentes')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  chartMetric === 'docentes'
                    ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Docentes
              </button>
              <button
                onClick={() => setChartMetric('carreraAdministrativa')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  chartMetric === 'carreraAdministrativa'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Carrera Adm.
              </button>
            </div>

            {/* Range selector: Top 50, Top 100, Todas */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
              {[50, 100, 295].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setTopRange(cnt)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    topRange === cnt
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cnt === 295 ? 'Todas (295)' : `Top ${cnt}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="w-full h-[520px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topEntitiesChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={true} />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="shortName"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                width={150}
              />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }} />
              <Bar dataKey={chartMetric} fill="#10b981" radius={[0, 6, 6, 0]} className="cursor-pointer">
                {topEntitiesChartData.map((entry, index) => (
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

      {/* Secondary Sector & Plant Type Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Public Breakdown Bar Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Top Sectores del Estado con Más Empleados Públicos
          </h3>

          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorAggregateData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="empleados" name="Total Cargos en Planta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plant Type Pie Distribution */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Distribución por Tipo de Planta / Modalidad Laboral
          </h3>

          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plantTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {plantTypeDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Public Entities Directory Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              Directorio Completo de Entidades Públicas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mostrando {filteredPublicEntities.length.toLocaleString()} instituciones gubernamentales.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar entidad o código SIGEP..."
              value={publicSearchQuery}
              onChange={(e) => setPublicSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th onClick={() => handleSort('rank')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center space-x-1">
                    <span>Entidad Pública</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Código SIGEP</th>
                <th onClick={() => handleSort('sector')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center space-x-1">
                    <span>Sector</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('totalCargos')} className="py-3 px-4 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Planta</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('plantaPermanente')} className="py-3 px-4 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Permanente</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('docentes')} className="py-3 px-4 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Docentes</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('carreraAdministrativa')} className="py-3 px-4 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Carrera Adm.</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {paginatedTableData.map((e) => (
                <tr key={e.code + e.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">#{e.rank}</td>
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[260px]" title={e.name}>
                        {e.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {e.clasificacion} • {e.orden}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{e.code}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {e.sector}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-400">
                    {e.totalCargos?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-200">
                    {e.plantaPermanente?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-400">
                    {e.docentes?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-cyan-400">
                    {e.carreraAdministrativa?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Página <strong className="text-white">{currentPage}</strong> de{' '}
            <strong className="text-white">{totalPages}</strong> ({sortedTableData.length.toLocaleString()} entidades)
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-white bg-slate-800 rounded-xl border border-slate-700">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
