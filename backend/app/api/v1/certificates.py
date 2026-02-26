"""
Certificate API Endpoints

Public certificate validation and admin/instructor certificate management.
Supports issuing, listing, validating, and revoking certificates.
"""

import uuid
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.certificate import Certificate
from app.utils.security import get_current_user
from app.schemas.certificate_schemas import (
    CertificateCreate,
    CertificateResponse,
    CertificateValidationResponse,
    CertificateListResponse,
)


router = APIRouter(prefix="/certificates", tags=["Certificates"])


def generate_serial_number() -> str:
    """Generate a unique certificate serial number in format UHS-YYYYMMDD-XXXXX."""
    date_part = datetime.utcnow().strftime("%Y%m%d")
    random_part = str(uuid.uuid4())[:5].upper()
    return f"UHS-{date_part}-{random_part}"


# ============================================================================
# Public Endpoints
# ============================================================================

@router.get(
    "/validate/{serial_number}",
    response_model=CertificateValidationResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate certificate",
    description="Public endpoint to validate a certificate by its serial number. No authentication required.",
)
async def validate_certificate(
    serial_number: str,
    db: AsyncSession = Depends(get_db),
) -> CertificateValidationResponse:
    """Validate a certificate by serial number (public, no auth required)."""
    result = await db.execute(
        select(Certificate).where(Certificate.serial_number == serial_number)
    )
    certificate = result.scalar_one_or_none()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found. Please check the serial number and try again.",
        )

    return CertificateValidationResponse(
        is_valid=certificate.is_valid,
        serial_number=certificate.serial_number,
        student_name=certificate.student_name,
        course_name=certificate.course_name,
        completion_date=certificate.completion_date,
        grade=certificate.grade,
        issued_at=certificate.issued_at,
    )


# ============================================================================
# Authenticated Endpoints
# ============================================================================

@router.post(
    "",
    response_model=CertificateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Issue certificate",
    description="Admin or instructor endpoint to issue a new certificate.",
)
async def issue_certificate(
    data: CertificateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CertificateResponse:
    """Issue a new certificate (admin/instructor only)."""
    if current_user.role not in ("admin", "instructor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and instructors can issue certificates",
        )

    # Generate a unique serial number (retry if collision)
    serial_number = generate_serial_number()

    # Check for unlikely collision
    existing = await db.execute(
        select(Certificate).where(Certificate.serial_number == serial_number)
    )
    if existing.scalar_one_or_none():
        serial_number = generate_serial_number()

    certificate = Certificate(
        serial_number=serial_number,
        student_id=data.student_id,
        student_name=data.student_name,
        course_id=data.course_id,
        course_name=data.course_name,
        grade=data.grade,
        completion_date=data.completion_date,
    )

    db.add(certificate)
    await db.flush()
    await db.refresh(certificate)

    return CertificateResponse.model_validate(certificate)


@router.get(
    "",
    response_model=CertificateListResponse,
    status_code=status.HTTP_200_OK,
    summary="List certificates",
    description="List certificates. Admins see all; other users see only their own.",
)
async def list_certificates(
    student_id: Optional[UUID] = Query(None, description="Filter by student ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CertificateListResponse:
    """List certificates (admin sees all, others see own certificates)."""
    query = select(Certificate)
    count_query = select(func.count(Certificate.id))

    if current_user.role == "admin":
        # Admin can see all, optionally filtered by student_id
        if student_id:
            query = query.where(Certificate.student_id == student_id)
            count_query = count_query.where(Certificate.student_id == student_id)
    else:
        # Non-admin users can only see their own certificates
        query = query.where(Certificate.student_id == current_user.id)
        count_query = count_query.where(Certificate.student_id == current_user.id)

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Get paginated results
    query = query.order_by(Certificate.issued_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    certificates = result.scalars().all()

    return CertificateListResponse(
        certificates=[CertificateResponse.model_validate(c) for c in certificates],
        total=total,
    )


@router.put(
    "/{certificate_id}/revoke",
    response_model=CertificateResponse,
    status_code=status.HTTP_200_OK,
    summary="Revoke certificate",
    description="Admin-only endpoint to revoke a certificate.",
)
async def revoke_certificate(
    certificate_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CertificateResponse:
    """Revoke a certificate (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(Certificate).where(Certificate.id == certificate_id)
    )
    certificate = result.scalar_one_or_none()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )

    if not certificate.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate is already revoked",
        )

    certificate.is_valid = False
    certificate.revoked_at = datetime.utcnow()
    await db.flush()
    await db.refresh(certificate)

    return CertificateResponse.model_validate(certificate)


@router.get(
    "/{certificate_id}/pdf",
    status_code=status.HTTP_200_OK,
    summary="Download certificate as PDF",
    description="Generate and download a certificate PDF. Owner or admin only.",
    response_class=Response,
)
async def download_certificate_pdf(
    certificate_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Generate and stream a certificate PDF (owner or admin)."""
    result = await db.execute(
        select(Certificate).where(Certificate.id == certificate_id)
    )
    certificate = result.scalar_one_or_none()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )

    # Only the certificate owner or an admin can download
    is_admin = current_user.role in ("admin", "staff")
    is_owner = certificate.student_id == current_user.id
    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to download this certificate",
        )

    if not certificate.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate has been revoked and cannot be downloaded",
        )

    try:
        from app.services.certificate_pdf_service import generate_certificate_pdf

        pdf_bytes = generate_certificate_pdf(
            student_name=certificate.student_name,
            course_name=certificate.course_name,
            grade=certificate.grade,
            serial_number=certificate.serial_number,
            completion_date=certificate.completion_date,
            issued_at=certificate.issued_at,
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )

    filename = f"UHS-Certificate-{certificate.serial_number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
