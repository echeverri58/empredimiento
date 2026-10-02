import csv
import datetime
import glob
import json
import os
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

# Diccionario de coordenadas para los principales municipios de Colombia
CITY_COORDS = {
    "BOGOTA, D.C.": {"lat": 4.7110, "lng": -74.0721, "dept": "BOGOTA D.C."},
    "MEDELLIN": {"lat": 6.2442, "lng": -75.5812, "dept": "ANTIOQUIA"},
    "CALI": {"lat": 3.4516, "lng": -76.5320, "dept": "VALLE"},
    "BARRANQUILLA": {"lat": 10.9685, "lng": -74.7813, "dept": "ATLANTICO"},
    "BUCARAMANGA": {"lat": 7.1254, "lng": -73.1198, "dept": "SANTANDER"},
    "CARTAGENA": {"lat": 10.3997, "lng": -75.5144, "dept": "BOLIVAR"},
    "ITAGUI": {"lat": 6.1846, "lng": -75.5991, "dept": "ANTIOQUIA"},
    "COTA": {"lat": 4.8086, "lng": -74.1031, "dept": "CUNDINAMARCA"},
    "YUMBO": {"lat": 3.5828, "lng": -76.4914, "dept": "VALLE"},
    "CUCUTA": {"lat": 7.8939, "lng": -72.5078, "dept": "NORTE DE SANTANDER"},
    "PEREIRA": {"lat": 4.8133, "lng": -75.6961, "dept": "RISARALDA"},
    "ENVIGADO": {"lat": 6.1759, "lng": -75.5917, "dept": "ANTIOQUIA"},
    "MANIZALES": {"lat": 5.0689, "lng": -75.5174, "dept": "CALDAS"},
    "FUNZA": {"lat": 4.7144, "lng": -74.2128, "dept": "CUNDINAMARCA"},
    "SANTA MARTA": {"lat": 11.2408, "lng": -74.1990, "dept": "MAGDALENA"},
    "SABANETA": {"lat": 6.1514, "lng": -75.6164, "dept": "ANTIOQUIA"},
    "VILLAVICENCIO": {"lat": 4.1420, "lng": -73.6266, "dept": "META"},
    "RIONEGRO": {"lat": 6.1552, "lng": -75.3739, "dept": "ANTIOQUIA"},
    "PALMIRA": {"lat": 3.5394, "lng": -76.3036, "dept": "VALLE"},
    "IBAGUE": {"lat": 4.4389, "lng": -75.2322, "dept": "TOLIMA"},
    "TOCANCIPA": {"lat": 4.9658, "lng": -73.9575, "dept": "CUNDINAMARCA"},
    "CHIA": {"lat": 4.8637, "lng": -74.0537, "dept": "CUNDINAMARCA"},
    "MOSQUERA": {"lat": 4.7059, "lng": -74.2302, "dept": "CUNDINAMARCA"},
    "MONTERIA": {"lat": 8.7480, "lng": -75.8814, "dept": "CORDOBA"},
    "NEIVA": {"lat": 2.9273, "lng": -75.2819, "dept": "HUILA"},
    "PASTO": {"lat": 1.2136, "lng": -77.2811, "dept": "NARINO"},
    "POPAYAN": {"lat": 2.4448, "lng": -76.6147, "dept": "CAUCA"},
    "ARMENIA": {"lat": 4.5339, "lng": -75.6811, "dept": "QUINDIO"},
    "VALLEDUPAR": {"lat": 10.4631, "lng": -73.2532, "dept": "CESAR"},
    "SINCELEJO": {"lat": 9.3047, "lng": -75.3978, "dept": "SUCRE"},
    "TUNJA": {"lat": 5.5353, "lng": -73.3678, "dept": "BOYACA"},
    "SOGAMOSO": {"lat": 5.7161, "lng": -72.9339, "dept": "BOYACA"},
    "FLORENCIA": {"lat": 1.6144, "lng": -75.6062, "dept": "CAQUETA"},
    "YOPAL": {"lat": 5.3378, "lng": -72.3959, "dept": "CASANARE"},
    "QUIBDO": {"lat": 5.6947, "lng": -76.6611, "dept": "CHOCO"},
    "RIOHACHA": {"lat": 11.5444, "lng": -72.9072, "dept": "LA GUAJIRA"},
    "SAN ANDRES": {"lat": 12.5847, "lng": -81.7006, "dept": "SAN ANDRES"},
    "BARRANCABERMEJA": {"lat": 7.0653, "lng": -73.8547, "dept": "SANTANDER"},
    "BELLO": {"lat": 6.3373, "lng": -75.5579, "dept": "ANTIOQUIA"},
    "SOLEDAD": {"lat": 10.9184, "lng": -74.7663, "dept": "ATLANTICO"},
    "GIRARDOT": {"lat": 4.3014, "lng": -74.8055, "dept": "CUNDINAMARCA"},
    "FUSAGASUGA": {"lat": 4.3367, "lng": -74.3639, "dept": "CUNDINAMARCA"},
    "ZIPAQUIRA": {"lat": 5.0232, "lng": -74.0040, "dept": "CUNDINAMARCA"},
    "DOSQUEBRADAS": {"lat": 4.8389, "lng": -75.6744, "dept": "RISARALDA"},
    "LA ESTRELLA": {"lat": 6.1578, "lng": -75.6433, "dept": "ANTIOQUIA"},
    "MARINILLA": {"lat": 6.1739, "lng": -75.3375, "dept": "ANTIOQUIA"},
    "TULUA": {"lat": 4.0847, "lng": -76.1953, "dept": "VALLE"},
    "BUENAVENTURA": {"lat": 3.8801, "lng": -77.0312, "dept": "VALLE"},
    "CARTAGO": {"lat": 4.7464, "lng": -75.9117, "dept": "VALLE"},
    "SOPO": {"lat": 4.9056, "lng": -73.9389, "dept": "CUNDINAMARCA"},
    "MADRID": {"lat": 4.7325, "lng": -74.2642, "dept": "CUNDINAMARCA"},
    "FACATATIVA": {"lat": 4.8142, "lng": -74.3547, "dept": "CUNDINAMARCA"},
    "SIBATE": {"lat": 4.4925, "lng": -74.2492, "dept": "CUNDINAMARCA"},
    "TENJO": {"lat": 4.8706, "lng": -74.1436, "dept": "CUNDINAMARCA"},
    "LA CALERA": {"lat": 4.6931, "lng": -73.9694, "dept": "CUNDINAMARCA"},
    "SOACHA": {"lat": 4.5794, "lng": -74.2172, "dept": "CUNDINAMARCA"},
    "GACHANCIPA": {"lat": 4.9925, "lng": -73.8744, "dept": "CUNDINAMARCA"},
    "CAJICA": {"lat": 4.9192, "lng": -74.0278, "dept": "CUNDINAMARCA"},
}

DEPT_COORDS = {
    "BOGOTA D.C.": {"lat": 4.7110, "lng": -74.0721},
    "ANTIOQUIA": {"lat": 6.2442, "lng": -75.5812},
    "VALLE": {"lat": 3.4516, "lng": -76.5320},
    "ATLANTICO": {"lat": 10.9685, "lng": -74.7813},
    "SANTANDER": {"lat": 7.1254, "lng": -73.1198},
    "BOLIVAR": {"lat": 10.3997, "lng": -75.5144},
    "CUNDINAMARCA": {"lat": 4.7144, "lng": -74.2128},
    "NORTE DE SANTANDER": {"lat": 7.8939, "lng": -72.5078},
    "RISARALDA": {"lat": 4.8133, "lng": -75.6961},
    "CALDAS": {"lat": 5.0689, "lng": -75.5174},
    "MAGDALENA": {"lat": 11.2408, "lng": -74.1990},
    "META": {"lat": 4.1420, "lng": -73.6266},
    "TOLIMA": {"lat": 4.4389, "lng": -75.2322},
    "CORDOBA": {"lat": 8.7480, "lng": -75.8814},
    "HUILA": {"lat": 2.9273, "lng": -75.2819},
    "NARINO": {"lat": 1.2136, "lng": -77.2811},
    "CAUCA": {"lat": 2.4448, "lng": -76.6147},
    "QUINDIO": {"lat": 4.5339, "lng": -75.6811},
    "CESAR": {"lat": 10.4631, "lng": -73.2532},
    "SUCRE": {"lat": 9.3047, "lng": -75.3978},
    "BOYACA": {"lat": 5.5353, "lng": -73.3678},
    "CAQUETA": {"lat": 1.6144, "lng": -75.6062},
    "CASANARE": {"lat": 5.3378, "lng": -72.3959},
    "CHOCO": {"lat": 5.6947, "lng": -76.6611},
    "LA GUAJIRA": {"lat": 11.5444, "lng": -72.9072},
    "SAN ANDRES": {"lat": 12.5847, "lng": -81.7006},
}

# Cifras o promedios conocidos para empresas líderes
KNOWN_HEADCOUNTS = {
    "ECOPETROL": 19500,
    "ALMACENES EXITO": 35000,
    "TERPEL": 3500,
    "EMPRESAS PUBLICAS DE MEDELLIN": 14500,
    "D1": 21000,
    "DRUMMOND": 10200,
    "CARBONES DEL CERREJON": 12000,
    "NUEVA EPS": 11500,
    "CLARO": 10000,
    "REFINERIA DE CARTAGENA": 4200,
    "ARGOS": 7500,
    "NUTRESA": 46000,
    "COLOMBINA": 9500,
    "BAVARIA": 4000,
    "AVIANCA": 12000,
    "BANCOLOMBIA": 22000,
    "SUPERTIENDAS OLIMPICA": 22000,
    "COOPIDROGAS": 6500,
    "COLSUBSIDIO": 18000,
    "COMPENSAR": 14000,
    "KERALTY": 15000,
    "EPS SANITAS": 12000
}

# Ingreso promedio por trabajador según sector (en Billones COP por empleado)
# Ej: 0.0004 Billones = 400 Millones COP / empleado
SECTOR_REVENUE_PER_EMP = {
    "MINERO": 0.0035,        # 3.500 Millones COP por trabajador
    "COMERCIO": 0.00045,     # 450 Millones COP por trabajador
    "MANUFACTURA": 0.00065,  # 650 Millones COP por trabajador
    "SERVICIOS": 0.00025,    # 250 Millones COP por trabajador
    "AGROPECUARIO": 0.00018, # 180 Millones COP por trabajador
    "CONSTRUCCION": 0.00030, # 300 Millones COP por trabajador
    "CONSTRUCCIÓN": 0.00030,
    "OTROS": 0.00040
}

PARSE_FAILURES = []

def parse_float(val, context=''):
    """Convierte montos tipo '$ 100.59', '-$0.80' o '1,234.5' a float.

    El dataset cambió de formato entre versiones (2026-08 vs 2026-10):
    antes los negativos venían como '-$0.80' y ahora como '-$ 0.82' (con
    espacio tras el '$'). Con el parseo anterior, float('- 0.82') fallaba y
    TODAS las pérdidas se convertían silenciosamente en 0.00. Aquí se
    eliminan todos los espacios y se normaliza el signo.
    """
    if not val:
        return 0.0
    s = re.sub(r'\s+', '', val.replace('$', '').replace(',', ''))
    if s in ('', '-', '+', '.'):
        return 0.0
    try:
        return round(float(s), 2)
    except ValueError:
        PARSE_FAILURES.append((context, val))
        return 0.0

# ---------------------------------------------------------------------------
# Geocodificación
# ---------------------------------------------------------------------------
# El CSV oficial escribe los municipios CON tildes ("MEDELLÍN", "CÚCUTA",
# "ITAGÜÍ", "IBAGUÉ") mientras que las tablas de coordenadas están sin ellas.
# Comparar en crudo hacía que ~2.600 empresas por año cayeran al centroide del
# departamento y otras 157 acabaran en Bogotá por defecto. Ahora se normaliza
# (mayúsculas, sin tildes, espacios simples) antes de comparar.

def strip_accents(txt):
    return ''.join(c for c in unicodedata.normalize('NFKD', txt)
                   if not unicodedata.combining(c))


def norm(txt):
    return re.sub(r'\s+', ' ', strip_accents(str(txt).upper())).strip()


# Municipios/capitales que faltaban en la tabla original
EXTRA_CITIES = {
    # Capitales de departamento ausentes
    'MOCOA': (1.1533, -76.6475),
    'ARAUCA': (7.0847, -70.7591),
    'SAN JOSE DEL GUAVIARE': (2.5689, -72.6394),
    'MITU': (1.1983, -70.1706),
    'PUERTO CARRENO': (6.1861, -67.4856),
    'LETICIA': (-1.4444, -69.9403),
    'INIRIDA': (3.8653, -67.9239),
    # Área metropolitana y municipios con volumen relevante
    'COPACABANA': (6.3481, -75.5089),
    'GIRON': (7.0708, -73.1697),
    'FLORIDABLANCA': (7.0628, -73.0864),
    'PIEDECUESTA': (6.9803, -73.0511),
    'GALAPA': (10.9133, -74.8878),
    'PUERTO COLOMBIA': (10.9883, -74.9539),
    'MALAMBO': (10.8581, -74.7819),
    'TURBACO': (10.3233, -75.4147),
    'MAGANGUE': (9.2419, -74.7539),
    'APARTADO': (7.8833, -76.6333),
    'GUARNE': (6.2803, -75.4419),
    'BUGA': (3.9006, -76.2978),
    'CANDELARIA': (3.4111, -76.3478),
    'JAMUNDI': (3.2608, -76.5397),
    'EL CERRITO': (3.6856, -76.3117),
    'ZARZAL': (4.3950, -76.0719),
    'PRADERA': (3.4189, -76.2444),
    'FLORIDA': (3.3256, -76.2344),
    'GINEBRA': (3.7247, -76.2669),
    'YOTOCO': (3.8611, -76.4689),
    'RIOFRIO': (4.1569, -76.2878),
    'VIJES': (3.7000, -76.4369),
    'ANDALUCIA': (4.1667, -76.1667),
    'ANSERMANUEVO': (4.7975, -76.0181),
    'LA UNION': (4.5319, -76.0953),
    'SAN PEDRO': (3.9833, -76.2333),
    'SARAVENA': (6.9553, -71.8733),
    'ARAUQUITA': (6.9367, -71.4169),
    'TAME': (6.4600, -71.7300),
    'PUERTO ASIS': (0.5133, -76.5000),
    'ORITO': (0.6667, -76.8700),
    'PUERTO LEGUIZAMO': (-0.1900, -74.7800),
    'SANTA ROSALIA': (5.1333, -70.8600),
}

# Departamentos que faltaban por completo en la tabla original
EXTRA_DEPTS = {
    'VALLE DEL CAUCA': (3.8000, -76.5000),
    'SAN ANDRES Y PROVIDENCIA': (12.5847, -81.7006),
    'ARAUCA': (6.7000, -70.7000),
    'PUTUMAYO': (0.6000, -75.6000),
    'GUAVIARE': (2.5689, -72.6394),
    'VAUPES': (0.9000, -70.8000),
    'VICHADA': (4.4200, -69.2900),
    'AMAZONAS': (-1.5000, -71.9000),
    'GUAINIA': (2.5700, -68.1300),
}

# Variantes de nombre que no son simples tildes
CITY_ALIASES = {
    'BOGOTA': 'BOGOTA, D.C.',
    'BOGOTA D C': 'BOGOTA, D.C.',
    'MITU VAUPES': 'MITU',
}

DEPT_ALIASES = {
    'GUAJIRA': 'LA GUAJIRA',
    'BOGOTA': 'BOGOTA D.C.',
}

def _as_pair(v):
    """Las tablas originales usan {'lat','lng'} y las nuevas tuplas (lat, lng)."""
    if isinstance(v, dict):
        return (v['lat'], v['lng'])
    return (v[0], v[1])


CITY_LOOKUP = {norm(k): _as_pair(v) for k, v in {**CITY_COORDS, **EXTRA_CITIES}.items()}
DEPT_LOOKUP = {norm(k): _as_pair(v) for k, v in {**DEPT_COORDS, **EXTRA_DEPTS}.items()}

GEO_STATS = {'city': 0, 'dept': 0, 'default': 0}


def get_coords(city, dept):
    """Devuelve (lat, lng, origen) con origen en 'city' | 'dept' | 'default'.

    Se evita a propósito la coincidencia parcial de nombres: hacía que
    'CARTAGENA DEL CHAIRA' (Caquetá) cayera sobre Cartagena (Bolívar), a
    350 km de su ubicación real. Es preferible un centroide departamental
    honesto que un punto exacto en el lugar equivocado.
    """
    c = norm(city)
    d = norm(dept)

    hit = CITY_LOOKUP.get(c) or CITY_LOOKUP.get(norm(CITY_ALIASES.get(c, '')))
    if hit:
        GEO_STATS['city'] += 1
        return hit[0], hit[1], 'city'

    key = DEPT_ALIASES.get(d, d)
    hit = DEPT_LOOKUP.get(key) or DEPT_LOOKUP.get(d)
    if hit:
        GEO_STATS['dept'] += 1
        return hit[0], hit[1], 'dept'

    GEO_STATS['default'] += 1
    return 4.7110, -74.0721, 'default'

# ---------------------------------------------------------------------------
# Empleados
# ---------------------------------------------------------------------------
# El dataset oficial NO trae el número de trabajadores, así que hay que
# estimarlo. Se hace en dos niveles:
#
#   1) Si la empresa tiene una cifra REAL publicada (empleados_anclas.json) se
#      usa esa cifra en su año de referencia y se ESCALA por ingresos en los
#      demás años:   empleados(año) = ancla × ingresos(año) / ingresos(año ancla)
#      Así el número cambia cada año en vez de repetirse.
#   2) Para el resto se aplica el ratio NIIF del macrosector sobre los ingresos
#      DE ESE AÑO, de modo que también varía año a año.
#
# El ancla se indexa por NIT (solo dígitos) y no por nombre: así no falla por
# tildes ("PÚBLICAS" vs "PUBLICAS") ni se aplica el mismo dato a varias razones
# sociales del mismo grupo.

ANCLAS_PATH = 'empleados_anclas.json'
ANCLAS = {}
INGRESOS_POR_NIT = {}

EMP_STATS = {'ancla': 0, 'ratio': 0, 'piso': 0, 'tope': 0}


def solo_digitos(txt):
    return re.sub(r'\D', '', str(txt or ''))


def cargar_anclas():
    """Carga las cifras reales de empleados rastreadas para las mayores empresas."""
    global ANCLAS
    if not os.path.exists(ANCLAS_PATH):
        print(f'  Aviso: no existe {ANCLAS_PATH} -> todas las empresas usan el ratio NIIF.\n')
        return
    with open(ANCLAS_PATH, encoding='utf-8') as f:
        payload = json.load(f)
    ANCLAS = {solo_digitos(k): v for k, v in payload.get('anclas', {}).items()}
    print(f'  Anclas reales cargadas: {len(ANCLAS)} empresas '
          f'(rastreo del {payload.get("generado", "?")})\n')


def estimate_employees(nit, sector, ingresos, year):
    """Empleados del año indicado: ancla real escalada o ratio NIIF."""
    clave = solo_digitos(nit)
    ancla = ANCLAS.get(clave)
    if ancla:
        anio_ref = str(ancla.get('anio', ''))
        ing_ref = INGRESOS_POR_NIT.get(clave, {}).get(anio_ref)
        if ing_ref:
            est = int(round(ancla['empleados'] * ingresos / ing_ref))
            if est < 15:
                EMP_STATS['piso'] += 1
                return 15
            if est > 250000:
                EMP_STATS['tope'] += 1
                return 250000
            EMP_STATS['ancla'] += 1
            return est

    rev_per_emp = SECTOR_REVENUE_PER_EMP.get(sector, 0.0004)
    if ingresos <= 0:
        return 50
    estimated = int(ingresos / rev_per_emp)
    if estimated < 15:
        EMP_STATS['piso'] += 1
        return 15
    if estimated > 250000:
        EMP_STATS['tope'] += 1
        return 250000
    EMP_STATS['ratio'] += 1
    return estimated

CSV_PATTERN = '10.000_Empresas_mas_Grandes_del_País_*.csv'


def find_csv_files():
    """CSV del dataset, ordenados del más antiguo al más reciente.

    La exportación oficial siempre incluye TODOS los años fiscales
    (2021..2025), por eso basta con procesar el archivo más reciente.
    """
    return sorted(glob.glob(CSV_PATTERN))


def process_data():
    csv_files = find_csv_files()
    if not csv_files:
        raise SystemExit(f'No se encontró ningún CSV que coincida con: {CSV_PATTERN}')
    print(f'CSV encontrados ({len(csv_files)}):')
    for path in csv_files:
        print(f'  - {path}')
    csv_filename = csv_files[-1]
    print(f'-> Usando el más reciente: {csv_filename}\n')
    cargar_anclas()

    # Primera pasada: indexar ingresos por empresa y año. Hace falta ANTES de
    # calcular empleados, porque las anclas reales se escalan por ingresos
    # entre el año de referencia y cada año fiscal.
    with open(csv_filename, mode='r', encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            clave = solo_digitos(r['NIT'])
            anio = r['Año de Corte'].replace(',', '').strip()
            INGRESOS_POR_NIT.setdefault(clave, {})[anio] = parse_float(
                r['INGRESOS OPERACIONALES'])
    print(f'  Ingresos indexados para {len(INGRESOS_POR_NIT):,} empresas\n')
    data_by_year = {}
    
    with open(csv_filename, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for r in reader:
            year = r['Año de Corte'].replace(',', '').strip()
            if year not in data_by_year:
                data_by_year[year] = []
                
            ingresos = parse_float(r['INGRESOS OPERACIONALES'])
            ganancias = parse_float(r['GANANCIA (PÉRDIDA)'])
            activos = parse_float(r['TOTAL ACTIVOS'])
            pasivos = parse_float(r['TOTAL PASIVOS'])
            patrimonio = parse_float(r['TOTAL PATRIMONIO'])
            
            ciudad = r['CIUDAD DOMICILIO'].strip().upper()
            depto = r['DEPARTAMENTO DOMICILIO'].strip().upper()
            sector = r['MACROSECTOR'].strip().upper()
            name = r['RAZÓN SOCIAL'].strip()

            lat, lng, geo = get_coords(ciudad, depto)
            empleados = estimate_employees(r['NIT'], sector, ingresos, year)
            
            item = {
                "nit": r['NIT'].strip(),
                "name": name,
                "supervisor": r['SUPERVISOR'].strip(),
                "region": r['REGIÓN'].strip(),
                "dept": depto,
                "city": ciudad,
                "sector": sector,
                "ciiu": r['CIIU'].strip(),
                "ingresos": ingresos,
                "ganancias": ganancias,
                "activos": activos,
                "pasivos": pasivos,
                "patrimonio": patrimonio,
                "empleados": empleados,
                "year": year,
                "lat": lat,
                "lng": lng,
                "geo": geo
            }
            data_by_year[year].append(item)

    for yr in data_by_year:
        data_by_year[yr].sort(key=lambda x: x['ingresos'], reverse=True)
        for rank, item in enumerate(data_by_year[yr], 1):
            item['rank'] = rank

    output_file = 'data.json'
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(data_by_year, out, ensure_ascii=False, indent=None)

    # ------------------------------------------------------------------
    # Salida partida por año (es lo que consume la app).
    # Antes se servía un único data.json de 18 MB; ahora la carga inicial se
    # reduce a un índice diminuto + el año seleccionado (~3,6 MB).
    # ------------------------------------------------------------------
    out_dir = os.path.join('public', 'data')
    os.makedirs(out_dir, exist_ok=True)

    index = {
        'generatedAt': datetime.date.today().isoformat(),
        'sourceCsv': os.path.basename(csv_filename),
        'years': sorted(data_by_year, reverse=True),
        'byYear': {},
    }
    history = {}

    for yr, rows in data_by_year.items():
        with open(os.path.join(out_dir, f'{yr}.json'), 'w', encoding='utf-8') as out:
            json.dump(rows, out, ensure_ascii=False, indent=None, separators=(',', ':'))

        index['byYear'][yr] = {
            'count': len(rows),
            'ingresos': round(sum(x['ingresos'] for x in rows), 2),
            'ganancias': round(sum(x['ganancias'] for x in rows), 2),
            'activos': round(sum(x['activos'] for x in rows), 2),
            'pasivos': round(sum(x['pasivos'] for x in rows), 2),
            'patrimonio': round(sum(x['patrimonio'] for x in rows), 2),
            'perdidas': sum(1 for x in rows if x['ganancias'] < 0),
        }

        for x in rows:
            # Historial compacto: [año, rank, ingresos, ganancias, empleados]
            history.setdefault(x['nit'], []).append(
                [int(yr), x['rank'], x['ingresos'], x['ganancias'], x['empleados']])

    with open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8') as out:
        json.dump(index, out, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'history.json'), 'w', encoding='utf-8') as out:
        json.dump(history, out, ensure_ascii=False, indent=None, separators=(',', ':'))
        
    print('Resumen por año fiscal:')
    for yr in sorted(data_by_year):
        rows = data_by_year[yr]
        ingresos = sum(x['ingresos'] for x in rows)
        ganancia = sum(x['ganancias'] for x in rows)
        perdidas = sum(1 for x in rows if x['ganancias'] < 0)
        print(f'  {yr}: {len(rows):>6,} empresas | ingresos ${ingresos:>10,.2f} B | '
              f'ganancia neta ${ganancia:>8,.2f} B | con pérdida: {perdidas:,}')

    if PARSE_FAILURES:
        print(f'\nADVERTENCIA: {len(PARSE_FAILURES)} valores no se pudieron parsear:')
        for ctx, val in PARSE_FAILURES[:10]:
            print(f'  {ctx}: {val!r}')
    else:
        print('\nSin errores de parseo numérico.')

    print(f'\nOK -> {output_file} (maestro) y public/data/ (índice, historial y un archivo por año)')
    total_emp = sum(EMP_STATS.values()) or 1
    print(f'Empleados: {EMP_STATS["ancla"]:,} registros con ancla real escalada '
          f'({EMP_STATS["ancla"] / total_emp * 100:.1f}%), '
          f'{EMP_STATS["ratio"]:,} por ratio NIIF '
          f'({EMP_STATS["ratio"] / total_emp * 100:.1f}%), '
          f'{EMP_STATS["piso"]:,} en el mínimo de 15, '
          f'{EMP_STATS["tope"]:,} en el tope.')
    total_geo = sum(GEO_STATS.values()) or 1
    print(f'Geocodificación: {GEO_STATS["city"]:,} empresas con coordenada de municipio '
          f'({GEO_STATS["city"] / total_geo * 100:.1f}%), '
          f'{GEO_STATS["dept"]:,} al centroide del departamento '
          f'({GEO_STATS["dept"] / total_geo * 100:.1f}%), '
          f'{GEO_STATS["default"]:,} sin ubicar.')

if __name__ == '__main__':
    process_data()
