"""Extrae el texto de los documentos cacheados y busca cifras con patrones ESTRICTOS.

Trabaja sobre rastreo/cache/*.bin (ya descargados), de modo que no necesita red.
Guarda el texto en rastreo/texto/ para poder iterar sin re-extraer.
"""
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

from pypdf import PdfReader

CACHE = os.path.join('rastreo', 'cache')
TEXTO = os.path.join('rastreo', 'texto')
os.makedirs(TEXTO, exist_ok=True)

# patrones estrictos: el numero debe estar pegado a la palabra clave
PATRONES = [
    r'([\d][\d.,]{2,9})\s*(?:mil\s+)?(?:empleados|colaboradores|trabajadores|funcionarios)',
    r'(?:empleados|colaboradores|trabajadores|funcionarios)\s+(?:directos?|totales?|de planta|en Colombia)?\s*'
    r'(?:es|son|de|:)?\s*([\d][\d.,]{2,9})',
    r'(?:total de|numero de|número de|contamos con|somos|conformado por|equipo de|planta de)\s*'
    r'([\d][\d.,]{2,9})\s*(?:empleados|colaboradores|trabajadores|personas)',
]


def a_entero(txt):
    limpio = re.sub(r'[^\d]', '', txt)
    if not limpio:
        return None
    v = int(limpio)
    if 1900 <= v <= 2100 or not (50 <= v <= 300000):
        return None
    return v


def texto_de(path_bin, slug):
    destino = os.path.join(TEXTO, slug + '.txt')
    if os.path.exists(destino) and os.path.getsize(destino) > 500:
        return open(destino, encoding='utf-8', errors='ignore').read()
    try:
        lector = PdfReader(path_bin)
    except Exception as e:
        return ''
    partes = []
    for pag in lector.pages[:350]:
        try:
            partes.append(pag.extract_text() or '')
        except Exception:
            continue
    txt = '\n'.join(partes)
    with open(destino, 'w', encoding='utf-8') as f:
        f.write(txt)
    return txt


resultado = {}
for archivo in sorted(os.listdir(CACHE)):
    if not archivo.endswith('.bin'):
        continue
    slug = archivo[:-4]
    txt = texto_de(os.path.join(CACHE, archivo), slug)
    if not txt:
        continue
    plano = re.sub(r'[ \t]+', ' ', txt)
    plano = re.sub(r'<[^>]{0,200}>', ' ', plano)      # limpia restos de HTML
    hallados = {}
    for pat in PATRONES:
        for m in re.finditer(pat, plano, re.IGNORECASE):
            val = a_entero(m.group(1))
            if val is None:
                continue
            pos = m.start()
            ctx = re.sub(r'\s+', ' ', plano[max(0, pos - 200):pos + 220]).strip()
            if val not in hallados or len(ctx) < len(hallados[val]):
                hallados[val] = ctx
    resultado[slug] = sorted(hallados.items(), key=lambda kv: -kv[0])

with open(os.path.join('rastreo', 'candidatos_estrictos.json'), 'w', encoding='utf-8') as f:
    json.dump({k: [{'valor': v, 'contexto': c} for v, c in lista] for k, lista in resultado.items()},
              f, ensure_ascii=False, indent=1)

print(f'{len(resultado)} documentos con texto extraido\n')
for slug, lista in resultado.items():
    if not lista:
        print(f'### {slug}  -> sin coincidencias estrictas')
        continue
    print(f'### {slug}')
    for val, ctx in lista[:4]:
        print(f'   {val:>8,} | {ctx[:300]}')
    print()
