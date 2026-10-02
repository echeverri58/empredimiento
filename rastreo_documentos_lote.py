"""Fase 2: procesa los documentos cuyas URLs recolectaron los investigadores.

Lee rastreo/urls_*.json, descarga cada documento, extrae el texto y busca
candidatos de cifra de empleados con puntuacion por proximidad a la palabra
clave. Incluye un caso especial para Ecopetrol: su formulario 20-F ante la SEC
trae una tabla oficial 'Number of employees'.
"""
import json
import os
import re
import sys
import tempfile
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

UA = {'User-Agent': 'Mozilla/5.0 (compatible; AnalisisDatosColombia/1.0; contacto: echeverri58@gmail.com)'}
RASTREO = 'rastreo'
TOP = json.load(open('top100_para_rastreo.json', encoding='utf-8'))

try:
    from pypdf import PdfReader
    HAY_PYPDF = True
except ImportError:
    HAY_PYPDF = False

CLAVE_ES = r'(?:empleados|colaboradores|trabajadores|funcionarios|headcount)'
CLAVE_EN = r'(?:employees|headcount|staff)'
PATRONES = [
    r'([\d][\d.,]{2,9})\s*(?:\+\s*)?(?:mil\s+)?(?:de\s+)?' + CLAVE_ES,
    CLAVE_ES + r'[^.\n]{0,90}?([\d][\d.,]{2,9})',
    r'(?:nomina|nómina|planta de personal|fuerza laboral|talento humano|nuestro equipo)'
    r'[^.\n]{0,70}?([\d][\d.,]{2,9})',
    r'([\d][\d.,]{2,9})\s*(?:personas|colaboradores)',
    r'[Nn]umber of employees[^.\n]{0,120}?([\d][\d.,]{2,9})',
    r'([\d][\d.,]{2,9})\s*(?:full[- ]time\s+)?' + CLAVE_EN,
]


def bajar(url, destino):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r:
        ctype = r.headers.get('Content-Type', '')
        with open(destino, 'wb') as f:
            while True:
                trozo = r.read(512 * 1024)
                if not trozo:
                    break
                f.write(trozo)
    return os.path.getsize(destino), ctype


def a_entero(txt):
    limpio = re.sub(r'[^\d]', '', txt)
    if not limpio:
        return None
    val = int(limpio)
    if 1900 <= val <= 2100 or not (50 <= val <= 300000):
        return None
    return val


def extraer(destino, ctype=''):
    cabecera = open(destino, 'rb').read(4)
    if cabecera == b'%PDF' or 'pdf' in ctype.lower():
        if not HAY_PYPDF:
            return ''
        lector = PdfReader(destino)
        partes = []
        for pag in lector.pages[:400]:
            try:
                partes.append(pag.extract_text() or '')
            except Exception:
                continue
        return '\n'.join(partes)
    return open(destino, encoding='utf-8', errors='ignore').read()


def candidatos(txt):
    plano = re.sub(r'[ \t]+', ' ', txt)
    hallados = {}
    for pat in PATRONES:
        for m in re.finditer(pat, plano, re.IGNORECASE):
            val = a_entero(m.group(1))
            if val is None:
                continue
            pos = m.start()
            ctx = plano[max(0, pos - 100):pos + 130].replace('\n', ' ').strip()
            if val not in hallados or len(ctx) < len(hallados[val]):
                hallados[val] = ctx
    return sorted(hallados.items(), key=lambda kv: -kv[0])


def procesar(nombre, url, etiqueta=''):
    print(f'\n--- {nombre} {etiqueta}---')
    cache = os.path.join(RASTREO, 'cache')
    os.makedirs(cache, exist_ok=True)
    slug = re.sub(r'[^A-Za-z0-9]+', '_', nombre)[:60] or 'doc'
    tmp = os.path.join(cache, slug + '.bin')

    if os.path.exists(tmp) and os.path.getsize(tmp) > 1000:
        print(f'  en cache ({os.path.getsize(tmp) / 1024 / 1024:.1f} MB), no se re-descarga')
    else:
        try:
            tam, ctype = bajar(url, tmp)
            print(f'  descargado {tam / 1024 / 1024:.1f} MB ({ctype[:26]})')
        except Exception as e:
            print(f'  no se pudo descargar: {str(e)[:110]}')
            return None
    try:
        txt = extraer(tmp, '')
    except Exception as e:
        print(f'  error al extraer: {str(e)[:110]}')
        return None
    if not txt:
        print('  sin texto extraible')
        return None
    res = candidatos(txt)
    print(f'  candidatos plausibles: {len(res)}')
    for val, ctx in res[:6]:
        print(f'     {val:>8,}  ...{ctx[:125]}')
    return [{'valor': v, 'contexto': c} for v, c in res]


hallazgos = {}
salida_json = os.path.join(RASTREO, 'documentos_hallazgos2.json')
if os.path.exists(salida_json):          # permite reanudar sin repetir trabajo
    with open(salida_json, encoding='utf-8') as f:
        hallazgos = json.load(f)
    print(f'(reanudando: {len(hallazgos)} documentos ya procesados)')

# ---- caso especial: 20-F de Ecopetrol en la SEC (tabla oficial de empleados)
print('=' * 78)
print('CASO ESPECIAL: 20-F DE ECOPETROL (SEC)')
print('=' * 78)
try:
    req = urllib.request.Request('https://data.sec.gov/submissions/CIK0001444406.json', headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        sub = json.loads(r.read().decode('utf-8'))
    recientes = sub['filings']['recent']
    veinte_f = [(f, a, d, fe) for f, a, d, fe in zip(
        recientes['form'], recientes['accessionNumber'],
        recientes['primaryDocument'], recientes['filingDate']) if f == '20-F']
    print(f'  20-F encontrados: {len(veinte_f)}')
    for form, acc, doc, fecha in veinte_f[:2]:
        acc_limpio = acc.replace('-', '')
        url = f'https://www.sec.gov/Archives/edgar/data/1444406/{acc_limpio}/{doc}'
        print(f'  {fecha}: {url}')
        r = procesar('ECOPETROL (20-F)', url, f'{fecha} ')
        if r:
            hallazgos[f'ECOPETROL 20-F {fecha}'] = r
except Exception as e:
    print(f'  error consultando la SEC: {str(e)[:130]}')

# ---- resto de documentos recolectados por los investigadores
archivos = sorted(
    os.path.join(RASTREO, f) for f in os.listdir(RASTREO)
    if f.startswith('urls_') and f.endswith('.json')
)
if not archivos:
    print('\n(no hay archivos rastreo/urls_*.json todavia)')
for path in archivos:
    with open(path, encoding='utf-8') as f:
        payload = json.load(f)
    for res in payload.get('resultados', []):
        url = res.get('url')
        if not url or not str(url).startswith('http'):
            continue
        nombre = res.get('nombre', url)
        if nombre in hallazgos:
            print(f'\n--- {nombre} --- (ya procesado, se omite)')
            continue
        r = procesar(nombre, url)
        if r:
            hallazgos[nombre] = r
            with open(salida_json, 'w', encoding='utf-8') as f:   # guardado incremental
                json.dump(hallazgos, f, ensure_ascii=False, indent=1)

with open(os.path.join(RASTREO, 'documentos_hallazgos2.json'), 'w', encoding='utf-8') as f:
    json.dump(hallazgos, f, ensure_ascii=False, indent=1)
print(f'\n-> guardado rastreo/documentos_hallazgos2.json con {len(hallazgos)} documentos')
