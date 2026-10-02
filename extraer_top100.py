"""Extrae las 100 empresas mas grandes por ingresos y su serie 2021-2025."""
import glob
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from prepare_data import KNOWN_HEADCOUNTS, norm

archivos = sorted(glob.glob(os.path.join('public', 'data', '20*.json')))
data = {os.path.basename(f)[:4]: json.load(open(f, encoding='utf-8')) for f in archivos}
anios = sorted(data.keys())

ingresos = {}
info = {}
for yr in anios:
    for c in data[yr]:
        ingresos.setdefault(c['nit'], {})[yr] = c['ingresos']
        if yr == anios[-1]:
            info[c['nit']] = c

claves = [norm(k) for k in KNOWN_HEADCOUNTS]
ya_tiene = []
top = []
for rank, c in enumerate(data[anios[-1]][:100], 1):
    nit = c['nit']
    serie = ingresos.get(nit, {})
    tiene = any(k in norm(c['name']) for k in claves)
    if tiene:
        ya_tiene.append(c['name'])
    top.append((rank, c['name'], c['nit'], c['sector'], serie))

print(f'TOP 100 ({anios[-1]}) — {len(top)} empresas')
print(f'Ya tienen ancla en KNOWN_HEADCOUNTS: {len(ya_tiene)}')
print()
print('rank|nombre|nit|sector|ingresos por anio')
for rank, nombre, nit, sector, serie in top:
    s = ' '.join(f'{y}:{serie.get(y, 0)}' for y in anios)
    print(f'{rank}|{nombre}|{nit}|{sector}|{s}')

with open('top100_para_rastreo.json', 'w', encoding='utf-8') as f:
    json.dump([{'rank': r, 'name': n, 'nit': nit, 'sector': s, 'ingresos': serie}
               for r, n, nit, s, serie in top], f, ensure_ascii=False, indent=1)
print()
print('-> guardado en top100_para_rastreo.json')
