'use client';

import ProtectedRoute from '@/components/middleware/ProtectedRoute';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
