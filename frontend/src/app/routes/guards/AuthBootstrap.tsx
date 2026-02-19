// routes/guards/AuthBootstrap.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setAuthChecking, setAuthenticated, setUnauthenticated } from "../../../features/auth/authSlice";
import { fetchMe } from "../../../features/auth/services/authService";

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);


useEffect(() => {
  if (status !== "idle") return;

  const run = async () => {
    dispatch(setAuthChecking());
    try {
      const user = await fetchMe();
      dispatch(setAuthenticated(user));
    } catch {
      dispatch(setUnauthenticated());
    }
  };

  run();
}, [status, dispatch]);

  
  if (status === "idle" || status === "checking") {
    // you can show a full-screen loader/spinner here
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
