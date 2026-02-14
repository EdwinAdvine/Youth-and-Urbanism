"""
CBC Service

Kenya Competency-Based Curriculum (CBC) competency search, alignment
checking, gap analysis, and hierarchical competency tree retrieval.
"""

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.cbc_competency import CBCCompetency
from app.models.staff.student_journey import StudentJourney
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


async def search_competencies(
    db: AsyncSession,
    query: Optional[str] = None,
    learning_area: Optional[str] = None,
    grade_level: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Search CBC competencies by keyword, learning area, and/or grade level.

    Returns matching competencies ordered by relevance (keyword match)
    and sort_order.
    """
    try:
        conditions = [CBCCompetency.is_active == True]  # noqa: E712

        if learning_area:
            conditions.append(CBCCompetency.learning_area == learning_area)
        if grade_level:
            conditions.append(CBCCompetency.grade_level == grade_level)
        if query:
            search_term = f"%{query}%"
            conditions.append(
                or_(
                    CBCCompetency.name.ilike(search_term),
                    CBCCompetency.description.ilike(search_term),
                    CBCCompetency.code.ilike(search_term),
                    CBCCompetency.strand.ilike(search_term),
                )
            )

        q = (
            select(CBCCompetency)
            .where(and_(*conditions))
            .order_by(
                CBCCompetency.learning_area,
                CBCCompetency.grade_level,
                CBCCompetency.sort_order,
            )
            .limit(50)
        )
        result = await db.execute(q)
        competencies = result.scalars().all()

        return [
            {
                "id": str(c.id),
                "code": c.code,
                "name": c.name,
                "description": c.description,
                "learning_area": c.learning_area,
                "strand": c.strand,
                "sub_strand": c.sub_strand,
                "grade_level": c.grade_level,
                "level": c.level,
                "keywords": c.keywords or [],
                "sort_order": c.sort_order,
            }
            for c in competencies
        ]

    except Exception as e:
        logger.error(f"Error searching CBC competencies: {e}")
        raise


async def get_competency(
    db: AsyncSession,
    competency_code: str,
) -> Optional[Dict[str, Any]]:
    """Return a single CBC competency by its unique code."""
    try:
        q = select(CBCCompetency).where(CBCCompetency.code == competency_code)
        result = await db.execute(q)
        c = result.scalar_one_or_none()

        if not c:
            return None

        return {
            "id": str(c.id),
            "code": c.code,
            "name": c.name,
            "description": c.description,
            "learning_area": c.learning_area,
            "strand": c.strand,
            "sub_strand": c.sub_strand,
            "grade_level": c.grade_level,
            "level": c.level,
            "keywords": c.keywords or [],
            "is_active": c.is_active,
            "sort_order": c.sort_order,
            "created_at": c.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching competency {competency_code}: {e}")
        raise


async def check_alignment(
    db: AsyncSession,
    content_text: str,
    expected_codes: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    AI-powered alignment check between content text and expected CBC
    competency codes.

    Fetches the expected competencies from the database, builds context
    for the AI, and returns an alignment assessment.
    """
    try:
        expected_codes = expected_codes or []

        # Fetch expected competency details
        expected_competencies = []
        if expected_codes:
            comp_q = select(CBCCompetency).where(
                CBCCompetency.code.in_(expected_codes)
            )
            comp_result = await db.execute(comp_q)
            expected_competencies = [
                {
                    "code": c.code,
                    "name": c.name,
                    "description": c.description,
                    "learning_area": c.learning_area,
                    "strand": c.strand,
                }
                for c in comp_result.scalars().all()
            ]

        competency_context = ""
        if expected_competencies:
            competency_context = "Expected competencies:\n" + "\n".join(
                f"- {c['code']}: {c['name']} ({c['learning_area']}, {c['strand']})"
                for c in expected_competencies
            )

        prompt = (
            "Assess how well this educational content aligns with Kenya's CBC "
            "competencies. For each expected competency, determine if it is "
            "covered, partially covered, or missing. Return JSON with: "
            "aligned_competencies (list of {code, name, coverage: full|partial|missing}), "
            "missing_competencies (list of codes), alignment_score (0-1), "
            "suggestions (list of improvement suggestions). "
            f"\n\n{competency_context}"
            f"\n\nContent:\n{content_text[:3000]}"
        )

        orchestrator = AIOrchestrator(db)
        await orchestrator.load_providers()
        result = await orchestrator.route_query(
            query=prompt,
            context={"task": "cbc_alignment_check"},
            response_mode="text",
        )

        ai_message = result.get("message", "")

        # Attempt structured parsing
        import json

        parsed = None
        try:
            start_idx = ai_message.find("{")
            end_idx = ai_message.rfind("}") + 1
            if start_idx != -1 and end_idx > start_idx:
                parsed = json.loads(ai_message[start_idx:end_idx])
        except (json.JSONDecodeError, ValueError):
            pass

        if parsed:
            return {
                "aligned_competencies": parsed.get("aligned_competencies", []),
                "missing_competencies": parsed.get("missing_competencies", []),
                "alignment_score": float(parsed.get("alignment_score", 0.0)),
                "suggestions": parsed.get("suggestions", []),
                "expected_codes": expected_codes,
            }

        return {
            "aligned_competencies": [],
            "missing_competencies": expected_codes,
            "alignment_score": 0.0,
            "suggestions": [ai_message] if ai_message else ["Alignment check unavailable."],
            "expected_codes": expected_codes,
        }

    except Exception as e:
        logger.error(f"Error checking CBC alignment: {e}")
        return {
            "aligned_competencies": [],
            "missing_competencies": expected_codes or [],
            "alignment_score": 0.0,
            "suggestions": ["Alignment check failed."],
            "expected_codes": expected_codes or [],
        }


async def get_gap_analysis(
    db: AsyncSession,
    student_id: str,
    learning_area: str,
) -> Dict[str, Any]:
    """
    Student competency gap analysis for a specific learning area.

    Combines the student's journey data (strengths, improvement areas)
    with the full set of CBC competencies for the learning area to
    identify gaps.
    """
    try:
        # Fetch student journey
        journey_q = select(StudentJourney).where(
            StudentJourney.student_id == student_id
        )
        journey_result = await db.execute(journey_q)
        journey = journey_result.scalar_one_or_none()

        # Fetch all competencies for the learning area
        comp_q = (
            select(CBCCompetency)
            .where(
                and_(
                    CBCCompetency.learning_area == learning_area,
                    CBCCompetency.is_active == True,  # noqa: E712
                )
            )
            .order_by(CBCCompetency.sort_order)
        )
        comp_result = await db.execute(comp_q)
        all_competencies = comp_result.scalars().all()

        if not all_competencies:
            return {
                "student_id": student_id,
                "learning_area": learning_area,
                "total_competencies": 0,
                "mastered": [],
                "in_progress": [],
                "gaps": [],
                "recommendations": [],
            }

        # Build competency list
        competency_list = [
            {
                "code": c.code,
                "name": c.name,
                "strand": c.strand,
                "grade_level": c.grade_level,
            }
            for c in all_competencies
        ]

        # Get AI analysis
        student_context = ""
        if journey:
            student_context = (
                f"Student risk level: {journey.risk_level}. "
                f"Learning style: {journey.learning_style or 'unknown'}. "
                f"Strengths: {journey.strengths or []}. "
                f"Improvement areas: {journey.areas_for_improvement or []}. "
            )

        import json

        prompt = (
            f"Analyse this student's competency gaps in {learning_area}. "
            f"{student_context}"
            f"Available competencies: {json.dumps(competency_list[:20])}. "
            "Categorise each competency as mastered, in_progress, or gap. "
            "Return JSON with: mastered (list of codes), in_progress (list), "
            "gaps (list of codes), recommendations (list of specific actions). "
        )

        try:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            result = await orchestrator.route_query(
                query=prompt,
                context={"task": "gap_analysis", "student_id": student_id},
                response_mode="text",
            )

            ai_message = result.get("message", "")
            parsed = None
            try:
                start_idx = ai_message.find("{")
                end_idx = ai_message.rfind("}") + 1
                if start_idx != -1 and end_idx > start_idx:
                    parsed = json.loads(ai_message[start_idx:end_idx])
            except (json.JSONDecodeError, ValueError):
                pass

            if parsed:
                return {
                    "student_id": student_id,
                    "learning_area": learning_area,
                    "total_competencies": len(all_competencies),
                    "mastered": parsed.get("mastered", []),
                    "in_progress": parsed.get("in_progress", []),
                    "gaps": parsed.get("gaps", []),
                    "recommendations": parsed.get("recommendations", []),
                }

        except Exception as ai_error:
            logger.warning(f"AI gap analysis failed: {ai_error}")

        # Fallback: mark all as gaps (no student performance data)
        return {
            "student_id": student_id,
            "learning_area": learning_area,
            "total_competencies": len(all_competencies),
            "mastered": [],
            "in_progress": [],
            "gaps": [c.code for c in all_competencies],
            "recommendations": [
                "Insufficient student performance data for detailed gap analysis. "
                "Recommend comprehensive diagnostic assessment."
            ],
        }

    except Exception as e:
        logger.error(
            f"Error in gap analysis for student {student_id}, "
            f"area {learning_area}: {e}"
        )
        raise


async def get_competency_tree(
    db: AsyncSession,
    learning_area: str,
    grade_level: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Return a hierarchical tree of CBC competencies for a learning area.

    Structure: learning_area -> strands -> sub_strands -> competencies.
    """
    try:
        conditions = [
            CBCCompetency.learning_area == learning_area,
            CBCCompetency.is_active == True,  # noqa: E712
        ]
        if grade_level:
            conditions.append(CBCCompetency.grade_level == grade_level)

        q = (
            select(CBCCompetency)
            .where(and_(*conditions))
            .order_by(
                CBCCompetency.strand,
                CBCCompetency.sub_strand.asc().nullslast(),
                CBCCompetency.sort_order,
            )
        )
        result = await db.execute(q)
        competencies = result.scalars().all()

        # Build hierarchical tree
        tree: Dict[str, Any] = {}
        for c in competencies:
            strand = c.strand
            sub_strand = c.sub_strand or "General"

            if strand not in tree:
                tree[strand] = {}
            if sub_strand not in tree[strand]:
                tree[strand][sub_strand] = []

            tree[strand][sub_strand].append({
                "code": c.code,
                "name": c.name,
                "description": c.description,
                "grade_level": c.grade_level,
                "level": c.level,
            })

        # Convert to structured response
        strands = []
        for strand_name, sub_strands in tree.items():
            sub_strand_list = []
            for sub_name, comps in sub_strands.items():
                sub_strand_list.append({
                    "name": sub_name,
                    "competencies": comps,
                    "count": len(comps),
                })
            strands.append({
                "name": strand_name,
                "sub_strands": sub_strand_list,
                "total_competencies": sum(len(ss["competencies"]) for ss in sub_strand_list),
            })

        return {
            "learning_area": learning_area,
            "grade_level": grade_level,
            "strands": strands,
            "total_strands": len(strands),
            "total_competencies": len(competencies),
        }

    except Exception as e:
        logger.error(
            f"Error building competency tree for {learning_area}: {e}"
        )
        raise
