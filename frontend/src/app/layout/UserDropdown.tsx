import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../../features/auth/services/authService";

export default function UserDropdown() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const initials =
    user?.fullName?.split(" ").map((p) => p[0]).join("").toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    dispatch(logout());
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border px-2 py-1"
      >
        <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
          {initials}
        </div>
        <span className="hidden sm:block text-sm">{user?.fullName}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-lg dark:bg-slate-800">
          <button className="block w-full px-3 py-2 text-left">
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full px-3 py-2 text-left text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
