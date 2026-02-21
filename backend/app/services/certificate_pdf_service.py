"""
Certificate PDF Service for Urban Home School

Generates styled PDF certificates using WeasyPrint (HTML → PDF).
Each certificate includes:
  - Student name, course name, grade
  - Serial number & completion date
  - Public validation URL with QR-code-like visual reference
  - UHS branding (#FF0000 accent)
"""

import io
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# Validation base URL for the QR link on the certificate
FRONTEND_URL = "http://localhost:3000"


def _build_certificate_html(
    student_name: str,
    course_name: str,
    grade: Optional[str],
    serial_number: str,
    completion_date: Optional[datetime],
    issued_at: datetime,
) -> str:
    """Return styled HTML for the certificate page."""
    grade_display = grade or "Completed"
    date_str = (
        completion_date.strftime("%B %d, %Y")
        if completion_date
        else issued_at.strftime("%B %d, %Y")
    )
    validation_url = f"{FRONTEND_URL}/validate-certificate?serial={serial_number}"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page {{
      size: A4 landscape;
      margin: 0;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: Georgia, 'Times New Roman', serif;
      background: #ffffff;
      width: 297mm;
      height: 210mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .certificate {{
      width: 270mm;
      height: 190mm;
      border: 6px solid #FF0000;
      padding: 12mm 16mm;
      position: relative;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }}
    /* Corner decorations */
    .corner {{
      position: absolute;
      width: 20mm;
      height: 20mm;
      border-color: #FF0000;
      border-style: solid;
    }}
    .corner.tl {{ top: 4mm; left: 4mm; border-width: 3px 0 0 3px; }}
    .corner.tr {{ top: 4mm; right: 4mm; border-width: 3px 3px 0 0; }}
    .corner.bl {{ bottom: 4mm; left: 4mm; border-width: 0 0 3px 3px; }}
    .corner.br {{ bottom: 4mm; right: 4mm; border-width: 0 3px 3px 0; }}

    .header {{ width: 100%; }}
    .org-name {{
      font-size: 11pt;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #FF0000;
      margin-bottom: 2mm;
    }}
    .cert-title {{
      font-size: 26pt;
      font-weight: bold;
      color: #1a1a1a;
      letter-spacing: 1px;
      margin-bottom: 1mm;
    }}
    .cert-subtitle {{
      font-size: 9pt;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
    }}

    .divider {{
      width: 60%;
      height: 1px;
      background: linear-gradient(to right, transparent, #FF0000, transparent);
      margin: 3mm auto;
    }}

    .body-text {{
      font-size: 10pt;
      color: #444;
      line-height: 1.6;
    }}
    .student-name {{
      font-size: 22pt;
      color: #1a1a1a;
      font-style: italic;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2mm;
      margin: 1mm 20mm;
    }}
    .course-name {{
      font-size: 13pt;
      color: #1a1a1a;
      font-weight: bold;
      margin: 1mm 0;
    }}
    .grade-badge {{
      display: inline-block;
      background: #FF0000;
      color: #fff;
      font-size: 11pt;
      font-weight: bold;
      padding: 2mm 6mm;
      border-radius: 4px;
      margin: 1mm 0;
    }}

    .footer {{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }}
    .footer-block {{ text-align: center; flex: 1; }}
    .footer-label {{
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-bottom: 1mm;
    }}
    .footer-value {{
      font-size: 8pt;
      color: #333;
      font-family: 'Courier New', monospace;
    }}
    .signature-line {{
      width: 40mm;
      height: 1px;
      background: #333;
      margin: 0 auto 1mm;
    }}
    .seal {{
      width: 24mm;
      height: 24mm;
      border: 2px solid #FF0000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      font-size: 6pt;
      color: #FF0000;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: center;
      padding: 2mm;
    }}
  </style>
</head>
<body>
  <div class="certificate">
    <!-- Corner decorations -->
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <!-- Header -->
    <div class="header">
      <div class="org-name">Urban Home School</div>
      <div class="cert-title">Certificate of Completion</div>
      <div class="cert-subtitle">This is to certify that</div>
    </div>

    <div class="divider"></div>

    <!-- Body -->
    <div>
      <div class="student-name">{student_name}</div>
      <p class="body-text">has successfully completed the course</p>
      <div class="course-name">{course_name}</div>
      <div class="grade-badge">Grade: {grade_display}</div>
      <p class="body-text" style="margin-top:2mm;">on {date_str}</p>
    </div>

    <div class="divider"></div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-block">
        <div class="signature-line"></div>
        <div class="footer-label">Issued by</div>
        <div class="footer-value">Edwin Odhiambo, CEO &amp; CTO</div>
      </div>

      <div class="footer-block">
        <div class="seal">URBAN<br>HOME<br>SCHOOL</div>
      </div>

      <div class="footer-block">
        <div class="footer-label">Serial Number</div>
        <div class="footer-value">{serial_number}</div>
        <div class="footer-label" style="margin-top:2mm;">Verify at</div>
        <div class="footer-value" style="font-size:7pt;">{validation_url}</div>
      </div>
    </div>
  </div>
</body>
</html>"""


def generate_certificate_pdf(
    student_name: str,
    course_name: str,
    grade: Optional[str],
    serial_number: str,
    completion_date: Optional[datetime],
    issued_at: datetime,
) -> bytes:
    """
    Generate a PDF certificate and return the raw bytes.

    Args:
        student_name: Full name of the student
        course_name: Name of the completed course
        grade: Grade achieved (e.g. "A", "85%") or None
        serial_number: Certificate serial number (e.g. UHS-20260221-ABCDE)
        completion_date: When the student completed the course
        issued_at: When the certificate was issued

    Returns:
        PDF as raw bytes

    Raises:
        RuntimeError: If PDF generation fails
    """
    try:
        from weasyprint import HTML

        html_content = _build_certificate_html(
            student_name=student_name,
            course_name=course_name,
            grade=grade,
            serial_number=serial_number,
            completion_date=completion_date,
            issued_at=issued_at,
        )

        pdf_bytes = HTML(string=html_content).write_pdf()
        logger.info(f"Generated PDF for certificate {serial_number}")
        return pdf_bytes

    except ImportError:
        logger.error("WeasyPrint is not installed. Cannot generate certificate PDF.")
        raise RuntimeError("PDF generation library not available")
    except Exception as e:
        logger.error(f"Failed to generate certificate PDF for {serial_number}: {e}")
        raise RuntimeError(f"PDF generation failed: {str(e)}")
