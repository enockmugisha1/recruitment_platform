import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { authService, profileService } from "../api/services";

// Must match JobSeekerProfile.GENDER_CHOICES in the Django backend (profiles/models.py)
const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "N", label: "Prefer not to say" },
];

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  location: string;
  website: string;
  linkedin: string;
}

const emptyForm: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  location: "",
  website: "",
  linkedin: "",
};

// Turn a DRF error payload ({field: ["msg"]}) into a readable message
function extractError(err: any): string {
  const data = err?.response?.data;
  if (!data) return err?.message || "Something went wrong. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  return Object.entries(data)
    .map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
      return `${field.replace(/_/g, " ")}: ${text}`;
    })
    .join("\n");
}

function readStoredUser(): { first_name?: string; last_name?: string; email?: string } {
  try {
    const stored = JSON.parse(localStorage.getItem("user") || "{}") || {};
    return { ...stored, email: stored.email || localStorage.getItem("email") || "" };
  } catch {
    return { email: localStorage.getItem("email") || "" };
  }
}

export default function Profile() {
  const navigate = useNavigate();
  // The app keeps the logged-in user in localStorage (written by the Login page).
  // There is no AuthProvider wrapping the router, so useAuth() can't be used here.
  const user = readStoredUser();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalNames, setOriginalNames] = useState({ first_name: "", last_name: "" });

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Load the existing profile (if any) and pre-fill name/email from the account
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await profileService.getJobSeekerProfile();
        const profile = Array.isArray(data) ? data[0] : data?.results?.[0] ?? null;
        if (cancelled) return;

        const first = profile?.first_name ?? user?.first_name ?? "";
        const last = profile?.last_name ?? user?.last_name ?? "";
        setOriginalNames({ first_name: first, last_name: last });
        setForm({
          first_name: first,
          last_name: last,
          email: profile?.email ?? user?.email ?? "",
          phone: profile?.phone ?? "",
          date_of_birth: profile?.date_of_birth ?? "",
          gender: profile?.gender ?? "",
          location: profile?.location ?? "",
          website: profile?.website ?? "",
          linkedin: profile?.linkedin ?? "",
        });
        if (profile) {
          setProfileId(profile.id);
          if (profile.picture) setPicturePreview(profile.picture);
        }
      } catch (err) {
        if (!cancelled) toast.error("Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setPicture(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.location.trim()) {
      toast.error("Please enter your location.");
      return;
    }
    if (!form.gender) {
      toast.error("Please select your gender (or 'Prefer not to say').");
      return;
    }

    setSaving(true);
    try {
      // 1. Name changes live on the user account
      if (
        form.first_name !== originalNames.first_name ||
        form.last_name !== originalNames.last_name
      ) {
        await authService.updateUser({
          first_name: form.first_name,
          last_name: form.last_name,
        });
        setOriginalNames({ first_name: form.first_name, last_name: form.last_name });
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}") || {};
          localStorage.setItem(
            "user",
            JSON.stringify({ ...stored, first_name: form.first_name, last_name: form.last_name })
          );
        } catch {
          /* ignore storage errors */
        }
      }

      // 2. Everything else is the job seeker profile
      const body = new FormData();
      body.append("location", form.location.trim());
      body.append("gender", form.gender);
      body.append("phone", form.phone);
      body.append("date_of_birth", form.date_of_birth); // "" is stored as null
      body.append("website", form.website);
      body.append("linkedin", form.linkedin);
      if (picture) body.append("picture", picture);

      const saved = profileId
        ? await profileService.updateJobSeekerProfile(profileId, body)
        : await profileService.createJobSeekerProfile(body);

      setProfileId(saved.id);
      setPicture(null);
      if (saved.picture) setPicturePreview(saved.picture);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${form.first_name.charAt(0)}${form.last_name.charAt(0)}`.toUpperCase() ||
    form.email.charAt(0).toUpperCase() ||
    "?";

  return (
    <div style={{ background: "#f3f6fb", minHeight: "100vh" }}>
      <ToastContainer />
      {/* Main content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 10,
          padding: "40px 48px 56px 48px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontSize: 18,
              cursor: "pointer",
              marginRight: 18,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 22, marginRight: 4 }}>←</span> Back
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
          {/* Avatar and change photo */}
          <div style={{ minWidth: 120, textAlign: "center" }}>
            {picturePreview ? (
              <img
                src={picturePreview}
                alt="Profile"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  objectFit: "cover",
                  margin: "0 auto 8px auto",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#2d3748",
                  margin: "0 auto 8px auto",
                }}
              >
                {initials}
              </div>
            )}
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
              Add your profile picture
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              style={{
                background: "#5cb85c",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "7px 18px",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              Change Photo
            </button>
          </div>

          {/* Form */}
          <form style={{ flex: 1 }} onSubmit={handleSubmit}>
            <fieldset
              disabled={loading || saving}
              style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "28px 32px",
                }}
              >
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    placeholder="Your First Name"
                    value={form.first_name}
                    onChange={set("first_name")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input
                    type="text"
                    placeholder="Your Last Name"
                    value={form.last_name}
                    onChange={set("last_name")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    value={form.email}
                    readOnly
                    title="Email can't be changed here"
                    style={{ ...inputStyle, color: "#6b7280", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Your Phone Number"
                    value={form.phone}
                    onChange={set("phone")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={set("date_of_birth")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={form.gender} onChange={set("gender")} style={inputStyle}>
                    <option value="" disabled>
                      Select Gender
                    </option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Location</label>
                  <input
                    type="text"
                    placeholder="Type your location, e.g. Kigali, Rwanda"
                    value={form.location}
                    onChange={set("location")}
                    maxLength={255}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Portfolio Link (optional)</label>
                  <input
                    type="url"
                    placeholder="Your Portfolio"
                    value={form.website}
                    onChange={set("website")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn (optional)</label>
                  <input
                    type="url"
                    placeholder="Add Link here"
                    value={form.linkedin}
                    onChange={set("linkedin")}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right", marginTop: 48 }}>
                <button
                  type="submit"
                  style={{
                    background: "#222",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "12px 38px",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: saving ? "wait" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: 14,
  color: "#222",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 4,
  border: "1px solid #e0e0e0",
  background: "#f9fafb",
  marginTop: 6,
  fontSize: 15,
  fontWeight: 400,
  outline: "none",
  marginBottom: 0,
  boxSizing: "border-box",
};