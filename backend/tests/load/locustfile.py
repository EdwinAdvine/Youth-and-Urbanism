"""
Load testing scenarios for Urban Home School API.

Run:
    locust -f backend/tests/load/locustfile.py --host=http://localhost:8000

Quick smoke test (100 users, 60s):
    locust -f backend/tests/load/locustfile.py --host=http://localhost:8000 \
        --users 100 --spawn-rate 10 --run-time 60s --headless

Target: 1000+ RPS with p99 < 500ms for cached endpoints.
"""

import json
import os

from locust import HttpUser, between, task, tag


# Demo credentials (from seed_users.py)
DEMO_USERS = {
    "admin": {
        "email": "admin@urbanhomeschool.co.ke",
        "password": "Admin@2026!",
    },
    "student": {
        "email": "student@urbanhomeschool.co.ke",
        "password": "Student@2026!",
    },
    "parent": {
        "email": "parent@urbanhomeschool.co.ke",
        "password": "Parent@2026!",
    },
    "instructor": {
        "email": "instructor@urbanhomeschool.co.ke",
        "password": "Instructor@2026!",
    },
}


class BaseUser(HttpUser):
    """Base user with authentication helpers."""

    abstract = True
    wait_time = between(1, 3)
    token: str = ""

    def _login(self, email: str, password: str) -> None:
        """Authenticate and store JWT token."""
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        if resp.status_code == 200:
            data = resp.json()
            self.token = data.get("access_token", "")
        else:
            self.token = ""

    @property
    def auth_headers(self) -> dict:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}


# ── Scenario 1: Health check baseline ──────────────────────────────


class HealthCheckUser(BaseUser):
    """Unauthenticated health-check traffic — tests pure infra throughput."""

    weight = 5

    @task
    @tag("health")
    def health(self):
        self.client.get("/health")

    @task
    @tag("health")
    def root(self):
        self.client.get("/")


# ── Scenario 2: Student dashboard ──────────────────────────────────


class StudentUser(BaseUser):
    """Authenticated student browsing courses and dashboard."""

    weight = 40

    def on_start(self):
        creds = DEMO_USERS["student"]
        self._login(creds["email"], creds["password"])

    @task(5)
    @tag("student", "dashboard")
    def dashboard(self):
        self.client.get(
            "/api/v1/student/dashboard",
            headers=self.auth_headers,
            name="/api/v1/student/dashboard",
        )

    @task(3)
    @tag("student", "courses")
    def course_catalog(self):
        self.client.get(
            "/api/v1/courses?page=1&limit=20",
            headers=self.auth_headers,
            name="/api/v1/courses",
        )

    @task(2)
    @tag("student", "profile")
    def profile(self):
        self.client.get(
            "/api/v1/users/me",
            headers=self.auth_headers,
            name="/api/v1/users/me",
        )

    @task(1)
    @tag("student", "notifications")
    def notifications(self):
        self.client.get(
            "/api/v1/student/notifications?limit=10",
            headers=self.auth_headers,
            name="/api/v1/student/notifications",
        )


# ── Scenario 3: CoPilot chat ──────────────────────────────────────


class CoPilotUser(BaseUser):
    """Simulates AI CoPilot chat — the heaviest endpoint."""

    weight = 15

    def on_start(self):
        creds = DEMO_USERS["student"]
        self._login(creds["email"], creds["password"])

    @task
    @tag("copilot", "ai")
    def copilot_chat(self):
        self.client.post(
            "/api/v1/copilot/chat",
            json={"message": "What topics should I study for Grade 7 Science?"},
            headers=self.auth_headers,
            name="/api/v1/copilot/chat",
            timeout=30,
        )


# ── Scenario 4: Admin dashboard (polling) ─────────────────────────


class AdminUser(BaseUser):
    """Admin polling dashboards — tests cache effectiveness."""

    weight = 10

    def on_start(self):
        creds = DEMO_USERS["admin"]
        self._login(creds["email"], creds["password"])

    @task(5)
    @tag("admin", "dashboard")
    def overview(self):
        self.client.get(
            "/api/v1/admin/dashboard/overview",
            headers=self.auth_headers,
            name="/api/v1/admin/dashboard/overview",
        )

    @task(3)
    @tag("admin", "dashboard")
    def pending(self):
        self.client.get(
            "/api/v1/admin/dashboard/pending",
            headers=self.auth_headers,
            name="/api/v1/admin/dashboard/pending",
        )

    @task(2)
    @tag("admin", "dashboard")
    def revenue(self):
        self.client.get(
            "/api/v1/admin/dashboard/revenue",
            headers=self.auth_headers,
            name="/api/v1/admin/dashboard/revenue",
        )


# ── Scenario 5: Parent monitoring ─────────────────────────────────


class ParentUser(BaseUser):
    """Parent checking children's progress."""

    weight = 15

    def on_start(self):
        creds = DEMO_USERS["parent"]
        self._login(creds["email"], creds["password"])

    @task(5)
    @tag("parent", "dashboard")
    def dashboard(self):
        self.client.get(
            "/api/v1/parent/dashboard",
            headers=self.auth_headers,
            name="/api/v1/parent/dashboard",
        )

    @task(3)
    @tag("parent", "children")
    def children(self):
        self.client.get(
            "/api/v1/parent/children",
            headers=self.auth_headers,
            name="/api/v1/parent/children",
        )


# ── Scenario 6: Instructor activity ───────────────────────────────


class InstructorUser(BaseUser):
    """Instructor checking courses and students."""

    weight = 15

    def on_start(self):
        creds = DEMO_USERS["instructor"]
        self._login(creds["email"], creds["password"])

    @task(5)
    @tag("instructor", "dashboard")
    def dashboard(self):
        self.client.get(
            "/api/v1/instructor/dashboard",
            headers=self.auth_headers,
            name="/api/v1/instructor/dashboard",
        )

    @task(3)
    @tag("instructor", "courses")
    def my_courses(self):
        self.client.get(
            "/api/v1/instructor/courses",
            headers=self.auth_headers,
            name="/api/v1/instructor/courses",
        )
