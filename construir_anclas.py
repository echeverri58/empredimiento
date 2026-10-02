"""Consolida el rastreo de empleados en empleados_anclas.json.

Lee todos los JSON de la carpeta rastreo/ y cruza cada resultado con el top 100
POR NOMBRE (no por posicion: los lotes tienen tamanos distintos).

Valida y descarta:
  - empleados debe ser entero positivo
  - el año de la cifra debe existir en el dataset (2021-2025)
  - debe traer URL de fuente
  - se descartan cifras de alcance global (no comparables con ingresos
    solo-Colombia) y las de confianza baja/nula
"""
import glob
import json
import os
import re
import sys
import unicodedata
from datetime import date

sys.stdout.reconfigure(encoding='utf-8')

from prepare_data import SECTOR_REVENUE_PER_EMP

RASTREO_DIR = 'rastreo'
TOP = json.load(open('top100_para_rastreo.json', encoding='utf-8'))

CONFIANZAS_OK = {'alta', 'media-alta', 'media'}


def solo_digitos(t):
    return re.sub(r'\D', '', str(t or ''))


def norm(t):
    """Normaliza para comparar nombres: sin tildes, sin puntos ni guiones.

    Los puntos se ELIMINAN (no se vuelven espacios) para que 'S.C.A.' quede
    como 'SCA' y empareje con 'SCA' del dataset.
    """
    t = unicodedata.normalize('NFKD', str(t or '').upper())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    t = t.replace('.', '').replace('-', ' ').replace('/', ' ')
    t = re.sub(r'[^A-Z0-9 ]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()


TOP_NORM = [(ref, norm(ref['name'])) for ref in TOP]


def emparejar(nombre):
    """Encuentra la empresa del top 100 correspondiente al nombre reportado."""
    n = norm(nombre)
    if not n:
        return None
    for ref, rn in TOP_NORM:                      # exacto
        if rn == n:
            return ref
    for ref, rn in TOP_NORM:                      # uno contiene al otro
        if len(n) > 6 and (n in rn or rn in n):
            return ref
    toks = set(n.split())
    mejor, score = None, 0.0                     # solapamiento de palabras
    for ref, rn in TOP_NORM:
        rt = set(rn.split())
        s = len(toks & rt) / max(1, len(toks | rt))
        if s > score:
            mejor, score = ref, s
    return mejor if score >= 0.5 else None


archivos = sorted(glob.glob(os.path.join(RASTREO_DIR, '*.json')))
if not archivos:
    raise SystemExit(f'No hay archivos en {RASTREO_DIR}/')

anclas = {}
rechazos, globales, sin_dato, sospechosas, no_emparejadas = [], [], [], [], []

for path in archivos:
    try:
        with open(path, encoding='utf-8') as f:
            payload = json.load(f)
    except Exception as e:
        rechazos.append((os.path.basename(path), f'JSON invalido: {e}'))
        continue
    resultados = payload.get('resultados', payload if isinstance(payload, list) else [])

    for res in resultados:
        nombre = res.get('nombre', '')
        ref = emparejar(nombre)
        if not ref:
            no_emparejadas.append(nombre)
            continue
        nit = solo_digitos(ref['nit'])

        emp = res.get('empleados')
        if emp in (None, '', 0):
            sin_dato.append(ref['name'])
            continue
        try:
            emp = int(float(emp))
        except (TypeError, ValueError):
            rechazos.append((ref['name'], f'empleados no numerico: {emp!r}'))
            continue

        if str(res.get('alcance', 'colombia')).lower() != 'colombia':
            globales.append((ref['name'], emp, res.get('alcance')))
            continue

        fuente = str(res.get('fuente', '')).strip()
        if not fuente.startswith('http'):
            rechazos.append((ref['name'], f'sin URL de fuente'))
            continue

        conf = str(res.get('confianza', '')).lower().strip()
        if conf not in CONFIANZAS_OK:
            rechazos.append((ref['name'], f'confianza no aceptada: {conf!r}'))
            continue

        try:
            anio = int(res.get('anio'))
        except (TypeError, ValueError):
            rechazos.append((ref['name'], f'año invalido: {res.get("anio")!r}'))
            continue
        if str(anio) not in ref['ingresos']:
            rechazos.append((ref['name'], f'año {anio} no esta en el dataset'))
            continue

        ing = ref['ingresos'][str(anio)]
        por_emp = ing / emp if emp else 0
        esperado = SECTOR_REVENUE_PER_EMP.get(ref['sector'], 0.0004)
        factor = por_emp / esperado if esperado else 0

        nota = str(res.get('nota', '') or '').strip()
        if factor > 15 or factor < 0.1:
            sospechosas.append((ref['name'], emp, anio, round(por_emp * 1000, 1), round(factor, 1)))
            nota = (nota + ' [revisar: facturacion por empleado atipica]').strip()

        anclas[nit] = {
            'nombre': ref['name'], 'empleados': emp, 'anio': anio,
            'alcance': 'colombia', 'fuente': fuente, 'confianza': conf, 'nota': nota,
        }

salida = {
    'generado': date.today().isoformat(),
    'metodo': ('Cifras reales publicadas para las mayores empresas: se usan en su año de '
               'referencia y se escalan por ingresos en los demas años. El resto de las '
               '10.000 empresas usa el ratio NIIF de facturacion por empleado del macrosector.'),
    'anclas': anclas,
}
with open('empleados_anclas.json', 'w', encoding='utf-8') as f:
    json.dump(salida, f, ensure_ascii=False, indent=1)

print('=' * 76)
print(f'ANCLAS ACEPTADAS: {len(anclas)}')
print('=' * 76)
for nit, a in sorted(anclas.items(), key=lambda x: -x[1]['empleados']):
    print(f"  {a['nombre'][:40]:<42} {a['empleados']:>7,} ({a['anio']}, {a['confianza']})")

print()
print(f'Sin dato encontrado              : {len(set(sin_dato))}')
print(f'Descartadas por alcance global   : {len(globales)}')
for n, e, a in globales:
    print(f'   {n[:44]:<46} {e:,} ({a})')
print(f'Descartadas por confianza/fuente : {len(rechazos)}')
for n, r in rechazos:
    print(f'   {n[:44]:<46} {r}')
if no_emparejadas:
    print(f'Nombres que no se pudieron cruzar: {len(no_emparejadas)}')
    for n in no_emparejadas:
        print(f'   {n}')
if sospechosas:
    print(f'Marcadas para revisar            : {len(sospechosas)}')
    for n, e, a, pe, f in sospechosas:
        print(f'   {n[:40]:<42} {e:>7,} ({a}) -> ${pe:,.1f} M COP/empleado (x{f} vs sector)')

print()
print(f'-> empleados_anclas.json con {len(anclas)} anclas reales')
