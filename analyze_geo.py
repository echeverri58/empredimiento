"""Diagnóstico de geocodificación: cobertura de municipios y departamentos.

Uso:  python analyze_geo.py
Revisa el CSV más reciente del dataset y reporta qué proporción de empresas
recibe una coordenada real de municipio y cuáles caen al centroide del
departamento. Sirve para medir el efecto de ampliar las tablas de coordenadas.
"""
import csv
import glob
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

from prepare_data import (
    CITY_LOOKUP, DEPT_LOOKUP, CITY_ALIASES, DEPT_ALIASES, norm, CSV_PATTERN,
)

YEAR = sys.argv[1] if len(sys.argv) > 1 else '2025'
path = sorted(glob.glob(CSV_PATTERN))[-1]
print(f'CSV analizado: {path}')
print(f'Año fiscal   : {YEAR}\n')


def resolver(ciudad, depto):
    """Réplica de get_coords(): devuelve 'city', 'dept' o 'default'."""
    c = norm(ciudad)
    d = norm(depto)
    if CITY_LOOKUP.get(c) or CITY_LOOKUP.get(norm(CITY_ALIASES.get(c, ''))):
        return 'city'
    key = DEPT_ALIASES.get(d, d)
    if DEPT_LOOKUP.get(key) or DEPT_LOOKUP.get(d):
        return 'dept'
    return 'default'


dept_counts = Counter()
city_counts = Counter()
city_dept = {}
origen = Counter()
mal_ubicadas = Counter()

with open(path, encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        if r['Año de Corte'].replace(',', '').strip() != YEAR:
            continue
        ciudad = r['CIUDAD DOMICILIO'].strip().upper()
        depto = r['DEPARTAMENTO DOMICILIO'].strip().upper()
        dept_counts[depto] += 1
        city_counts[ciudad] += 1
        city_dept.setdefault(ciudad, depto)

        o = resolver(ciudad, depto)
        origen[o] += 1
        if o == 'default':
            mal_ubicadas[ciudad] += 1

total = sum(origen.values()) or 1

print('=' * 70)
print('COBERTURA DE GEOCODIFICACIÓN')
print('=' * 70)
print(f'  coordenada real de municipio : {origen["city"]:>7,}  ({origen["city"]/total*100:5.1f}%)')
print(f'  centroide del departamento   : {origen["dept"]:>7,}  ({origen["dept"]/total*100:5.1f}%)')
print(f'  sin ubicar (Bogotá por def.) : {origen["default"]:>7,}  ({origen["default"]/total*100:5.1f}%)')
print(f'  TOTAL                        : {total:>7,}')

print()
print('=' * 70)
print(f'DEPARTAMENTOS en {YEAR}: {len(dept_counts)}')
print('=' * 70)
sin_dept = [d for d in dept_counts if resolver('', d) == 'default']
for d, n in dept_counts.most_common():
    marca = '  <-- SIN COORDENADA' if d in sin_dept else ''
    print(f'  {d:<26} {n:>5,}{marca}')
if not sin_dept:
    print('\n  100% de los departamentos tienen coordenada.')

print()
print('=' * 70)
print(f'CIUDADES en {YEAR}: {len(city_counts)}')
print('=' * 70)
sin_ciudad = [c for c in city_counts if resolver(c, city_dept.get(c, '')) != 'city']
print(f'  con coordenada propia : {len(city_counts) - len(sin_ciudad)}')
print(f'  sin coordenada propia : {len(sin_ciudad)}')

if mal_ubicadas:
    print('\nCiudades que caerían en Bogotá por defecto (debería ser 0):')
    for c, n in mal_ubicadas.most_common(20):
        print(f'  {c:<28} {city_dept.get(c, "?"):<20} {n:>4}')
else:
    print('\nNinguna ciudad cae en Bogotá por defecto.')

if sin_ciudad:
    print('\nTOP 20 ciudades sin coordenada propia (usan centroide departamental):')
    for c in sorted(sin_ciudad, key=lambda x: -city_counts[x])[:20]:
        print(f'  {c:<28} {city_dept.get(c, "?"):<20} {city_counts[c]:>4}')
