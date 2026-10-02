"""Fase 1 (v2): datasets de RUES + extraccion robusta de cifras de documentos.

Mejoras sobre la v1:
  - descarga a archivo temporal (sin tope en memoria ni PDFs truncados)
  - cada documento aislado en try/except: uno que falle no tumba el proceso
  - patrones mas amplios + puntuacion por proximidad y plausibilidad
"""
import io
import json
import os
import re
import sys
import tempfile
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

UA = {'User-Agent': 'Mozilla/5.0 (compatible; AnalisisDatosColombia/1.0; contacto: echeverri58@gmail.com)'}
DATOS = 'https://www.datos.gov.co/resource/'
TOP = json.load(open('top100_para_rastreo.json', encoding='utf-8'))
RASTREO = 'rastreo'
os.makedirs(RASTREO, exist_ok=True)


def solo_digitos(t):
    return re.sub(r'\D', '', str(t or ''))


def bajar_a_archivo(url, destino):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r, open(destino, 'wb') as f:
        ctype = r.headers.get('Content-Type', '')
        while True:
            trozo = r.read(512 * 1024)
            if not trozo:
                break
            f.write(trozo)
    return os.path.getsize(destino), ctype


# ---------------------------------------------------------------- A) RUES
print('=' * 78)
print('A) COBERTURA DE LOS DATASETS DE RUES (personal por NIT)')
print('=' * 78)

RUES = {
    'dvkz-vw2v': ('nit', 'personal'),
    'j8w2-u75f': ('nit', 'personal'),
    'p39t-z7qc': ('identificacion', 'personal'),
    'we9a-3bys': ('nit', 'personal_ocupado'),
}
nits_top = sorted({solo_digitos(r['nit']) for r in TOP})

for ds, (cnit, cpers) in RUES.items():
    print(f'\n--- {ds} ---')
    total = 0
    con_dato = []
    for i in range(0, 60, 20):
        lote = nits_top[i:i + 20]
        where = "%s in('%s')" % (cnit, "','".join(lote))
        try:
            url = DATOS + ds + '.json?' + urllib.parse.urlencode({'$where': where, '$limit': 300})
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=180) as r:
                rows = json.loads(r.read().decode('utf-8'))
        except Exception as e:
            print(f'  lote {i//20 + 1}: error -> {str(e)[:110]}')
            continue
        total += len(rows)
        for row in rows:
            p = row.get(cpers)
            if p not in (None, '', '0', 'NA', 0):
                con_dato.append((solo_digitos(row.get(cnit)), p, row.get('ult_ano_ren') or row.get('periodo')))
    print(f'  filas que coinciden con las 60 mayores: {total}')
    print(f'  con "personal" distinto de cero/vacio : {len(con_dato)}')
    for nit, p, a in con_dato[:8]:
        print(f'     nit={nit}  personal={p}  anio={a}')

# ------------------------------------------------- B) documentos oficiales
print()
print('=' * 78)
print('B) EXTRACCION DE CIFRAS EN DOCUMENTOS OFICIALES')
print('=' * 78)

try:
    from pypdf import PdfReader
    HAY_PYPDF = True
except ImportError:
    HAY_PYPDF = False
    print('  AVISO: sin pypdf, solo se procesara HTML')

DOCS = [
    ('EPM', 'https://www.epm.com.co/content/dam/epm/institucional/transparencia/rendicion-de-cuentas/rendicion-de-cuentas-2024/Informe%20de%20Gesti%C3%B3n%20EPM%20FINAL.pdf'),
    ('Grupo Exito', 'https://www.grupoexito.com.co/es/informe-sostenibilidad-2025.pdf'),
    ('Drummond', 'http://drummondltd.com/wp-content/uploads/2024/10/Informe-de-Sostenibilidad-2023-Drummond-Ltd-20241024.pdf'),
    ('Ecopetrol ESG', 'https://www.ecopetrol.com.co/wps/wcm/connect/5c11d386-8780-4472-9efd-7d6c600810a9/Capitulo+ESG+2024+Circular+031+ESP.pdf'),
    ('Claro Colombia', 'https://www.claro.com.co/portal/co/recursos/co/pdf/Informe_de_Sostenibilidad_Claro_2024.pdf'),
    ('Reficar', 'https://www.refineriadecartagena.com.co/Informe%20de%20Gesti%C3%B3n%20y%20Sostenibilidad%202024.pdf'),
    ('Avianca', 'https://static.avianca.com/media/l0rotatv/informe-de-responsabilidad-corporativa-2024.pdf'),
]

CLAVE = r'(?:empleados|colaboradores|trabajadores|funcionarios|headcount|employees)'
PATRONES = [
    (r'([\d][\d.,]{2,9})\s*(?:\+\s*)?(?:mil\s+)?(?:de\s+)?' + CLAVE, 0),
    (CLAVE + r'[^.\n]{0,90}?([\d][\d.,]{2,9})', 0),
    (r'(?:nomina|nómina|planta de personal|fuerza laboral|talento humano|equipo humano|nuestro equipo)'
     r'[^.\n]{0,70}?([\d][\d.,]{2,9})', 0),
    (r'([\d][\d.,]{2,9})\s*(?:personas|colaboradores)', 0),
]


def a_entero(txt):
    limpio = re.sub(r'[^\d]', '', txt)
    if not limpio:
        return None
    val = int(limpio)
    if 1900 <= val <= 2100:          # es un año, no una cifra de personal
        return None
    if not (50 <= val <= 300000):    # fuera de rango plausible
        return None
    return val


def extraer(destino, ctype):
    if 'pdf' in ctype.lower() or open(destino, 'rb').read(4) == b'%PDF':
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


hallazgos = {}
for nombre, url in DOCS:
    print(f'\n--- {nombre} ---')
    tmp = os.path.join(tempfile.gettempdir(), 'doc_rastreo.pdf')
    try:
        tam, ctype = bajar_a_archivo(url, tmp)
        print(f'  descargado {tam / 1024 / 1024:.1f} MB ({ctype[:28]})')
    except Exception as e:
        print(f'  no se pudo descargar: {str(e)[:100]}')
        continue
    try:
        txt = extraer(tmp, ctype)
    except Exception as e:
        print(f'  error al extraer texto: {str(e)[:100]}')
        continue
    if not txt:
        print('  sin texto extraible')
        continue

    plano = re.sub(r'[ \t]+', ' ', txt)
    cand = {}
    for pat, _ in PATRONES:
        for m in re.finditer(pat, plano, re.IGNORECASE):
            bruto = m.group(1)
            val = a_entero(bruto)
            if val is None:
                continue
            pos = m.start()
            ctx = plano[max(0, pos - 100):pos + 120].replace('\n', ' ')
            anterior = cand.get(val)
            # se queda con el contexto mas cercano a la palabra clave
            if anterior is None or len(ctx) < len(anterior):
                cand[val] = ctx.strip()
    orden = sorted(cand.items(), key=lambda kv: -kv[0])
    print(f'  cifras plausibles distintas: {len(orden)}')
    for val, ctx in orden[:8]:
        print(f'     {val:>8,}  ...{ctx[:130]}')
    hallazgos[nombre] = [{'valor': v, 'contexto': c} for v, c in orden]
    try:
        os.remove(tmp)
    except OSError:
        pass

with open(os.path.join(RASTREO, 'documentos_hallazgos.json'), 'w', encoding='utf-8') as f:
    json.dump(hallazgos, f, ensure_ascii=False, indent=1)
print('\n-> guardado rastreo/documentos_hallazgos.json')
