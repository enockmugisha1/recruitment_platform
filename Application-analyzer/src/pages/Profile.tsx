import React from "react";

export default function Profile() {
  return (
    <div style={{ background: "#f3f6fb", minHeight: "100vh" }}>
      {/* Top bar */}
      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 32px 0 32px",
          background: "#fff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <input
          type="text"
          placeholder="Find job"
          style={{
            flex: 1,
            maxWidth: 250,
            padding: "8px 12px",
            borderRadius: 20,
            border: "1px solid #e0e0e0",
            background: "#f3f6fb",
            outline: "none",
            fontSize: 14,
          }}
        />
        <div style={{ marginLeft: 32, fontWeight: 500, color: "#222" }}>
          My Applications
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#2d3748",
            }}
          >
            BA
          </div>
          <span style={{ fontWeight: 500 }}>Bangura123</span>
        </div>
      </div> */}

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
              BA
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
              Add your profile picture
            </div>
            <button
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
          <form style={{ flex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "28px 32px",
              }}
            >
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Your First Name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Your Last Name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Your Email Address"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  placeholder="Your Date of Birth"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Gender
                </label>
                <input
                  type="text"
                  placeholder="Your Gender"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Location
                </label>
                <select style={inputStyle}>
                  <option>Select Country</option>
                  {/* ...other options... */}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  {/* Empty label for spacing */}
                </label>
                <select style={inputStyle}>
                  <option>Select State/Province</option>
                  {/* ...other options... */}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  Portfolio Link (optional)
                </label>
                <input
                  type="url"
                  placeholder="Your Portfolio"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>
                  LinkedIn (optional)
                </label>
                <input
                  type="url"
                  placeholder="Add Link here"
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
                  cursor: "pointer",
                }}
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
};
