import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { Top100Chart } from './components/Top100Chart';
import { SectorCharts } from './components/SectorCharts';
import { CityCharts } from './components/CityCharts';
import { ColombiaMap } from './components/ColombiaMap';
import { CompanyTable } from './components/CompanyTable';
import { CompanyModal } from './components/CompanyModal';
import { PublicEntitiesView } from './components/PublicEntitiesView';
import { MethodologyNotes } from './components/MethodologyNotes';
import { Building2, Loader2, Mail, Phone, UserCheck, ShieldCheck } from 'lucide-react';

const DashboardContent = () => {
  const { loading, error, activeTab } = useData();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin absolute -bottom-2 -right-2" />
        </div>
        <p className="text-sm font-semibold text-slate-300">
          Cargando Base de Datos Empresarial y Sector Público de Colombia...
        </p>
        <p className="text-xs text-slate-500">
          Procesando registros de la Superintendencia de Sociedades y Función Pública (SIGEP)
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <p className="text-sm font-bold">Error al cargar la información: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top KPI Metrics Cards (visible on primary views) */}
      {activeTab !== 'notes' && activeTab !== 'publicEntities' && <KpiCards />}

      {/* Tab Switcher Views */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <Top100Chart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectorCharts />
            <ColombiaMap />
          </div>
          <CompanyTable />
        </div>
      )}

      {activeTab === 'top100' && (
        <div className="space-y-6">
          <Top100Chart />
        </div>
      )}

      {activeTab === 'publicEntities' && (
        <div className="space-y-6">
          <PublicEntitiesView />
        </div>
      )}

      {activeTab === 'sectors' && (
        <div className="space-y-6">
          <SectorCharts />
          <CityCharts />
        </div>
      )}

      {activeTab === 'map' && (
        <div className="space-y-6">
          <ColombiaMap />
        </div>
      )}

      {activeTab === 'table' && (
        <div className="space-y-6">
          <CompanyTable />
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <MethodologyNotes />
        </div>
      )}

      {/* Company Profile Modal */}
      <CompanyModal />
    </main>
  );
};

export function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
        <div>
          <Navbar />
          <DashboardContent />
        </div>

        {/* Executive Credits Footer */}
        <footer className="mt-12 bg-slate-900/90 border-t border-slate-800 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
              
              {/* Left Side: App Branding */}
              <div className="flex items-center space-x-3 text-center md:text-left">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Plataforma de Inteligencia Empresarial de Colombia
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Análisis Integrado de las 10.000 Empresas Privadas y 295 Entidades Públicas del Estado
                  </p>
                </div>
              </div>

              {/* Right Side: Creator Credits */}
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Diseñada y Desarrollada por</span>
                    <span className="text-xs font-extrabold text-white">John Alexander Echeverry Ocampo</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-800 hidden sm:block" />

                <div className="flex flex-col sm:flex-row items-center gap-3 text-[11px] text-slate-300">
                  <a
                    href="mailto:echeverri58@gmail.com"
                    className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>echeverri58@gmail.com</span>
                  </a>

                  <a
                    href="tel:3217466359"
                    className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Celular: 3217466359</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Sources & Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
              <p>
                © {new Date().getFullYear()} John Alexander Echeverry Ocampo. Todos los derechos reservados.
              </p>
              <p>
                Fuentes Oficiales: <strong>Superintendencia de Sociedades</strong> • <strong>Función Pública (SIGEP)</strong> • <strong>Datos.gov.co</strong>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;
