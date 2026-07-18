"""Generate a generic Business Plan PDF template on the Desktop."""
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path.home() / "Desktop" / "business-plan.pdf"

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=20, spaceAfter=14, textColor=colors.HexColor("#0f172a"))
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, spaceBefore=14, spaceAfter=8, textColor=colors.HexColor("#1e3a8a"))
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10.5, leading=15, alignment=TA_JUSTIFY, spaceAfter=8)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=2, spaceAfter=4)
TITLE = ParagraphStyle("Title", parent=styles["Title"], fontSize=28, leading=34, spaceAfter=10, textColor=colors.HexColor("#0f172a"))
SUB = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=12, textColor=colors.HexColor("#475569"))


def p(t):  return Paragraph(t, BODY)
def b(t):  return Paragraph(f"• {t}", BULLET)
def h1(t): return Paragraph(t, H1)
def h2(t): return Paragraph(t, H2)


def build():
    doc = SimpleDocTemplate(
        str(OUT), pagesize=LETTER,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        topMargin=0.85 * inch, bottomMargin=0.85 * inch,
        title="Business Plan", author="Shahtab Raiz",
    )
    s = []

    # Cover
    s += [Spacer(1, 1.6 * inch),
          Paragraph("BUSINESS PLAN", TITLE),
          Paragraph("[Company Name]", SUB),
          Spacer(1, 0.25 * inch),
          Paragraph("[Tagline / one-line description of the business]", SUB),
          Spacer(1, 2.5 * inch),
          Paragraph(f"Prepared: {date.today():%B %Y}", SUB),
          Paragraph("Prepared by: [Founder / Author]", SUB),
          Paragraph("Contact: [email] · [phone] · [website]", SUB),
          PageBreak()]

    # 1. Executive Summary
    s += [h1("1. Executive Summary"),
          p("[Company Name] is a [industry] business that [core value proposition]. "
            "We solve [problem] for [target customer] by offering [product/service]. "
            "Our differentiation is [unique advantage]."),
          h2("Key Highlights"),
          b("Founded: [Year] · Location: [City, Country]"),
          b("Stage: [Idea / Early / Operating]"),
          b("Target market size: [TAM/SAM] in [region]"),
          b("Revenue model: [subscription / one-time / commission / etc.]"),
          b("Funding sought: [$amount] for [use of funds]"),
          b("3-year revenue target: [$amount]"),
          PageBreak()]

    # 2. Company Description
    s += [h1("2. Company Overview"),
          h2("Mission"),
          p("[Mission statement — why the company exists.]"),
          h2("Vision"),
          p("[Vision — what the company aims to become.]"),
          h2("Legal Structure"),
          p("[Sole proprietorship / LLC / Pvt. Ltd. / etc.] registered in [jurisdiction]."),
          h2("Founders & Team"),
          b("[Founder Name] — [Role]. [Background / experience.]"),
          b("[Co-founder / Key hire] — [Role]. [Background.]"),
          PageBreak()]

    # 3. Products & Services
    s += [h1("3. Products & Services"),
          p("[Detailed description of the core product or service offering.]"),
          h2("Core Offering"),
          b("[Product/Service 1] — [description, price]"),
          b("[Product/Service 2] — [description, price]"),
          b("[Product/Service 3] — [description, price]"),
          h2("Roadmap"),
          b("Phase 1 (0–6 months): [milestone]"),
          b("Phase 2 (6–18 months): [milestone]"),
          b("Phase 3 (18–36 months): [milestone]"),
          PageBreak()]

    # 4. Market Analysis
    s += [h1("4. Market Analysis"),
          h2("Industry Overview"),
          p("[Industry size, growth rate, key trends, regulations.]"),
          h2("Target Customer"),
          b("Demographics: [age, income, location, profession]"),
          b("Pain points: [problems they currently face]"),
          b("Buying behavior: [how/where they purchase today]"),
          h2("Competitors"),
          b("[Competitor A] — strengths: [...]; weaknesses: [...]"),
          b("[Competitor B] — strengths: [...]; weaknesses: [...]"),
          h2("Our Competitive Advantage"),
          p("[Why customers will choose us — price, quality, service, technology, brand.]"),
          PageBreak()]

    # 5. Marketing & Sales Strategy
    s += [h1("5. Marketing & Sales Strategy"),
          h2("Positioning"),
          p("[Brand positioning statement.]"),
          h2("Channels"),
          b("Digital: [website, SEO, paid ads, social, email]"),
          b("Offline: [retail partners, events, print, referrals]"),
          h2("Pricing Strategy"),
          p("[Pricing tiers and rationale.]"),
          h2("Sales Process"),
          b("Lead generation: [...]"),
          b("Conversion: [...]"),
          b("Retention: [...]"),
          PageBreak()]

    # 6. Operations
    s += [h1("6. Operations Plan"),
          h2("Location & Facilities"),
          p("[Office, warehouse, store, or remote setup.]"),
          h2("Suppliers & Partners"),
          b("[Supplier 1 — what they provide]"),
          b("[Logistics partner]"),
          h2("Technology"),
          p("[Software, hardware, platforms used.]"),
          h2("Key Processes"),
          b("Production / service delivery: [...]"),
          b("Quality control: [...]"),
          b("Customer support: [...]"),
          PageBreak()]

    # 7. Financial Plan
    s += [h1("7. Financial Plan"),
          h2("Startup Costs")]

    startup = [
        ["Item", "Amount"],
        ["Legal & registration", "[$_____]"],
        ["Equipment & technology", "[$_____]"],
        ["Inventory / initial stock", "[$_____]"],
        ["Marketing launch", "[$_____]"],
        ["Working capital (6 months)", "[$_____]"],
        ["Other", "[$_____]"],
        ["Total", "[$_____]"],
    ]
    t1 = Table(startup, colWidths=[3.5 * inch, 2.0 * inch])
    t1.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e0e7ff")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    s += [t1, Spacer(1, 0.2 * inch),
          h2("3-Year Revenue & Profit Forecast")]

    fc = [
        ["", "Year 1", "Year 2", "Year 3"],
        ["Revenue", "[$_____]", "[$_____]", "[$_____]"],
        ["Cost of goods", "[$_____]", "[$_____]", "[$_____]"],
        ["Gross profit", "[$_____]", "[$_____]", "[$_____]"],
        ["Operating expenses", "[$_____]", "[$_____]", "[$_____]"],
        ["Net profit", "[$_____]", "[$_____]", "[$_____]"],
    ]
    t2 = Table(fc, colWidths=[2.0 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#dcfce7")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    s += [t2, Spacer(1, 0.15 * inch),
          h2("Funding Request"),
          p("Seeking [$amount] in exchange for [equity %, loan terms, grant]. "
            "Funds will be used for: [team, marketing, inventory, operations]."),
          h2("Break-even Analysis"),
          p("Expected break-even at [$revenue] / [#units] in month [N]."),
          PageBreak()]

    # 8. Risks & Mitigation
    s += [h1("8. Risks & Mitigation"),
          b("Market risk: [description] — mitigation: [...]"),
          b("Operational risk: [description] — mitigation: [...]"),
          b("Financial risk: [description] — mitigation: [...]"),
          b("Regulatory risk: [description] — mitigation: [...]"),
          PageBreak()]

    # 9. Appendix
    s += [h1("9. Appendix"),
          b("Founders' CVs / résumés"),
          b("Product photos / mockups"),
          b("Letters of intent / contracts"),
          b("Detailed financial model (spreadsheet)"),
          b("Market research data")]

    doc.build(s)
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    build()
