import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';

export default function ProtectedRoute() {
  const { user, status } = useAppSelector(s => s.auth);
  const loc = useLocation();
  if (!status) return null;
  if (status === "checking" || status === "idle") {
    // same loader as before if you want
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;
  return <Outlet />;
}
