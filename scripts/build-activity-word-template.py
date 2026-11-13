"""Build the editable Word base used by the campus download generator.

Run with the document runtime Python. The DOCX in the work directory is for QA;
only the generic template JSON is part of the site source.
"""
import base64
import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
work = Path(sys.argv[1]).resolve()
work.mkdir(parents=True, exist_ok=True)
doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.86)
section.bottom_margin = Inches(0.65)
section.left_margin = section.right_margin = Inches(0.72)
section.header_distance = Inches(0.25)
section.footer_distance = Inches(0.28)

for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Caption']:
    style = doc.styles[name]
    style.font.name = 'Arial'
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.font.size = Pt(11)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.1
doc.styles['Title'].font.size = Pt(20)
doc.styles['Title'].font.bold = True
doc.styles['Title'].paragraph_format.space_after = Pt(7)
doc.styles['Subtitle'].font.size = Pt(10)
doc.styles['Heading 1'].font.size = Pt(13)
doc.styles['Heading 1'].font.bold = True
doc.styles['Heading 1'].paragraph_format.space_before = Pt(11)
doc.styles['Heading 1'].paragraph_format.space_after = Pt(5)
doc.styles['Heading 2'].font.size = Pt(11)
doc.styles['Heading 2'].font.bold = True
doc.styles['Heading 2'].paragraph_format.space_before = Pt(9)
doc.styles['Heading 2'].paragraph_format.space_after = Pt(4)
for name in ['Title', 'Heading 1', 'Heading 2']:
    doc.styles[name].paragraph_format.keep_with_next = True
    doc.styles[name].font.underline = False
# The bundled Word base can carry a blue Title border. The campus uses plain
# native headings and whitespace, including when the file opens in Word.
for border in doc.styles.element.xpath('.//w:pBdr'):
    border.getparent().remove(border)
answer = doc.styles.add_style('Answer', 1)
answer.base_style = doc.styles['Normal']
answer.font.color.rgb = RGBColor.from_string('68565D')
answer.font.italic = True
answer.paragraph_format.space_after = Pt(10)
meta = doc.styles.add_style('StudentData', 1)
meta.base_style = doc.styles['Normal']
meta.font.size = Pt(9)
meta.paragraph_format.space_after = Pt(4)
meta.paragraph_format.keep_with_next = True
source = doc.styles.add_style('Source', 1)
source.base_style = doc.styles['Normal']
source.font.size = Pt(8)
source.paragraph_format.space_after = Pt(4)

header = section.header.paragraphs[0]
header.paragraph_format.space_after = Pt(0)
# Embed the official logo at 300 dpi for its 1.7 inch printed width.
# The public original is preserved; this keeps each student download small.
logo = Image.open(ROOT / 'assets/evolva-email-logo.png').convert('RGB')
logo.thumbnail((510, 510), Image.Resampling.LANCZOS)
logo_path = work / 'evolva-word-logo.jpg'
logo.save(logo_path, quality=95, optimize=True)
header.add_run().add_picture(str(logo_path), width=Inches(1.7))
picture = header._p.xpath('.//wp:docPr')[0]
picture.set('descr', 'Logo oficial de Evolva Academy')
doc.add_paragraph('{{ACTIVITY_TITLE}}', 'Title')
doc.add_paragraph('{{COURSE}}', 'Subtitle')
doc.add_paragraph('Alumno  {{STUDENT_NAME}}', 'StudentData')
doc.add_paragraph('Matrícula  {{MATRICULA}}     Grupo  {{GROUP}}', 'StudentData')
doc.add_paragraph('Actividad  {{ACTIVITY_REFERENCE}}', 'StudentData')
doc.add_paragraph('__ACTIVITY_BODY__')
for border in doc.element.xpath('.//w:pBdr'):
    border.getparent().remove(border)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = footer.add_run('Evolva Academy  |  Actividad editable  |  ')
run.font.size = Pt(8)
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)
doc.core_properties.author = 'Evolva Academy'
doc.core_properties.last_modified_by = 'Evolva Academy'
doc.core_properties.title = 'Actividad editable de curso'
doc.core_properties.subject = 'Actividades y trabajos del campus'
path = work / 'base-actividad.docx'
doc.save(path)
output = ROOT / 'campus-proyecto/src/activity-word-template.json'
output.write_text(json.dumps({'docx': base64.b64encode(path.read_bytes()).decode('ascii')}, separators=(',', ':')) + '\n')
print('Base editable de Word creada con logo y estilos nativos.')
