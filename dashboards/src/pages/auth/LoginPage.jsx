import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "vendor") {
        navigate("/dashboard/overview", { replace: true });
      } else if (user.role === "admin") {
        navigate("/dashboard/admin/users", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logoMark}>V</div>
          <h2 style={styles.leftTitle}>
            Your local market,
            <br />
            beautifully managed.
          </h2>
          <p style={styles.leftSub}>
            Vendi brings homemade goods and neighbourhood sellers together in one elegant place.
          </p>
          <div style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ ...styles.dot, opacity: i === 0 ? 1 : 0.3 }} />
            ))}
          </div>
        </div>

        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <span style={styles.brandBadge}>Vendi Admin</span>
            <h1 style={styles.formTitle}>Welcome back</h1>
            <p style={styles.formSubtitle}>Sign in to manage your store</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7.5" cy="7.5" r="6.5" stroke="#c0392b" strokeWidth="1.4" />
                <path d="M7.5 4.5v4" stroke="#c0392b" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="7.5" cy="10.5" r="0.75" fill="#c0392b" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="#aaa" strokeWidth="1.3" />
                  <path d="M1.5 5l6 4 6-4" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="2.5" y="6" width="10" height="7.5" rx="1.5" stroke="#aaa" strokeWidth="1.3" />
                  <path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="7.5" cy="9.5" r="1" fill="#aaa" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 40 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M1 7.5S3.5 3 7.5 3s6.5 4.5 6.5 4.5S13 12 7.5 12 1 7.5 1 7.5z" stroke="#9a8f88" strokeWidth="1.3" />
                      <circle cx="7.5" cy="7.5" r="1.75" stroke="#9a8f88" strokeWidth="1.3" />
                      <path d="M2 2l11 11" stroke="#9a8f88" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M1 7.5S3.5 3 7.5 3s6.5 4.5 6.5 4.5S13 12 7.5 12 1 7.5 1 7.5z" stroke="#9a8f88" strokeWidth="1.3" />
                      <circle cx="7.5" cy="7.5" r="1.75" stroke="#9a8f88" strokeWidth="1.3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p style={styles.footer}>
            Vendi · Admin Portal · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    backgroundColor: "#f5f0ea",
  },
  left: {
    width: "42%",
    backgroundColor: "#9B4D52",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  leftInner: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxWidth: 360,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "1.5px solid rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', serif",
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
  },
  leftTitle: {
    fontFamily: "'Georgia', serif",
    fontSize: 34,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.25,
    margin: 0,
  },
  leftSub: {
    fontSize: 14.5,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.65,
    margin: 0,
  },
  dots: {
    display: "flex",
    gap: 7,
    marginTop: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    backgroundColor: "#fff",
  },
  circle1: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -120,
    right: -100,
    zIndex: 1,
  },
  circle2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -60,
    right: 40,
    zIndex: 1,
  },
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  formCard: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  formHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  brandBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#9B4D52",
  },
  formTitle: {
    fontFamily: "'Georgia', serif",
    fontSize: 30,
    fontWeight: 700,
    color: "#1a1310",
    margin: 0,
    lineHeight: 1.1,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#7a6f68",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fff0f0",
    border: "1px solid #f5c0c0",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "#c0392b",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#3a2a2a",
    letterSpacing: "0.01em",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 38px",
    borderRadius: 12,
    border: "1.5px solid #ddd6cc",
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#1a1310",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 4,
  },
  submitBtn: {
    padding: "14px",
    borderRadius: 12,
    backgroundColor: "#9B4D52",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 4,
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footer: {
    fontSize: 11.5,
    color: "#b0a9a0",
    textAlign: "center",
    marginTop: -8,
  },
};