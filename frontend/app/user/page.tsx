'use client';

import ProtectedRoute from '@/components/middleware/ProtectedRoute';
import { UserDashboard } from '@/components/UserDashboard';

export default function UserPage() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
}
