import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, CurrentUser } from "../utils/auth";

type GuardStatus = "checking" | "authorized";

/**
 * Verifies the current user is logged in AND has the required role before
 * a protected layout renders its content. Redirects (without ever flashing
 * the protected content) to /login if unauthenticated, or to fallbackPath
 * if the role doesn't match.
 */
export function useRoleGuard(requiredRole: "recruiter" | "job_seeker", fallbackPath: string) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GuardStatus>("checking");
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const current = getCurrentUser();

    if (!current) {
      navigate("/login", { replace: true });
      return;
    }

    if (current.role !== requiredRole) {
      navigate(fallbackPath, { replace: true });
      return;
    }

    setUser(current);
    setStatus("authorized");
    // Re-run whenever the route/role requirement changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredRole, fallbackPath]);

  return { status, user };
}
