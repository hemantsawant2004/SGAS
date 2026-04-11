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

    let isActive = true;

    const run = async () => {
      dispatch(setAuthChecking());
      try {
        const user = await fetchMe();

        if (!isActive) return;
        dispatch(setAuthenticated({ user }));
      } catch {
        if (!isActive) return;
        dispatch(setUnauthenticated());
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [status, dispatch]);

  
  if (status === "idle" || status === "checking") {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-500">Loading...</p>
          <p className="text-xs text-gray-400">Checking your session</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
