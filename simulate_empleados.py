"""Compara el metodo actual con las dos alternativas de calculo de empleados."""
import csv
import glob
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

from prepare_data import (
    KNOWN_HEADCOUNTS, SECTOR_REVENUE_PER_EMP, parse_float, norm, CSV_PATTERN,
)

CSV = sorted(glob.glob(CSV_PATTERN))[-1]
FILAS = []
with open(CSV, encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        FILAS.append({
            'year': r['Año de Corte'].replace(',', '').strip(),
            'nit': r['NIT'].strip(),
            'name': r['RAZÓN SOCIAL'].strip(),
            'sector': r['MACROSECTOR'].strip().upper(),
            'ingresos': parse_float(r['INGRESOS OPERACIONALES']),
        })
print(f'CSV: {CSV}')
print(f'Filas: {len(FILAS):,}\n')

CLAVES = [norm(k) for k in KNOWN_HEADCOUNTS]


def tiene_ancla(nombre):
    n = norm(nombre)
    return any(k in n for k in CLAVES)


def actual(row):
    """Metodo que usa hoy el script: lista fija primero, luego ratio."""
    n = row['name'].upper()
    for k, v in KNOWN_HEADCOUNTS.items():
        if k in n:
            return v
    return max(15, min(60000, int(row['ingresos'] / SECTOR_REVENUE_PER_EMP.get(row['sector'], 0.0004))))


def solo_ratio(row, tope=250000):
    """Opcion A: el ratio NIIF decide SIEMPRE (sin lista fija)."""
    if row['ingresos'] <= 0:
        return 50
    return max(15, min(tope, int(row['ingresos'] / SECTOR_REVENUE_PER_EMP.get(row['sector'], 0.0004))))


# ancla de referencia por empresa (se usa en 2024) para la opcion B
ANIO_ANCLA = '2024'
ing_ancla = {}
for r in FILAS:
    if r['year'] == ANIO_ANCLA and tiene_ancla(r['name']):
        for k, v in KNOWN_HEADCOUNTS.items():
            if k in r['name'].upper() or norm(k) in norm(r['name']):
                ing_ancla.setdefault(norm(k), []).append((r['ingresos'], v, r['name']))

mejor = {}
for k, lista in ing_ancla.items():
    ingresos, valor, nombre = max(lista)
    mejor[k] = (ingresos, valor, nombre)


def escalado(row, tope=250000):
    """Opcion B: el valor real publicado se escala por ingresos cada ano."""
    n = norm(row['name'])
    for k in CLAVES:
        if k in n and k in mejor:
            ing_ref, valor_ref, _ = mejor[k]
            if ing_ref > 0:
                est = int(round(valor_ref * row['ingresos'] / ing_ref))
                return max(15, min(tope, est))
    return solo_ratio(row, tope)


def resumen(nombre, fn):
    series = defaultdict(dict)
    for r in FILAS:
        series[r['nit']][r['year']] = fn(r)
    anios = sorted({r['year'] for r in FILAS})
    completos = {n: s for n, s in series.items() if len(s) == len(anios)}
    planos = [n for n, s in completos.items() if len(set(s.values())) == 1]
    totales = {y: sum(series[n][y] for n in series if y in series[n]) for y in anios}
    print('=' * 74)
    print(nombre)
    print('=' * 74)
    print(f'  empresas planas (iguales los 5 anos): {len(planos):,} de {len(completos):,}')
    for y in anios:
        print(f'    {y}: total {totales[y]:>10,} empleos')
    return series


s_act = resumen('METODO ACTUAL (lista fija + ratio)', actual)
print()
s_rat = resumen('OPCION A: solo ratio NIIF', solo_ratio)
print()
s_esc = resumen('OPCION B: valores reales escalados por ingresos', escalado)

print()
print('=' * 74)
print('COMO QUEDA CADA EMPRESA EMBLEMATICA')
print('=' * 74)
anios = sorted({r['year'] for r in FILAS})
nombres = {r['nit']: r['name'] for r in FILAS}
clave = {}
for r in FILAS:
    if r['year'] == '2025':
        clave[nit := r['nit']] = r['name']

objetivo = ['ECOPETROL', 'ORGANIZACIÓN TERPEL', 'EMPRESAS PÚBLICAS DE MEDELLÍN',
            'COMUNICACIÓN CELULAR', 'D1 S.A.S.', 'GRUPO NUTRESA', 'ALMACENES EXITO',
            'REFINERIA DE CARTAGENA']
for patron in objetivo:
    hits = [n for n in s_act if norm(patron) in norm(nombres.get(n, ''))]
    if not hits:
        continue
    n = max(hits, key=lambda x: s_act[x][anios[-1]])
    print(f'\n  {nombres[n][:46]}')
    for etiqueta, s in (('actual', s_act), ('solo ratio', s_rat), ('escalado', s_esc)):
        print(f'    {etiqueta:<11}: ' + '  '.join(f'{y}={s[n][y]:>7,}' for y in anios))
