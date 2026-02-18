import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffSidebar from '../../components/staff/sidebar/StaffSidebar';
import { useStaffStore } from '../../store/staffStore';

// Mock the authStore so logout logic does not error
vi.mock('../../store/authStore', () => ({
  useAuthStore: Object.assign(
    () => ({
      logout: vi.fn(),
    }),
    {
      persist: { clearStorage: vi.fn() },
    }
  ),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('StaffSidebar', () => {
  beforeEach(() => {
    const initialState = useStaffStore.getInitialState();
    useStaffStore.setState(initialState, true);
  });

  // ── Basic rendering ────────────────────────────────────────────

  it('renders without crashing', () => {
    const { container } = renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );
    expect(container).toBeTruthy();
  });

  // ── Navigation sections ────────────────────────────────────────

  it('renders all 7 navigation sections', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(screen.getByText('MODERATION & QUALITY')).toBeInTheDocument();
    expect(screen.getByText('SUPPORT & CARE')).toBeInTheDocument();
    expect(screen.getByText('LEARNING EXPERIENCE')).toBeInTheDocument();
    expect(screen.getByText('INSIGHTS & IMPACT')).toBeInTheDocument();
    expect(screen.getByText('TEAM & GROWTH')).toBeInTheDocument();
    expect(screen.getByText('ACCOUNT')).toBeInTheDocument();
  });

  // ── Search input ───────────────────────────────────────────────

  it('renders the search input', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    const searchInput = screen.getByPlaceholderText('Search staff... (Ctrl+K)');
    expect(searchInput).toBeInTheDocument();
  });

  it('updates global search when typing', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    const searchInput = screen.getByPlaceholderText('Search staff... (Ctrl+K)');
    fireEvent.change(searchInput, { target: { value: 'tickets' } });
    expect(useStaffStore.getState().globalSearch).toBe('tickets');
  });

  // ── Badge counts ───────────────────────────────────────────────

  it('shows badge counts when counters have values', () => {
    // Set counters before rendering
    useStaffStore.setState({
      counters: {
        openTickets: 5,
        moderationQueue: 12,
        pendingApprovals: 0,
        activeSessions: 0,
        unreadNotifications: 3,
        slaAtRisk: 0,
      },
      // Make sure the sections with badges are open
      openSidebarSections: ['dashboard', 'moderation', 'support', 'account'],
    });

    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    // moderationQueue badge = 12
    expect(screen.getByText('12')).toBeInTheDocument();
    // openTickets badge = 5
    expect(screen.getByText('5')).toBeInTheDocument();
    // unreadNotifications badge = 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // ── Section expand/collapse ────────────────────────────────────

  it('shows children of initially open sections', () => {
    // 'dashboard', 'moderation', 'support' are open by default
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    // 'My Focus' is a child of the 'dashboard' section (open by default)
    expect(screen.getByText('My Focus')).toBeInTheDocument();
    // 'Content Review' is a child of 'moderation' (open by default)
    expect(screen.getByText('Content Review')).toBeInTheDocument();
  });

  it('does not show children of initially closed sections', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    // 'insights' is NOT in the default openSidebarSections,
    // so its children should not be rendered
    expect(screen.queryByText('Platform Health')).not.toBeInTheDocument();
  });

  it('expands a closed section on click', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    // 'INSIGHTS & IMPACT' section is closed by default
    expect(screen.queryByText('Platform Health')).not.toBeInTheDocument();

    // Click the section header to open it
    fireEvent.click(screen.getByText('INSIGHTS & IMPACT'));

    // Now its children should appear
    expect(screen.getByText('Platform Health')).toBeInTheDocument();
    expect(screen.getByText('Content Performance')).toBeInTheDocument();
  });

  it('collapses an open section on click', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    // 'DASHBOARD' is open by default so 'My Focus' is visible
    expect(screen.getByText('My Focus')).toBeInTheDocument();

    // Click the section header to close it
    fireEvent.click(screen.getByText('DASHBOARD'));

    // Child should now be hidden
    expect(screen.queryByText('My Focus')).not.toBeInTheDocument();
  });

  // ── View mode toggle ──────────────────────────────────────────

  it('renders the current view mode label', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    // Default viewMode is 'teacher_focus' which maps to 'Teacher Focus'
    expect(screen.getByText('Teacher Focus')).toBeInTheDocument();
  });

  // ── Footer ─────────────────────────────────────────────────────

  it('renders the sidebar footer with version info', () => {
    renderWithRouter(
      <StaffSidebar isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Staff Dashboard v1.0')).toBeInTheDocument();
  });
});
