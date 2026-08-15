#!/usr/bin/env python3
"""Generate the downloadable GG Nagarkar professional profile PDF."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "gg-nagarkar-professional-profile.pdf"
PUBLIC_OUTPUT = ROOT / "public" / "downloads" / "gg-nagarkar-professional-profile.pdf"

NAVY = colors.HexColor("#173B57")
BLUE = colors.HexColor("#2B6F9E")
INK = colors.HexColor("#17212B")
MUTED = colors.HexColor("#526271")
PALE = colors.HexColor("#EEF4F7")
LINE = colors.HexColor("#D7E0E6")
WHITE = colors.white


def load_json(relative_path: str):
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def safe(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


styles = getSampleStyleSheet()
TITLE = ParagraphStyle(
    "Title",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=25,
    leading=29,
    textColor=NAVY,
    alignment=TA_LEFT,
    spaceAfter=3 * mm,
)
SUBTITLE = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=11.2,
    leading=16,
    textColor=MUTED,
    spaceAfter=3 * mm,
)
SECTION = ParagraphStyle(
    "Section",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=14,
    leading=18,
    textColor=NAVY,
    spaceBefore=5 * mm,
    spaceAfter=2.5 * mm,
)
BODY = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.3,
    leading=13.5,
    textColor=INK,
    spaceAfter=2.4 * mm,
)
SMALL = ParagraphStyle(
    "Small",
    parent=BODY,
    fontSize=8.2,
    leading=11.3,
    textColor=MUTED,
)
CARD_TITLE = ParagraphStyle(
    "CardTitle",
    parent=BODY,
    fontName="Helvetica-Bold",
    fontSize=10.2,
    leading=13,
    textColor=NAVY,
    spaceAfter=1.2 * mm,
)
DATE = ParagraphStyle(
    "Date",
    parent=SMALL,
    fontName="Helvetica-Bold",
    textColor=BLUE,
)
EXPERIENCE_BODY = ParagraphStyle(
    "ExperienceBody",
    parent=SMALL,
    fontSize=7.5,
    leading=10.1,
    spaceAfter=1.5 * mm,
)
EXPERIENCE_TITLE = ParagraphStyle(
    "ExperienceTitle",
    parent=CARD_TITLE,
    fontSize=9.2,
    leading=11.3,
    spaceAfter=0.8 * mm,
)
TAG = ParagraphStyle(
    "Tag",
    parent=SMALL,
    fontSize=7.4,
    leading=9.5,
    textColor=NAVY,
    alignment=TA_CENTER,
)


def pill(text: str):
    table = Table([[Paragraph(safe(text), TAG)]], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE),
                ("BOX", (0, 0), (-1, -1), 0.4, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return table


def tag_grid(items: list[str], columns: int = 3):
    rows = []
    for index in range(0, len(items), columns):
        row = [pill(item) for item in items[index : index + columns]]
        row += [""] * (columns - len(row))
        rows.append(row)
    table = Table(rows, colWidths=[52 * mm] * columns, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 1.2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.2 * mm),
            ]
        )
    )
    return table


def bullet_list(items: list[str]):
    return [
        Paragraph(f"<font color='#2B6F9E'>&bull;</font>&nbsp;&nbsp;{safe(item)}", BODY)
        for item in items
    ]


def draw_page(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 7 * mm, width, 7 * mm, stroke=0, fill=1)
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 15 * mm, width - 20 * mm, 15 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 9.5 * mm, "GG Nagarkar | Professional Profile")
    canvas.drawRightString(width - 20 * mm, 9.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def experience_card(item):
    heading = f"{safe(item['role'])} | {safe(item['company'])}"
    meta = f"{safe(item['startDate'])} to {safe(item['endDate'])} | {safe(item['location'])}"
    summary = item["summary"]
    if item["company"] != "BMC Software" and ". " in summary:
        summary = summary.split(". ", 1)[0] + "."
    return [
        Paragraph(heading, EXPERIENCE_TITLE),
        Paragraph(meta, DATE),
        Paragraph(safe(summary), EXPERIENCE_BODY),
        Paragraph(" | ".join(safe(skill) for skill in item["skills"]), EXPERIENCE_BODY),
    ]


def main():
    profile = load_json("src/data/profile.json")
    experience = load_json("src/data/experience.json")
    projects = load_json("src/data/projects.json")
    patents = load_json("src/data/patents.json")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=21 * mm,
        title="GG Nagarkar - Professional Profile",
        author="GG Nagarkar",
        subject="Founder, product engineer, and technology leader",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="profile")
    doc.addPageTemplates(PageTemplate(id="main", frames=frame, onPage=draw_page))

    story = []
    photo = Image(str(ROOT / "public" / profile["profileImage"].lstrip("/")), 31 * mm, 31 * mm)
    photo.hAlign = "LEFT"
    intro = [
        Paragraph(safe(profile["name"]), TITLE),
        Paragraph(safe(profile["headline"]), SUBTITLE),
        Paragraph(
            f"{safe(profile['location'])} &nbsp;|&nbsp; "
            f"<link href='mailto:{safe(profile['email'])}' color='#2B6F9E'>{safe(profile['email'])}</link> &nbsp;|&nbsp; "
            "<link href='https://www.ggnagarkar.com' color='#2B6F9E'>ggnagarkar.com</link>",
            SMALL,
        ),
    ]
    header = Table([[photo, intro]], colWidths=[38 * mm, 124 * mm])
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story += [header, Spacer(1, 4 * mm), HRFlowable(color=LINE, thickness=0.7)]

    story += [Paragraph("Profile", SECTION), Paragraph(safe(profile["shortBio"]), BODY)]
    story += [
        Paragraph(
            "GG's career connects enterprise monitoring, observability, operational log analytics, and ITSM with later work in DevOps, cloud platforms, AIOps, and practical enterprise AI. At BMC Software, he progressed through Development Manager and Senior Manager, R&amp;D roles and worked on BMC IT Data Analytics, monitoring-to-incident workflows, and ProactiveNet integration and releases.",
            BODY,
        )
    ]

    story.append(Paragraph("Selected Highlights", SECTION))
    story.extend(bullet_list(profile["highlights"]))
    story.append(Paragraph("Core Domains", SECTION))
    story.append(tag_grid(profile["interests"][:9]))

    story.append(Paragraph("Current Work", SECTION))
    current = [item for item in projects if item["name"] in {"Applied AI Consulting", "OpsRabbit", "7Targets"}]
    for item in current:
        story.append(
            KeepTogether(
                [
                    Paragraph(safe(item["name"]), CARD_TITLE),
                    Paragraph(safe(item["summary"]), BODY),
                ]
            )
        )

    story.append(PageBreak())
    story.append(Paragraph("Professional Experience", TITLE))
    story.append(Paragraph("Product, engineering, and founder leadership across enterprise software, cloud platforms, DevOps, and AI.", SUBTITLE))
    cards = [experience_card(item) for item in experience]
    experience_rows = [[cards[index], cards[index + 1]] for index in range(0, len(cards), 2)]
    experience_table = Table(experience_rows, colWidths=[79 * mm, 79 * mm], hAlign="LEFT")
    experience_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOX", (0, 0), (-1, -1), 0.45, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.45, LINE),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3.2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.2 * mm),
            ]
        )
    )
    story.append(experience_table)

    story.append(PageBreak())
    story.append(Paragraph("Selected Product Work", TITLE))
    bmc_slugs = {
        "bmc-itda",
        "monitoring-itsm-integration",
        "proactivenet-integration-release-management",
    }
    selected = [item for item in projects if item.get("featured") or item["slug"] in bmc_slugs]
    for item in selected[:9]:
        story.append(
            KeepTogether(
                [
                    Table(
                        [[Paragraph(safe(item["name"]), CARD_TITLE), Paragraph(safe(item["period"]), DATE)]],
                        colWidths=[120 * mm, 42 * mm],
                        style=TableStyle(
                            [
                                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                                ("TOPPADDING", (0, 0), (-1, -1), 0),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                            ]
                        ),
                    ),
                    Paragraph(safe(item["summary"]), SMALL),
                    Spacer(1, 3 * mm),
                ]
            )
        )

    story.append(Paragraph("Patents", SECTION))
    for patent in patents:
        story.append(
            Paragraph(
                f"<b>{safe(patent['patentNumber'])}</b> - {safe(patent['title'])} ({safe(patent['status'])})",
                BODY,
            )
        )

    story.append(Paragraph("Education and Contact", SECTION))
    story.append(
        Paragraph(
            f"Education: {safe(', '.join(profile['education']))}<br/>"
            f"Email: <link href='mailto:{safe(profile['email'])}' color='#2B6F9E'>{safe(profile['email'])}</link><br/>"
            "Website: <link href='https://www.ggnagarkar.com' color='#2B6F9E'>www.ggnagarkar.com</link>",
            BODY,
        )
    )

    doc.build(story)
    shutil.copyfile(OUTPUT, PUBLIC_OUTPUT)
    print(OUTPUT)
    print(PUBLIC_OUTPUT)


if __name__ == "__main__":
    main()
