"""Generate matching PDF pages and SVG previews, without external dependencies."""
from pathlib import Path
from html import escape
import json

root = Path(__file__).resolve().parents[1]
examples = [
    ('guide-identification', 'Guide de l’identification', 'Identification guide', 'Un exemple de guide pour présenter les étapes et les informations utiles aux citoyens.', 'A sample guide presenting steps and useful information for citizens.', ['Comprendre la démarche', 'Préparer sa visite', 'Retrouver les informations utiles']),
    ('fiche-renseignements', 'Fiche de renseignements', 'Information sheet', 'Un modèle de fiche pour illustrer la présentation des informations à renseigner.', 'A sample sheet illustrating how information fields can be presented.', ['Informations générales', 'Coordonnées de contact', 'Observations complémentaires']),
    ('presentation-services', 'Présentation des services', 'Services overview', 'Une brochure de démonstration pour découvrir la présentation des services de l’ONIP.', 'A demonstration brochure introducing the presentation of ONIP services.', ['L’identification de la population', 'L’information des citoyens', 'L’accompagnement des usagers']),
]
items = []
for slug, title, title_en, description, description_en, sections in examples:
    pdf, svg = [], []
    def rect(x, y, w, h, color):
        rgb = tuple(int(color[i:i+2], 16)/255 for i in (1,3,5))
        pdf.append(f'{rgb[0]:.4f} {rgb[1]:.4f} {rgb[2]:.4f} rg {x} {842-y-h} {w} {h} re f')
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>')
    def text(x, y, size, value, color='#12304f'):
        rgb = tuple(int(color[i:i+2], 16)/255 for i in (1,3,5))
        safe = value.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')
        pdf.append(f'{rgb[0]:.4f} {rgb[1]:.4f} {rgb[2]:.4f} rg BT /F1 {size} Tf {x} {842-y} Td ({safe}) Tj ET')
        svg.append(f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{size}" fill="{color}">{escape(value)}</text>')
    rect(0,0,595,842,'#ffffff')
    rect(0,0,595,12,'#0864bb'); rect(198,0,198,12,'#f5ce32'); rect(396,0,199,12,'#d82a35')
    text(48,76,30,'ONIP'); text(48,101,10,'OFFICE NATIONAL D’IDENTIFICATION DE LA POPULATION')
    rect(48,140,155,28,'#fff1d0'); text(60,159,11,'EXEMPLE / SAMPLE')
    text(48,225,26,title)
    text(48,255,13,title_en,'#56718f')
    text(48,304,12,'Document de démonstration — sans valeur officielle.')
    text(48,327,11,'Demonstration document — not an official document.','#56718f')
    for i, section in enumerate(sections):
        y = 390+i*104
        rect(48,y-22,4,46,'#0864bb')
        text(66,y,16,f'0{i+1}   {section}')
        text(66,y+26,11,'Cette rubrique illustre la mise en page d’un document.','#56718f')
        rect(66,y+43,430,1,'#e1e8ef')
    rect(48,754,499,1,'#e1e8ef')
    text(48,783,10,'EXEMPLE • Aucune donnée personnelle à transmettre.','#56718f')
    text(528,783,10,'01')
    stream = ('\n'.join(pdf)).encode('cp1252')
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>', b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', f'<< /Length {len(stream)} >>\nstream\n'.encode()+stream+b'\nendstream']
    output = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'); offsets = [0]
    for n,obj in enumerate(objects,1):
        offsets.append(len(output)); output.extend(f'{n} 0 obj\n'.encode()+obj+b'\nendobj\n')
    start = len(output)
    output.extend(f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode())
    for offset in offsets[1:]: output.extend(f'{offset:010d} 00000 n \n'.encode())
    output.extend(f'trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{start}\n%%EOF\n'.encode())
    folder = root/'public/documents/examples'
    (folder/f'{slug}.pdf').write_bytes(output)
    (folder/f'{slug}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 842">'+''.join(svg)+'</svg>\n')
    items.append(dict(id=f'example-{slug}', title=dict(fr=title,en=title_en), body=dict(fr=description,en=description_en), resourceUrl=f'/documents/examples/{slug}.pdf', previewUrl=f'/documents/examples/{slug}.svg', isExample=True, pageCount=1, sizeBytes=len(output)))
data_path = root/'src/data/static-content.json'
data = json.loads(data_path.read_text())
data['documents'] = [item for item in data['documents'] if not item.get('isExample')] + items
data_path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
