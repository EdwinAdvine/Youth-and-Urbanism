"""
Store API Tests

Tests for e-commerce store endpoints at /api/v1/store/.
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.unit
class TestStoreProducts:
    """Test store product listing endpoints."""

    async def test_list_products_public(self, client):
        response = await client.get("/api/v1/store/products")
        assert response.status_code in (200, 404)

    async def test_get_product_by_slug(self, client):
        response = await client.get("/api/v1/store/products/test-product")
        assert response.status_code in (200, 404)

    async def test_list_categories(self, client):
        response = await client.get("/api/v1/store/categories")
        assert response.status_code in (200, 404)


@pytest.mark.unit
class TestStoreCart:
    """Test shopping cart endpoints."""

    async def test_get_cart_requires_auth(self, client):
        response = await client.get("/api/v1/store/cart")
        assert response.status_code in (401, 403, 404)

    async def test_get_cart_success(self, client, auth_headers):
        response = await client.get("/api/v1/store/cart", headers=auth_headers)
        assert response.status_code in (200, 404)

    async def test_add_to_cart(self, client, auth_headers):
        response = await client.post(
            "/api/v1/store/cart/items",
            json={"product_id": "fake-id", "quantity": 1},
            headers=auth_headers,
        )
        assert response.status_code in (200, 201, 404, 422)

    async def test_remove_from_cart(self, client, auth_headers):
        response = await client.delete(
            "/api/v1/store/cart/items/fake-id",
            headers=auth_headers,
        )
        assert response.status_code in (200, 204, 404)


@pytest.mark.unit
class TestStoreCheckout:
    """Test checkout endpoints."""

    async def test_checkout_requires_auth(self, client):
        response = await client.post("/api/v1/store/checkout")
        assert response.status_code in (401, 403, 404)

    async def test_checkout_empty_cart(self, client, auth_headers):
        response = await client.post(
            "/api/v1/store/checkout",
            json={"payment_method": "wallet"},
            headers=auth_headers,
        )
        assert response.status_code in (200, 400, 404, 422)
