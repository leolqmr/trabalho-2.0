from pathlib import Path
from html import escape

import markdown
from bs4 import BeautifulSoup, NavigableString
from pypdf import PdfReader

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, Preformatted, KeepTogether
)

ROOT = Path.cwd()

DOCUMENTOS = [
    ("docs/testes/relatorio-analise-critica.md", 5),
    ("docs/qualidade/relatorio-refatoracao.md", 3),
]

fonte = "Helvetica"
fonte_bold = "Helvetica-Bold"

arial = Path("C:/Windows/Fonts/arial.ttf")
arial_bold = Path("C:/Windows/Fonts/arialbd.ttf")

if arial.exists() and arial_bold.exists():
    pdfmetrics.registerFont(TTFont("ArialLocal", str(arial)))
    pdfmetrics.registerFont(TTFont("ArialLocal-Bold", str(arial_bold)))
    pdfmetrics.registerFontFamily(
        "ArialLocal",
        normal="ArialLocal",
        bold="ArialLocal-Bold"
    )
    fonte = "ArialLocal"
    fonte_bold = "ArialLocal-Bold"

estilos = getSampleStyleSheet()

estilos.add(ParagraphStyle(
    name="TituloP07", fontName=fonte_bold, fontSize=15,
    leading=18, spaceAfter=10, textColor=colors.HexColor("#17365D")
))
estilos.add(ParagraphStyle(
    name="SecaoP07", fontName=fonte_bold, fontSize=10.5,
    leading=13, spaceBefore=10, spaceAfter=5,
    textColor=colors.HexColor("#17365D"), keepWithNext=True
))
estilos.add(ParagraphStyle(
    name="SubsecaoP07", fontName=fonte_bold, fontSize=9.5,
    leading=12, spaceBefore=7, spaceAfter=4, keepWithNext=True
))
estilos.add(ParagraphStyle(
    name="CorpoP07", fontName=fonte, fontSize=8.5,
    leading=11.5, spaceAfter=6, splitLongWords=True
))
estilos.add(ParagraphStyle(
    name="TabelaP07", parent=estilos["CorpoP07"],
    fontSize=7.2, leading=9, spaceAfter=0
))
estilos.add(ParagraphStyle(
    name="CodigoP07", fontName="Courier", fontSize=7,
    leading=9, spaceAfter=6
))

def formatar_inline(elemento):
    partes = []
    for filho in elemento.children:
        if isinstance(filho, NavigableString):
            partes.append(escape(str(filho)))
        elif filho.name in ("strong", "b"):
            partes.append("<b>" + formatar_inline(filho) + "</b>")
        elif filho.name in ("em", "i"):
            partes.append("<i>" + formatar_inline(filho) + "</i>")
        elif filho.name == "code":
            partes.append(
                '<font color="#334155">' +
                formatar_inline(filho) + "</font>"
            )
        elif filho.name == "a":
            partes.append(formatar_inline(filho))
        elif filho.name == "br":
            partes.append("<br/>")
        else:
            partes.append(formatar_inline(filho))
    return "".join(partes)

def criar_elementos(conteudo, largura):
    html = markdown.markdown(
        conteudo,
        extensions=["tables", "fenced_code", "sane_lists"]
    )
    soup = BeautifulSoup(html, "html.parser")
    elementos = []

    for tag in soup.contents:
        if not getattr(tag, "name", None):
            continue

        if tag.name == "h1":
            elementos.append(
                Paragraph(formatar_inline(tag), estilos["TituloP07"])
            )

        elif tag.name == "h2":
            elementos.append(
                Paragraph(formatar_inline(tag), estilos["SecaoP07"])
            )

        elif tag.name in ("h3", "h4"):
            elementos.append(
                Paragraph(formatar_inline(tag), estilos["SubsecaoP07"])
            )

        elif tag.name in ("p", "blockquote"):
            elementos.append(
                Paragraph(formatar_inline(tag), estilos["CorpoP07"])
            )

        elif tag.name in ("ul", "ol"):
            for indice, li in enumerate(tag.find_all("li", recursive=False), 1):
                marcador = f"{indice}." if tag.name == "ol" else "•"
                elementos.append(Paragraph(
                    escape(marcador) + " " + formatar_inline(li),
                    estilos["CorpoP07"]
                ))

        elif tag.name == "pre":
            texto = tag.get_text().strip()
            elementos.append(Preformatted(
                texto, estilos["CodigoP07"],
                maxLineLength=90, splitChars=" ,.;)"
            ))

        elif tag.name == "table":
            linhas = []
            for tr in tag.find_all("tr"):
                celulas = tr.find_all(["th", "td"], recursive=False)
                linhas.append([
                    Paragraph(
                        formatar_inline(celula),
                        estilos["TabelaP07"]
                    )
                    for celula in celulas
                ])

            if linhas:
                colunas = max(len(linha) for linha in linhas)
                for linha in linhas:
                    linha.extend([""] * (colunas - len(linha)))

                tabela = Table(
                    linhas,
                    colWidths=[largura / colunas] * colunas,
                    repeatRows=1 if tag.find("thead") else 0,
                    hAlign="LEFT"
                )
                tabela.setStyle(TableStyle([
                    ("GRID", (0, 0), (-1, -1), 0.35, colors.lightgrey),
                    ("BACKGROUND", (0, 0), (-1, 0),
                     colors.HexColor("#EAF0F7")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]))
                elementos.append(tabela)
                elementos.append(Spacer(1, 7))

    return elementos

def rodape(canvas, doc):
    canvas.saveState()
    canvas.setFont(fonte, 8)
    canvas.setFillColor(colors.grey)
    canvas.drawCentredString(
        A4[0] / 2, 10 * mm, f"Página {doc.page}"
    )
    canvas.restoreState()

def converter(caminho, limite):
    origem = ROOT / caminho
    destino = origem.with_suffix(".pdf")

    conteudo = origem.read_text(encoding="utf-8-sig")

    if "{{" in conteudo or "}}" in conteudo:
        raise ValueError(f"Marcadores pendentes em {origem.name}")

    margem_horizontal = 16 * mm
    largura = A4[0] - 2 * margem_horizontal

    documento = SimpleDocTemplate(
        str(destino),
        pagesize=A4,
        leftMargin=margem_horizontal,
        rightMargin=margem_horizontal,
        topMargin=15 * mm,
        bottomMargin=17 * mm,
        title=origem.stem,
        author="Equipe P07"
    )

    elementos = criar_elementos(conteudo, largura)
    documento.build(elementos, onFirstPage=rodape, onLaterPages=rodape)

    paginas = len(PdfReader(str(destino)).pages)
    print(f"{destino.name}: {paginas} pagina(s) / limite {limite}")

    if paginas > limite:
        print("ATENCAO: limite ultrapassado. Revisar diagramacao.")
        return False

    return True

def main():
    resultados = [
        converter(caminho, limite)
        for caminho, limite in DOCUMENTOS
    ]

    if all(resultados):
        print("PDFs gerados dentro dos limites.")
    else:
        print("PDFs gerados, mas ha ajustes de paginacao pendentes.")

if __name__ == "__main__":
    main()
