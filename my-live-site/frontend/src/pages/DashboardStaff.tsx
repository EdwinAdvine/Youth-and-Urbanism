// DashboardStaff - Staff role dashboard redirect. Navigates to /dashboard/staff where the
// full staff dashboard with support tickets, content tools, and platform health is rendered.
import { Navigate } from 'react-router-dom';

const DashboardStaff = () => {
  return <Navigate to="/dashboard/staff" replace />;
};

export default DashboardStaff;
