import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCamera, FiCheck, FiCrosshair, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiUpload, FiUser } from "react-icons/fi";
import { register, enrollBiometric } from "../../api/api";

const roles = [
  { value: "citizen", label: "Citizen / Voter" },
  { value: "observer", label: "Election Observer" },
  { value: "candidate", label: "Candidate" },
  { value: "presiding_officer", label: "Presiding Officer" },
  { value: "returning_officer", label: "Returning Officer" },
  { value: "election_administrator", label: "Election Administrator" },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 credentials, 2 biometric optional
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", role: "citizen" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bioCaptured, setBioCaptured] = useState("");
  const [bioType, setBioType] = useState("fingerprint");
  const [showBio, setShowBio] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [camOn, setCamOn] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); setCamOn(true); }
    } catch { setError("Camera denied — use upload instead."); }
  };
  const captureBio = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.7);
    setBioCaptured(dataUrl);
    v.srcObject?.getTracks().forEach((t) => t.stop());
    setCamOn(false); setMsg("Biometric captured — will enroll after account creation.");
  };
  const onAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAvatarPreview(r.result);
    r.readAsDataURL(f);
  };
  const onBioFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setBioCaptured(r.result); setMsg("Biometric loaded from file."); };
    r.readAsDataURL(f);
  };

  const enrollBioAfter = async () => {
    if (!bioCaptured) return;
    try {
      const data = await enrollBiometric({ biometric_type: bioType, biometric_data: bioCaptured.substring(0, 2000) });
      setMsg("Biometric enrolled: " + data.biometric_type);
    } catch (e) { setError(e.message); }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      if (showBio && bioCaptured) {
        await enrollBioAfter();
      }
      // show success step before dashboard
      setStep(2);
      setMsg("Account created! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left intro - reuse login styles */}
        <div className="login-intro">
          <div className="login-brand">
            <div className="login-fingerprint">
              <span /><span /><span /><span />
            </div>
            <div>
              <strong>SEIS</strong>
              <small>SMART ELECTORAL<br />INTEGRITY SYSTEM</small>
            </div>
          </div>
          <span className="eyebrow">CREATE ACCOUNT</span>
          <h1>Join <span>SEIS</span></h1>
          <p>Create your secure account to access transparent, verifiable election services. Your credentials are encrypted and protected.</p>
          <div className="login-points">
            <div><FiShield /><span>Secure credential storage</span></div>
            <div><FiLock /><span>Encrypted & auditable</span></div>
            <div><FiCheck /><span>Role-based access</span></div>
          </div>
        </div>

        {/* Right form */}
        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">SEIS ACCESS</span>
            <h2>Create account</h2>
            <p>Enter your credentials to get started.</p>
            {avatarPreview && <img src={avatarPreview} alt="avatar preview" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid #eafaf2", marginTop: 10 }} />}
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
                {error}
              </div>
            )}
            {msg && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 12px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
                {msg}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <div className="input-wrapper">
                <FiUser />
                <input id="full_name" name="full_name" type="text" placeholder="Enter your full name" value={form.full_name} onChange={onChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail />
                <input id="email" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={onChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <FiShield />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  style={{ width: "100%", height: 48, padding: "0 14px 0 44px", border: "1px solid var(--slate-200)", borderRadius: 9, background: "var(--slate-50)" }}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <FiLock />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 8 chars)"
                  value={form.password}
                  onChange={onChange}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--slate-500)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <FiLock />
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={onChange}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--slate-500)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="avatar">Profile Photo (optional)</label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px dashed var(--slate-300)", borderRadius: 9, background: "white", cursor: "pointer" }}>
                <FiUpload /> {avatarPreview ? "Change photo" : "Upload photo"}
                <input id="avatar" type="file" accept="image/*" onChange={onAvatar} style={{ display: "none" }} />
              </label>
            </div>

            <div style={{ border: "1px solid var(--slate-200)", borderRadius: 12, padding: 14, background: "var(--slate-50)", marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" checked={showBio} onChange={(e) => setShowBio(e.target.checked)} />
                <FiCrosshair /> Enable biometric enrollment (recommended)
              </label>
              {showBio && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {["fingerprint", "face", "iris"].map((t) => (
                      <button key={t} type="button" onClick={() => setBioType(t)} style={{ padding: "6px 10px", borderRadius: 8, border: bioType === t ? "2px solid var(--green-500)" : "1px solid var(--slate-200)", background: bioType === t ? "#eafaf2" : "white", fontSize: "0.8rem", fontWeight: 700 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{ background: "#0b132b", borderRadius: 10, overflow: "hidden", minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {!camOn && !bioCaptured && <span style={{ color: "#8da49c", fontSize: "0.85rem" }}>Biometric preview</span>}
                    <video ref={videoRef} style={{ width: "100%", display: camOn ? "block" : "none" }} muted playsInline />
                    {bioCaptured && !camOn && <img src={bioCaptured} alt="bio preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover" }} />}
                  </div>
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {!camOn ? <button type="button" onClick={startCam} className="green-btn small"><FiCamera /> Camera</button> : <><button type="button" onClick={captureBio} className="green-btn small"><FiCheck /> Capture</button><button type="button" onClick={() => { videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop()); setCamOn(false); }} className="outline-btn" style={{ color: "var(--navy-900)", borderColor: "var(--slate-300)", minHeight: 40 }}>Stop</button></>}
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 12px", minHeight: 40, border: "1px solid var(--slate-200)", borderRadius: 9, background: "white", cursor: "pointer", fontSize: "0.85rem" }}>
                      <FiUpload /> Upload
                      <input type="file" accept="image/*" onChange={onBioFile} style={{ display: "none" }} />
                    </label>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--slate-500)", marginTop: 8 }}>SHA-256 hashed on server — raw never stored. Skip if you prefer to enroll later at <b>/biometric</b>.</p>
                </div>
              )}
            </div>

            <button type="submit" className="green-btn login-submit" disabled={loading}>
              {loading ? "Creating account..." : step === 2 ? "Redirecting..." : "Create Account"}
              <FiArrowRight />
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.85rem", color: "var(--slate-500)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--green-600)", fontWeight: 700 }}>Sign in</Link>
          </p>

          <div className="login-security">
            <FiShield />
            <span>Your credentials are protected by bcrypt hashing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
