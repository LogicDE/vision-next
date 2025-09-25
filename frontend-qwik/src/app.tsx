import { component$ } from '@builder.io/qwik';
import { useAuthProvider, useAuth } from './contexts/auth-context';
import { LoginForm } from './components/login-form';
import { UserDashboard } from './components/user-dashboard';
import { AdminDashboard } from './components/admin-dashboard';
import { LoadingSpinner } from './components/ui/loading-spinner';

export const App = component$(() => {
  useAuthProvider();
  const { user, loading } = useAuth();

  if (loading.value) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user.value) {
    return <LoginForm />;
  }

  return user.value.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
});
