"""
Student AI Tutor Service - Enhanced AI interactions with student context

Provides personalized AI tutoring by enriching queries with student-specific
data such as grade level, learning style, current mood, and energy level.
Manages conversation history per student, generates learning paths, creates
AI-analyzed journal entries, explains concepts at grade-appropriate levels,
facilitates teacher Q&A with AI summaries, and handles voice response
generation via ElevenLabs TTS.

All methods require a student UUID and use the AIOrchestrator for AI calls.
"""
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from uuid import UUID

from app.models.user import User
from app.models.student import Student
from app.models.ai_tutor import AITutor
from app.models.student_dashboard import StudentJournalEntry, StudentMoodEntry, MoodType
from app.models.student_community import StudentTeacherQA
from app.services.ai_orchestrator import AIOrchestrator


class AITutorService:
    """
    Service for student AI tutor interactions.

    Wraps the AIOrchestrator with student-specific context including grade
    level, mood, energy, and conversation history. Manages persistent AI
    tutor instances per student in the database. Uses Socratic guided
    discovery methodology to prevent cognitive outsourcing.
    """

    # Grade-level language adaptation
    GRADE_LANGUAGE_HINTS = {
        "ecd": (
            "LANGUAGE LEVEL: This is an ECD (Early Childhood) student. "
            "Use very simple words, short sentences, lots of emojis, and counting with fingers/objects. "
            "Keep everything playful and visual. Use picture descriptions and storytelling."
        ),
        "lower_primary": (
            "LANGUAGE LEVEL: This is a Grade 1-3 student. "
            "Use simple language with fun examples. Encourage with excitement. "
            "Use drawings, counting objects, and relatable Kenyan scenarios like shopping at the duka."
        ),
        "upper_primary": (
            "LANGUAGE LEVEL: This is a Grade 4-6 student. "
            "Use moderate complexity. Introduce proper terminology alongside simple explanations. "
            "Use real-world problem solving and Kenyan examples like market transactions."
        ),
        "junior_secondary": (
            "LANGUAGE LEVEL: This is a Grade 7-9 student. "
            "Use more technical terms with clear definitions. Challenge them with multi-step problems. "
            "Connect concepts to real-world applications and future career relevance."
        ),
        "senior_secondary": (
            "LANGUAGE LEVEL: This is a Grade 10-12 student. "
            "Use full technical vocabulary. Encourage critical thinking and analysis. "
            "Connect topics to national exams, university preparation, and career paths."
        ),
    }

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()

    def _get_grade_group(self, student: Student) -> str:
        """Determine the grade group for language adaptation."""
        if student.is_ecd:
            return "ecd"
        grade_num = student.grade_number
        if grade_num is None:
            return "upper_primary"
        if grade_num <= 3:
            return "lower_primary"
        if grade_num <= 6:
            return "upper_primary"
        if grade_num <= 9:
            return "junior_secondary"
        return "senior_secondary"

    def _build_socratic_prompt(self, student: Student, student_context: Dict) -> str:
        """Build a comprehensive Socratic pedagogy system prompt with student context."""
        grade_group = self._get_grade_group(student)
        grade_hint = self.GRADE_LANGUAGE_HINTS.get(grade_group, self.GRADE_LANGUAGE_HINTS["upper_primary"])

        # Mood and energy adaptation
        mood = student_context.get("current_mood", "neutral")
        energy = student_context.get("energy_level", 3)

        mood_instruction = ""
        if mood == "frustrated":
            mood_instruction = (
                "MOOD ADAPTATION: The student is feeling frustrated right now. "
                "Be extra patient and gentle. Use shorter steps. Celebrate every small win. "
                "Consider switching to an easier related topic to rebuild confidence."
            )
        elif mood == "tired":
            mood_instruction = (
                "MOOD ADAPTATION: The student is feeling tired. "
                "Keep responses shorter and more visual. Suggest a break if they seem to struggle. "
                "Use lighter, more fun examples to maintain engagement."
            )
        elif mood == "excited":
            mood_instruction = (
                "MOOD ADAPTATION: The student is feeling excited and energized! "
                "Channel this energy into harder challenges. Move through hints faster. "
                "Encourage them to tackle bonus problems and explore deeper."
            )
        elif mood == "happy":
            mood_instruction = (
                "MOOD ADAPTATION: The student is in a good mood. "
                "Maintain the positive energy with encouraging feedback and fun examples."
            )

        energy_instruction = ""
        if energy <= 2:
            energy_instruction = (
                "ENERGY LEVEL: Low (2/5 or below). Keep responses concise. "
                "Use more visuals and fewer text-heavy explanations. Suggest a break soon."
            )
        elif energy >= 4:
            energy_instruction = (
                "ENERGY LEVEL: High (4/5 or above). Student has energy for challenges! "
                "Offer bonus problems and encourage deeper exploration."
            )

        # Learning style adaptation
        learning_profile = getattr(student, 'learning_profile', {}) or {}
        learning_style = learning_profile.get("learning_style", "visual")
        interests = learning_profile.get("interests", [])

        style_instruction = ""
        if learning_style == "visual":
            style_instruction = "LEARNING STYLE: Visual learner. Use descriptions of diagrams, drawings, and spatial examples."
        elif learning_style == "auditory":
            style_instruction = "LEARNING STYLE: Auditory learner. Suggest reading concepts aloud. Use rhymes and rhythm."
        elif learning_style == "kinesthetic":
            style_instruction = "LEARNING STYLE: Kinesthetic learner. Suggest hands-on activities, building, and movement-based learning."

        interest_instruction = ""
        if interests:
            interest_instruction = f"STUDENT INTERESTS: {', '.join(interests[:5])}. Use these to make examples relatable."

        prompt = (
            f"You are Birdy, the personal AI tutor for a {student.grade_level} student "
            f"on Urban Home School, a Kenyan e-learning platform following the CBC curriculum.\n\n"

            f"{grade_hint}\n\n"

            "TEACHING METHODOLOGY — SOCRATIC GUIDED DISCOVERY:\n"
            "You NEVER give direct answers to academic questions. Instead, you guide the student "
            "to discover answers themselves through questions and progressive hints.\n\n"

            "THINK-FIRST GATE (mandatory for every academic question):\n"
            "- ALWAYS first ask: 'What do you already know about this?' or 'What have you tried so far?'\n"
            "- If the student says 'I don't know', ask them to guess or describe what the question asks.\n"
            "- Only after the student shares their thinking do you begin guiding.\n\n"

            "PROGRESSIVE HINT SYSTEM (follow this order):\n"
            "- Hint 1 (Visual/Concrete): Give a concrete Kenyan example — counting mangoes, "
            "sharing ugali, matatu passengers, market stalls, football players.\n"
            "- Hint 2 (Analogy): Connect to something known — 'Fractions are like cutting chapati.'\n"
            "- Hint 3 (Partial Reveal): Show part of the solution, student completes the rest.\n"
            "- Only after all 3 hints, if stuck, give the full explanation + require explain-back.\n\n"

            "EXPLAIN-BACK: After every concept, say: 'Now explain this back to me in your own words, "
            "like you are teaching a friend.'\n\n"

            "SELF-TEST: End topics with a practice challenge (no answer given), then ask: "
            "'How confident do you feel? Rate yourself 1-5 stars.'\n\n"

            "REFUSAL MODE: If asked to 'just give the answer' or 'do my homework', respond warmly: "
            "'I know it feels easier, but you learn SO much more figuring it out yourself! "
            "Let me help you step by step.' NEVER write complete homework or essays.\n\n"

            "CRUTCH DETECTION: If a student pastes a full problem without attempt, say: "
            "'Before I help, what part do you understand? What have you tried?'\n\n"

            "KENYAN CONTEXT: Use KSh for money, reference Nairobi/Mombasa/Mt. Kenya/Maasai Mara, "
            "use examples with mangoes, matatus, ugali, chapati, sukuma wiki, football, jua kali.\n\n"

            "METACOGNITION: Ask 'What strategy helped you?' and 'What other questions does this raise?'\n\n"

            "OFFLINE SUGGESTIONS: Occasionally suggest closing the screen to draw, build, or practice "
            "with real objects. Recommend play, reading, and family time after sessions.\n\n"

            "SESSION WELLBEING: After 20+ messages, suggest a break. If frustrated, shift to encouragement. "
            "Remind students you are a learning tool, not a friend to chat with all day.\n\n"
        )

        # Append context-specific instructions
        if mood_instruction:
            prompt += f"{mood_instruction}\n\n"
        if energy_instruction:
            prompt += f"{energy_instruction}\n\n"
        if style_instruction:
            prompt += f"{style_instruction}\n\n"
        if interest_instruction:
            prompt += f"{interest_instruction}\n\n"

        return prompt

    async def chat_with_ai(
        self,
        student_id: UUID,
        message: str,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Chat with AI tutor using student context and Socratic methodology.

        Enhances the existing AI orchestrator with:
        - Socratic guided discovery system prompt
        - Student grade level with language adaptation
        - Learning style preferences
        - Current mood and energy adaptation
        """
        # Get student info
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Get latest mood for context
        mood_result = await self.db.execute(
            select(StudentMoodEntry)
            .where(StudentMoodEntry.student_id == student_id)
            .order_by(StudentMoodEntry.timestamp.desc())
            .limit(1)
        )
        latest_mood = mood_result.scalar_one_or_none()

        # Build enhanced context
        learning_profile = student.learning_profile or {}
        student_context = {
            "grade_level": student.grade_level,
            "learning_style": learning_profile.get("learning_style", "visual"),
            "current_mood": latest_mood.mood_type.value if latest_mood else "neutral",
            "energy_level": latest_mood.energy_level if latest_mood else 3
        }

        # Get or create AI tutor instance
        tutor_result = await self.db.execute(
            select(AITutor).where(AITutor.student_id == student_id)
        )
        ai_tutor = tutor_result.scalar_one_or_none()

        if not ai_tutor:
            # Create new AI tutor instance
            ai_tutor = AITutor(
                student_id=student_id,
                ai_provider_id=None,  # Will use default from orchestrator
                conversation_history=[],
                total_interactions=0
            )
            self.db.add(ai_tutor)
            await self.db.commit()
            await self.db.refresh(ai_tutor)

        # Use conversation history from AI tutor if not provided
        if not conversation_history:
            conversation_history = ai_tutor.conversation_history or []

        # Build Socratic system prompt with full student context
        system_message = self._build_socratic_prompt(student, student_context)

        # Call AI orchestrator
        response = await self.ai_orchestrator.chat(
            message=message,
            conversation_history=conversation_history,
            system_message=system_message,
            task_type="general"
        )

        # Update conversation history
        new_history = conversation_history + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": response["message"]}
        ]

        ai_tutor.conversation_history = new_history
        ai_tutor.total_interactions += 1
        await self.db.commit()

        return {
            "message": response["message"],
            "conversation_id": str(ai_tutor.id),
            "provider": response.get("provider", "unknown"),
            "timestamp": datetime.utcnow()
        }

    async def get_learning_path(self, student_id: UUID) -> Dict:
        """
        Get an AI-generated daily learning path for the student.

        Uses the student's grade level to generate 3-5 personalized learning
        activities with topics, durations, difficulty levels, and objectives.
        Raises ValueError if the student is not found.
        """
        # Get student info
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Generate learning path via AI
        prompt = f"""Create a personalized daily learning path for a grade {student.grade_level} student.
Include 3-5 learning activities, each with:
- Topic
- Estimated duration
- Difficulty level
- Learning objective"""

        response = await self.ai_orchestrator.chat(
            message=prompt,
            system_message="You are an educational planner. Respond in JSON format.",
            task_type="general"
        )

        return {
            "learning_path": response["message"],
            "generated_at": datetime.utcnow(),
            "student_grade": student.grade_level
        }

    async def create_journal_entry(
        self,
        student_id: UUID,
        content: str,
        mood_tag: Optional[MoodType] = None
    ) -> StudentJournalEntry:
        """
        Create a journal entry and generate AI insights from its content.

        The AI analyzes the entry for key themes, learning insights, and
        suggested next steps. Returns the saved StudentJournalEntry with
        AI insights stored in its ai_insights JSONB column.
        """
        # Generate AI insights from journal content
        insight_prompt = f"""Analyze this student's journal entry and provide:
1. Key themes
2. Learning insights
3. Suggested next steps

Journal entry: {content}"""

        ai_response = await self.ai_orchestrator.chat(
            message=insight_prompt,
            system_message="You are an educational mentor analyzing student reflections.",
            task_type="general"
        )

        # Create journal entry
        journal_entry = StudentJournalEntry(
            student_id=student_id,
            content=content,
            mood_tag=mood_tag.value if mood_tag else None,
            ai_insights={
                "analysis": ai_response["message"],
                "generated_at": datetime.utcnow().isoformat()
            },
            reflection_prompts=[]
        )

        self.db.add(journal_entry)
        await self.db.commit()
        await self.db.refresh(journal_entry)

        return journal_entry

    async def get_journal_entries(self, student_id: UUID, limit: int = 10) -> List[StudentJournalEntry]:
        """Get the student's most recent journal entries, ordered newest first."""
        result = await self.db.execute(
            select(StudentJournalEntry)
            .where(StudentJournalEntry.student_id == student_id)
            .order_by(StudentJournalEntry.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def explain_concept(
        self,
        student_id: UUID,
        concept: str,
        context: Optional[str] = None
    ) -> Dict:
        """
        Generate a grade-appropriate explanation of a concept for the student.

        Uses the student's grade level to tailor the language and examples.
        Accepts an optional context string for additional background.
        Raises ValueError if the student is not found.
        """
        # Get student grade for age-appropriate explanation
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        prompt = f"Explain this concept to a grade {student.grade_level} student: {concept}"
        if context:
            prompt += f"\n\nContext: {context}"

        response = await self.ai_orchestrator.chat(
            message=prompt,
            system_message=f"You are a patient tutor explaining concepts to grade {student.grade_level} students. Use simple language and examples.",
            task_type="general"
        )

        return {
            "explanation": response["message"],
            "concept": concept,
            "grade_level": student.grade_level,
            "timestamp": datetime.utcnow()
        }

    async def send_teacher_question(
        self,
        student_id: UUID,
        teacher_id: UUID,
        question: str
    ) -> StudentTeacherQA:
        """
        Send a question to a teacher, with an AI-generated one-sentence summary.

        Creates a StudentTeacherQA record linking the student and teacher,
        storing both the full question and the AI summary. The record starts
        as unmoderated and unanswered.
        """
        # Generate AI summary of the question
        summary_prompt = f"Summarize this student question in one sentence: {question}"

        ai_response = await self.ai_orchestrator.chat(
            message=summary_prompt,
            system_message="You are an assistant summarizing student questions.",
            task_type="general"
        )

        # Create teacher Q&A record
        qa_record = StudentTeacherQA(
            student_id=student_id,
            teacher_id=teacher_id,
            question=question,
            ai_summary=ai_response["message"],
            is_moderated=False,
            is_answered=False
        )

        self.db.add(qa_record)
        await self.db.commit()
        await self.db.refresh(qa_record)

        return qa_record

    async def get_teacher_responses(self, student_id: UUID) -> List[Dict]:
        """
        Get answered teacher Q&A threads for the student.

        Returns the 20 most recent answered questions with their AI summaries,
        teacher answers, and timestamps.
        """
        result = await self.db.execute(
            select(StudentTeacherQA)
            .where(
                and_(
                    StudentTeacherQA.student_id == student_id,
                    StudentTeacherQA.is_answered == True
                )
            )
            .order_by(StudentTeacherQA.answered_at.desc())
            .limit(20)
        )
        qa_records = result.scalars().all()

        responses = []
        for qa in qa_records:
            responses.append({
                "id": str(qa.id),
                "question": qa.question,
                "question_summary": qa.ai_summary,
                "answer": qa.answer,
                "answered_at": qa.answered_at,
                "is_public": qa.is_public
            })

        return responses

    async def generate_voice_response(
        self,
        student_id: UUID,
        text: str
    ) -> Dict:
        """
        Generate voice response using ElevenLabs TTS

        Note: Requires ElevenLabs API integration
        """
        # Placeholder for ElevenLabs integration
        # In production, this would call ElevenLabs API
        return {
            "audio_url": None,  # Would be actual audio URL
            "text": text,
            "voice_id": "default",
            "timestamp": datetime.utcnow(),
            "message": "Voice generation not yet implemented"
        }
