import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./SyCodes.css";

const emailPattern =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const initialForm = {
  name: "",
  email: "",
  phone: "",
  rollNumber: "",
  division: "",
  batch: "",
};

export default function SyCodes() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showEventBrief, setShowEventBrief] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowEventBrief(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const goHome = () => {
    window.location.href = "/";
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const valid =
    form.name.trim().length >= 2 &&
    emailPattern.test(form.email.trim()) &&
    /^\d{10}$/.test(form.phone) &&
    form.rollNumber.trim() !== "" &&
    form.division.trim() !== "" &&
    form.batch.trim() !== "";

  const submitRegistration = async (event) => {
    event.preventDefault();
    if (!valid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const { data, error: submitError } = await supabase.rpc(
        "submit_sy_coding_registration",
        {
          p_name: form.name.trim(),
          p_email: form.email.trim().toLowerCase(),
          p_phone: form.phone,
          p_roll_number: form.rollNumber.trim(),
          p_year: "SY",
          p_division: form.division.trim(),
          p_batch: form.batch.trim(),
        }
      );

      if (submitError) {
        console.error("SE coding registration error:", submitError);
        const message = String(submitError.message || "").toUpperCase();
        const details = String(submitError.details || "").toUpperCase();
        const combined = `${message} ${details}`;

        if (combined.includes("ALREADY_REGISTERED") || submitError.code === "23505") {
          setError(
            "ALREADY REGISTERED. IN CASE OF ANY AMBIGUITY, CONTACT PRADYUMN P — 9270404006."
          );
        } else if (combined.includes("REGISTRATION_CLOSED")) {
          setError("REGISTRATION IS CLOSED.");
        } else if (combined.includes("ONLY_SY_ELIGIBLE")) {
          setError("ONLY SY STUDENTS ARE ELIGIBLE FOR THIS COMPETITION.");
        } else {
          setError("WE COULDN'T COMPLETE YOUR REGISTRATION. PLEASE TRY AGAIN.");
        }
        return;
      }

      if (!data) {
        setError("REGISTRATION SUBMITTED, BUT NO REGISTRATION ID WAS RETURNED.");
        return;
      }

      setRegistrationCode(data);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitException) {
      console.error(submitException);
      setError("SOMETHING WENT WRONG. PLEASE TRY AGAIN.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="sycodes-page sycodes-success-page">
        <div className="sycodes-frame" />

        <button type="button" className="sycodes-brand" onClick={goHome}>
          ACES<span>/</span>
        </button>

        <button type="button" className="sycodes-back" onClick={goHome}>
          ← BACK TO ACES
        </button>

        <section className="sycodes-success">
          <div className="sycodes-index">ACES / SE CODING COMPETITION</div>

          <h1 className="sycodes-success-title">
            REGISTRATION
            <br />
            <span>CONFIRMED.</span>
          </h1>

          <div className="sycodes-terminal">
            <div className="sycodes-terminal-top">
              <div className="sycodes-terminal-dots">
                <i />
                <i />
                <i />
              </div>
              <span>aces://sycodes</span>
            </div>

            <div className="sycodes-terminal-body">
              <div className="sycodes-terminal-line">
                <span>$</span>
                <span>register --se-coding</span>
              </div>
              <div className="sycodes-terminal-line muted">
                <span>&gt;</span>
                <span>validating registration...</span>
              </div>
              <div className="sycodes-terminal-line muted">
                <span>&gt;</span>
                <span>registration accepted</span>
              </div>

              <div className="sycodes-divider" />

              <div className="sycodes-code-label">REGISTRATION ID</div>
              <div className="sycodes-code">{registrationCode}</div>
              <div className="sycodes-status">STATUS: REGISTERED</div>

              <p className="sycodes-success-note">
                Keep this registration ID safe.
                <br />
                HackerRank details will be shared on the day of the competition.
              </p>
            </div>
          </div>

          <div className="sycodes-success-event">
            <span>26 SEP 2026</span>
            <span>OFFLINE · HACKERRANK</span>
            <span>SOFTWARE LAB 1 · A BUILDING</span>
            <span>STARTS 9:45 AM</span>
          </div>

          <button type="button" className="sycodes-home-button" onClick={goHome}>
            RETURN TO ACES ↗
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="sycodes-page">
      <div className="sycodes-frame" />

      <button type="button" className="sycodes-brand" onClick={goHome}>
        ACES<span>/</span>
      </button>

      <button type="button" className="sycodes-back" onClick={goHome}>
        ← BACK TO ACES
      </button>

      <header className="sycodes-header">
        <div className="sycodes-index">05 / SE CODING COMPETITION</div>

        <div className="sycodes-header-main">
          <h1>
            SE CODING
            <br />
            <span>COMPETITION.</span>
          </h1>

          <div className="sycodes-header-meta">
            <span>26 SEPTEMBER 2026</span>
            <span>SATURDAY · OFFLINE SEATING</span>
            <span>HACKERRANK</span>
          </div>
        </div>

        <p className="sycodes-intro">
          Register for the ACES SE Coding Competition. Solve Python problems on
          HackerRank based on topics covered during the VAC.
        </p>
      </header>

      <section className="sycodes-event-strip">
        <div>
          <span>REGISTRATION DEADLINE</span>
          <strong>25 SEP 2026 · 5:00 PM IST</strong>
        </div>
        <div>
          <span>ELIGIBILITY</span>
          <strong>SY · COMPUTER ENGINEERING · ALL DIVISIONS</strong>
        </div>
        <div>
          <span>PLATFORM</span>
          <strong>HACKERRANK LINK SHARED ON THE DAY</strong>
        </div>
      </section>

      {showEventBrief && (
        <div className="sycodes-brief-backdrop" role="dialog" aria-modal="true" aria-label="SE Coding Competition event brief">
          <div className="sycodes-brief-card">
            <button
              type="button"
              className="sycodes-brief-close"
              onClick={() => setShowEventBrief(false)}
              aria-label="Close event brief"
            >
              ×
            </button>

            <div className="sycodes-brief-kicker">EVENT BRIEF / 03</div>

            <div className="sycodes-brief-heading">
              <span>VENUE CONFIRMED</span>
              <strong>SE CODING<br />COMPETITION.</strong>
            </div>

            <div className="sycodes-brief-grid">
              <div className="sycodes-brief-block sycodes-brief-time">
                <span>STARTS</span>
                <strong>09:45</strong>
                <small>AM · 26 SEP 2026</small>
              </div>

              <div className="sycodes-brief-block">
                <span>LOCATION</span>
                <strong>SOFTWARE LAB 1</strong>
                <small>A BUILDING · DYPCOE</small>
              </div>
            </div>

            <div className="sycodes-brief-footer">
              <span><i /> OFFLINE · HACKERRANK</span>
              <button type="button" onClick={() => setShowEventBrief(false)}>GOT IT ↗</button>
            </div>
          </div>
        </div>
      )}

      <section className="sycodes-application">
        <div className="sycodes-form-heading">
          <div>
            <span>01 / REGISTRATION</span>
            <h2>ENTER YOUR DETAILS.</h2>
          </div>
          <p>One registration per student.</p>
        </div>

        <form className="sycodes-form" onSubmit={submitRegistration}>
          <div className="sycodes-fields">
            <label className="sycodes-field sycodes-full">
              <span>FULL NAME</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={80}
              />
            </label>

            <label className="sycodes-field">
              <span>EMAIL</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                      .replace(/[^a-zA-Z0-9@._%+-]/g, "")
                      .toLowerCase()
                  )
                }
                placeholder="your@email.com"
                autoComplete="email"
                inputMode="email"
                maxLength={100}
              />
              {form.email && !emailPattern.test(form.email) && (
                <small>ENTER A VALID EMAIL ADDRESS</small>
              )}
            </label>

            <label className="sycodes-field">
              <span>PHONE NUMBER</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10 digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
              />
              {form.phone && !/^\d{10}$/.test(form.phone) && (
                <small>PHONE NUMBER MUST BE EXACTLY 10 DIGITS</small>
              )}
            </label>

            <label className="sycodes-field">
              <span>ROLL NUMBER</span>
              <input
                type="text"
                value={form.rollNumber}
                onChange={(event) =>
                  updateField("rollNumber", event.target.value.slice(0, 30))
                }
                placeholder="Your roll number"
                maxLength={30}
              />
            </label>

            <div className="sycodes-field">
              <span>YEAR</span>
              <div className="sycodes-fixed">SECOND YEAR / SY</div>
            </div>

            <div className="sycodes-field">
              <span>BRANCH</span>
              <div className="sycodes-fixed">COMPUTER ENGINEERING</div>
            </div>

            <label className="sycodes-field">
              <span>DIVISION</span>
              <input
                type="text"
                value={form.division}
                onChange={(event) => updateField("division", event.target.value.slice(0, 10))}
                placeholder="Your division"
                maxLength={10}
              />
            </label>

            <label className="sycodes-field">
              <span>BATCH</span>
              <input
                type="text"
                value={form.batch}
                onChange={(event) => updateField("batch", event.target.value.slice(0, 20))}
                placeholder="Your batch"
                maxLength={20}
              />
            </label>
          </div>

          {error && <div className="sycodes-error">{error}</div>}

          <div className="sycodes-form-footer">
            <div>
              <span>NOTICE</span>
              <p>
                Registration closes automatically at 5:00 PM on 25 September.
                <br />
                In case of any ambiguity, contact Pradyumn P — 9270404006.
              </p>
            </div>

            <button type="submit" disabled={!valid || submitting}>
              {submitting ? "REGISTERING..." : "REGISTER NOW"}
              <span>↗</span>
            </button>
          </div>
        </form>
      </section>

      <footer className="sycodes-footer">
        <span>ACES / SE CODING</span>
        <span>PYTHON · HACKERRANK · VAC</span>
        <span>2026</span>
      </footer>
    </main>
  );
}
