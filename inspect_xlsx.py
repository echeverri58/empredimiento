"""Inspección rápida de datosBasicosComplete.xlsx (encabezados y años presentes)."""
import re
import sys
import zipfile
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

PATH = 'datosBasicosComplete.xlsx'
z = zipfile.ZipFile(PATH)

print('=== Entradas del zip ===')
for n in z.namelist():
    print(f'  {n}  ->  {z.getinfo(n).file_size:,} bytes')

# sharedStrings (si existe)
shared = []
if 'xl/sharedStrings.xml' in z.namelist():
    raw = z.read('xl/sharedStrings.xml').decode('utf-8', 'ignore')
    shared = [re.sub(r'<[^>]+>', '', s) for s in re.findall(r'<si>(.*?)</si>', raw, re.S)]
    print(f'\n=== sharedStrings: {len(shared)} cadenas. Primeras 40: ===')
    for i, s in enumerate(shared[:40]):
        print(f'  [{i}] {s[:80]}')

print('\n=== Primeras filas de sheet1.xml ===')
sheet = z.open('xl/sheet1.xml')
head = sheet.read(6000).decode('utf-8', 'ignore')
print(head[:4000])
