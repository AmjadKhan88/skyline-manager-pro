import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import Loading from '../components/loaders/Loading';

interface Props {
  user: User | null;
  role: UserRole | UserRole[];
  children: React.ReactNode;
  loading?: boolean;
}

export default function ProtectedRoute({ user, role, children, loading }: Props) {
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/" replace />;
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
