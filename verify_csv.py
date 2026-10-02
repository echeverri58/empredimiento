"""Verificación de calidad del CSV nuevo antes de regenerar data.json."""
import csv
import re
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

NUEVO = '10.000_Empresas_mas_Grandes_del_País_20261002.csv'
VIEJO = '10.000_Empresas_mas_Grandes_del_País_20260821.csv'

NUM_COLS = [
    'INGRESOS OPERACIONALES', 'GANANCIA (PÉRDIDA)',
    'TOTAL ACTIVOS', 'TOTAL PASIVOS', 'TOTAL PATRIMONIO',
]


def parse_float_viejo(val):
    """Réplica exacta de prepare_data.py actual."""
    if not val:
        return 0.0
    val = val.replace('$', '').replace(',', '').strip()
    try:
        return round(float(val), 2)
    except ValueError:
        return 0.0


def parse_float_nuevo(val):
    """Parseo robusto: quita todo espacio y normaliza el signo."""
    if not val:
        return 0.0
    s = val.replace('$', '').replace(',', '')
    s = re.sub(r'\s+', '', s)
    if s in ('', '-', '+'):
        return 0.0
    try:
        return round(float(s), 2)
    except ValueError:
        return 0.0


def muestra_formatos(path, n=4000):
    """Muestras de cadenas crudas para ver el formato real."""
    patrones = {'positivo': None, 'negativo': None, 'cero': None}
    formatos = Counter()
    with open(path, encoding='utf-8') as f:
        for i, r in enumerate(csv.DictReader(f)):
            if i >= n:
                break
            v = r['GANANCIA (PÉRDIDA)']
            if v.strip().startswith('-') and patrones['negativo'] is None:
                patrones['negativo'] = repr(v)
            elif v.strip().startswith('$') and patrones['positivo'] is None:
                patrones['positivo'] = repr(v)
            # firma del formato: dónde está el signo respecto al $
            firma = re.sub(r'\d', '#', v.strip())
            formatos[firma] += 1
    return patrones, formatos


def escanear(path):
    """Totales por año + cuántos negativos se perderían con el parseo viejo."""
    totales = defaultdict(lambda: defaultdict(float))
    perdidos = Counter()          # filas con pérdida convertidas en 0.00
    negativos_reales = Counter()  # filas realmente negativas
    count = Counter()
    ejemplos = []
    with open(path, encoding='utf-8') as f:
        for r in csv.DictReader(f):
            yr = r['Año de Corte'].replace(',', '').strip()
            count[yr] += 1
            for col in NUM_COLS:
                totales[yr][col] += parse_float_nuevo(r[col])
            g_raw = r['GANANCIA (PÉRDIDA)']
            g_new = parse_float_nuevo(g_raw)
            if g_new < 0:
                negativos_reales[yr] += 1
                if len(ejemplos) < 5:
                    ejemplos.append((yr, r['RAZÓN SOCIAL'][:38], repr(g_raw), g_new))
            if parse_float_viejo(g_raw) == 0.0 and g_new != 0.0:
                perdidos[yr] += 1
    return totales, count, perdidos, negativos_reales, ejemplos


print('=' * 72)
print('1) FORMATO DE LAS CADENAS NUMÉRICAS')
print('=' * 72)
for etiqueta, path in (('VIEJO (2021-2024)', VIEJO), ('NUEVO (2021-2025)', NUEVO)):
    patrones, formatos = muestra_formatos(path)
    print(f'\n--- {etiqueta} ---')
    print(f'  primer positivo : {patrones["positivo"]}')
    print(f'  primer negativo : {patrones["negativo"]}')

print()
print('=' * 72)
print('2) IMPACTO DEL BUG DE PARSEO (pérdidas -> 0.00)')
print('=' * 72)
for etiqueta, path in (('VIEJO', VIEJO), ('NUEVO', NUEVO)):
    totales, count, perdidos, neg, ejemplos = escanear(path)
    print(f'\n--- {etiqueta} ---')
    for yr in sorted(count):
        print(f'  {yr}: {count[yr]:>6,} filas | pérdidas reales: {neg[yr]:>5,} '
              f'| se perderían (->0.00): {perdidos[yr]:>5,}')
    if ejemplos:
        print('  ejemplos de pérdidas:')
        for yr, nombre, raw, val in ejemplos:
            print(f'    {yr} {nombre:<38} {raw:<14} -> {val}')

print()
print('=' * 72)
print('3) VALIDACIÓN CONTRA CIFRA OFICIAL (cierre 2025)')
print('=' * 72)
print('  Oficial Supersociedades: ingresos $1.852,9 billones | utilidades $138,1 billones')
totales, count, _, _, _ = escanear(NUEVO)
t25 = totales['2025']
print(f'  Calculado en el CSV   : ingresos ${t25["INGRESOS OPERACIONALES"]:,.2f} B '
      f'| ganancia ${t25["GANANCIA (PÉRDIDA)"]:,.2f} B')
print(f'  Activos 2025: ${t25["TOTAL ACTIVOS"]:,.2f} B | '
      f'Pasivos: ${t25["TOTAL PASIVOS"]:,.2f} B | '
      f'Patrimonio: ${t25["TOTAL PATRIMONIO"]:,.2f} B')

print()
print('=' * 72)
print('4) ¿SE REVISARON LAS CIFRAS HISTÓRICAS? (2024 viejo vs nuevo)')
print('=' * 72)
tv, _, _, _, _ = escanear(VIEJO)
for yr in ('2021', '2022', '2023', '2024'):
    a = tv[yr]['INGRESOS OPERACIONALES']
    b = totales[yr]['INGRESOS OPERACIONALES']
    flag = 'IGUAL' if abs(a - b) < 0.01 else f'DIFERENTE (delta {b - a:+,.2f})'
    print(f'  {yr}: viejo ${a:>10,.2f} B | nuevo ${b:>10,.2f} B -> {flag}')
