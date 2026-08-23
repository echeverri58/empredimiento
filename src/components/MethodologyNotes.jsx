import React from 'react';
import { 
  BookOpen, 
  Calculator, 
  HelpCircle, 
  Building2, 
  Landmark, 
  CheckCircle2, 
  FileText, 
  Info,
  ShieldCheck
} from 'lucide-react';

export const MethodologyNotes = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Notas Aclaratorias & Metodología NIIF / SIGEP
            </h2>
            <p className="text-xs text-slate-400">
              Transparencia en el cálculo de puestos de trabajo para el Sector Privado y Sector Público en Colombia
            </p>
          </div>
        </div>
      </div>

      {/* Accordion / Card 1: NIIF Ratio Calculation for Private Companies */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            1. Metodología NIIF: ¿Cómo se obtuvieron los empleados de las empresas privadas?
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            El conjunto de datos oficiales de las <strong className="text-white">10.000 Empresas más Grandes de Colombia</strong> publicado en el portal <em>Datos Abiertos (Datos.gov.co)</em> y suministrado por la <strong>Superintendencia de Sociedades</strong> contiene estados financieros completos bajo normas NIIF (Ingresos Operacionales, Ganancia/Pérdida, Activos, Pasivos y Patrimonio), pero <span className="text-amber-400 font-semibold">no exige la casilla de personal directo en su reporte masivo simplificado</span>.
          </p>

          <p>
            Para solucionar esta restricción y ofrecer una visión completa de la fuerza laboral, se utilizó un <strong className="text-emerald-400">Modelo de Productividad NIIF por Trabajador</strong> alineado con los estudios económicos de la Superintendencia de Sociedades:
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 my-2 font-mono text-center text-xs text-emerald-400">
            Fuerza Laboral Estimada = Ingresos Operacionales ($ COP) ÷ Facturación Promedio por Empleado del Sector
          </div>

          <h4 className="font-bold text-white pt-2">Ratios de Facturación Promedio Aplicados por Macrosector:</h4>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Macrosector Económico</th>
                  <th className="py-2.5 px-4 text-right">Facturación Promedio por Empleado</th>
                  <th className="py-2.5 px-4">Justificación Económica / NIIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-amber-400">MINERO E HIDROCARBUROS</td>
                  <td className="py-2.5 px-4 text-right font-bold text-white">$3.500 Millones COP / trabajador</td>
                  <td className="py-2.5 px-4 text-slate-400">Alta intensidad de capital técnico y maquinaria automatizada.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-400">COMERCIO / RETAIL</td>
                  <td className="py-2.5 px-4 text-right font-bold text-white">$450 Millones COP / trabajador</td>
                  <td className="py-2.5 px-4 text-slate-400">Alta densidad de personal en cajas, logística y tiendas.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-purple-400">MANUFACTURA / INDUSTRIA</td>
                  <td className="py-2.5 px-4 text-right font-bold text-white">$650 Millones COP / trabajador</td>
                  <td className="py-2.5 px-4 text-slate-400">Balance entre líneas de ensamblaje operarias y ventas masivas.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-blue-400">SERVICIOS / SALUD / TELECOM</td>
                  <td className="py-2.5 px-4 text-right font-bold text-white">$250 Millones COP / trabajador</td>
                  <td className="py-2.5 px-4 text-slate-400">Sector intensivo en mano de obra médica, técnica y atención al cliente.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-lime-400">AGROPECUARIO</td>
                  <td className="py-2.5 px-4 text-right font-bold text-white">$180 Millones COP / trabajador</td>
                  <td className="py-2.5 px-4 text-slate-400">Personal de campo y recolección agrícola intensiva.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-pink-400">CONSTRUCCIÓN</td>
                  <td className="py-2.5 px-4 text-right font-bold text-white">$300 Millones COP / trabajador</td>
                  <td className="py-2.5 px-4 text-slate-400">Mano de obra contratada por obra civil e infraestructura.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Card 2: Official ESG / Sustainability Headcounts for Major Firms */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            2. Cifras Reales Auditadas para Grandes Conglomerados (GRI / ESG)
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Para las principales empresas cotizadas en la Bolsa de Valores de Colombia (BVC) o multinacionales líderes, las cifras de empleados corresponden a los <strong className="text-white">Reportes de Sostenibilidad e Informes de Gestión anuales auditados</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">ECOPETROL S.A.</span>
              <span className="text-emerald-400 font-extrabold">19.500 Directos</span>
              <span className="text-[10px] text-slate-500 block">(&gt;110.000 via Contratistas)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">GRUPO NUTRESA</span>
              <span className="text-emerald-400 font-extrabold">46.000 Empleados</span>
              <span className="text-[10px] text-slate-500 block">Nómina nacional e internacional</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">ALMACENES ÉXITO S.A.</span>
              <span className="text-emerald-400 font-extrabold">35.000 Empleados</span>
              <span className="text-[10px] text-slate-500 block">Fuerza comercial e hipermercados</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">BANCOLOMBIA</span>
              <span className="text-emerald-400 font-extrabold">22.000 Empleados</span>
              <span className="text-[10px] text-slate-500 block">Personal bancario y financiero</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">D1 S.A.S.</span>
              <span className="text-emerald-400 font-extrabold">21.000 Empleados</span>
              <span className="text-[10px] text-slate-500 block">Red de tiendas de descuento</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">EMPRESAS PÚBLICAS DE MEDELLÍN</span>
              <span className="text-emerald-400 font-extrabold">14.500 Empleados</span>
              <span className="text-[10px] text-slate-500 block">Operación de servicios públicos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Public Sector SIGEP Methodology */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <Landmark className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            3. Fuente del Sector Público (SIGEP - Función Pública)
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Los datos del Sector Público provienen del archivo oficial <strong className="text-white">`Cantidad_de_empleos_y_tipos_de_planta_por_entidad_20260813.csv`</strong> del <em>Departamento Administrativo de la Función Pública</em> y el sistema <strong>SIGEP</strong>.
          </p>

          <h4 className="font-bold text-white pt-1">Definición de las Modalidades de Contratación Estatal:</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-bold text-emerald-400 block text-xs">Planta Permanente</span>
              <span className="text-[11px] text-slate-400">
                Empleos fijados por ley o decreto para desarrollar las funciones esenciales e indispensables de la entidad.
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-bold text-blue-400 block text-xs">Docentes y Formadores</span>
              <span className="text-[11px] text-slate-400">
                Personal dedicado a la enseñanza en la ESAP, universidades e institutos tecnológicos estatales (ej. Ministerio de Educación, UNAL).
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-bold text-cyan-400 block text-xs">Carrera Administrativa</span>
              <span className="text-[11px] text-slate-400">
                Servidores vinculados mediante concurso público de méritos administrado por la CNSC (Comisión Nacional del Servicio Civil).
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-bold text-purple-400 block text-xs">Planta Temporal / Transitoria</span>
              <span className="text-[11px] text-slate-400">
                Cargos creados por necesidades temporales, sobrecarga de trabajo o proyectos específicos de duración limitada.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
