import csv
import json
import os
import sys

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

def parse_float(val):
    if not val:
        return 0.0
    val = val.replace('$', '').replace(',', '').strip()
    try:
        return round(float(val), 2)
    except ValueError:
        return 0.0

def get_coords(city, dept):
    c_clean = city.strip().upper()
    d_clean = dept.strip().upper()
    if c_clean in CITY_COORDS:
        return CITY_COORDS[c_clean]["lat"], CITY_COORDS[c_clean]["lng"]
    for k, v in CITY_COORDS.items():
        if k in c_clean or c_clean in k:
            return v["lat"], v["lng"]
    if d_clean in DEPT_COORDS:
        return DEPT_COORDS[d_clean]["lat"], DEPT_COORDS[d_clean]["lng"]
    return 4.7110, -74.0721

def estimate_employees(name, sector, ingresos):
    name_upper = name.upper()
    for k, count in KNOWN_HEADCOUNTS.items():
        if k in name_upper:
            return count

    rev_per_emp = SECTOR_REVENUE_PER_EMP.get(sector, 0.0004)
    if ingresos <= 0:
        return 50
    estimated = int(ingresos / rev_per_emp)
    return max(15, min(60000, estimated))

def process_data():
    csv_filename = '10.000_Empresas_mas_Grandes_del_País_20260821.csv'
    data_by_year = {}
    
    with open(csv_filename, mode='r', encoding='utf-8') as f:
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

            lat, lng = get_coords(ciudad, depto)
            empleados = estimate_employees(name, sector, ingresos)
            
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
                "lng": lng
            }
            data_by_year[year].append(item)

    for yr in data_by_year:
        data_by_year[yr].sort(key=lambda x: x['ingresos'], reverse=True)
        for rank, item in enumerate(data_by_year[yr], 1):
            item['rank'] = rank

    output_file = 'data.json'
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(data_by_year, out, ensure_ascii=False, indent=None)

    # Copy to public folder as well
    with open('public/data.json', 'w', encoding='utf-8') as out:
        json.dump(data_by_year, out, ensure_ascii=False, indent=None)
        
    print(f"Data processed successfully with employee estimates! Output written to {output_file} and public/data.json.")

if __name__ == '__main__':
    process_data()
