import { Navigate,Outlet,useLocation } from "react-router-dom";
// import { useAppSelector } from "../../hooks";
import { useAppSelector } from "../../hooks";

export default function ProtectedRoutesAdmin() {
   const { user, status } = useAppSelector(s => s.auth);
  const loc = useLocation();
  if (user && !["admin", "superadmin"].includes(user.role)) return null;
  if (status === "checking" || status === "idle") {
    // same loader as before if you want
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }
  //if no logged in
  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;

    // logged in but not admin or superadmin
  if (!["admin", "superadmin"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

