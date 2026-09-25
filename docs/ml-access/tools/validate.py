"""Check package links, figure coverage, master parity and PDF text."""
from pathlib import Path
import re
from pypdf import PdfReader
from docx import Document
ROOT=Path(__file__).resolve().parents[3]
BASE=ROOT/'docs/ml-access'
fail=[]
for md in [ROOT/'README.md',*BASE.rglob('*.md')]:
    if 'sources' in md.parts:continue
    for target in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)',md.read_text(encoding='utf-8')):
        if target.startswith(('http:','https:','#')):continue
        if not (md.parent/target.split('#')[0]).exists():fail.append(f'Broken link: {md.name}: {target}')
assert (BASE/'MASTER.me').read_bytes()==(BASE/'ML_SYSTEM_DESIGN.md').read_bytes()
doc=Document(ROOT/'REPORT_4.docx')
assert len(doc.inline_shapes)==8, len(doc.inline_shapes)
pdf=PdfReader(ROOT/'REPORT_4.pdf')
text='\n'.join(p.extract_text() or '' for p in pdf.pages)
for term in ['Недиков Михаил Олегович','Цели и предпосылки','Подготовка пилота','Издержки','Источники','2995']:
    if term not in text:fail.append('Missing PDF text: '+term)
for name in ['as-is','to-be','er','architecture','components','sequence','baseline','mvp']:
    for ext in ['svg','png']:
        p=BASE/'diagrams'/f'{name}.{ext}'
        if not p.exists() or p.stat().st_size<500:fail.append('Missing diagram '+str(p))
print('PDF pages:',len(pdf.pages),'DOCX figures:',len(doc.inline_shapes))
print('PDF text characters:',len(text))
if fail:raise SystemExit('\n'.join(fail))
print('PASS: local links, master parity, required sections and figures')
