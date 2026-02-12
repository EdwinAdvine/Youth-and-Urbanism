"""
Seed script: Creates product categories and sample products for the UHS store.

Usage (run inside Docker for consistency):
    docker exec tuhs_backend python seed_products.py

Or locally:
    cd backend/
    python seed_products.py

Creates:
- 3 product categories: School Supplies, Branded Merchandise, Books & Materials
- 8 sample products with realistic KES prices (500-5000 KES range)
"""

import asyncio
import sys
import os

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

from sqlalchemy import select, func
from app.database import Base, init_db
from app.models import *  # noqa: F403 - Import all models so Base.metadata is populated
from app.models.store import Product, ProductCategory


# ============================================================================
# Seed Data
# ============================================================================

SEED_CATEGORIES = [
    {
        "name": "School Supplies",
        "slug": "school-supplies",
        "description": "Essential school supplies for everyday learning including bags, stationery, and accessories.",
        "icon": "backpack",
        "display_order": 1,
    },
    {
        "name": "Branded Merchandise",
        "slug": "branded-merchandise",
        "description": "Official Urban Home School branded clothing, accessories, and gear.",
        "icon": "shirt",
        "display_order": 2,
    },
    {
        "name": "Books & Materials",
        "slug": "books-materials",
        "description": "Textbooks, workbooks, and educational materials aligned with the CBC curriculum.",
        "icon": "book",
        "display_order": 3,
    },
]


# Products reference categories by slug for lookup
SEED_PRODUCTS = [
    {
        "name": "UHS School Bag",
        "slug": "uhs-school-bag",
        "description": "Durable Urban Home School branded school bag with padded laptop compartment, multiple pockets, and ergonomic straps. Perfect for carrying books, devices, and supplies.",
        "price": 3500.00,
        "compare_at_price": 4200.00,
        "category_slug": "school-supplies",
        "inventory_count": 50,
        "sku": "UHS-BAG-001",
        "weight_grams": 800,
        "is_featured": True,
        "tags": ["bag", "school", "branded", "laptop"],
        "images": ["/images/products/school-bag-front.jpg", "/images/products/school-bag-side.jpg"],
    },
    {
        "name": "UHS School Uniform Polo",
        "slug": "uhs-school-uniform-polo",
        "description": "Official Urban Home School polo shirt in navy blue with embroidered logo. Made from breathable cotton blend fabric suitable for the Kenyan climate.",
        "price": 1800.00,
        "compare_at_price": None,
        "category_slug": "branded-merchandise",
        "inventory_count": 120,
        "sku": "UHS-POLO-001",
        "weight_grams": 250,
        "is_featured": True,
        "tags": ["uniform", "polo", "branded", "clothing"],
        "images": ["/images/products/polo-front.jpg"],
    },
    {
        "name": "Exercise Book Set (10 Pack)",
        "slug": "exercise-book-set-10",
        "description": "Pack of 10 high-quality 200-page exercise books with UHS cover design. Ruled pages suitable for all subjects. A4 size.",
        "price": 750.00,
        "compare_at_price": 900.00,
        "category_slug": "school-supplies",
        "inventory_count": 200,
        "sku": "UHS-EXB-010",
        "weight_grams": 2000,
        "is_featured": False,
        "tags": ["exercise book", "stationery", "writing", "bulk"],
        "images": ["/images/products/exercise-books.jpg"],
    },
    {
        "name": "UHS Branded T-Shirt",
        "slug": "uhs-branded-tshirt",
        "description": "Casual Urban Home School branded t-shirt with The Bird AI logo. 100% cotton, available in multiple sizes. Great for school events and casual wear.",
        "price": 1200.00,
        "compare_at_price": 1500.00,
        "category_slug": "branded-merchandise",
        "inventory_count": 80,
        "sku": "UHS-TSH-001",
        "weight_grams": 200,
        "is_featured": False,
        "tags": ["t-shirt", "branded", "clothing", "casual"],
        "images": ["/images/products/tshirt-front.jpg", "/images/products/tshirt-back.jpg"],
    },
    {
        "name": "UHS Water Bottle (750ml)",
        "slug": "uhs-water-bottle",
        "description": "Stainless steel insulated water bottle with Urban Home School branding. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid.",
        "price": 950.00,
        "compare_at_price": None,
        "category_slug": "branded-merchandise",
        "inventory_count": 100,
        "sku": "UHS-WB-001",
        "weight_grams": 350,
        "is_featured": True,
        "tags": ["water bottle", "branded", "drinkware", "stainless steel"],
        "images": ["/images/products/water-bottle.jpg"],
    },
    {
        "name": "Premium Pencil & Pen Set",
        "slug": "premium-pencil-pen-set",
        "description": "Complete stationery set including 6 HB pencils, 4 ballpoint pens (blue and black), eraser, sharpener, and ruler. Packaged in a UHS branded pouch.",
        "price": 500.00,
        "compare_at_price": 650.00,
        "category_slug": "school-supplies",
        "inventory_count": 150,
        "sku": "UHS-PEN-001",
        "weight_grams": 300,
        "is_featured": False,
        "tags": ["pencils", "pens", "stationery", "set"],
        "images": ["/images/products/pencil-set.jpg"],
    },
    {
        "name": "UHS Backpack (Large)",
        "slug": "uhs-backpack-large",
        "description": "Large capacity Urban Home School backpack with dedicated laptop sleeve (up to 15 inches), USB charging port, water-resistant fabric, and reflective strips for safety.",
        "price": 4500.00,
        "compare_at_price": 5000.00,
        "category_slug": "school-supplies",
        "inventory_count": 30,
        "sku": "UHS-BPK-002",
        "weight_grams": 1200,
        "is_featured": True,
        "tags": ["backpack", "laptop", "premium", "school"],
        "images": ["/images/products/backpack-large-front.jpg", "/images/products/backpack-large-open.jpg"],
    },
    {
        "name": "CBC Mathematics Textbook (Grade 4-6)",
        "slug": "cbc-math-textbook-grade-4-6",
        "description": "Comprehensive CBC-aligned Mathematics textbook covering Grade 4 to Grade 6 curriculum. Includes worked examples, practice exercises, and assessment questions. Full colour illustrations.",
        "price": 2200.00,
        "compare_at_price": 2800.00,
        "category_slug": "books-materials",
        "inventory_count": 60,
        "sku": "UHS-TXB-MATH-001",
        "weight_grams": 600,
        "is_featured": False,
        "tags": ["textbook", "mathematics", "CBC", "grade 4", "grade 5", "grade 6"],
        "images": ["/images/products/math-textbook.jpg"],
    },
]


async def main():
    print("=" * 65)
    print("  Urban Home School - Store Product Seeding")
    print("=" * 65)

    # Initialize database connection
    print("\n1. Initializing database connection...")
    await init_db()

    from app.database import engine, AsyncSessionLocal

    # Create all tables (including new store tables)
    print("\n2. Creating database tables (if not exist)...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("   Tables ready.")

    # Seed categories
    print("\n3. Seeding product categories...")
    category_map = {}  # slug -> category object

    async with AsyncSessionLocal() as session:
        for cat_data in SEED_CATEGORIES:
            result = await session.execute(
                select(ProductCategory).where(ProductCategory.slug == cat_data["slug"])
            )
            existing = result.scalars().first()

            if existing:
                print(f"  [SKIP] Category: {cat_data['name']} (already exists)")
                category_map[cat_data["slug"]] = existing
            else:
                category = ProductCategory(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    description=cat_data["description"],
                    icon=cat_data["icon"],
                    display_order=cat_data["display_order"],
                    is_active=True,
                )
                session.add(category)
                await session.flush()
                category_map[cat_data["slug"]] = category
                print(f"  [NEW]  Category: {cat_data['name']}")

        await session.commit()
        print(f"   Categories ready: {len(category_map)}")

    # Seed products
    print("\n4. Seeding products...")
    async with AsyncSessionLocal() as session:
        # Re-fetch categories to get their IDs in this session
        cat_slug_to_id = {}
        for slug in [c["slug"] for c in SEED_CATEGORIES]:
            result = await session.execute(
                select(ProductCategory).where(ProductCategory.slug == slug)
            )
            cat = result.scalars().first()
            if cat:
                cat_slug_to_id[slug] = cat.id

        created_count = 0
        skipped_count = 0

        for prod_data in SEED_PRODUCTS:
            result = await session.execute(
                select(Product).where(Product.slug == prod_data["slug"])
            )
            existing = result.scalars().first()

            if existing:
                print(f"  [SKIP] {prod_data['name']} (already exists)")
                skipped_count += 1
                continue

            category_id = cat_slug_to_id.get(prod_data["category_slug"])

            product = Product(
                name=prod_data["name"],
                slug=prod_data["slug"],
                description=prod_data["description"],
                price=prod_data["price"],
                compare_at_price=prod_data["compare_at_price"],
                currency="KES",
                images=prod_data["images"],
                product_category_id=category_id,
                inventory_count=prod_data["inventory_count"],
                sku=prod_data["sku"],
                weight_grams=prod_data["weight_grams"],
                is_active=True,
                is_featured=prod_data["is_featured"],
                tags=prod_data["tags"],
            )
            session.add(product)
            created_count += 1
            print(f"  [NEW]  {prod_data['name']} - KES {prod_data['price']:,.2f}")

        await session.commit()
        print(f"\n   Created: {created_count}, Skipped: {skipped_count}")

    # Summary
    print("\n" + "=" * 65)
    print("  PRODUCT CATALOG SUMMARY")
    print("=" * 65)

    async with AsyncSessionLocal() as session:
        # Count categories
        cat_result = await session.execute(
            select(func.count(ProductCategory.id))
        )
        cat_count = cat_result.scalar_one()

        # Count products
        prod_result = await session.execute(
            select(func.count(Product.id))
        )
        prod_count = prod_result.scalar_one()

        print(f"  Total Categories: {cat_count}")
        print(f"  Total Products:   {prod_count}")

        # List products by category
        for cat_data in SEED_CATEGORIES:
            cat_result = await session.execute(
                select(ProductCategory).where(ProductCategory.slug == cat_data["slug"])
            )
            cat = cat_result.scalars().first()
            if cat:
                prod_result = await session.execute(
                    select(Product).where(Product.product_category_id == cat.id)
                )
                products = prod_result.scalars().all()
                print(f"\n  {cat.name} ({len(products)} products):")
                for p in products:
                    featured = " [FEATURED]" if p.is_featured else ""
                    print(f"    - {p.name}: KES {p.price:,.2f} (stock: {p.inventory_count}){featured}")

    print("\n" + "=" * 65)

    # Cleanup
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
