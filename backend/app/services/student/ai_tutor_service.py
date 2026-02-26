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
from app.utils.student_codes import generate_ait_code


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

    async def _get_or_create_tutor(self, student_id: UUID, student: Student) -> AITutor:
        """Get or create an AI tutor for a student, generating AIT code if needed."""
        tutor_result = await self.db.execute(
            select(AITutor).where(AITutor.student_id == student_id)
        )
        ai_tutor = tutor_result.scalar_one_or_none()

        if not ai_tutor:
            # Generate AIT code before creating the tutor so we know the count
            ait_code = await generate_ait_code(self.db, student.admission_number)
            ai_tutor = AITutor(
                student_id=student_id,
                name="Birdy",
                ait_code=ait_code,
                conversation_history=[],
                total_interactions=0
            )
            self.db.add(ai_tutor)
            await self.db.commit()
            await self.db.refresh(ai_tutor)
        elif not ai_tutor.ait_code:
            # Backfill AIT code for existing tutors that don't have one
            ai_tutor.ait_code = await generate_ait_code(self.db, student.admission_number)
            await self.db.commit()
            await self.db.refresh(ai_tutor)

        return ai_tutor

    async def get_tutor_info(self, student_id: UUID) -> Dict:
        """
        Return display information for the student's AI tutor.

        Includes the tutor name, AIT code, interaction stats, and
        the student's own admission number. Creates the tutor if it
        does not yet exist.
        """
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise ValueError("Student not found")

        ai_tutor = await self._get_or_create_tutor(student_id, student)

        return {
            "tutor_name": ai_tutor.name,
            "ait_code": ai_tutor.ait_code,
            "response_mode": ai_tutor.response_mode,
            "total_interactions": ai_tutor.total_interactions,
            "last_interaction": ai_tutor.last_interaction,
            "admission_number": student.admission_number,
            "grade_level": student.grade_level,
        }

    async def get_plan_with_progress(self, student_id: UUID) -> Dict:
        """
        Return an AI-generated daily learning plan combined with mastery progress.

        Computes whether the student is ahead, on track, or catching up based
        on their mastery records, then returns:
        - learning path activities from the AI
        - overall progress status
        - mastery summary
        - catch-up topic list (if behind)
        """
        try:
            from app.models.student_mastery import StudentMasteryRecord
        except ImportError:
            StudentMasteryRecord = None

        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise ValueError("Student not found")

        # Fetch mastery records
        mastered_count = 0
        total_topics = 0
        catch_up_topics: List[Dict] = []

        if StudentMasteryRecord is not None:
            mastery_result = await self.db.execute(
                select(StudentMasteryRecord).where(
                    StudentMasteryRecord.student_id == student_id
                )
            )
            mastery_records = mastery_result.scalars().all()
            total_topics = len(mastery_records)
            mastered_count = sum(1 for r in mastery_records if r.is_mastered)

            for record in mastery_records:
                if not record.is_mastered and record.mastery_level < 0.7:
                    catch_up_topics.append({
                        "topic": record.topic_name,
                        "subject": record.subject,
                        "mastery_level": round(record.mastery_level * 100),
                    })

        # Determine progress status
        if total_topics == 0:
            progress_status = "on_track"
        else:
            mastery_ratio = mastered_count / total_topics
            if mastery_ratio >= 0.8:
                progress_status = "ahead"
            elif mastery_ratio >= 0.5:
                progress_status = "on_track"
            else:
                progress_status = "catching_up"

        # Get AI learning path
        learning_path_data = await self.get_learning_path(student_id)

        return {
            "progress_status": progress_status,
            "mastered_count": mastered_count,
            "total_topics": total_topics,
            "catch_up_topics": catch_up_topics[:5],  # Return top 5 catch-up topics
            "learning_path": learning_path_data,
            "generated_at": datetime.utcnow(),
        }

    async def chat_with_ai(
        self,
        student_id: UUID,
        message: str,
        conversation_history: Optional[List[Dict]] = None,
        screen_context: Optional[str] = None
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

        # Get or create AI tutor instance (with AIT code generation)
        ai_tutor = await self._get_or_create_tutor(student_id, student)

        # Use conversation history from AI tutor if not provided
        if not conversation_history:
            conversation_history = ai_tutor.conversation_history or []

        # Build Socratic system prompt with full student context
        system_message = self._build_socratic_prompt(student, student_context)

        # Append screen context to system prompt if provided
        if screen_context:
            truncated = screen_context[:2000]
            system_message += (
                f"\n\nSCREEN CONTEXT — the student is currently viewing this content:\n"
                f"---\n{truncated}\n---\n"
                "Use this context to answer questions about what the student sees on screen. "
                "If they ask 'what am I looking at?', describe and explain the screen content above."
            )

        # Effective message for the AI
        effective_message = message

        # Call AI orchestrator
        response = await self.ai_orchestrator.chat(
            message=effective_message,
            conversation_history=conversation_history,
            system_message=system_message,
            task_type="general"
        )

        # Update conversation history
        new_history = list(conversation_history) + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": response["message"]}
        ]

        ai_tutor.conversation_history = new_history
        ai_tutor.total_interactions += 1
        await self.db.commit()

        return {
            "message": response["message"],
            "ait_code": ai_tutor.ait_code,
            "tutor_name": ai_tutor.name,
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

    async def update_journal_entry(
        self,
        student_id: UUID,
        entry_id: UUID,
        content: str,
        mood_tag: Optional[MoodType] = None
    ) -> StudentJournalEntry:
        """Update content and/or mood tag on an existing journal entry owned by the student."""
        result = await self.db.execute(
            select(StudentJournalEntry).where(
                and_(
                    StudentJournalEntry.id == entry_id,
                    StudentJournalEntry.student_id == student_id,
                    StudentJournalEntry.is_deleted == False
                )
            )
        )
        entry = result.scalar_one_or_none()

        if not entry:
            raise ValueError("Journal entry not found or access denied")

        entry.content = content
        if mood_tag is not None:
            entry.mood_tag = mood_tag.value
        entry.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(entry)

        return entry

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

    async def get_available_teachers(self, student_id: UUID) -> List[Dict]:
        """
        Return the class teacher for the student's grade + subject department heads
        for each learning area the student is enrolled in.
        """
        from app.models.grade_assignments import GradeClassTeacher, SubjectDepartmentHead
        from app.models.enrollment import Enrollment
        from app.models.course import Course

        # Fetch student grade
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise ValueError("Student not found")

        teachers: List[Dict] = []

        # Class teacher for student's grade
        ct_result = await self.db.execute(
            select(GradeClassTeacher, User)
            .join(User, GradeClassTeacher.staff_user_id == User.id)
            .where(
                and_(
                    GradeClassTeacher.grade_level == student.grade_level,
                    GradeClassTeacher.is_active == True
                )
            )
        )
        for ct, user in ct_result.all():
            name = user.profile_data.get("full_name", user.email) if user.profile_data else user.email
            teachers.append({
                "id": str(user.id),
                "name": name,
                "role": "class_teacher",
                "subject": None,
                "label": f"{name} (Class Teacher — {ct.grade_level})"
            })

        # Subject department heads for enrolled learning areas
        enrolled_result = await self.db.execute(
            select(Course.learning_area).distinct()
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.is_deleted == False,
                    Course.is_deleted == False
                )
            )
        )
        learning_areas = [row[0] for row in enrolled_result.all() if row[0]]

        for area in learning_areas:
            sdh_result = await self.db.execute(
                select(SubjectDepartmentHead, User)
                .join(User, SubjectDepartmentHead.staff_user_id == User.id)
                .where(
                    and_(
                        SubjectDepartmentHead.learning_area == area,
                        SubjectDepartmentHead.is_active == True
                    )
                )
            )
            for sdh, user in sdh_result.all():
                # Avoid duplicating if same teacher is also class teacher
                if not any(t["id"] == str(user.id) and t["subject"] == area for t in teachers):
                    name = user.profile_data.get("full_name", user.email) if user.profile_data else user.email
                    teachers.append({
                        "id": str(user.id),
                        "name": name,
                        "role": "subject_head",
                        "subject": area,
                        "label": f"{name} ({area} Teacher)"
                    })

        return teachers

    async def get_all_teacher_questions(self, student_id: UUID) -> List[Dict]:
        """All teacher Q&A threads for the student (pending + answered)."""
        result = await self.db.execute(
            select(StudentTeacherQA, User)
            .outerjoin(User, StudentTeacherQA.teacher_id == User.id)
            .where(
                and_(
                    StudentTeacherQA.student_id == student_id,
                    StudentTeacherQA.is_deleted == False
                )
            )
            .order_by(StudentTeacherQA.created_at.desc())
            .limit(30)
        )
        rows = result.all()

        items = []
        for qa, teacher_user in rows:
            teacher_name = ""
            if teacher_user and teacher_user.profile_data:
                teacher_name = teacher_user.profile_data.get("full_name", teacher_user.email)
            elif teacher_user:
                teacher_name = teacher_user.email
            items.append({
                "id": str(qa.id),
                "question": qa.question,
                "ai_summary": qa.ai_summary,
                "answer": qa.answer,
                "teacher_name": teacher_name,
                "status": "answered" if qa.is_answered else "pending",
                "created_at": qa.created_at,
                "answered_at": qa.answered_at,
            })
        return items

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
