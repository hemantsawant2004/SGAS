import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks";

export default function GuestRoute() {
  const loc = useLocation();
  const { user, status } = useAppSelector((s) => s.auth);

  if (status === "checking" || status === "idle") {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
