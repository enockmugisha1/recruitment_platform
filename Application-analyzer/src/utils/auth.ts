import { jwtDecode } from "jwt-decode";

export interface CurrentUser {
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  exp?: number;
  [key: string]: any;
}

/**
 * Resolves the logged-in user. The stored "user" object (set from the
 * login response) is the source of truth for role/profile fields — this
 * backend's JWT was confirmed (via debugging) to carry only token_type,
 * exp, iat, jti, and user_id, with no role claim. The decoded token is
 * still used for identity/expiry checks and as a fallback if the stored
 * object is ever missing a field.
 *
 * Returns null if there's no valid, unexpired token.
 */
export function getCurrentUser(): CurrentUser | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  let decoded: CurrentUser;
  try {
    decoded = jwtDecode<CurrentUser>(token);
  } catch (e) {
    return null;
  }

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return null;
  }

  let stored: CurrentUser | null = null;
  const storedStr = localStorage.getItem("user");
  if (storedStr && storedStr !== "undefined") {
    try {
      stored = JSON.parse(storedStr);
    } catch (e) {
      stored = null;
    }
  }

  return { ...decoded, ...stored, role: stored?.role || decoded.role };
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("email");
}
