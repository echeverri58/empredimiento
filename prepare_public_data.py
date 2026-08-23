import csv
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

CITY_COORDS = {
    "BOGOTA": {"lat": 4.7110, "lng": -74.0721, "dept": "BOGOTA D.C."},
    "MEDELLIN": {"lat": 6.2442, "lng": -75.5812, "dept": "ANTIOQUIA"},
    "CALI": {"lat": 3.4516, "lng": -76.5320, "dept": "VALLE"},
    "BARRANQUILLA": {"lat": 10.9685, "lng": -74.7813, "dept": "ATLANTICO"},
    "BUCARAMANGA": {"lat": 7.1254, "lng": -73.1198, "dept": "SANTANDER"},
    "CARTAGENA": {"lat": 10.3997, "lng": -75.5144, "dept": "BOLIVAR"},
    "MANIZALES": {"lat": 5.0689, "lng": -75.5174, "dept": "CALDAS"},
    "CUCUTA": {"lat": 7.8939, "lng": -72.5078, "dept": "NORTE DE SANTANDER"},
    "PASTO": {"lat": 1.2136, "lng": -77.2811, "dept": "NARINO"},
    "VALLEDUPAR": {"lat": 10.4631, "lng": -73.2532, "dept": "CESAR"},
    "VILLAVICENCIO": {"lat": 4.1420, "lng": -73.6266, "dept": "META"},
    "MONTERIA": {"lat": 8.7480, "lng": -75.8814, "dept": "CORDOBA"}
}

def parse_int(val):
    if not val:
        return 0
    try:
        return int(float(str(val).strip()))
    except ValueError:
        return 0

def get_coords(lat_str, lng_str, city_name):
    try:
        lat = float(lat_str)
        lng = float(lng_str)
        if lat != 0 and lng != 0:
            return lat, lng
    except (ValueError, TypeError):
        pass
    
    city_upper = city_name.upper()
    for k, v in CITY_COORDS.items():
        if k in city_upper:
            return v["lat"], v["lng"]
            
    return 4.7110, -74.0721

def process_public_entities():
    csv_filename = 'Cantidad_de_empleos_y_tipos_de_planta_por_entidad_20260813.csv'
    entities = []

    with open(csv_filename, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            code = r.get('Código SIGEP', '').strip()
            name = r.get('Nombre de la entidad', '').strip()
            orden = r.get('Orden', '').strip()
            clasificacion = r.get('Clasificación Orgánica', '').strip()
            nivel = r.get('Nivel', '').strip()
            sector = r.get('Sector', '').strip()
            tipo_vinculacion = r.get('Tipo de Vinculacíón ', '').strip()
            naturaleza = r.get('Naturaleza jurídica ', '').strip()
            year = r.get('Año', '2025').strip()
            fuente = r.get('Fuente ', '').strip()

            # Quantities by plant type
            planta_permanente = parse_int(r.get('Cantidad de cargos en Planta Permanente', 0))
            planta_temporal = parse_int(r.get('Cantidad de cargos de Planta-Regimen General: Planta Temporal', 0))
            planta_transitoria = parse_int(r.get('Cantidad de cargos en Planta Transitoria', 0))
            trabajadores_oficiales = parse_int(r.get('Cantidad de cargos de Planta-Trabajadores Oficiales', 0))
            planta_privada = parse_int(r.get('Cantidad de cargos en Planta Privada ', 0))
            docentes = parse_int(r.get('Cantidad de cargos de Planta-Docentes: ESAP, Institutos Tecnológicos', 0))
            total_cargos = parse_int(r.get('Cantidad total de cargos en Planta ', 0))

            # Quantities by appointment type
            libre_nombramiento = parse_int(r.get('Libre Nombramiento y Remoción', 0))
            carrera_adm = parse_int(r.get('Carrera administrativa', 0))
            periodo_fijo = parse_int(r.get('Periodo Fijo ', 0))
            temporal = parse_int(r.get('Temporal', 0))
            carrera_diplomatica = parse_int(r.get('Carrera Diplomatica', 0))
            docentes_app = parse_int(r.get('Docentes', 0))
            trabajadores_ofic_app = parse_int(r.get('Trabajadores Ofciales ', 0))
            planta_priv_app = parse_int(r.get('Planta Privada', 0))
            instructores = parse_int(r.get('Instructores', 0))
            eleccion_popular = parse_int(r.get('Elección Popular', 0))

            lat, lng = get_coords(r.get('Latitud', ''), r.get('Longitud', ''), name)

            if total_cargos == 0:
                total_cargos = planta_permanente + planta_temporal + trabajadores_oficiales + docentes + planta_privada + planta_transitoria

            item = {
                "code": code,
                "name": name,
                "orden": orden,
                "clasificacion": clasificacion,
                "nivel": nivel,
                "sector": sector,
                "tipoVinculacion": tipo_vinculacion,
                "naturaleza": naturaleza,
                "year": year,
                "fuente": fuente,
                "totalCargos": total_cargos,
                "plantaPermanente": planta_permanente,
                "plantaTemporal": planta_temporal,
                "plantaTransitoria": planta_transitoria,
                "trabajadoresOficiales": trabajadores_oficiales,
                "plantaPrivada": planta_privada,
                "docentes": docentes,
                "libreNombramiento": libre_nombramiento,
                "carreraAdministrativa": carrera_adm,
                "periodoFijo": periodo_fijo,
                "temporal": temporal,
                "instructores": instructores,
                "eleccionPopular": eleccion_popular,
                "lat": lat,
                "lng": lng
            }
            entities.append(item)

    # Sort descending by total headcount
    entities.sort(key=lambda x: x['totalCargos'], reverse=True)
    for rank, item in enumerate(entities, 1):
        item['rank'] = rank

    output_file = 'public_entities.json'
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(entities, out, ensure_ascii=False, indent=None)

    os.makedirs('public', exist_ok=True)
    with open('public/public_entities.json', 'w', encoding='utf-8') as out:
        json.dump(entities, out, ensure_ascii=False, indent=None)

    print(f"Public entities data processed successfully! Total records: {len(entities)}")
    print(f"Top 1: {entities[0]['name']} ({entities[0]['totalCargos']:,} cargos)")
    print(f"Top 2: {entities[1]['name']} ({entities[1]['totalCargos']:,} cargos)")

if __name__ == '__main__':
    process_public_entities()
