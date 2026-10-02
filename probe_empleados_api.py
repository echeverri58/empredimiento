"""Prueba si existe dato REAL de empleados por NIT para las grandes empresas."""
import json
import re
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

B = 'https://www.datos.gov.co/resource/'


def api(path, **params):
    url = B + path + '.json'
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode('utf-8'))


data = json.load(open('public/data/2025.json', encoding='utf-8'))
objetivo = {}
for c in data[:15]:
    d = re.sub(r'\D', '', c['nit'])
    objetivo[d] = (c['name'], c['ingresos'])

print('NITs de prueba (top 6 de 2025):')
for d, (n, i) in list(objetivo.items())[:6]:
    print('   %-12s %s  ($%s B)' % (d, n[:44], i))

CAND = [
    ('dvkz-vw2v', 'nit', 'personal', 'ult_ano_ren'),
    ('j8w2-u75f', 'nit', 'personal', 'ult_ano_ren'),
    ('p39t-z7qc', 'identificacion', 'personal', 'ult_ano_ren'),
    ('we9a-3bys', 'nit', 'personal_ocupado', 'periodo'),
]

for ds, cnit, cpers, cyear in CAND:
    print()
    print('=' * 74)
    print('DATASET', ds)
    print('=' * 74)
    try:
        c = api(ds, **{'$select': 'count(*)'})
        print('  filas totales en el dataset:', c[0].get('count'))
    except Exception as e:
        print('  count ERROR:', e)
        continue

    lista = "','".join(objetivo.keys())
    where = "%s in('%s')" % (cnit, lista)
    try:
        rows = api(ds, **{'$where': where, '$limit': 400})
    except Exception as e:
        print('  consulta ERROR:', e)
        continue

    print('  coincidencias con el top 15 de Colombia:', len(rows))
    for r in rows[:15]:
        nit = re.sub(r'\D', '', str(r.get(cnit, '')))
        nombre = objetivo.get(nit, ('(no esta en el top)', None))[0]
        print('    %-40s nit=%-12s personal=%-8s %s=%s' % (
            nombre[:40], nit, r.get(cpers), cyear, r.get(cyear, '')))
