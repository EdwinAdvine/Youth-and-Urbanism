from __future__ import annotations

"""
Deterministic course code generator.

Produces a short, human-readable, unique identifier for each student course
in the format {AREA_CODE}-{GRADE_CODE}, e.g. ``ENV-G2``, ``MATH-PP1``.

The same maps are mirrored in the frontend at
``frontend/src/utils/courseCode.ts`` — keep them in sync.
"""

AREA_CODE_MAP: dict[str, str] = {
    # Pre-Primary
    "Language Activities (English)": "LAEN",
    "Language Activities (Kiswahili)": "LAKIS",
    "Mathematical Activities": "MATA",
    "Environmental Activities": "ENV",
    "Hygiene and Nutrition Activities": "HYG",
    "Creative Activities": "CREA",
    "Psychomotor and Creative Activities": "PSYC",
    # Languages
    "English": "ENG",
    "English Activities": "ENGA",
    "Kiswahili": "KIS",
    "Arabic": "ARA",
    "French": "FRE",
    "German": "GER",
    "Indigenous Language": "IND",
    "Mandarin": "MAN",
    "Kenyan Sign Language": "KSL",
    "Foreign Languages": "FLANG",
    "Languages": "LANG",
    # Mathematics
    "Mathematics": "MATH",
    # Sciences
    "Science & Technology": "SCI",
    "Integrated Science": "INT",
    "Pure Sciences": "PSCI",
    "Applied Sciences": "ASCI",
    # Religious Education
    "CRE": "CRE",
    "HRE": "HRE",
    "IRE": "IRE",
    "Christian Religious Education": "CRE",
    "Hindu Religious Education": "HRE",
    "Islamic Religious Education": "IRE",
    "Religious Education": "REL",
    # Social & Humanities
    "Social Studies": "SOC",
    "Humanities": "HUM",
    # Creative Arts & PE
    "Creative Arts": "ART",
    "Art & Craft": "ARTC",
    "Music": "MUS",
    "Physical Education": "PE",
    "Arts & Sports": "ARTS",
    # Agriculture & Home Science
    "Agriculture": "AGR",
    "Home Science": "HOM",
    # Technical
    "Pre-Technical Studies": "PTECH",
    "Technical Studies": "TECH",
    # Senior Secondary — individual subjects (STEM track)
    "Physics": "PHY",
    "Biology": "BIO",
    "Chemistry": "CHEM",
    "Computer Studies": "COMP",
    "Electricity": "ELEC",
    # Senior Secondary — Social Sciences / Humanities track
    "Geography": "GEO",
    "History and Citizenship": "HIST",
    "Business Studies": "BUS",
    "Literature in English": "LIT",
    # Senior Secondary — Technical / Practical track
    "Building Construction": "BC",
    "Power Mechanics": "PM",
    "Metalwork": "METW",
    "Woodwork": "WOOD",
    "Aviation": "AVI",
    "Media Technology": "MEDIA",
    "Marine & Fisheries Technology": "MFT",
    # Senior Secondary — Creative / Design track
    "Fine Arts": "FA",
    "Music & Dance": "MD",
    "Theatre & Film": "TF",
    # Senior Secondary — Applied / Cross-curricular
    "General Science": "GSCI",
    "ICT": "ICTS",
    "Community Service Learning": "CSL",
    # ── Variant names found in cbcContent.ts ──
    # Ampersand ↔ "and" variants
    "Science and Technology": "SCI",
    "Music and Dance": "MD",
    "Marine and Fisheries Technology": "MFT",
    "History & Citizenship": "HIST",
    "Theatre and Film": "TF",
    "Art and Craft": "ARTC",
    "Child Development and Psychology": "CDP",
    # Physical Education variant
    "Physical and Health Education": "PE",
    # Mathematics variants (Senior Secondary tracks)
    "Core Mathematics": "MATH",
    "Essential Mathematics": "MATH",
    # Plural variant
    "Indigenous Languages": "IND",
    # Spacing variant
    "Metal Work": "METW",
    # Kiswahili literature subjects (after date stripping)
    "Fasihi ya Kiswahili": "KIS",
    "Fasihi": "KIS",
    "Literature": "LIT",
    "Kiswahili Lugha": "KIS",
    # Sports variant
    "Sports and Recreation": "PE",
    # Diploma / Teacher Education (special subjects)
    "Historical and Comparative Foundations of Education": "HCFE",
    "Philosophical and Sociological Foundations of Education": "PSFE",
    "Child Development & Psychology": "CDP",
    "Curriculum Studies": "CURR",
    "Education Assessment": "EASS",
    "Educational Resources": "ERES",
    "ICT Integration in Education": "ICT",
    "Inclusive Education": "INCL",
    "Leadership and Management": "LMG",
    "Microteaching": "MICRO",
    "Research Skills": "RES",
}

GRADE_CODE_MAP: dict[str, str] = {
    "PP1": "PP1",
    "PP2": "PP2",
    "ECD 1": "ECD1",
    "ECD 2": "ECD2",
    "Grade 1": "G1",
    "Grade 2": "G2",
    "Grade 3": "G3",
    "Grade 4": "G4",
    "Grade 5": "G5",
    "Grade 6": "G6",
    "Grade 7": "G7",
    "Grade 8": "G8",
    "Grade 9": "G9",
    "Grade 10": "G10",
    "Grade 11": "G11",
    "Grade 12": "G12",
    "Teacher's Guide": "TG",
    "Diploma": "DIP",
}


def generate_course_code(
    learning_area: str,
    grade_level: str,
    suffix: str = "",
) -> str | None:
    """
    Return a course code like ``ENV-G2`` for a student course, or ``None``
    if either the learning area or grade level is not in the known maps
    (avoids generating codes for unknown future subjects).

    Optional *suffix* appends a variant tag, e.g. ``-TG`` for Teacher's
    Guides or ``-REV`` for Revision Textbooks, producing codes like
    ``MATH-G1-TG`` or ``MATH-DIP-REV``.
    """
    area = AREA_CODE_MAP.get(learning_area)
    grade = GRADE_CODE_MAP.get(grade_level)
    if area and grade:
        code = f"{area}-{grade}"
        if suffix:
            code = f"{code}-{suffix}"
        return code
    return None
