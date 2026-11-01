import { jwtDecode } from "jwt-decode";

export type Role = "job_seeker" | "recruiter" | "business";

export interface CompanyInfo {
  id: number;
  name: string;
}

export interface CurrentUser {
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  exp?: number;
  // True while the user is still on a temporary password (new recruiters)
  must_change_password?: boolean;
  // Recruiters belong to a company; company admins can manage its team
  company?: CompanyInfo | null;
  is_company_admin?: boolean;
  [key: string]: any;
}

/** Where each kind of user lands after logging in. */
export function homeForRole(role?: string): string {
  if (role === "business") return "/business";
  if (role === "recruiter") return "/";
  return "/dashboard";
}

/** Which login screen each kind of user belongs on. */
export function loginForRole(role?: string): string {
  return role === "business" ? "/business/login" : "/login";
}

/** Merge new fields into the stored user (e.g. after the password was changed). */
export function updateStoredUser(patch: Partial<CurrentUser>) {
  const storedStr = localStorage.getItem("user");
  let stored: CurrentUser = {};
  try {
    stored = storedStr ? JSON.parse(storedStr) : {};
  } catch (e) {
    stored = {};
  }
  localStorage.setItem("user", JSON.stringify({ ...stored, ...patch }));
}

/**
 * Store a successful login. The refresh token goes to localStorage when
 * "remember me" is ticked, otherwise it only lives for this browser session.
 */
export function saveSession(data: { access: string; refresh: string; user_data: CurrentUser }, remember = false) {
  localStorage.setItem("accessToken", data.access);
  if (remember) {
    localStorage.setItem("refreshToken", data.refresh);
  } else {
    sessionStorage.setItem("refreshToken", data.refresh);
  }
  localStorage.setItem("email", data.user_data.email || "");
  localStorage.setItem("user", JSON.stringify(data.user_data));
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
