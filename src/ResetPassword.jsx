import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./Auth.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const prepareRecovery = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted && data?.session) {
        setReady(true);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(Boolean(session));
      }
    });

    prepareRecovery();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!ready) {
      setError("RESET SESSION IS INVALID OR HAS EXPIRED.");
      return;
    }

    if (password.length < 8) {
      setError("PASSWORD MUST BE AT LEAST 8 CHARACTERS.");
      return;
    }

    if (password !== confirm) {
      setError("PASSWORDS DO NOT MATCH.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message.toUpperCase());
      setLoading(false);
      return;
    }

    setMessage("PASSWORD UPDATED. REDIRECTING TO LOGIN...");

    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.replace("/console/login");
    }, 1200);
  };

  return (
    <main className="auth-page">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-frame" />

      <header className="auth-topbar">
        <a href="/" className="auth-brand">
          ACES<span>/</span>CONSOLE
        </a>

        <a href="/console/login" className="auth-back">
          ← BACK TO LOGIN
        </a>
      </header>

      <section className="auth-shell">
        <div className="auth-kicker">ACES / SECURITY</div>

        <h1 className="auth-title">
          RESET
          <span>PASSWORD.</span>
        </h1>

        <p className="auth-subtitle">
          {ready
            ? "Choose a new password for your console account."
            : "Waiting for a valid recovery session."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="new-password">
            NEW PASSWORD
          </label>

          <input
            id="new-password"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!ready || loading}
          />

          <label className="auth-label" htmlFor="confirm-password">
            CONFIRM PASSWORD
          </label>

          <input
            id="confirm-password"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={!ready || loading}
          />

          {(error || message) && (
            <div className={`auth-alert ${error ? "error" : "success"}`}>
              {error || message}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={!ready || loading}
          >
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            <span>↗</span>
          </button>
        </form>
      </section>

      <footer className="auth-footer">
        <span>DYPCOE / PUNE</span>
        <span>ACES // SECURITY</span>
        <span>2026</span>
      </footer>
    </main>
  );
}
