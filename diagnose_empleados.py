"""Diagnóstico: por qué los empleados no cambian entre años."""
import glob
import json
import os
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

from prepare_data import KNOWN_HEADCOUNTS, SECTOR_REVENUE_PER_EMP, norm

archivos = sorted(glob.glob(os.path.join('public', 'data', '20*.json')))
data = {os.path.basename(f)[:4]: json.load(open(f, encoding='utf-8')) for f in archivos}
anios = sorted(data.keys())
print('Años analizados:', ', '.join(anios))

series = defaultdict(dict)
ingresos = defaultdict(dict)
nombres = {}
sectores = {}
for yr, rows in data.items():
    for c in rows:
        series[c['nit']][yr] = c['empleados']
        ingresos[c['nit']][yr] = c['ingresos']
        nombres[c['nit']] = c['name']
        sectores[c['nit']] = c['sector']

completos = {n: s for n, s in series.items() if len(s) == len(anios)}
print(f'Empresas presentes en los {len(anios)} años: {len(completos):,}')

planos = [n for n, s in completos.items() if len(set(s.values())) == 1]
varian = [n for n, s in completos.items() if len(set(s.values())) > 1]
print(f'  empleados IDENTICOS todos los años : {len(planos):,}')
print(f'  empleados que VARIAN por año       : {len(varian):,}')

print()
print('=' * 76)
print('CAUSA 1: lista fija KNOWN_HEADCOUNTS (mismo valor para todos los años)')
print('=' * 76)
claves_norm = [norm(k) for k in KNOWN_HEADCOUNTS]


def coincide_fijo(nombre):
    n = norm(nombre)
    return any(k in n for k in claves_norm)


fijos = [n for n in planos if coincide_fijo(nombres[n])]
print(f'  Empresas planas explicadas por la lista fija: {len(fijos)}')
for n in sorted(fijos, key=lambda x: -completos[x][anios[-1]])[:12]:
    print(f'    {nombres[n][:42]:<44} {completos[n]}')

print()
print('=' * 76)
print('CAUSA 2: el emparejamiento por nombre falla con tildes')
print('=' * 76)
print('  Con comparación CRUDA (la que usa el script actual):')
crudas = [n for n in planos if any(k in nombres[n].upper() for k in KNOWN_HEADCOUNTS)]
print(f'    empresas que reciben valor real ...: {len(crudas)}')
print('  Con comparación NORMALIZADA (sin tildes):')
print(f'    empresas que recibirian valor real : {len(fijos)}')
perdidas = [n for n in fijos if n not in crudas]
print(f'    -> {len(perdidas)} empresas PIERDEN su valor real por la tilde:')
for n in perdidas:
    print(f'       {nombres[n][:46]:<48} estimado={completos[n][anios[-1]]:,}')

print()
print('=' * 76)
print('CAUSA 3: topes del estimador (15 y 60.000)')
print('=' * 76)
for yr in anios:
    tope_alto = [c for c in data[yr] if c['empleados'] == 60000]
    tope_bajo = [c for c in data[yr] if c['empleados'] == 15]
    print(f'  {yr}: {len(tope_alto):>3} empresas en el tope de 60.000 | {len(tope_bajo):>4} en el minimo de 15')
print()
print('  Empresas pegadas en 60.000 (2025) — el estimador las esta saturando:')
for c in [c for c in data[anios[-1]] if c['empleados'] == 60000][:8]:
    print(f'    {c["name"][:44]:<46} ingresos=${c["ingresos"]:>8} B  sector={c["sector"]}')

print()
print('=' * 76)
print('IMPACTO EN EL KPI "EMPLEOS GENERADOS"')
print('=' * 76)
for yr in anios:
    total = sum(c['empleados'] for c in data[yr])
    suma_fijos = sum(c['empleados'] for c in data[yr] if coincide_fijo(c['name']))
    print(f'  {yr}: total {total:>9,} | de empresas con valor fijo: {suma_fijos:>8,} '
          f'({suma_fijos/total*100:4.1f}%)')
print()
print(f'  Total 2025 vs 2024: {sum(c["empleados"] for c in data["2025"]):,} vs '
      f'{sum(c["empleados"] for c in data["2024"]):,}')
print('  (los ingresos totales si cambiaron: 1852.83 vs 1764.13 B COP)')
