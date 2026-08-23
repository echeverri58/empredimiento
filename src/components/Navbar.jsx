import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Building2, 
  Search, 
  FilterX, 
  Calendar, 
  LayoutDashboard, 
  Award, 
  Map as MapIcon, 
  Table as TableIcon,
  PieChart as PieIcon,
  Landmark,
  BookOpen
} from 'lucide-react';

export const Navbar = () => {
  const {
    years,
    selectedYear,
    setSelectedYear,
    selectedSector,
    setSelectedSector,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    sectorsList,
    citiesList,
    resetFilters,
    activeTab,
    setActiveTab,
    filteredCompanies
  } = useData();

  const hasActiveFilters = selectedSector !== 'ALL' || selectedCity !== 'ALL' || searchQuery !== '';

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'top100', label: 'Top 100', icon: Award },
    { id: 'publicEntities', label: 'Sector Público', icon: Landmark },
    { id: 'sectors', label: 'Sectores & Ciudades', icon: PieIcon },
    { id: 'map', label: 'Mapa OSM', icon: MapIcon },
    { id: 'table', label: 'Directorio', icon: TableIcon },
    { id: 'notes', label: 'Notas NIIF', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2 sm:space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Logo & Title & Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 leading-tight">
                  Top Empresas Colombia
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    10.000 Empresas
                  </span>
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-x-1.5 leading-none mt-0.5">
                  <span>Por: <strong className="text-slate-200">John Alexander Echeverry Ocampo</strong></span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <a href="mailto:echeverri58@gmail.com" className="text-slate-400 hover:text-emerald-400 hidden sm:inline">echeverri58@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Fiscal Year Selector Pill on Mobile */}
            <div className="flex lg:hidden items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 ml-1 mr-1" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs text-emerald-400 font-bold focus:outline-none cursor-pointer pr-1"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-white">
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search & Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto">
            {/* Year Selector Desktop */}
            <div className="hidden lg:flex items-center bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-700/80 text-xs font-medium text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400 mr-1.5" />
              <span className="text-slate-400 mr-1">Año:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-900 text-emerald-400 font-bold focus:outline-none cursor-pointer px-2 py-0.5 rounded-md border border-slate-700"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar empresa, NIT o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/90 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Sector Dropdown & City Dropdown Grid on Mobile */}
            <div className="grid grid-cols-2 lg:flex items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full bg-slate-950/90 text-xs text-slate-200 rounded-xl px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none truncate"
                >
                  <option value="ALL">🏢 Todos Sectores</option>
                  {sectorsList.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-950/90 text-xs text-slate-200 rounded-xl px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none truncate"
                >
                  <option value="ALL">📍 Todas Ciudades</option>
                  {citiesList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center justify-center text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-2 rounded-xl transition-all font-medium col-span-1 sm:col-span-2 lg:col-span-1"
                title="Limpiar Filtros"
              >
                <FilterX className="w-3.5 h-3.5 mr-1" />
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scrollable Tab Navigation for Mobile & Desktop */}
        <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar touch-pan-x">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 bg-slate-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
