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
            1. ¿Cómo se calcularon los empleados de las 10.000 empresas?
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            El conjunto de datos oficiales de las <strong className="text-white">10.000 Empresas más Grandes de Colombia</strong> publicado en el portal <em>Datos Abiertos (Datos.gov.co)</em> y suministrado por la <strong>Superintendencia de Sociedades</strong> contiene estados financieros completos bajo normas NIIF (Ingresos Operacionales, Ganancia/Pérdida, Activos, Pasivos y Patrimonio), pero <span className="text-amber-400 font-semibold">no exige la casilla de personal directo en su reporte masivo simplificado</span>.
          </p>

          <p>
            Se aplica un método de <strong className="text-emerald-400">dos niveles</strong>, para que el dato sea lo más fiel posible donde más importa:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30">
              <span className="font-bold text-emerald-400 block text-xs">Nivel 1 · Cifra real publicada</span>
              <span className="text-[11px] text-slate-400">
                Para las <strong className="text-white">20 empresas más grandes</strong> se rastreó su número de
                empleados en fuentes oficiales (informes de sostenibilidad, informes de gestión y el formulario
                20-F ante la SEC). Ese valor se usa tal cual en su año de referencia y se
                <strong className="text-white"> escala por ingresos</strong> en los demás años:
                <span className="block mt-1 font-mono text-[10px] text-emerald-300">
                  empleados(año) = ancla × ingresos(año) ÷ ingresos(año del ancla)
                </span>
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-bold text-slate-300 block text-xs">Nivel 2 · Ratio NIIF del macrosector</span>
              <span className="text-[11px] text-slate-400">
                Para las demás empresas (que no publican su planta de personal) se estima con la facturación
                promedio por empleado de su macrosector, aplicada a los ingresos <em>de cada año</em>, de modo
                que la cifra siempre varía año a año y acompaña la evolución del negocio.
              </span>
            </div>
          </div>

          <p className="pt-1">
            Ratios de facturación promedio por empleado usados en el Nivel 2:
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
            2. Cifras Reales Rastreadas para las 20 Mayores Empresas
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Para las <strong className="text-white">20 empresas de mayor facturación</strong> se rastreó el número de empleados en documentos oficiales: informes de sostenibilidad, informes de gestión anuales y el <strong className="text-white">formulario 20-F ante la SEC</strong> (documento auditado). Cada cifra se usó en su año de referencia y se escaló por ingresos en los demás años:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">ECOPETROL S.A.</span>
              <span className="text-emerald-400 font-extrabold">19.581 · 2025</span>
              <span className="text-[10px] text-slate-500 block">Formulario 20-F ante la SEC</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">ALMACENES ÉXITO S.A.</span>
              <span className="text-emerald-400 font-extrabold">30.000 · 2024</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">D1 S.A.S.</span>
              <span className="text-emerald-400 font-extrabold">26.000 · 2025</span>
              <span className="text-[10px] text-slate-500 block">Forbes Colombia / La República</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">GASEOSAS LUX (Postobón)</span>
              <span className="text-emerald-400 font-extrabold">11.418 · 2023</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">DROGUERÍAS CRUZ VERDE</span>
              <span className="text-emerald-400 font-extrabold">10.000 · 2025</span>
              <span className="text-[10px] text-slate-500 block">La República</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">CI ENERGÍA SOLAR (Tecnoglass)</span>
              <span className="text-emerald-400 font-extrabold">9.444 · 2024</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad (Colombia)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">COMUNICACIÓN CELULAR (Claro)</span>
              <span className="text-emerald-400 font-extrabold">8.402 · 2024</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad (directos)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">DRUMMOND LTD</span>
              <span className="text-emerald-400 font-extrabold">5.340 · 2023</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">BAVARIA Y COMPAÑÍA S.C.A.</span>
              <span className="text-emerald-400 font-extrabold">4.646 · 2023</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">UNIBÁN</span>
              <span className="text-emerald-400 font-extrabold">3.800 · 2025</span>
              <span className="text-[10px] text-slate-500 block">Reporte de Sostenibilidad (directos)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">REFINERÍA DE CARTAGENA</span>
              <span className="text-emerald-400 font-extrabold">3.635 · 2024</span>
              <span className="text-[10px] text-slate-500 block">Informe de Gestión y Sostenibilidad</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-300 block">ALPINA</span>
              <span className="text-emerald-400 font-extrabold">3.197 · 2021</span>
              <span className="text-[10px] text-slate-500 block">Informe de Sostenibilidad (Colombia)</span>
            </div>
          </div>

          <p className="pt-1 text-[11px] text-slate-400">
            El listado completo son 20 empresas: se suman Aris Mining Segovia (3.234 · 2022),
            UNE EPM Telecomunicaciones (2.766 · 2024), ESSA (3.800 · 2024), Biomax (746 · 2021),
            Frontera Energy (721 · 2024), Racafé (277 · 2024) y Termobarranquilla (149 · 2024).
          </p>
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
