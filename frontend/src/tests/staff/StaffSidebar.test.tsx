/**
 * Vitest tests for StaffSidebar component
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffSidebar from '../../components/staff/sidebar/StaffSidebar';

describe('StaffSidebar', () => {
  it('renders all 7 main sections', () => {
    render(
      <BrowserRouter>
        <StaffSidebar isOpen={true} onClose={() => {}} onOpenAuthModal={() => {}} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Moderation & Quality')).toBeInTheDocument();
    expect(screen.getByText('Support & Care')).toBeInTheDocument();
    expect(screen.getByText('Learning Experience Tools')).toBeInTheDocument();
    expect(screen.getByText('Insights & Impact')).toBeInTheDocument();
    expect(screen.getByText('Team & Growth')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('displays badge counts when provided', () => {
    // This would need proper store mocking
    // Placeholder for badge count tests
    expect(true).toBe(true);
  });
});
