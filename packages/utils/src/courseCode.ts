/**
 * Deterministic course code generator — mirrors backend/app/utils/course_code.py.
 *
 * Produces short, human-readable identifiers like "ENV-G2" or "MATH-PP1"
 * from a learning_area + grade_level pair.
 *
 * Keep this map in sync with the Python counterpart.
 */

const AREA_CODE_MAP: Record<string, string> = {
  // Pre-Primary
  'Language Activities (English)': 'LAEN',
  'Language Activities (Kiswahili)': 'LAKIS',
  'Mathematical Activities': 'MATA',
  'Environmental Activities': 'ENV',
  'Hygiene and Nutrition Activities': 'HYG',
  'Creative Activities': 'CREA',
  'Psychomotor and Creative Activities': 'PSYC',
  // Languages
  'English': 'ENG',
  'English Activities': 'ENGA',
  'Kiswahili': 'KIS',
  'Arabic': 'ARA',
  'French': 'FRE',
  'German': 'GER',
  'Indigenous Language': 'IND',
  'Mandarin': 'MAN',
  'Kenyan Sign Language': 'KSL',
  'Foreign Languages': 'FLANG',
  'Languages': 'LANG',
  // Mathematics
  'Mathematics': 'MATH',
  // Sciences
  'Science & Technology': 'SCI',
  'Integrated Science': 'INT',
  'Pure Sciences': 'PSCI',
  'Applied Sciences': 'ASCI',
  // Religious Education
  'CRE': 'CRE',
  'HRE': 'HRE',
  'IRE': 'IRE',
  'Christian Religious Education': 'CRE',
  'Hindu Religious Education': 'HRE',
  'Islamic Religious Education': 'IRE',
  'Religious Education': 'REL',
  // Social & Humanities
  'Social Studies': 'SOC',
  'Humanities': 'HUM',
  // Creative Arts & PE
  'Creative Arts': 'ART',
  'Art & Craft': 'ARTC',
  'Music': 'MUS',
  'Physical Education': 'PE',
  'Arts & Sports': 'ARTS',
  // Agriculture & Home Science
  'Agriculture': 'AGR',
  'Home Science': 'HOM',
  // Technical
  'Pre-Technical Studies': 'PTECH',
  'Technical Studies': 'TECH',
  // Senior Secondary — individual subjects (STEM track)
  'Physics': 'PHY',
  'Biology': 'BIO',
  'Chemistry': 'CHEM',
  'Computer Studies': 'COMP',
  'Electricity': 'ELEC',
  // Senior Secondary — Social Sciences / Humanities track
  'Geography': 'GEO',
  'History and Citizenship': 'HIST',
  'Business Studies': 'BUS',
  'Literature in English': 'LIT',
  // Senior Secondary — Technical / Practical track
  'Building Construction': 'BC',
  'Power Mechanics': 'PM',
  'Metalwork': 'METW',
  'Woodwork': 'WOOD',
  'Aviation': 'AVI',
  'Media Technology': 'MEDIA',
  'Marine & Fisheries Technology': 'MFT',
  // Senior Secondary — Creative / Design track
  'Fine Arts': 'FA',
  'Music & Dance': 'MD',
  'Theatre & Film': 'TF',
  // Senior Secondary — Applied / Cross-curricular
  'General Science': 'GSCI',
  'ICT': 'ICTS',
  'Community Service Learning': 'CSL',
  // ── Variant names found in cbcContent.ts ──
  // Ampersand ↔ "and" variants
  'Science and Technology': 'SCI',
  'Music and Dance': 'MD',
  'Marine and Fisheries Technology': 'MFT',
  'History & Citizenship': 'HIST',
  'Theatre and Film': 'TF',
  'Art and Craft': 'ARTC',
  'Child Development and Psychology': 'CDP',
  // Physical Education variant
  'Physical and Health Education': 'PE',
  // Mathematics variants (Senior Secondary tracks)
  'Core Mathematics': 'MATH',
  'Essential Mathematics': 'MATH',
  // Plural variant
  'Indigenous Languages': 'IND',
  // Spacing variant
  'Metal Work': 'METW',
  // Kiswahili literature subjects (after date stripping)
  'Fasihi ya Kiswahili': 'KIS',
  'Fasihi': 'KIS',
  'Literature': 'LIT',
  'Kiswahili Lugha': 'KIS',
  // Sports variant
  'Sports and Recreation': 'PE',
  // Diploma / Teacher Education
  'Historical and Comparative Foundations of Education': 'HCFE',
  'Philosophical and Sociological Foundations of Education': 'PSFE',
  'Child Development & Psychology': 'CDP',
  'Curriculum Studies': 'CURR',
  'Education Assessment': 'EASS',
  'Educational Resources': 'ERES',
  'ICT Integration in Education': 'ICT',
  'Inclusive Education': 'INCL',
  'Leadership and Management': 'LMG',
  'Microteaching': 'MICRO',
  'Research Skills': 'RES',
};

const GRADE_CODE_MAP: Record<string, string> = {
  'PP1': 'PP1',
  'PP2': 'PP2',
  'ECD 1': 'ECD1',
  'ECD 2': 'ECD2',
  'Grade 1': 'G1',
  'Grade 2': 'G2',
  'Grade 3': 'G3',
  'Grade 4': 'G4',
  'Grade 5': 'G5',
  'Grade 6': 'G6',
  'Grade 7': 'G7',
  'Grade 8': 'G8',
  'Grade 9': 'G9',
  'Grade 10': 'G10',
  'Grade 11': 'G11',
  'Grade 12': 'G12',
  "Teacher's Guide": 'TG',
  'Diploma': 'DIP',
};

/**
 * Returns a course code like "ENV-G2" for a student course,
 * or null if the learning area or grade level is not in the known maps.
 *
 * Optional `suffix` appends a variant tag, e.g. "TG" for Teacher's Guides
 * or "REV" for Revision Textbooks, producing codes like "MATH-G1-TG".
 */
export function generateCourseCode(
  learningArea: string,
  gradeLevel: string,
  suffix = '',
): string | null {
  const area = AREA_CODE_MAP[learningArea];
  const grade = GRADE_CODE_MAP[gradeLevel];
  if (area && grade) {
    const code = `${area}-${grade}`;
    return suffix ? `${code}-${suffix}` : code;
  }
  return null;
}
