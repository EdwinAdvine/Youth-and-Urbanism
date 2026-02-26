import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock child components to isolate StaffDashboardPage logic
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

import StaffDashboardPage from '../../pages/staff/StaffDashboardPage';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('StaffDashboardPage', () => {
  // -- Loading state --

  it('renders loading skeleton initially', () => {
    renderWithRouter(<StaffDashboardPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('does not show dashboard heading while loading', () => {
    renderWithRouter(<StaffDashboardPage />);

    // "My Focus" heading should not be visible during loading
    expect(screen.queryByText('My Focus')).not.toBeInTheDocument();
  });

  // -- Post-loading state (success or error, both display heading) --

  it('transitions out of loading state', async () => {
    renderWithRouter(<StaffDashboardPage />);

    // Wait for loading to complete - the page shows "My Focus" in both
    // success and error states, along with the ViewToggle
    await waitFor(
      () => {
        expect(screen.getByText('My Focus')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('renders the ViewToggle after loading', async () => {
    renderWithRouter(<StaffDashboardPage />);

    await waitFor(
      () => {
        expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
