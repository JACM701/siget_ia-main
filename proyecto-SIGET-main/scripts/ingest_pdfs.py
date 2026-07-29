import json
from pathlib import Path
from subprocess import run
import sys

# Asegurar que pypdf esté instalado
try:
    import pypdf
except Exception:
    print("Instalando pypdf...")
    run([sys.executable, '-m', 'pip', 'install', 'pypdf'], check=True)
    import pypdf

# Directorio de salida
OUTPUT_DIR = Path(__file__).resolve().parent.parent / 'backend-node' / 'data'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = OUTPUT_DIR / 'documentos_legales.json'

# Documentos a procesar
PDF_FILES = [
    {
        "name": "Ley de Tránsito y Vialidad de Yucatán",
        "path": Path(r'C:\Users\ajsan\Downloads\ley-de-transito-y-vialidad-del-estado-de-yucatan.pdf'),
        "id": "transito_yucatan"
    },
    {
        "name": "Constitución Política de los Estados Unidos Mexicanos",
        "path": Path(r'C:\Users\ajsan\Downloads\CONSTITUCION POLITICA.pdf'),
        "id": "constitucion_mexico"
    }
]

documentos_ingestados = []

for doc in PDF_FILES:
    pdf_path = doc["path"]
    if not pdf_path.exists():
        print(f"[WARNING] No se encontro el archivo: {pdf_path}")
        continue
    
    print(f"Procesando {doc['name']}...")
    try:
        reader = pypdf.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        print(f"   Paginas encontradas: {total_pages}")
        
        for idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ''
            text = text.strip()
            if not text:
                continue
            
            # Dividir en fragmentos de aprox. 1000 caracteres si el texto de la página es muy largo
            # o guardarlo por página si es razonable.
            # Guardar por página es ideal para citar la fuente y el número de página.
            chunks = []
            if len(text) > 1500:
                # Partir en dos mitades con solapamiento
                half = len(text) // 2
                chunks.append(text[:half + 150])
                chunks.append(text[half - 150:])
            else:
                chunks.append(text)
                
            for chunk_idx, chunk_text in enumerate(chunks):
                documentos_ingestados.append({
                    "id": f"{doc['id']}_p{idx}_{chunk_idx}",
                    "document": doc["name"],
                    "page": idx,
                    "text": chunk_text
                })
        print(f"Procesado con exito: {doc['name']}")
    except Exception as e:
        print(f"Error al procesar {doc['name']}: {e}")

# Guardar los documentos en el JSON
if documentos_ingestados:
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(documentos_ingestados, f, ensure_ascii=False, indent=2)
    print(f"Exito: Se guardaron {len(documentos_ingestados)} fragmentos en {OUTPUT_FILE}")
else:
    print("No se pudo procesar ningun documento.")
