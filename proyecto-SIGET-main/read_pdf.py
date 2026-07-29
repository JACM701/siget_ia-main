from pathlib import Path
from subprocess import run
import sys

path = Path(r'C:\Users\ajsan\Downloads\rubrica.entregable.semana.07.pdf')
try:
    import pypdf
except Exception:
    run([sys.executable, '-m', 'pip', 'install', '--user', 'pypdf'], check=True)
    import pypdf

reader = pypdf.PdfReader(path)
print('PAGES', len(reader.pages))
for i, page in enumerate(reader.pages[:8], start=1):
    text = page.extract_text() or ''
    print(f'--- PAGE {i} ---')
    print(text)
