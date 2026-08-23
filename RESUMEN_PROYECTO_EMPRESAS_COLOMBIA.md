# Proyecto: Análisis y Visualización de las 10.000 Empresas más Grandes de Colombia

Este documento contiene el resumen detallado del proyecto, el análisis financiero del CSV, la metodología de ordenamiento, el funcionamiento de la aplicación web con **OpenStreetMap**, la guía para consultar el número de empleados y el **directorio completo de todos los enlaces, fuentes y referencias oficiales consultadas**.

---

## 📌 1. Resumen del Proyecto

Se procesó y analizó la base de datos oficial de las **10.000 empresas más grandes de Colombia**, contenida en el archivo CSV local `10.000_Empresas_mas_Grandes_del_País_20260821.csv`.

* **Total de registros**: 40.000 filas (10.000 empresas por cada año fiscal: 2021, 2022, 2023 y 2024).
* **Cobertura geográfica**: 355 ciudades y 39 departamentos de Colombia.
* **Macrosectores evaluados**: Comercio, Manufactura, Minero, Servicios, Agropecuario y Construcción.

---

## 📊 2. Estructura del Archivo CSV

Las columnas identificadas en la tabla original son:

| Columna | Descripción |
| :--- | :--- |
| `NIT` | Número de Identificación Tributaria de la empresa. |
| `RAZÓN SOCIAL` | Nombre legal de la empresa. |
| `SUPERVISOR` | Entidad reguladora (*Superfinanciera*, *Supersociedades*, *Supersalud*, etc.). |
| `REGIÓN` | Región geográfica principal (*Bogotá - Cundinamarca*, *Antioquia*, *Costa Atlántica*, etc.). |
| `DEPARTAMENTO DOMICILIO` | Departamento sede principal. |
| `CIUDAD DOMICILIO` | Municipio o ciudad de domicilio principal. |
| `CIIU` | Código de actividad económica internacional uniforme. |
| `MACROSECTOR` | Clasificación del sector económico. |
| `INGRESOS OPERACIONALES` | Facturación bruta operacional en **Billones de Pesos COP** (ej. `$113.92`). |
| `GANANCIA (PÉRDIDA)` | Utilidad o pérdida neta del ejercicio en Billones de COP (ej. `$33.41` o `-$0.80`). |
| `TOTAL ACTIVOS` | Total de activos del balance general en Billones de COP. |
| `TOTAL PASIVOS` | Total de obligaciones o pasivos en Billones de COP. |
| `TOTAL PATRIMONIO` | Patrimonio neto corporativo en Billones de COP. |
| `Año de Corte` | Año fiscal del reporte (`2,024`, `2,023`, `2,022`, `2,021`). |

---

## 🔍 3. Metodología de Ordenamiento: ¿Cómo filtrar de la Empresa más Grande a la más Pequeña?

1. **Criterio Oficial de Ranking**: Se ordenan descendentemente por la columna **`INGRESOS OPERACIONALES`** (estándar oficial de la Superintendencia de Sociedades de Colombia).
2. **Limpieza Numérica**: Los datos del CSV vienen formateados como texto de moneda (ejemplo: `$113.92`). Se eliminaron los caracteres `$`, comas y guiones negativos, convirtiéndolos a valores decimales numéricos (`float`).
3. **Filtrado por Año Fiscal**: Se toma el año más reciente disponible (**2024**).
4. **Ordenamiento Descendente**: Se aplica un orden descendente (`DESC`).
5. **Selección del Top 1.000**: Se toman las primeras 1.000 empresas para la visualización enfocada.

### Top 10 Empresas Líderes en Colombia (Año 2024)

| Ranking | Empresa | Macrosector | Ciudad | Ingresos Operacionales | Ganancia (Pérdida) | Activos Totales |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| 🥇 **#1** | **ECOPETROL S.A.** | MINERO | BOGOTA, D.C. | **$113.92 B COP** | $33.41 B COP | $216.85 B COP |
| 🥈 **#2** | **REFINERIA DE CARTAGENA S.A.** | MANUFACTURA | CARTAGENA | **$25.86 B COP** | $2.19 B COP | $42.84 B COP |
| 🥉 **#3** | **ORGANIZACIÓN TERPEL S.A.** | COMERCIO | BOGOTA, D.C. | **$24.75 B COP** | $0.33 B COP | $7.48 B COP |
| 🏅 **#4** | **EMPRESAS PÚBLICAS DE MEDELLÍN E.S.P.** | SERVICIOS | MEDELLIN | **$20.57 B COP** | $3.04 B COP | $59.47 B COP |
| 🏅 **#5** | **D1 S.A.S.** | COMERCIO | BOGOTA, D.C. | **$19.44 B COP** | $0.29 B COP | $0.15 B COP |
| 🏅 **#6** | **CARBONES DEL CERREJON LIMITED** | MINERO | BOGOTA, D.C. | **$16.39 B COP** | $6.05 B COP | $10.45 B COP |
| 🏅 **#7** | **DRUMMOND LTD** | MINERO | BOGOTA, D.C. | **$15.27 B COP** | $2.16 B COP | $14.27 B COP |
| 🏅 **#8** | **ALMACENES EXITO S.A.** | COMERCIO | ENVIGADO | **$15.13 B COP** | $0.10 B COP | $14.85 B COP |
| 🏅 **#9** | **NUEVA EPS S.A.** | SERVICIOS | BOGOTA, D.C. | **$14.78 B COP** | $0.01 B COP | $5.91 B COP |
| 🏅 **#10** | **COMUNICACIÓN CELULAR S.A. (CLARO)** | SERVICIOS | BOGOTA, D.C. | **$14.63 B COP** | $1.79 B COP | $23.43 B COP |

---

## 🖥️ 4. Aplicación Web Interactiva Desarrollada

Se construyó un dashboard web completo e interactivo listo para usar.

### Componentes de la Aplicación
1. **Mapa Interactivo OpenStreetMap (Leaflet.js)**:
   - Georreferenciación de empresas en más de 350 municipios de Colombia.
   - Círculos escalados según el volumen de facturación de cada municipio.
   - Popups descriptivos al hacer clic que muestran las principales empresas de la ciudad y permiten filtrar la tabla instantáneamente.
2. **Selector de Rango de Empresas**:
   - Botón predeterminado para **"Top 1.000"** (con opciones para Top 100, Top 500 y 10.000 completas).
3. **Filtros Dinámicos**:
   - Selector por **Año Fiscal** (2024, 2023, 2022, 2021).
   - Selector por **Macrosector** (Comercio, Manufactura, Minero, Servicios, etc.).
   - Selector por **Ubicación** (Ciudad y Departamento).
   - Buscador rápido por **NIT** o **Razón Social**.
4. **Gráficos Estadísticos (Chart.js)**:
   - Donut Chart de participación por Macrosector.
   - Gráfico de Barras comparativo del Top 10 de empresas (Ingresos vs. Ganancias).
   - Top 5 ciudades líderes por facturación.
5. **Tabla Interactiva de Posiciones**:
   - Insignias visuales de medalla (oro, plata, bronce).
   - Ordenamiento por cualquier columna.
   - Paginación dinámica y botón de **Exportación a CSV**.

---

## 🔗 5. Enlaces y Fuentes Consultadas (Directorio de Referencias)

A continuación se consolidan **todos los enlaces, fuentes gubernamentales, portales de datos abiertos y tecnologías** consultadas durante el desarrollo:

### A. Portales Oficiales de Gobierno y Datos Abiertos
* **Portal de Datos Abiertos de Colombia**: [https://www.datos.gov.co/](https://www.datos.gov.co/)
* **Conjunto de Datos "10.000 Empresas más Grandes del País" (Directo)**: [https://www.datos.gov.co/Comercio-Industria-y-Turismo/10-000-Empresas-mas-Grandes-del-Pa-s-2022/23v9-mrk7](https://www.datos.gov.co/Comercio-Industria-y-Turismo/10-000-Empresas-mas-Grandes-del-Pa-s-2022/23v9-mrk7)
* **Búsqueda de Datos Empresariales en Datos.gov.co**: [https://www.datos.gov.co/browse?q=10.000+Empresas+mas+Grandes+del+Pa%C3%ADs](https://www.datos.gov.co/browse?q=10.000+Empresas+mas+Grandes+del+Pa%C3%ADs)

### B. Superintendencia de Sociedades y Sistemas de Información
* **Portal SIIS (Sistema Integrado de Información Societaria)**: [https://siis.ia.supersociedades.gov.co/](https://siis.ia.supersociedades.gov.co/)
* **Manual de Usuario del SIIS (PDF)**: [https://siis.ia.supersociedades.gov.co/MilEmpresas/files/Manual_de_usuario_SIIS.pdf](https://siis.ia.supersociedades.gov.co/MilEmpresas/files/Manual_de_usuario_SIIS.pdf)
* **Página Oficial de la Superintendencia de Sociedades**: [https://www.supersociedades.gov.co](https://www.supersociedades.gov.co)
* **Estudios Económicos y Financieros de la Supersociedades**: [https://www.supersociedades.gov.co/web/estudios-economicos-y-financieros](https://www.supersociedades.gov.co/web/estudios-economicos-y-financieros)
* **Estados Financieros de Fin de Ejercicio (NIIF Plenas y Pymes)**: [https://www.supersociedades.gov.co/web/estudios-economicos-y-financieros/estados-financieros-de-fin-de-ejercicio](https://www.supersociedades.gov.co/web/estudios-economicos-y-financieros/estados-financieros-de-fin-de-ejercicio)

### C. Registro Empresarial y Número de Empleados
* **RUES (Registro Único Empresarial y Social - Cámaras de Comercio)**: [https://www.rues.org.co/](https://www.rues.org.co/)
* **Consulta de Matrícula Mercantil por NIT en RUES**: [https://www.rues.org.co/](https://www.rues.org.co/)

### D. Librerías y Servicios Utilizados en la Aplicación
* **Leaflet.js (Motor de Mapas Interáctivos)**: [https://leafletjs.com/](https://leafletjs.com/)
* **OpenStreetMap (Servicio de Mapas Libres)**: [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
* **CARTO Voyager Basemaps**: [https://carto.com/](https://carto.com/)
* **Chart.js (Visualización de Gráficos)**: [https://www.chartjs.org/](https://www.chartjs.org/)
* **Tailwind CSS (Framework de Diseño UI)**: [https://tailwindcss.com/](https://tailwindcss.com/)
* **Lucide Icons**: [https://lucide.dev/](https://lucide.dev/)

---

## 👥 6. Consulta del Número de Empleados por Empresa

El archivo CSV sintético publicado en Datos Abiertos no incluye la variable de personal. Las opciones oficiales para consultar o calcular el número de empleados son:

1. **Plataforma SIIS (Supersociedades)**:
   - Accediendo al portal oficial **[https://siis.ia.supersociedades.gov.co/](https://siis.ia.supersociedades.gov.co/)**, en la pestaña de *Información Financiera / Reportes Masivos*, se puede descargar el reporte de **"Información General NIIF"** que contiene la columna `Número de Trabajadores`.
2. **Consulta RUES (Cámara de Comercio)**:
   - En **[www.rues.org.co](https://www.rues.org.co/)**, buscando por el NIT de cualquier empresa, figura el dato oficial de *Personal Ocupado*.
3. **Ratios de Facturación por Empleado**:
   - *Comercio / Retail*: ~$300 a $600 millones COP de ingresos por empleado.
   - *Manufactura*: ~$500 a $1.000 millones COP de ingresos por empleado.
   - *Servicios*: ~$100 a $250 millones COP de ingresos por empleado.

---

## 📁 7. Registro de Archivos Locales del Proyecto

* 👉 **Aplicación Web Local**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
* [`prepare_data.py`](prepare_data.py): Script de Python para limpiar el CSV y generar el JSON con coordenadas geográficas.
* [`data.json`](data.json): Dataset optimizado de 40.000 filas.
* [`index.html`](index.html): Estructura HTML5 de la aplicación.
* [`styles.css`](styles.css): Estilos CSS del dashboard.
* [`app.js`](app.js): Lógica de JavaScript para el mapa OpenStreetMap, gráficos y filtros.
* [`RESUMEN_PROYECTO_EMPRESAS_COLOMBIA.md`](RESUMEN_PROYECTO_EMPRESAS_COLOMBIA.md): Este documento resumen.
