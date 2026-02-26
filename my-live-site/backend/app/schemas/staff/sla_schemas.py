from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SLAPolicyCreate(BaseModel):
    name: str
    priority: str
    category: Optional[str] = None
    first_response_minutes: int
    resolution_minutes: int
    escalation_chain: List[Dict[str, Any]]
    breach_notification: Dict[str, Any] = {}


class SLAStatus(BaseModel):
    policy_name: str
    first_response_deadline: Optional[datetime] = None
    resolution_deadline: Optional[datetime] = None
    first_response_met: bool = False
    is_breached: bool = False
    time_remaining_minutes: Optional[float] = None
    escalation_level: int = 0
