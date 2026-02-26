"""
Notification Service Tests

Tests for app/services/notification_service.py:
- create_notification()
- get_notifications()
- get_unread_count()
- mark_as_read()
- mark_all_as_read()
- delete_notification()
"""

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.notification_service import (
    create_notification,
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
    delete_notification,
)


def _make_mock_notification(**overrides):
    """Build a mock Notification object."""
    defaults = {
        "id": uuid.uuid4(),
        "user_id": uuid.uuid4(),
        "type": "system",
        "title": "Test Notification",
        "message": "This is a test notification",
        "is_read": False,
        "action_url": None,
        "action_label": None,
        "metadata_": {},
        "created_at": datetime.utcnow(),
        "read_at": None,
    }
    defaults.update(overrides)
    obj = MagicMock()
    for k, v in defaults.items():
        setattr(obj, k, v)
    return obj


@pytest.mark.unit
class TestCreateNotification:
    """Tests for create_notification()."""

    async def test_creates_notification_with_required_fields(self):
        """create_notification should add a Notification and flush."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        result = await create_notification(
            db=mock_db,
            user_id=user_id,
            type="system",
            title="Welcome",
            message="Welcome to Urban Home School!",
        )

        mock_db.add.assert_called_once()
        mock_db.flush.assert_awaited_once()

    async def test_creates_notification_with_optional_fields(self):
        """create_notification should pass optional fields to the model."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        result = await create_notification(
            db=mock_db,
            user_id=user_id,
            type="assignment",
            title="New Assignment",
            message="You have a new assignment in Mathematics",
            action_url="/courses/math/assignments/1",
            action_label="View Assignment",
            metadata={"course_id": "abc123"},
        )

        added_obj = mock_db.add.call_args[0][0]
        assert added_obj.action_url == "/courses/math/assignments/1"
        assert added_obj.action_label == "View Assignment"
        assert added_obj.metadata_ == {"course_id": "abc123"}

    async def test_creates_notification_with_empty_metadata(self):
        """create_notification should default metadata to empty dict."""
        mock_db = AsyncMock()

        result = await create_notification(
            db=mock_db,
            user_id=uuid.uuid4(),
            type="course",
            title="Course Update",
            message="Your course has been updated",
        )

        added_obj = mock_db.add.call_args[0][0]
        assert added_obj.metadata_ == {}


@pytest.mark.unit
class TestGetNotifications:
    """Tests for get_notifications()."""

    async def test_returns_paginated_results(self):
        """get_notifications should return notifications with pagination info."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        # total count
        total_res = MagicMock()
        total_res.scalar.return_value = 5
        # unread count
        unread_res = MagicMock()
        unread_res.scalar.return_value = 3
        # notifications list
        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = [
            _make_mock_notification(),
            _make_mock_notification(),
        ]

        mock_db.execute = AsyncMock(side_effect=[total_res, unread_res, items_res])

        result = await get_notifications(mock_db, user_id)

        assert result["total"] == 5
        assert result["unread_count"] == 3
        assert result["page"] == 1
        assert result["limit"] == 20
        assert len(result["notifications"]) == 2

    async def test_filters_by_is_read(self):
        """get_notifications should filter by is_read when provided."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        total_res = MagicMock()
        total_res.scalar.return_value = 2
        unread_res = MagicMock()
        unread_res.scalar.return_value = 2
        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = [
            _make_mock_notification(is_read=False),
            _make_mock_notification(is_read=False),
        ]

        mock_db.execute = AsyncMock(side_effect=[total_res, unread_res, items_res])

        result = await get_notifications(mock_db, user_id, is_read=False)

        assert result["total"] == 2

    async def test_filters_by_notification_type(self):
        """get_notifications should filter by notification type."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        total_res = MagicMock()
        total_res.scalar.return_value = 1
        unread_res = MagicMock()
        unread_res.scalar.return_value = 0
        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = [
            _make_mock_notification(type="quiz"),
        ]

        mock_db.execute = AsyncMock(side_effect=[total_res, unread_res, items_res])

        result = await get_notifications(mock_db, user_id, notification_type="quiz")

        assert result["total"] == 1

    async def test_returns_empty_for_no_notifications(self):
        """get_notifications should return empty list when no notifications."""
        mock_db = AsyncMock()

        total_res = MagicMock()
        total_res.scalar.return_value = 0
        unread_res = MagicMock()
        unread_res.scalar.return_value = 0
        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = []

        mock_db.execute = AsyncMock(side_effect=[total_res, unread_res, items_res])

        result = await get_notifications(mock_db, uuid.uuid4())

        assert result["total"] == 0
        assert result["notifications"] == []


@pytest.mark.unit
class TestGetUnreadCount:
    """Tests for get_unread_count()."""

    async def test_returns_unread_count(self):
        """get_unread_count should return the number of unread notifications."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        mock_result = MagicMock()
        mock_result.scalar.return_value = 7
        mock_db.execute.return_value = mock_result

        result = await get_unread_count(mock_db, user_id)

        assert result == 7

    async def test_returns_zero_when_all_read(self):
        """get_unread_count should return 0 when all notifications are read."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar.return_value = 0
        mock_db.execute.return_value = mock_result

        result = await get_unread_count(mock_db, uuid.uuid4())

        assert result == 0


@pytest.mark.unit
class TestMarkAsRead:
    """Tests for mark_as_read()."""

    async def test_marks_notification_as_read(self):
        """mark_as_read should set is_read=True and read_at timestamp."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()
        notification = _make_mock_notification(user_id=user_id, is_read=False)

        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = notification
        mock_db.execute.return_value = mock_result

        result = await mark_as_read(mock_db, user_id, notification.id)

        assert notification.is_read is True
        assert notification.read_at is not None
        mock_db.flush.assert_awaited_once()

    async def test_does_not_re_mark_already_read(self):
        """mark_as_read should not update if already read."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()
        notification = _make_mock_notification(user_id=user_id, is_read=True)

        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = notification
        mock_db.execute.return_value = mock_result

        result = await mark_as_read(mock_db, user_id, notification.id)

        mock_db.flush.assert_not_awaited()

    async def test_returns_none_when_not_found(self):
        """mark_as_read should return None if notification not found."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        mock_db.execute.return_value = mock_result

        result = await mark_as_read(mock_db, uuid.uuid4(), uuid.uuid4())

        assert result is None


@pytest.mark.unit
class TestMarkAllAsRead:
    """Tests for mark_all_as_read()."""

    async def test_marks_all_unread_as_read(self):
        """mark_all_as_read should update unread notifications and return count."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        mock_result = MagicMock()
        mock_result.rowcount = 5
        mock_db.execute.return_value = mock_result

        count = await mark_all_as_read(mock_db, user_id)

        assert count == 5
        mock_db.flush.assert_awaited_once()

    async def test_returns_zero_when_none_unread(self):
        """mark_all_as_read should return 0 when there are no unread notifications."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_db.execute.return_value = mock_result

        count = await mark_all_as_read(mock_db, uuid.uuid4())

        assert count == 0


@pytest.mark.unit
class TestDeleteNotification:
    """Tests for delete_notification()."""

    async def test_deletes_notification(self):
        """delete_notification should delete the notification and return True."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()
        notification = _make_mock_notification(user_id=user_id)

        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = notification
        mock_db.execute.return_value = mock_result

        result = await delete_notification(mock_db, user_id, notification.id)

        assert result is True
        mock_db.delete.assert_awaited_once_with(notification)
        mock_db.flush.assert_awaited_once()

    async def test_returns_false_when_not_found(self):
        """delete_notification should return False if notification not found."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        mock_db.execute.return_value = mock_result

        result = await delete_notification(mock_db, uuid.uuid4(), uuid.uuid4())

        assert result is False
        mock_db.delete.assert_not_awaited()
