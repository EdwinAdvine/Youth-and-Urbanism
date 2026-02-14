"""
Student Support Service - Help, Guides, Tickets
"""
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from uuid import UUID

from app.models.student import Student
from app.services.ai_orchestrator import AIOrchestrator


class SupportService:
    """Service for student support features"""

    # Help guides
    HELP_GUIDES = [
        {
            "id": "getting-started",
            "title": "Getting Started with Urban Home School",
            "category": "basics",
            "description": "Learn the basics of navigating the platform",
            "content": "Welcome to Urban Home School! This guide will help you get started...",
            "video_url": None
        },
        {
            "id": "assignments",
            "title": "How to Submit Assignments",
            "category": "assignments",
            "description": "Step-by-step guide for submitting your work",
            "content": "Submitting assignments is easy! Follow these steps...",
            "video_url": None
        },
        {
            "id": "ai-tutor",
            "title": "Using Your AI Tutor",
            "category": "ai",
            "description": "Get the most out of your AI learning companion",
            "content": "Your AI tutor is here to help you learn! Here's how to use it effectively...",
            "video_url": None
        },
        {
            "id": "live-sessions",
            "title": "Joining Live Classes",
            "category": "live",
            "description": "How to join and participate in live sessions",
            "content": "Live sessions are interactive learning experiences...",
            "video_url": None
        },
        {
            "id": "gamification",
            "title": "Understanding XP and Levels",
            "category": "gamification",
            "description": "Learn how to earn XP and unlock badges",
            "content": "Earn XP by completing activities and level up your learning journey!",
            "video_url": None
        }
    ]

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()

    async def get_help_guides(self, category: Optional[str] = None) -> List[Dict]:
        """Get help guides, optionally filtered by category"""
        guides = self.HELP_GUIDES

        if category:
            guides = [g for g in guides if g["category"] == category]

        return guides

    async def get_guide_by_id(self, guide_id: str) -> Optional[Dict]:
        """Get a specific guide"""
        for guide in self.HELP_GUIDES:
            if guide["id"] == guide_id:
                return guide
        return None

    async def create_support_ticket(
        self,
        student_id: UUID,
        subject: str,
        description: str,
        priority: str = "normal"
    ) -> Dict:
        """
        Create a support ticket

        Note: This would integrate with existing ticket system
        For now, returns mock data
        """
        # In production, create ticket in database
        ticket_data = {
            "ticket_id": f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(student_id)[:8]}",
            "student_id": str(student_id),
            "subject": subject,
            "description": description,
            "priority": priority,
            "status": "open",
            "created_at": datetime.utcnow(),
            "assigned_to": None
        }

        return ticket_data

    async def get_student_tickets(self, student_id: UUID) -> List[Dict]:
        """
        Get student's support tickets

        Note: Would query actual ticket database in production
        """
        # Placeholder - would query tickets table
        return []

    async def ai_help_triage(self, student_id: UUID, question: str) -> Dict:
        """
        AI-powered instant help triage

        Tries to answer question with AI before creating ticket
        """
        # Get student info for context
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Generate AI response
        prompt = f"""A grade {student.grade_level} student needs help with: {question}

Provide:
1. Quick answer if it's a common question
2. Relevant help guide references
3. Whether they should create a support ticket

Keep response clear and helpful."""

        ai_response = await self.ai_orchestrator.chat(
            message=prompt,
            system_message="You are a helpful support assistant for students. Be clear and encouraging.",
            task_type="general"
        )

        return {
            "question": question,
            "ai_response": ai_response["message"],
            "needs_ticket": "create a ticket" in ai_response["message"].lower(),
            "suggested_guides": [],
            "timestamp": datetime.utcnow()
        }

    async def report_problem(
        self,
        student_id: UUID,
        problem_type: str,
        description: str,
        urgency: str = "normal"
    ) -> Dict:
        """Report a technical problem"""
        report = {
            "report_id": f"RPT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "student_id": str(student_id),
            "problem_type": problem_type,
            "description": description,
            "urgency": urgency,
            "status": "reported",
            "created_at": datetime.utcnow()
        }

        # In production, would create database record and notify support team

        return report

    async def get_faq(self) -> List[Dict]:
        """Get frequently asked questions"""
        return [
            {
                "question": "How do I reset my password?",
                "answer": "Click on 'Forgot Password' on the login page and follow the instructions.",
                "category": "account"
            },
            {
                "question": "How do I contact my teacher?",
                "answer": "Use the 'Ask Teacher' feature in your AI Tutor section.",
                "category": "teachers"
            },
            {
                "question": "What are XP points?",
                "answer": "XP (Experience Points) are rewards you earn by completing activities. They help you level up!",
                "category": "gamification"
            },
            {
                "question": "How do I add funds to my wallet?",
                "answer": "Go to Wallet section and choose M-Pesa or Card payment to add funds.",
                "category": "payments"
            },
            {
                "question": "Can I study offline?",
                "answer": "Yes! Download course materials when connected, then study offline anytime.",
                "category": "features"
            }
        ]
