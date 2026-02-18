"""
Admin API Endpoints for AI Provider Management

This module allows administrators to configure AI providers through the API,
enabling flexible multi-AI orchestration without code changes. Admins can:
- Add any AI provider (text, voice, video, multimodal)
- Configure API endpoints and authentication
- Set provider specializations and capabilities
- Track costs and usage
- Enable/disable providers dynamically
- Mark recommended providers for specific tasks
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import AIProvider
from app.schemas import (
    AIProviderCreate,
    AIProviderUpdate,
    AIProviderResponse,
    AIProviderListResponse,
    RecommendedProviderInfo,
)
from app.utils.security import get_current_active_user, encrypt_api_key


# Create router for AI provider management
router = APIRouter(prefix="/ai-providers", tags=["Admin - AI Providers"])


async def verify_admin_access(current_user: dict = Depends(get_current_active_user)) -> dict:
    """
    Verify that the current user has admin role.

    Args:
        current_user: Current authenticated user from token

    Returns:
        dict: User data if admin

    Raises:
        HTTPException 403: If user is not an admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required."
        )
    return current_user


@router.get(
    "/",
    response_model=AIProviderListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all AI providers",
    description="Get a list of all AI providers. Admins can filter by active status."
)
async def list_ai_providers(
    active_only: bool = Query(False, description="Filter to show only active providers"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(verify_admin_access)
) -> AIProviderListResponse:
    """
    List all AI providers configured in the system.

    Args:
        active_only: If True, return only active providers
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        AIProviderListResponse: List of AI providers with total count

    Raises:
        HTTPException 403: If user is not an admin
        HTTPException 500: If database query fails
    """
    try:
        # Build query
        query = select(AIProvider)

        # Apply filters
        if active_only:
            query = query.where(AIProvider.is_active == True)

        # Order by creation date (newest first)
        query = query.order_by(AIProvider.created_at.desc())

        # Execute query
        result = await db.execute(query)
        providers = result.scalars().all()

        # Convert to response models
        provider_responses = [
            AIProviderResponse.model_validate(provider)
            for provider in providers
        ]

        return AIProviderListResponse(
            providers=provider_responses,
            total=len(provider_responses)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve AI providers: {str(e)}"
        )


@router.get(
    "/recommended",
    response_model=List[RecommendedProviderInfo],
    status_code=status.HTTP_200_OK,
    summary="Get recommended AI providers",
    description="Get a list of platform-recommended AI providers with descriptions (public endpoint)."
)
async def get_recommended_providers(
    db: AsyncSession = Depends(get_db)
) -> List[RecommendedProviderInfo]:
    """
    Get platform-recommended AI providers.

    This is a public endpoint (no authentication required) that returns
    recommended providers with descriptions to help users choose the best AI
    for their needs.

    Args:
        db: Database session

    Returns:
        List[RecommendedProviderInfo]: List of recommended providers

    Raises:
        HTTPException 500: If database query fails
    """
    try:
        # Query recommended active providers
        query = select(AIProvider).where(
            AIProvider.is_recommended == True,
            AIProvider.is_active == True
        ).order_by(AIProvider.name)

        result = await db.execute(query)
        providers = result.scalars().all()

        # Convert to response models
        recommended_providers = [
            RecommendedProviderInfo(
                name=provider.name,
                description=provider.description or f"AI provider specialized in {provider.specialization}",
                specialization=provider.specialization or "general",
                provider_type=provider.provider_type
            )
            for provider in providers
        ]

        return recommended_providers

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve recommended providers: {str(e)}"
        )


@router.post(
    "/",
    response_model=AIProviderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add new AI provider",
    description="Add a new AI provider to the system. The API key will be encrypted before storage."
)
async def create_ai_provider(
    provider_data: AIProviderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(verify_admin_access)
) -> AIProviderResponse:
    """
    Create a new AI provider.

    Args:
        provider_data: Provider configuration data including API key
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        AIProviderResponse: Created provider data (without decrypted API key)

    Raises:
        HTTPException 400: If validation fails or provider already exists
        HTTPException 403: If user is not an admin
        HTTPException 500: If encryption or database operation fails
    """
    try:
        # Encrypt the API key before storage
        encrypted_key = encrypt_api_key(provider_data.api_key)

        # Create provider instance
        new_provider = AIProvider(
            name=provider_data.name,
            provider_type=provider_data.provider_type,
            api_endpoint=provider_data.api_endpoint,
            api_key_encrypted=encrypted_key,
            specialization=provider_data.specialization,
            is_active=True,  # New providers are active by default
            is_recommended=provider_data.is_recommended,
            cost_per_request=provider_data.cost_per_request,
            configuration=provider_data.configuration,
            description=provider_data.description,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Add to database
        db.add(new_provider)
        await db.commit()
        await db.refresh(new_provider)

        return AIProviderResponse.model_validate(new_provider)

    except ValueError as e:
        # Handle encryption errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid API key: {str(e)}"
        )
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider with this configuration already exists"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create AI provider: {str(e)}"
        )


@router.get(
    "/{provider_id}",
    response_model=AIProviderResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI provider details",
    description="Get detailed information about a specific AI provider (without decrypted API key)."
)
async def get_ai_provider(
    provider_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(verify_admin_access)
) -> AIProviderResponse:
    """
    Get details of a specific AI provider.

    Args:
        provider_id: UUID of the provider to retrieve
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        AIProviderResponse: Provider data (without decrypted API key)

    Raises:
        HTTPException 403: If user is not an admin
        HTTPException 404: If provider not found
        HTTPException 500: If database query fails
    """
    try:
        # Query provider by ID
        query = select(AIProvider).where(AIProvider.id == provider_id)
        result = await db.execute(query)
        provider = result.scalar_one_or_none()

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"AI provider with ID {provider_id} not found"
            )

        return AIProviderResponse.model_validate(provider)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve AI provider: {str(e)}"
        )


@router.put(
    "/{provider_id}",
    response_model=AIProviderResponse,
    status_code=status.HTTP_200_OK,
    summary="Update AI provider",
    description="Update an existing AI provider's configuration. If a new API key is provided, it will be encrypted."
)
async def update_ai_provider(
    provider_id: UUID,
    provider_data: AIProviderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(verify_admin_access)
) -> AIProviderResponse:
    """
    Update an existing AI provider.

    Args:
        provider_id: UUID of the provider to update
        provider_data: Updated provider data (only provided fields will be updated)
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        AIProviderResponse: Updated provider data

    Raises:
        HTTPException 400: If validation fails
        HTTPException 403: If user is not an admin
        HTTPException 404: If provider not found
        HTTPException 500: If encryption or database operation fails
    """
    try:
        # Query provider by ID
        query = select(AIProvider).where(AIProvider.id == provider_id)
        result = await db.execute(query)
        provider = result.scalar_one_or_none()

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"AI provider with ID {provider_id} not found"
            )

        # Update fields (only if provided)
        update_data = provider_data.model_dump(exclude_unset=True)

        # Handle API key encryption if provided
        if "api_key" in update_data:
            encrypted_key = encrypt_api_key(update_data["api_key"])
            update_data["api_key_encrypted"] = encrypted_key
            del update_data["api_key"]

        # Update provider fields
        for field, value in update_data.items():
            setattr(provider, field, value)

        # Update timestamp
        provider.updated_at = datetime.utcnow()

        # Commit changes
        await db.commit()
        await db.refresh(provider)

        return AIProviderResponse.model_validate(provider)

    except ValueError as e:
        # Handle encryption errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid API key: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update AI provider: {str(e)}"
        )


@router.delete(
    "/{provider_id}",
    status_code=status.HTTP_200_OK,
    summary="Deactivate AI provider",
    description="Deactivate an AI provider (soft delete). The provider will no longer be used for AI requests."
)
async def deactivate_ai_provider(
    provider_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(verify_admin_access)
) -> dict:
    """
    Deactivate an AI provider (soft delete).

    This sets is_active to False, preventing the provider from being used
    for new AI requests while preserving the configuration history.

    Args:
        provider_id: UUID of the provider to deactivate
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        dict: Success message

    Raises:
        HTTPException 403: If user is not an admin
        HTTPException 404: If provider not found
        HTTPException 500: If database operation fails
    """
    try:
        # Query provider by ID
        query = select(AIProvider).where(AIProvider.id == provider_id)
        result = await db.execute(query)
        provider = result.scalar_one_or_none()

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"AI provider with ID {provider_id} not found"
            )

        # Soft delete by setting is_active to False
        provider.is_active = False
        provider.updated_at = datetime.utcnow()

        # Commit changes
        await db.commit()

        return {
            "message": "Provider deactivated successfully",
            "provider_id": str(provider_id),
            "provider_name": provider.name
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate AI provider: {str(e)}"
        )
