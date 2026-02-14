"""
Seed script: Creates demo partner data including sponsorship programs, children, consents, etc.

Usage (run inside Docker):
    docker exec tuhs_backend python seed_partner_data.py

Or locally:
    cd backend/
    python seed_partner_data.py

Prerequisites:
    - Run seed_users.py first to create tables and base users
    - Database must have at least 15-20 student records
"""

import asyncio
import sys
import os
from datetime import datetime, date, timedelta
from decimal import Decimal
import uuid

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

from sqlalchemy import select
from app.database import init_db, Base
from app.models import *  # noqa: F403 - Import all models so Base.metadata is populated
from app.models.user import User
from app.models.student import Student
from app.models.partner import (
    PartnerProfile,
    SponsorshipProgram, SponsoredChild, SponsorshipConsent,
    ProgramType, ProgramStatus, SponsoredChildStatus, BillingPeriod,
    PartnerSubscription, PartnerPayment,
    PartnerSubscriptionStatus, PartnerPaymentStatus, PartnerPaymentGateway,
    PartnerImpactReport, ReportType, ExportFormat,
    PartnerMessage, PartnerMeeting, MeetingStatus,
    PartnerResource, ResourceStatus, ResourceType,
    PartnerTicket, TicketPriority, TicketStatus, TicketCategory,
)


async def main():
    print("=" * 70)
    print("  Urban Home School - Partner Dashboard Data Seeding")
    print("=" * 70)

    # Initialize database connection
    print("\n1. Initializing database connection...")
    await init_db()
    from app.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        # Get or verify partner user exists
        print("\n2. Checking partner user...")
        result = await session.execute(
            select(User).where(User.email == "partner@urbanhomeschool.co.ke")
        )
        partner_user = result.scalars().first()

        if not partner_user:
            print("   ERROR: Partner user not found. Please run seed_users.py first.")
            return

        print(f"   Partner user found: {partner_user.email} (ID: {partner_user.id})")

        # Create PartnerProfile
        print("\n3. Creating partner profile...")
        result = await session.execute(
            select(PartnerProfile).where(PartnerProfile.user_id == partner_user.id)
        )
        existing_profile = result.scalars().first()

        if existing_profile:
            print("   [SKIP] Partner profile already exists")
            partner_profile = existing_profile
        else:
            partner_profile = PartnerProfile(
                user_id=partner_user.id,
                organization_name="Hope Foundation Kenya",
                organization_type="NGO",
                display_name="Hope Foundation",
                bio="Empowering Kenyan children through education and technology. We believe every child deserves access to quality learning resources.",
                tagline="Building Brighter Futures Through Education",
                logo_url="/assets/partners/hope-foundation-logo.png",
                banner_url="/assets/partners/hope-foundation-banner.jpg",
                contact_person="Grace Akinyi",
                contact_email="grace@hopefoundation.ke",
                contact_phone="+254712345678",
                address={
                    "street": "Moi Avenue, Nairobi",
                    "city": "Nairobi",
                    "county": "Nairobi",
                    "postal_code": "00100",
                    "country": "Kenya"
                },
                website="https://hopefoundation.ke",
                social_links={
                    "twitter": "@HopeFoundationKE",
                    "linkedin": "hope-foundation-kenya",
                    "facebook": "HopeFoundationKenya"
                },
                registration_number="NGO/12345/2020",
                tax_id="A123456789P",
                tax_exempt=True,
                specializations=["CBC Education", "STEM", "Literacy", "Digital Skills"],
                partnership_tier="premium",
                onboarding_completed=True,
                onboarding_step=5,
                branding_config={
                    "primary_color": "#E40000",
                    "secondary_color": "#FFD700",
                    "logo_position": "top-left",
                    "include_in_reports": True
                }
            )
            session.add(partner_profile)
            await session.flush()
            print(f"   [NEW] Partner profile created: {partner_profile.organization_name}")

        # Get available students
        print("\n4. Fetching available students for sponsorship...")
        result = await session.execute(select(Student).limit(25))
        all_students = result.scalars().all()

        if len(all_students) < 15:
            print(f"   WARNING: Only {len(all_students)} students found. Need at least 15.")
            print("   Consider running additional seed scripts to create more students.")
            students_to_sponsor = all_students
        else:
            students_to_sponsor = all_students[:20]
            print(f"   Found {len(all_students)} students. Will sponsor {len(students_to_sponsor)}.")

        # Create Sponsorship Programs
        print("\n5. Creating sponsorship programs...")
        programs = []

        # Program 1: STEM Achievers Cohort
        result = await session.execute(
            select(SponsorshipProgram).where(
                SponsorshipProgram.partner_id == partner_user.id,
                SponsorshipProgram.name == "STEM Achievers Cohort 2026"
            )
        )
        existing_prog1 = result.scalars().first()

        if existing_prog1:
            print("   [SKIP] STEM Achievers program already exists")
            program1 = existing_prog1
        else:
            program1 = SponsorshipProgram(
                partner_id=partner_user.id,
                name="STEM Achievers Cohort 2026",
                description="Supporting talented students in Science, Technology, Engineering, and Mathematics with full access to AI-powered learning.",
                program_type=ProgramType.COHORT,
                min_children=10,
                max_children=15,
                status=ProgramStatus.ACTIVE,
                billing_period=BillingPeriod.MONTHLY,
                price_per_child=Decimal("2500.00"),
                currency="KES",
                custom_pricing_notes="Discounted rate for cohort sponsorship",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 12, 31),
                goals={
                    "academic": "Improve STEM competency by 30%",
                    "engagement": "Maintain 90% weekly active learning",
                    "completion": "80% course completion rate"
                },
                approved_by=partner_user.id,
                approved_at=datetime.utcnow() - timedelta(days=30)
            )
            session.add(program1)
            await session.flush()
            print(f"   [NEW] Program created: {program1.name}")
        programs.append(program1)

        # Program 2: Direct Scholarship Program
        result = await session.execute(
            select(SponsorshipProgram).where(
                SponsorshipProgram.partner_id == partner_user.id,
                SponsorshipProgram.name == "Individual Scholarship Program"
            )
        )
        existing_prog2 = result.scalars().first()

        if existing_prog2:
            print("   [SKIP] Individual Scholarship program already exists")
            program2 = existing_prog2
        else:
            program2 = SponsorshipProgram(
                partner_id=partner_user.id,
                name="Individual Scholarship Program",
                description="Direct sponsorship for students from underserved communities.",
                program_type=ProgramType.DIRECT,
                min_children=10,
                max_children=20,
                status=ProgramStatus.ACTIVE,
                billing_period=BillingPeriod.TERMLY,
                price_per_child=Decimal("6000.00"),
                currency="KES",
                custom_pricing_notes="Termly payment covering 3 months",
                start_date=date(2026, 1, 1),
                end_date=None,  # Open-ended
                goals={
                    "reach": "Support 20 students from Kibera, Mathare, and Kawangware",
                    "retention": "95% program retention rate",
                    "literacy": "Improve literacy scores by 25%"
                },
                approved_by=partner_user.id,
                approved_at=datetime.utcnow() - timedelta(days=45)
            )
            session.add(program2)
            await session.flush()
            print(f"   [NEW] Program created: {program2.name}")
        programs.append(program2)

        # Create Sponsored Children
        print("\n6. Adding children to sponsorship programs...")
        sponsored_children = []

        # Split students between programs
        stem_students = students_to_sponsor[:12]
        direct_students = students_to_sponsor[12:20] if len(students_to_sponsor) >= 20 else students_to_sponsor[12:]

        # Add to STEM program
        for idx, student in enumerate(stem_students):
            result = await session.execute(
                select(SponsoredChild).where(
                    SponsoredChild.program_id == program1.id,
                    SponsoredChild.student_id == student.id
                )
            )
            existing = result.scalars().first()

            if existing:
                sponsored_children.append(existing)
                continue

            sponsored_child = SponsoredChild(
                program_id=program1.id,
                student_id=student.id,
                partner_id=partner_user.id,
                status=SponsoredChildStatus.ACTIVE,
                enrolled_at=datetime.utcnow() - timedelta(days=25),
                partner_goals={
                    "q1_target": "Complete 5 STEM courses",
                    "q2_target": "Score above 80% in assessments",
                    "notes": f"Sponsored student {idx + 1} in STEM cohort"
                },
                ai_milestones={
                    "milestone_1": "Master Python basics",
                    "milestone_2": "Complete CBC Grade-level Mathematics",
                    "milestone_3": "Participate in coding challenge"
                },
                notes=f"High-potential student showing strong interest in {['coding', 'mathematics', 'physics', 'chemistry'][idx % 4]}"
            )
            session.add(sponsored_child)
            sponsored_children.append(sponsored_child)

        # Add to Direct program
        for idx, student in enumerate(direct_students):
            result = await session.execute(
                select(SponsoredChild).where(
                    SponsoredChild.program_id == program2.id,
                    SponsoredChild.student_id == student.id
                )
            )
            existing = result.scalars().first()

            if existing:
                sponsored_children.append(existing)
                continue

            sponsored_child = SponsoredChild(
                program_id=program2.id,
                student_id=student.id,
                partner_id=partner_user.id,
                status=SponsoredChildStatus.ACTIVE,
                enrolled_at=datetime.utcnow() - timedelta(days=40),
                partner_goals={
                    "academic": "Improve overall grade average by 15%",
                    "engagement": "Consistent weekly learning sessions",
                    "notes": "Direct scholarship recipient"
                },
                ai_milestones={
                    "reading": "Improve reading level by 2 grades",
                    "confidence": "Increase learning confidence score"
                },
                notes=f"Community referral from {['Kibera', 'Mathare', 'Kawangware'][idx % 3]}"
            )
            session.add(sponsored_child)
            sponsored_children.append(sponsored_child)

        await session.flush()
        print(f"   Added {len(sponsored_children)} children to programs")

        # Create Consent Records
        print("\n7. Creating parent consent records...")
        consent_count = 0
        for sponsored_child in sponsored_children[:10]:  # First 10 have consents
            result = await session.execute(
                select(SponsorshipConsent).where(
                    SponsorshipConsent.sponsored_child_id == sponsored_child.id
                )
            )
            existing_consent = result.scalars().first()

            if existing_consent:
                continue

            # Get student's parent
            result = await session.execute(
                select(Student).where(Student.id == sponsored_child.student_id)
            )
            student = result.scalars().first()

            consent = SponsorshipConsent(
                sponsored_child_id=sponsored_child.id,
                parent_id=student.parent_id if student.parent_id else partner_user.id,  # Fallback for demo
                consent_given=True,
                consent_text="I hereby grant consent for my child to participate in the Hope Foundation sponsorship program. I understand that anonymized learning data will be shared with the sponsor for monitoring purposes only.",
                ip_address="102.68.137.22",
                user_agent="Mozilla/5.0 (Linux; Android 12) Mobile Safari/605.1.15",
                consented_at=datetime.utcnow() - timedelta(days=20)
            )
            session.add(consent)
            consent_count += 1

        await session.flush()
        print(f"   Created {consent_count} parent consent records")

        # Create Subscriptions
        print("\n8. Creating partner subscriptions...")
        subscriptions = []

        # Subscription for STEM program
        result = await session.execute(
            select(PartnerSubscription).where(
                PartnerSubscription.partner_id == partner_user.id,
                PartnerSubscription.program_id == program1.id
            )
        )
        existing_sub1 = result.scalars().first()

        if existing_sub1:
            print("   [SKIP] STEM program subscription exists")
            sub1 = existing_sub1
        else:
            sub1 = PartnerSubscription(
                partner_id=partner_user.id,
                program_id=program1.id,
                billing_period="monthly",
                amount_per_child=Decimal("2500.00"),
                total_children=12,
                total_amount=Decimal("30000.00"),
                currency="KES",
                status=PartnerSubscriptionStatus.ACTIVE,
                current_period_start=date(2026, 2, 1),
                current_period_end=date(2026, 2, 28),
                next_billing_date=date(2026, 3, 1),
                auto_renew=True
            )
            session.add(sub1)
            await session.flush()
            print(f"   [NEW] STEM subscription created: KES 30,000/month")
        subscriptions.append(sub1)

        # Subscription for Direct program
        result = await session.execute(
            select(PartnerSubscription).where(
                PartnerSubscription.partner_id == partner_user.id,
                PartnerSubscription.program_id == program2.id
            )
        )
        existing_sub2 = result.scalars().first()

        if existing_sub2:
            print("   [SKIP] Direct program subscription exists")
            sub2 = existing_sub2
        else:
            sub2 = PartnerSubscription(
                partner_id=partner_user.id,
                program_id=program2.id,
                billing_period="termly",
                amount_per_child=Decimal("6000.00"),
                total_children=len(direct_students),
                total_amount=Decimal(str(6000 * len(direct_students))),
                currency="KES",
                status=PartnerSubscriptionStatus.ACTIVE,
                current_period_start=date(2026, 1, 1),
                current_period_end=date(2026, 3, 31),
                next_billing_date=date(2026, 4, 1),
                auto_renew=True
            )
            session.add(sub2)
            await session.flush()
            print(f"   [NEW] Direct subscription created: KES {6000 * len(direct_students)}/term")
        subscriptions.append(sub2)

        # Create Payment Records
        print("\n9. Creating payment records...")
        payment_count = 0

        for subscription in subscriptions:
            # Create 2 past payments
            for i in range(2):
                payment = PartnerPayment(
                    subscription_id=subscription.id,
                    partner_id=partner_user.id,
                    amount=subscription.total_amount,
                    currency=subscription.currency,
                    status=PartnerPaymentStatus.COMPLETED,
                    payment_gateway=PartnerPaymentGateway.MPESA,
                    transaction_reference=f"MPESA{uuid.uuid4().hex[:10].upper()}",
                    gateway_response={
                        "MpesaReceiptNumber": f"QA{uuid.uuid4().hex[:8].upper()}",
                        "TransactionDate": (datetime.utcnow() - timedelta(days=30 * (i + 1))).isoformat(),
                        "PhoneNumber": "254712345678"
                    },
                    receipt_url=f"/receipts/partner_{uuid.uuid4().hex[:12]}.pdf",
                    invoice_number=f"INV-HF-{2026}-{100 + payment_count:04d}",
                    period_start=date(2026, 1 - i, 1),
                    period_end=date(2026, 1 - i, 28),
                    paid_at=datetime.utcnow() - timedelta(days=30 * (i + 1))
                )
                session.add(payment)
                payment_count += 1

        await session.flush()
        print(f"   Created {payment_count} payment records")

        # Create Impact Reports
        print("\n10. Creating impact reports...")
        report_count = 0

        for program in programs:
            report = PartnerImpactReport(
                partner_id=partner_user.id,
                program_id=program.id,
                report_type=ReportType.MONTHLY,
                title=f"{program.name} - January 2026 Impact Report",
                summary="This month showed strong engagement with 92% weekly active learning rate. Students demonstrated significant progress in CBC competencies with an average 18% improvement in assessment scores.",
                metrics={
                    "total_children": 12 if program.program_type == ProgramType.COHORT else len(direct_students),
                    "active_learners": 11,
                    "avg_weekly_hours": 8.5,
                    "courses_completed": 24,
                    "avg_assessment_score": 78.5,
                    "competency_growth": "+18%",
                    "parent_satisfaction": "4.6/5"
                },
                ai_insights={
                    "strengths": [
                        "Strong engagement in STEM subjects",
                        "Consistent learning patterns established",
                        "High parent satisfaction scores"
                    ],
                    "challenges": [
                        "Some students need additional literacy support",
                        "Internet connectivity issues in 2 households"
                    ],
                    "recommendations": [
                        "Introduce peer learning groups for collaborative STEM projects",
                        "Provide offline learning resources for connectivity challenges",
                        "Focus on reading comprehension in upcoming term"
                    ],
                    "forecast": "Projected 25% competency improvement by end of Q1"
                },
                generated_at=datetime.utcnow() - timedelta(days=3),
                exported_at=datetime.utcnow() - timedelta(days=2),
                export_format=ExportFormat.PDF,
                export_url=f"/reports/impact_{uuid.uuid4().hex[:12]}.pdf"
            )
            session.add(report)
            report_count += 1

        await session.flush()
        print(f"   Created {report_count} impact reports")

        # Create Sample Tickets
        print("\n11. Creating support tickets...")
        tickets = [
            {
                "subject": "Question about February billing",
                "description": "I'd like to understand the breakdown of next month's invoice for the STEM program.",
                "category": TicketCategory.BILLING,
                "priority": TicketPriority.MEDIUM,
                "status": TicketStatus.RESOLVED,
                "resolved_at": datetime.utcnow() - timedelta(days=2)
            },
            {
                "subject": "Request for custom impact report",
                "description": "Can we get a detailed breakdown of each child's progress in Mathematics specifically?",
                "category": TicketCategory.REPORTING,
                "priority": TicketPriority.LOW,
                "status": TicketStatus.OPEN,
                "resolved_at": None
            },
            {
                "subject": "Add 3 more children to program",
                "description": "We've identified 3 more eligible students for the Individual Scholarship Program. Can you help with enrollment?",
                "category": TicketCategory.ENROLLMENT,
                "priority": TicketPriority.HIGH,
                "status": TicketStatus.IN_PROGRESS,
                "resolved_at": None
            }
        ]

        ticket_count = 0
        for ticket_data in tickets:
            ticket = PartnerTicket(
                partner_id=partner_user.id,
                subject=ticket_data["subject"],
                description=ticket_data["description"],
                category=ticket_data["category"],
                priority=ticket_data["priority"],
                status=ticket_data["status"],
                ai_triage_category=ticket_data["category"].value,
                ai_triage_priority=ticket_data["priority"].value,
                attachments=[],
                resolution="Billing breakdown sent via email." if ticket_data["status"] == TicketStatus.RESOLVED else None,
                resolved_at=ticket_data["resolved_at"]
            )
            session.add(ticket)
            ticket_count += 1

        await session.flush()
        print(f"   Created {ticket_count} support tickets")

        # Create Sample Messages
        print("\n12. Creating collaboration messages...")
        message = PartnerMessage(
            partner_id=partner_user.id,
            recipient_id=partner_user.id,  # Demo: self-message
            subject="Welcome to Urban Home School Partner Dashboard",
            body="Thank you for partnering with us to transform education in Kenya. Your dashboard provides real-time insights into your sponsored children's learning journeys. Explore the Analytics section for detailed impact reports.",
            attachments={"files": []},
            read_at=datetime.utcnow() - timedelta(days=1)
        )
        session.add(message)
        print("   [NEW] Welcome message created")

        # Create Sample Meeting
        print("\n13. Creating scheduled meeting...")
        meeting = PartnerMeeting(
            partner_id=partner_user.id,
            title="Q1 Impact Review - STEM Achievers Cohort",
            description="Quarterly review of program outcomes, challenges, and planning for Q2 activities.",
            scheduled_at=datetime.utcnow() + timedelta(days=7),
            duration_minutes=60,
            meeting_url="https://meet.urbanhomeschool.co.ke/partner/q1-review",
            attendees={
                "partner": ["Grace Akinyi"],
                "staff": ["Program Coordinator", "Data Analyst"],
                "optional": ["Finance Team"]
            },
            status=MeetingStatus.SCHEDULED,
            ai_suggested=True,
            notes="AI recommended based on program milestone completion"
        )
        session.add(meeting)
        print("   [NEW] Meeting scheduled")

        # Create Sample Resource
        print("\n14. Creating partner resource contribution...")
        resource = PartnerResource(
            partner_id=partner_user.id,
            title="Hope Foundation STEM Challenge Workbook",
            description="Supplementary workbook for Grade 5-7 students covering robotics, coding basics, and environmental science projects.",
            resource_type=ResourceType.MATERIAL,
            file_url="/resources/partner/hf_stem_workbook_2026.pdf",
            file_size=2457600,  # ~2.4 MB
            mime_type="application/pdf",
            status=ResourceStatus.APPROVED,
            branding_applied=True,
            usage_count=47,
            target_programs=[str(program1.id)]
        )
        session.add(resource)
        print("   [NEW] Resource contribution added")

        # Commit all changes
        await session.commit()

        print("\n" + "=" * 70)
        print("  SEEDING COMPLETE")
        print("=" * 70)
        print(f"  Partner: {partner_profile.organization_name}")
        print(f"  Programs: {len(programs)}")
        print(f"  Sponsored Children: {len(sponsored_children)}")
        print(f"  Consents: {consent_count}")
        print(f"  Subscriptions: {len(subscriptions)}")
        print(f"  Payments: {payment_count}")
        print(f"  Impact Reports: {report_count}")
        print(f"  Support Tickets: {ticket_count}")
        print("=" * 70)
        print("\n  Login as partner@urbanhomeschool.co.ke to view dashboard")
        print("=" * 70)

    # Cleanup
    from app.database import engine
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
