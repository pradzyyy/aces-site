import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./Auth.css";

export default function ConsoleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted || !data?.session) return;

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (!adminError && isAdmin === true) {
        window.location.replace("/console");
      }
    };

    checkExistingSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("ENTER EMAIL AND PASSWORD.");
      return;
    }

    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (loginError) {
      setError(loginError.message.toUpperCase());
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } =
      await supabase.rpc("is_admin");

    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut();
      setError("ACCOUNT IS NOT AUTHORIZED FOR ACES CONSOLE.");
      setLoading(false);
      return;
    }

    window.location.replace("/console");
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("ENTER YOUR EMAIL FIRST.");
      return;
    }

    setLoading(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    if (resetError) {
      setError(resetError.message.toUpperCase());
    } else {
      setMessage("PASSWORD RESET LINK SENT. CHECK YOUR EMAIL.");
    }

    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-frame" />

      <header className="auth-topbar">
        <a href="/" className="auth-brand">
          ACES<span>/</span>CONSOLE
        </a>

        <a href="/" className="auth-back">
          ← BACK TO ACES
        </a>
      </header>

      <section className="auth-shell">
        <div className="auth-kicker">ACES / PRIVATE SYSTEM</div>

        <h1 className="auth-title">
          {mode === "login" ? (
            <>
              CONSOLE
              <span>ACCESS.</span>
            </>
          ) : (
            <>
              RESET
              <span>PASSWORD.</span>
            </>
          )}
        </h1>

        <p className="auth-subtitle">
          {mode === "login"
            ? "Authorized committee access only."
            : "Request a secure password reset link."}
        </p>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-label" htmlFor="console-email">
              EMAIL
            </label>

            <input
              id="console-email"
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />

            <label className="auth-label" htmlFor="console-password">
              PASSWORD
            </label>

            <input
              id="console-password"
              className="auth-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {(error || message) && (
              <div className={`auth-alert ${error ? "error" : "success"}`}>
                {error || message}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "ENTER CONSOLE"}
              <span>↗</span>
            </button>

            <button
              type="button"
              className="auth-secondary"
              onClick={() => {
                setMode("forgot");
                setError("");
                setMessage("");
              }}
            >
              FORGOT PASSWORD?
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <label className="auth-label" htmlFor="reset-email">
              EMAIL
            </label>

            <input
              id="reset-email"
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />

            {(error || message) && (
              <div className={`auth-alert ${error ? "error" : "success"}`}>
                {error || message}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}
              <span>↗</span>
            </button>

            <button
              type="button"
              className="auth-secondary"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              ← BACK TO LOGIN
            </button>
          </form>
        )}
      </section>

      <footer className="auth-footer">
        <span>DYPCOE / PUNE</span>
        <span>ACES // PRIVATE CONSOLE</span>
        <span>2026</span>
      </footer>
    </main>
  );
}
