import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffDashboardPage from '../../pages/staff/StaffDashboardPage';

// Mock the child components so the tests focus on StaffDashboardPage logic
// and don't break due to child component internals.
vi.mock('../../components/staff/dashboard/ViewToggle', () => ({
  default: () => <div data-testid="view-toggle">ViewToggle</div>,
}));

vi.mock('../../components/staff/dashboard/StaffBentoGrid', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bento-grid">{children}</div>
  ),
}));

vi.mock('../../components/staff/dashboard/UrgentTicketsCard', () => ({
  default: () => <div data-testid="urgent-tickets-card">UrgentTicketsCard</div>,
}));

vi.mock('../../components/staff/dashboard/ModerationQueueCard', () => ({
  default: () => <div data-testid="moderation-queue-card">ModerationQueueCard</div>,
}));

vi.mock('../../components/staff/dashboard/AIAgendaCard', () => ({
  default: () => <div data-testid="ai-agenda-card">AIAgendaCard</div>,
}));

vi.mock('../../components/staff/dashboard/TasksDeadlinesCard', () => ({
  default: () => <div data-testid="tasks-deadlines-card">TasksDeadlinesCard</div>,
}));

vi.mock('../../components/staff/dashboard/StudentFlagsCard', () => ({
  default: () => <div data-testid="student-flags-card">StudentFlagsCard</div>,
}));

vi.mock('../../components/staff/dashboard/AnomaliesCard', () => ({
  default: () => <div data-testid="anomalies-card">AnomaliesCard</div>,
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('StaffDashboardPage', () => {
  // ── Loading state ──────────────────────────────────────────────

  it('renders loading skeleton initially', () => {
    renderWithRouter(<StaffDashboardPage />);

    // The loading state shows animated pulse elements.
    // There should be multiple skeleton placeholders with the animate-pulse class.
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('does not show dashboard heading while loading', () => {
    renderWithRouter(<StaffDashboardPage />);

    // "My Focus" heading should not be visible during loading
    expect(screen.queryByText('My Focus')).not.toBeInTheDocument();
  });

  // ── Dashboard content after loading ────────────────────────────

  it('renders dashboard content after loading completes', async () => {
    renderWithRouter(<StaffDashboardPage />);

    // Wait for the simulated loading delay (800ms) to complete
    await waitFor(
      () => {
        expect(screen.getByText('My Focus')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Subtitle should also be present
    expect(
      screen.getByText('Welcome back. Here is what needs your attention today.')
    ).toBeInTheDocument();
  });

  it('renders the ViewToggle component after loading', async () => {
    renderWithRouter(<StaffDashboardPage />);

    await waitFor(
      () => {
        expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  // ── Stats cards ────────────────────────────────────────────────

  it('shows stats cards with correct labels after loading', async () => {
    renderWithRouter(<StaffDashboardPage />);

    await waitFor(
      () => {
        expect(screen.getByText('Open Tickets')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText('Moderation Queue')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
  });

  it('shows stats card values after loading', async () => {
    renderWithRouter(<StaffDashboardPage />);

    await waitFor(
      () => {
        expect(screen.getByText('23')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('342')).toBeInTheDocument();
  });

  // ── Bento grid and child cards ─────────────────────────────────

  it('renders the bento grid with child cards after loading', async () => {
    renderWithRouter(<StaffDashboardPage />);

    await waitFor(
      () => {
        expect(screen.getByTestId('bento-grid')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId('urgent-tickets-card')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-queue-card')).toBeInTheDocument();
    expect(screen.getByTestId('ai-agenda-card')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-deadlines-card')).toBeInTheDocument();
    expect(screen.getByTestId('student-flags-card')).toBeInTheDocument();
    expect(screen.getByTestId('anomalies-card')).toBeInTheDocument();
  });
});
