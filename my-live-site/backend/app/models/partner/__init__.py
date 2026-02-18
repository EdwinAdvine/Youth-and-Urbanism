"""
Partner Models

Database models for the partner dashboard feature including
sponsorship programs, child monitoring, billing, impact reports,
collaboration, content contributions, and support tickets.
"""

from app.models.partner.partner_profile import PartnerProfile
from app.models.partner.sponsorship import (
    SponsorshipProgram,
    SponsoredChild,
    SponsorshipConsent,
    ProgramType,
    ProgramStatus,
    SponsoredChildStatus,
    BillingPeriod,
)
from app.models.partner.partner_subscription import (
    PartnerSubscription,
    PartnerPayment,
    PartnerSubscriptionStatus,
    PartnerPaymentStatus,
    PartnerPaymentGateway,
)
from app.models.partner.partner_impact import (
    PartnerImpactReport,
    ReportType,
    ExportFormat,
)
from app.models.partner.partner_collaboration import (
    PartnerMessage,
    PartnerMeeting,
    MeetingStatus,
)
from app.models.partner.partner_content import (
    PartnerResource,
    ResourceStatus,
    ResourceType,
)
from app.models.partner.partner_ticket import (
    PartnerTicket,
    TicketPriority,
    TicketStatus,
    TicketCategory,
)

__all__ = [
    # Profile
    "PartnerProfile",

    # Sponsorship
    "SponsorshipProgram",
    "SponsoredChild",
    "SponsorshipConsent",
    "ProgramType",
    "ProgramStatus",
    "SponsoredChildStatus",
    "BillingPeriod",

    # Subscriptions & Payments
    "PartnerSubscription",
    "PartnerPayment",
    "PartnerSubscriptionStatus",
    "PartnerPaymentStatus",
    "PartnerPaymentGateway",

    # Impact Reports
    "PartnerImpactReport",
    "ReportType",
    "ExportFormat",

    # Collaboration
    "PartnerMessage",
    "PartnerMeeting",
    "MeetingStatus",

    # Content
    "PartnerResource",
    "ResourceStatus",
    "ResourceType",

    # Tickets
    "PartnerTicket",
    "TicketPriority",
    "TicketStatus",
    "TicketCategory",
]
