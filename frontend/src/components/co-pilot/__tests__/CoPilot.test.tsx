import React from 'react';
import CoPilotSidebar from '../CoPilotSidebar';

// Simple integration test component for manual testing
interface TestCoPilotProps {
  initialState?: {
    isExpanded?: boolean;
    activeRole?: string;
    isOnline?: boolean;
  };
}

const TestCoPilot: React.FC<TestCoPilotProps> = ({ 
  initialState = { isExpanded: false, activeRole: 'student', isOnline: true } 
}) => {
  // This is a manual test component for development
  return (
    <div>
      <h2>CoPilot Integration Test</h2>
      <p>Initial State: {JSON.stringify(initialState)}</p>
      <CoPilotSidebar />
    </div>
  );
};

export default TestCoPilot;
