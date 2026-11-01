import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, CurrentUser, Role, homeForRole, loginForRole } from "../utils/auth";

type GuardStatus = "checking" | "authorized";

/**
 * Verifies the current user is logged in AND has the required role before
 * a protected layout renders its content, without ever flashing the
 * protected content:
 *   - not logged in                       -> that role's login screen
 *   - still on a temporary password       -> /change-password
 *   - logged in with a different role     -> that role's own home
 */
export function useRoleGuard(requiredRole: Role) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GuardStatus>("checking");
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const current = getCurrentUser();

    if (!current) {
      navigate(loginForRole(requiredRole), { replace: true });
      return;
    }

    if (current.must_change_password) {
      navigate("/change-password", { replace: true });
      return;
    }

    if (current.role !== requiredRole) {
      navigate(homeForRole(current.role), { replace: true });
      return;
    }

    setUser(current);
    setStatus("authorized");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredRole]);

  return { status, user };
}
