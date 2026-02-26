/**
 * CBC Curriculum Lookup Utility
 *
 * Maps course_code (e.g. "ENG-G4", "MATH-PP1") to the correct SubjectEntry
 * in cbcContent.ts using the same deterministic code system as courseCode.ts.
 *
 * This eliminates fuzzy name-matching which caused false positives
 * (e.g. English courses showing Technical Studies content).
 */

import { cbcContent, type SubjectEntry } from './data/cbcContent';

// ============================================================================
// AREA_CODE_TO_CBC_NAMES
// Reverse mapping of AREA_CODE_MAP (in courseCode.ts).
// Each area code maps to one or more candidate subject name strings
// that appear in cbcContent[gradeKey].subjects[].name.
// Listed from most specific to least specific so exact matches win.
// ============================================================================
const AREA_CODE_TO_CBC_NAMES: Record<string, string[]> = {
  // Pre-Primary integrated areas
  LAEN:  ['Language Activities (English)', 'English'],
  LAKIS: ['Language Activities (Kiswahili)', 'Kiswahili'],
  MATA:  ['Mathematical Activities', 'Mathematics'],
  ENV:   ['Environmental Activities', 'Environmental'],
  HYG:   ['Hygiene and Nutrition Activities', 'Hygiene'],
  CREA:  ['Creative Activities', 'Creative Arts'],
  PSYC:  ['Psychomotor and Creative Activities', 'Psychomotor'],
  // Languages
  ENG:   ['English'],
  ENGA:  ['English'],
  KIS:   ['Kiswahili'],
  ARA:   ['Arabic'],
  FRE:   ['French'],
  GER:   ['German'],
  IND:   ['Indigenous Language', 'Indigenous Languages'],
  MAN:   ['Mandarin', 'Mandarin Chinese'],
  KSL:   ['Kenyan Sign Language'],
  FLANG: ['Foreign Languages', 'Languages'],
  LANG:  ['Languages'],
  // Mathematics
  MATH:  ['Mathematics'],
  // Sciences
  SCI:   ['Science & Technology', 'Science and Technology'],
  INT:   ['Integrated Science'],
  PSCI:  ['Pure Sciences', 'Biology', 'Physics', 'Chemistry'],
  ASCI:  ['Applied Sciences', 'General Science'],
  // Religious Education
  CRE:   ['CRE', 'Christian Religious Education'],
  HRE:   ['HRE', 'Hindu Religious Education'],
  IRE:   ['IRE', 'Islamic Religious Education'],
  REL:   ['Religious Education'],
  // Social / Humanities
  SOC:   ['Social Studies'],
  HUM:   ['Humanities', 'History and Citizenship', 'Geography', 'Business Studies'],
  // Arts & PE
  ART:   ['Creative Arts', 'Art & Craft', 'Fine Arts'],
  ARTC:  ['Art & Craft', 'Creative Arts'],
  MUS:   ['Music', 'Music & Dance'],
  PE:    ['Physical Education', 'Physical and Health Education'],
  ARTS:  ['Arts & Sports'],
  // Practical subjects
  AGR:   ['Agriculture'],
  HOM:   ['Home Science'],
  PTECH: ['Pre-Technical Studies'],
  TECH:  ['Technical Studies', 'Technical & Pre-Technical'],
  // Senior Secondary — individual STEM subjects
  PHY:   ['Physics'],
  BIO:   ['Biology'],
  CHEM:  ['Chemistry'],
  COMP:  ['Computer Studies'],
  ELEC:  ['Electricity'],
  // Senior Secondary — Social Sciences / Humanities
  GEO:   ['Geography'],
  HIST:  ['History and Citizenship', 'History'],
  BUS:   ['Business Studies'],
  LIT:   ['Literature in English', 'Literature'],
  // Senior Secondary — Technical / Practical
  BC:    ['Building Construction'],
  PM:    ['Power Mechanics'],
  METW:  ['Metalwork'],
  WOOD:  ['Woodwork'],
  AVI:   ['Aviation'],
  MEDIA: ['Media Technology'],
  MFT:   ['Marine & Fisheries Technology', 'Marine'],
  // Senior Secondary — Creative / Design
  FA:    ['Fine Arts'],
  MD:    ['Music & Dance', 'Music and Dance'],
  TF:    ['Theatre & Film', 'Theatre and Film'],
  // Senior Secondary — Applied / Cross-curricular
  GSCI:  ['General Science'],
  ICTS:  ['ICT'],
  CSL:   ['Community Service Learning'],
};

// ============================================================================
// GRADE_CODE_TO_CBC_KEY
// Maps the grade portion of a course_code → cbcContent record key
// ============================================================================
const GRADE_CODE_TO_CBC_KEY: Record<string, string> = {
  PP1:  'pp1',
  PP2:  'pp2',
  ECD1: 'ecd-1',
  ECD2: 'ecd-2',
  G1:   'grade-1',
  G2:   'grade-2',
  G3:   'grade-3',
  G4:   'grade-4',
  G5:   'grade-5',
  G6:   'grade-6',
  G7:   'grade-7',
  G8:   'grade-8',
  G9:   'grade-9',
  G10:  'grade-10',
  G11:  'grade-11',
  G12:  'grade-12',
  TG:   'teachers-guide',
  DIP:  'diploma',
};

// ============================================================================
// getCbcDataByCourseCode  (PRIMARY LOOKUP)
// Parses the course_code to get an exact, deterministic subject match.
// "ENG-G4" → areaCode="ENG", gradeCode="G4"
//           → grade key "grade-4", candidate names ["English"]
//           → searches for exact/contains name in cbcContent["grade-4"].subjects
// Returns null if the code is missing, unrecognised, or no subject matches.
// ============================================================================
export function getCbcDataByCourseCode(courseCode: string | null | undefined): SubjectEntry | null {
  if (!courseCode) return null;

  // Split on the LAST "-" so multi-char area codes work (e.g. "PTECH-G7")
  const lastDash = courseCode.lastIndexOf('-');
  if (lastDash === -1) return null;

  const areaCode  = courseCode.slice(0, lastDash);   // e.g. "ENG"
  const gradeCode = courseCode.slice(lastDash + 1);  // e.g. "G4"

  const gradeKey = GRADE_CODE_TO_CBC_KEY[gradeCode];
  if (!gradeKey) return null;

  const gradeData = cbcContent[gradeKey];
  if (!gradeData?.subjects?.length) return null;

  const candidates = AREA_CODE_TO_CBC_NAMES[areaCode];
  if (!candidates?.length) return null;

  // Try each candidate name: exact match first, then contains
  for (const candidate of candidates) {
    const c = candidate.toLowerCase();
    // Exact match
    const exact = gradeData.subjects.find((s) => s.name.toLowerCase() === c);
    if (exact) return exact;
  }
  for (const candidate of candidates) {
    const c = candidate.toLowerCase();
    // Contains match (s.name contains candidate, or candidate contains s.name)
    const partial = gradeData.subjects.find(
      (s) => s.name.toLowerCase().includes(c) || c.includes(s.name.toLowerCase())
    );
    if (partial) return partial;
  }

  return null;
}

// ============================================================================
// getCbcSubjectData  (FALLBACK — for courses without a course_code)
// Simplified name-based lookup: exact → startsWith → contains only.
// The old word-overlap scoring that caused false positives has been removed.
// ============================================================================
export function getCbcSubjectData(
  learningArea: string,
  gradeLevel: string
): SubjectEntry | null {
  if (!learningArea || !gradeLevel) return null;

  const gradeKey  = getCbcGradeKey(gradeLevel);
  const gradeData = cbcContent[gradeKey];
  if (!gradeData?.subjects?.length) return null;

  const la = learningArea.trim().toLowerCase();

  // Exact
  const exact = gradeData.subjects.find((s) => s.name.trim().toLowerCase() === la);
  if (exact) return exact;

  // Starts-with
  const startsWith = gradeData.subjects.find(
    (s) => s.name.trim().toLowerCase().startsWith(la) || la.startsWith(s.name.trim().toLowerCase())
  );
  if (startsWith) return startsWith;

  // Contains
  const contains = gradeData.subjects.find(
    (s) => s.name.trim().toLowerCase().includes(la) || la.includes(s.name.trim().toLowerCase())
  );
  return contains ?? null;
}

// ============================================================================
// getCbcGradeKey
// "PP1" → "pp1", "Grade 4" → "grade-4"
// ============================================================================
export function getCbcGradeKey(gradeLevel: string): string {
  return gradeLevel.trim().toLowerCase().replace(/\s+/g, '-');
}

// ============================================================================
// getGradeStage
// Returns the human-readable CBC education stage label.
// ============================================================================
export function getGradeStage(gradeLevel: string): string {
  const n = gradeLevel.trim().toLowerCase();
  if (n === 'pp1' || n === 'pp2') return 'Pre-Primary';

  const m = n.match(/grade[\s-]?(\d+)/);
  if (!m) return '';
  const num = parseInt(m[1], 10);
  if (num <= 3) return 'Lower Primary';
  if (num <= 6) return 'Upper Primary';
  if (num <= 9) return 'Junior Secondary';
  return 'Senior Secondary';
}
