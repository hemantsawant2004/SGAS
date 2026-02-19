import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";

export default function DashboardResolver() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  const role = user.role?.toLowerCase();
  switch (role) {
    case "admin":
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "guide":
      return <Navigate to="/guide/dashboard" replace />;
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <Navigate to="/admin/dashboard" replace />;
  }
}
