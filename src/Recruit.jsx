import React, { useState } from "react";

import { supabase } from "./lib/supabase";

import "./Recruit.css";

const domainOptions = [

  "Technical",

  "Sports",

  "Cultural",

  "Media",

  "PR",

  "Design",

  "Documentation",

  "Management",

];

const initialForm = {

  name: "",

  email: "",

  phone: "",

  year: "",

  branch: "Computer Engineering",

  division: "",

  batch: "",

  primaryDomain: "",

  secondaryDomain: "",

  whyAces: "",

  experience: "",

};

const emailPattern =

  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Recruit() {

  const [step, setStep] = useState(1);

  const [form, setForm] = useState(initialForm);

  const [submitted, setSubmitted] = useState(false);

  const [applicationCode, setApplicationCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [showStatusChecker, setShowStatusChecker] = useState(false);

  const [statusCode, setStatusCode] = useState("");

  const [statusEmail, setStatusEmail] = useState("");

  const [statusResult, setStatusResult] = useState(null);

  const [statusLoading, setStatusLoading] = useState(false);

  const [statusError, setStatusError] = useState("");

  // =========================================================

  // FIELD UPDATE

  // =========================================================

  const updateField = (field, value) => {

    setForm((current) => ({

      ...current,

      [field]: value,

    }));

  };

  // =========================================================

  // NAVIGATION

  // =========================================================

  const goHome = () => {

    window.location.href = "/";

  };

  const scrollTop = () => {

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  const nextStep = () => {

    if (!canContinue()) return;

    setStep((current) => Math.min(current + 1, 5));

    scrollTop();

  };

  const previousStep = () => {

    setStep((current) => Math.max(current - 1, 1));

    scrollTop();

  };

  const goToStep = (targetStep) => {

    if (targetStep >= step) return;

    setStep(targetStep);

    scrollTop();

  };

  // =========================================================

  // VALIDATION

  // =========================================================

  const canContinue = () => {

    if (step === 1) {

      return (

        form.name.trim().length >= 2 &&

        emailPattern.test(form.email.trim()) &&

        /^\d{10}$/.test(form.phone)

      );

    }

    if (step === 2) {

      return (

        (form.year === "FE" || form.year === "SY") &&

        form.division.trim() !== "" &&

        form.batch.trim() !== ""

      );

    }

    if (step === 3) {

      return (

        form.primaryDomain !== "" &&

        form.whyAces.trim() !== ""

      );

    }

    if (step === 4) {

      return true;

    }

    return true;

  };

  // =========================================================

  // SUBMIT TO SUPABASE

  // =========================================================

  const submitApplication = async () => {
    if (!canContinue()) return;

    setIsSubmitting(true);
    setSubmitError("");

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.trim();
    const cleanDivision = form.division.trim();
    const cleanBatch = form.batch.trim();
    const cleanWhyAces = form.whyAces.trim();
    const cleanExperience = form.experience.trim();

    try {
      const { data, error } = await supabase.rpc(
        "submit_application",
        {
          p_name: cleanName,
          p_email: cleanEmail,
          p_phone: cleanPhone,
          p_year: form.year,
          p_division: cleanDivision,
          p_batch: cleanBatch,
          p_primary_domain: form.primaryDomain,
          p_secondary_domain: form.secondaryDomain || "",
          p_why_aces: cleanWhyAces,
          p_experience: cleanExperience,
        }
      );

      if (error) {
        console.error("Submission error:", error);

        const code = String(error.code || "");
        const message = String(error.message || "").toLowerCase();
        const details = String(error.details || "").toLowerCase();
        const combined = `${message} ${details}`;

        if (
          code === "23505" ||
          combined.includes("applications_email_unique") ||
          combined.includes("applications_phone_unique") ||
          combined.includes("duplicate key") ||
          combined.includes("email")
        ) {
          if (
            combined.includes("applications_email_unique") ||
            combined.includes("email")
          ) {
            setSubmitError(
              "AN APPLICATION ALREADY EXISTS FOR THIS EMAIL ADDRESS."
            );
          } else if (
            combined.includes("applications_phone_unique") ||
            combined.includes("phone")
          ) {
            setSubmitError(
              "AN APPLICATION ALREADY EXISTS FOR THIS PHONE NUMBER."
            );
          } else {
            setSubmitError(
              "AN APPLICATION ALREADY EXISTS FOR THIS EMAIL OR PHONE NUMBER."
            );
          }
        } else {
          setSubmitError(
            "WE COULDN'T SUBMIT YOUR APPLICATION. PLEASE TRY AGAIN."
          );
        }

        return;
      }

      if (!data) {
        setSubmitError(
          "APPLICATION SUBMITTED, BUT NO APPLICATION ID WAS RETURNED."
        );
        return;
      }

      setApplicationCode(data);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Unexpected submission error:", error);
      setSubmitError(
        "SOMETHING WENT WRONG. PLEASE TRY AGAIN."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // STATUS CHECKER

  // =========================================================

  const openStatusChecker = () => {

    setStatusCode("");

    setStatusEmail("");

    setStatusResult(null);

    setStatusError("");

    setShowStatusChecker(true);

  };

  const closeStatusChecker = () => {

    if (statusLoading) return;

    setShowStatusChecker(false);

    setStatusResult(null);

    setStatusError("");

  };

  const checkInterviewStatus = async () => {

    const cleanCode = statusCode.trim().toUpperCase();

    const cleanEmail = statusEmail.trim().toLowerCase();

    if (!/^ACES-26-[A-Z0-9]{6}$/.test(cleanCode)) {

      setStatusError("ENTER A VALID APPLICATION ID.");

      return;

    }

    if (!emailPattern.test(cleanEmail)) {

      setStatusError("ENTER A VALID EMAIL ADDRESS.");

      return;

    }

    setStatusLoading(true);

    setStatusError("");

    setStatusResult(null);

    try {

      const { data, error } = await supabase.rpc(

        "check_application_status",

        {

          p_application_code: cleanCode,

          p_email: cleanEmail,

        }

      );

      if (error) {

        console.error("Status check error:", error);

        setStatusError(

          "WE COULDN'T CHECK THAT APPLICATION. TRY AGAIN."

        );

        return;

      }

      if (!data) {

        setStatusError(

          "NO APPLICATION FOUND FOR THOSE DETAILS."

        );

        return;

      }

      setStatusResult(data);

    } catch (error) {

      console.error("Unexpected status error:", error);

      setStatusError(

        "SOMETHING WENT WRONG. PLEASE TRY AGAIN."

      );

    } finally {

      setStatusLoading(false);

    }

  };

  // =========================================================

  // SUCCESS SCREEN

  // =========================================================

  if (submitted) {

    return (

      <main className="recruit-page recruit-success-page">

        <div className="recruit-frame" />

        <button

          type="button"

          className="recruit-brand"

          onClick={goHome}

          aria-label="Return to ACES"

        >

          ACES<span>/</span>

        </button>

        <button

          type="button"

          className="recruit-back-top"

          onClick={goHome}

        >

          ← BACK TO ACES

        </button>

        <div className="recruit-success">

          <div className="recruit-index">

            ACES / RECRUITMENT

          </div>

          <h1 className="success-heading">

            APPLICATION

            <br />

            <span>RECEIVED.</span>

          </h1>

          <div className="success-terminal">

            <div className="success-terminal-top">

              <div className="terminal-dots">

                <span className="terminal-dot red" />

                <span className="terminal-dot yellow" />

                <span className="terminal-dot green" />

              </div>

              <span>aces://recruit</span>

            </div>

            <div className="success-terminal-body">

              <div className="success-line">

                <span>$</span>

                <span>submit --application</span>

              </div>

              <div className="success-line muted">

                <span>&gt;</span>

                <span>validating response...</span>

              </div>

              <div className="success-line muted">

                <span>&gt;</span>

                <span>application accepted</span>

              </div>

              <div className="success-divider" />

              <div className="success-label">

                APPLICATION ID

              </div>

              <div className="success-code">

                {applicationCode}

              </div>

              <div className="success-status">

                STATUS: SUBMITTED

              </div>

              <div className="success-message">

                Your application has been recorded.

                <br />

                Keep your application ID safe.

              </div>

            </div>

          </div>

          <button

            type="button"

            className="success-home-button"

            onClick={goHome}

          >

            RETURN TO ACES ↗

          </button>

        </div>

      </main>

    );

  }

  // =========================================================

  // MAIN PAGE

  // =========================================================

  return (

    <main className="recruit-page">

      <div className="recruit-frame" />

      {/* BRAND */}

      <button

        type="button"

        className="recruit-brand"

        onClick={goHome}

        aria-label="Return to ACES"

      >

        ACES<span>/</span>

      </button>

      {/* EXIT */}

      <button

        type="button"

        className="recruit-back-top"

        onClick={goHome}

      >

        ← BACK TO ACES

      </button>

      {/* HEADER */}

      <header className="recruit-header">

        <div className="recruit-index">

          05 / RECRUITMENT

        </div>

        <h1 className="recruit-title">

          JOIN THE

          <br />

          <span>COMMITTEE.</span>

        </h1>

        <p className="recruit-intro">

          Applications are open for the

          <br />

          ACES 2026 committee.

        </p>

      </header>

      {/* APPLICATION */}

      <section className="recruit-application">

        {/* STEP NAVIGATION */}

        <div className="recruit-steps">

          {[

            ["01", "IDENTITY"],

            ["02", "ACADEMICS"],

            ["03", "DOMAIN"],

            ["04", "ABOUT YOU"],

            ["05", "REVIEW"],

          ].map(([number, label], index) => {

            const targetStep = index + 1;

            return (

              <button

                key={number}

                type="button"

                className={`recruit-step ${

                  step === targetStep ? "current" : ""

                } ${step > targetStep ? "completed" : ""}

                ${step < targetStep ? "locked" : ""}`}

                disabled={

                  targetStep >= step

                }

                onClick={() => goToStep(targetStep)}

              >

                <span>{number}</span>

                <strong>{label}</strong>

                {step > targetStep && (

                  <small>✓</small>

                )}

              </button>

            );

          })}

        </div>

        {/* FORM */}

        <div className="recruit-form">

          {/* =================================================

              STEP 01 — IDENTITY

          ================================================= */}

          {step === 1 && (

            <div className="form-stage">

              <div className="stage-heading">

                <div>

                  <span className="stage-number">

                    01 / IDENTITY

                  </span>

                  <h2>WHO ARE YOU?</h2>

                </div>

                <p>Enter your basic details.</p>

              </div>

              <div className="field-grid">

                <label className="field field-full">

                  <span>FULL NAME</span>

                  <input

                    type="text"

                    value={form.name}

                    onChange={(event) =>

                      updateField(

                        "name",

                        event.target.value

                      )

                    }

                    placeholder="Enter your full name"

                    autoComplete="name"

                    maxLength={80}

                  />

                </label>

                <label className="field">

                  <span>EMAIL</span>

                  <input

                    type="email"

                    value={form.email}

                    onChange={(event) => {

                      const cleaned =

                        event.target.value

                          .replace(

                            /[^a-zA-Z0-9@._%+-]/g,

                            ""

                          )

                          .toLowerCase();

                      updateField(

                        "email",

                        cleaned

                      );

                    }}

                    placeholder="your@email.com"

                    autoComplete="email"

                    inputMode="email"

                    spellCheck="false"

                    maxLength={100}

                    aria-invalid={

                      form.email !== "" &&

                      !emailPattern.test(

                        form.email

                      )

                    }

                  />

                  {form.email !== "" &&

                    !emailPattern.test(

                      form.email

                    ) && (

                      <small className="field-error">

                        ENTER A VALID EMAIL ADDRESS

                      </small>

                    )}

                </label>

                <label className="field">

                  <span>PHONE NUMBER</span>

                  <input

                    type="tel"

                    value={form.phone}

                    onChange={(event) => {

                      const digits =

                        event.target.value

                          .replace(/\D/g, "")

                          .slice(0, 10);

                      updateField(

                        "phone",

                        digits

                      );

                    }}

                    placeholder="10 digit mobile number"

                    autoComplete="tel"

                    inputMode="numeric"

                    maxLength={10}

                    aria-invalid={

                      form.phone !== "" &&

                      !/^\d{10}$/.test(

                        form.phone

                      )

                    }

                  />

                  {form.phone !== "" &&

                    !/^\d{10}$/.test(

                      form.phone

                    ) && (

                      <small className="field-error">

                        PHONE NUMBER MUST BE EXACTLY

                        10 DIGITS

                      </small>

                    )}

                </label>

              </div>

            </div>

          )}

          {/* =================================================

              STEP 02 — ACADEMICS

          ================================================= */}

          {step === 2 && (

            <div className="form-stage">

              <div className="stage-heading">

                <div>

                  <span className="stage-number">

                    02 / ACADEMICS

                  </span>

                  <h2>WHERE DO YOU STUDY?</h2>

                </div>

                <p>

                  Your current academic details.

                </p>

              </div>

              <div className="field-grid">

                <div className="field field-full">

                  <span>YEAR</span>

                  <div className="choice-row">

                    <button

                      type="button"

                      className={

                        form.year === "FE"

                          ? "choice selected"

                          : "choice"

                      }

                      onClick={() =>

                        updateField("year", "FE")

                      }

                    >

                      FE

                    </button>

                    <button

                      type="button"

                      className={

                        form.year === "SY"

                          ? "choice selected"

                          : "choice"

                      }

                      onClick={() =>

                        updateField("year", "SY")

                      }

                    >

                      SY

                    </button>

                  </div>

                </div>

                <div className="field field-full">

                  <span>BRANCH</span>

                  <div className="field-fixed">

                    COMPUTER ENGINEERING

                  </div>

                </div>

                <label className="field">

                  <span>DIVISION</span>

                  <input

                    type="text"

                    value={form.division}

                    onChange={(event) =>

                      updateField(

                        "division",

                        event.target.value

                      )

                    }

                    placeholder="Your division"

                    maxLength={10}

                  />

                </label>

                <label className="field">

                  <span>BATCH</span>

                  <input

                    type="text"

                    value={form.batch}

                    onChange={(event) =>

                      updateField(

                        "batch",

                        event.target.value

                      )

                    }

                    placeholder="Your batch"

                    maxLength={20}

                  />

                </label>

              </div>

            </div>

          )}

          {/* =================================================

              STEP 03 — DOMAIN

          ================================================= */}

          {step === 3 && (

            <div className="form-stage">

              <div className="stage-heading">

                <div>

                  <span className="stage-number">

                    03 / DOMAIN

                  </span>

                  <h2>

                    WHERE DO YOU WANT TO BUILD?

                  </h2>

                </div>

                <p>

                  Choose your primary domain.

                </p>

              </div>

              <div className="field domain-field">

                <span>PRIMARY DOMAIN</span>

              </div>

              <div className="domain-grid">

                {domainOptions.map((domain) => (

                  <button

                    key={domain}

                    type="button"

                    className={

                      form.primaryDomain === domain

                        ? "domain-choice selected"

                        : "domain-choice"

                    }

                    onClick={() =>

                      updateField(

                        "primaryDomain",

                        domain

                      )

                    }

                  >

                    <span>{domain}</span>

                    <span>↗</span>

                  </button>

                ))}

              </div>

              <div className="field-grid">

                <div className="field field-full">

                  <span>

                    SECONDARY DOMAIN

                    <small>OPTIONAL</small>

                  </span>

                  <select

                    value={form.secondaryDomain}

                    onChange={(event) =>

                      updateField(

                        "secondaryDomain",

                        event.target.value

                      )

                    }

                  >

                    <option value="">

                      No secondary domain

                    </option>

                    {domainOptions.map((domain) => (

                      <option

                        key={domain}

                        value={domain}

                        disabled={

                          domain ===

                          form.primaryDomain

                        }

                      >

                        {domain}

                      </option>

                    ))}

                  </select>

                </div>

                <label className="field field-full">

                  <span>

                    WHY DO YOU WANT TO JOIN ACES?

                  </span>

                  <textarea

                    value={form.whyAces}

                    onChange={(event) =>

                      updateField(

                        "whyAces",

                        event.target.value

                      )

                    }

                    placeholder="Tell us what you want to contribute..."

                    rows={5}

                    maxLength={1000}

                  />

                  <small className="field-hint">

                    {form.whyAces.length} / 1000

                  </small>

                </label>

              </div>

            </div>

          )}

          {/* =================================================

              STEP 04 — ABOUT YOU

          ================================================= */}

          {step === 4 && (

            <div className="form-stage">

              <div className="stage-heading">

                <div>

                  <span className="stage-number">

                    04 / ABOUT YOU

                  </span>

                  <h2>TELL US MORE.</h2>

                </div>

                <p>

                  Previous experience is optional.

                </p>

              </div>

              <div className="field-grid">

                <label className="field field-full">

                  <span>

                    PREVIOUS EXPERIENCE

                    <small>OPTIONAL</small>

                  </span>

                  <textarea

                    value={form.experience}

                    onChange={(event) =>

                      updateField(

                        "experience",

                        event.target.value

                      )

                    }

                    placeholder="Projects, events, clubs, skills, or anything else you'd like us to know\..."

                    rows={7}

                    maxLength={1200}

                  />

                  <small className="field-hint">

                    {form.experience.length} / 1200

                  </small>

                </label>

              </div>

              <div className="about-note">

                <span>NOTE</span>

                <p>

                  You do not need previous committee

                  experience to apply.

                </p>

              </div>

            </div>

          )}

          {/* =================================================

              STEP 05 — REVIEW

          ================================================= */}

          {step === 5 && (

            <div className="form-stage review-stage">

              <div className="stage-heading">

                <div>

                  <span className="stage-number">

                    05 / REVIEW

                  </span>

                  <h2>READY TO SUBMIT?</h2>

                </div>

                <p>Check your application.</p>

              </div>

              <div className="review-grid">

                <div className="review-block">

                  <span className="review-label">

                    NAME

                  </span>

                  <strong>{form.name}</strong>

                </div>

                <div className="review-block">

                  <span className="review-label">

                    EMAIL

                  </span>

                  <strong>{form.email}</strong>

                </div>

                <div className="review-block">

                  <span className="review-label">

                    PHONE

                  </span>

                  <strong>{form.phone}</strong>

                </div>

                <div className="review-block">

                  <span className="review-label">

                    YEAR

                  </span>

                  <strong>{form.year}</strong>

                </div>

                <div className="review-block">

                  <span className="review-label">

                    BRANCH

                  </span>

                  <strong>

                    COMPUTER ENGINEERING

                  </strong>

                </div>

                <div className="review-block">

                  <span className="review-label">

                    DIVISION / BATCH

                  </span>

                  <strong>

                    {form.division} / {form.batch}

                  </strong>

                </div>

                <div className="review-block review-wide">

                  <span className="review-label">

                    PRIMARY DOMAIN

                  </span>

                  <strong>

                    {form.primaryDomain}

                  </strong>

                </div>

                {form.secondaryDomain && (

                  <div className="review-block review-wide">

                    <span className="review-label">

                      SECONDARY DOMAIN

                    </span>

                    <strong>

                      {form.secondaryDomain}

                    </strong>

                  </div>

                )}

                <div className="review-block review-wide">

                  <span className="review-label">

                    WHY ACES

                  </span>

                  <p>{form.whyAces}</p>

                </div>

                {form.experience && (

                  <div className="review-block review-wide">

                    <span className="review-label">

                      EXPERIENCE

                    </span>

                    <p>{form.experience}</p>

                  </div>

                )}

              </div>

            </div>

          )}

          {/* CONTROLS */}

          <div className="form-controls">

            <button

              type="button"

              className="form-back"

              onClick={

                step > 1

                  ? previousStep

                  : goHome

              }

            >

              {step > 1

                ? "← BACK"

                : "← EXIT TO ACES"}

            </button>

            <div className="form-progress">

              STEP {step} / 05

            </div>

            {step < 5 ? (

              <button

                type="button"

                className="form-next"

                disabled={!canContinue()}

                onClick={nextStep}

              >

                CONTINUE

                <span>→</span>

              </button>

            ) : (

              <button

                type="button"

                className="form-next submit-button"

                onClick={submitApplication}

                disabled={isSubmitting}

              >

                {isSubmitting

                  ? "SUBMITTING..."

                  : "SUBMIT APPLICATION"}

                <span>

                  {isSubmitting ? "…" : "↗"}

                </span>

              </button>

            )}

          </div>

          {submitError && (

            <div

              className="form-error"

              role="alert"

            >

              {submitError}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================

          STATUS CHECK

      ===================================================== */}

      <div className="recruit-status-link">

        <div>

          <span className="status-eyebrow">

            ALREADY APPLIED?

          </span>

          <strong>

            Check whether you've been selected

            for an interview.

          </strong>

        </div>

        <button

          type="button"

          onClick={openStatusChecker}

        >

          CHECK INTERVIEW STATUS

          <span>↗</span>

        </button>

      </div>

      {/* STATUS MODAL */}

      {showStatusChecker && (

        <div

          className="status-modal-backdrop"

          role="dialog"

          aria-modal="true"

          aria-labelledby="status-checker-title"

          onMouseDown={(event) => {

            if (

              event.target ===

              event.currentTarget

            ) {

              closeStatusChecker();

            }

          }}

        >

          <div className="status-modal">

            <div className="status-modal-top">

              <span>ACES://STATUS</span>

              <button

                type="button"

                className="status-modal-close"

                onClick={closeStatusChecker}

                aria-label="Close status checker"

              >

                ×

              </button>

            </div>

            <div className="status-modal-body">

              <div className="status-modal-index">

                PUBLIC APPLICATION LOOKUP

              </div>

              <h2 id="status-checker-title">

                CHECK INTERVIEW STATUS.

              </h2>

              <p>

                Enter your application ID and

                the email address used during

                submission.

              </p>

              <label className="field">

                <span>APPLICATION ID</span>

                <input

                  type="text"

                  value={statusCode}

                  onChange={(event) =>

                    setStatusCode(

                      event.target.value

                        .toUpperCase()

                        .replace(

                          /[^A-Z0-9-]/g,

                          ""

                        )

                        .slice(0, 15)

                    )

                  }

                  placeholder="ACES-26-XXXXXX"

                  autoComplete="off"

                />

              </label>

              <label className="field">

                <span>EMAIL</span>

                <input

                  type="email"

                  value={statusEmail}

                  onChange={(event) =>

                    setStatusEmail(

                      event.target.value

                        .replace(

                          /[^a-zA-Z0-9@._%+-]/g,

                          ""

                        )

                        .toLowerCase()

                    )

                  }

                  placeholder="your@email.com"

                  autoComplete="email"

                />

              </label>

              <button

                type="button"

                className="form-next status-check-button"

                onClick={checkInterviewStatus}

                disabled={statusLoading}

              >

                {statusLoading

                  ? "CHECKING..."

                  : "CHECK STATUS"}

                <span>

                  {statusLoading ? "…" : "↗"}

                </span>

              </button>

              {statusError && (

                <div

                  className="form-error"

                  role="alert"

                >

                  {statusError}

                </div>

              )}

              {statusResult && (

                <div className="status-result">

                  <div className="status-result-label">

                    APPLICATION

                  </div>

                  <strong>

                    {statusResult.application_code}

                  </strong>

                  <div className="status-result-row">

                    <span>

                      APPLICATION STATUS

                    </span>

                    <strong>

                      {statusResult.status}

                    </strong>

                  </div>

                  <div className="status-result-row">

                    <span>

                      INTERVIEW STATUS

                    </span>

                    <strong>

                      {

                        statusResult.interview_status

                      }

                    </strong>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* SMALL ADDITIONAL STYLES */}

      <style>{`

        .form-error {

          margin-top: 18px;

          padding: 12px 14px;

          border: 1px solid rgba(255, 90, 90, 0.38);

          color: #ff8f8f;

          font-family: "DM Mono", monospace;

          font-size: 10px;

          letter-spacing: 0.08em;

          text-transform: uppercase;

        }

        .form-next:disabled {

          opacity: 0.5;

          cursor: not-allowed;

        }

        .status-modal-backdrop {

          position: fixed;

          inset: 0;

          z-index: 9999;

          display: grid;

          place-items: center;

          padding: 24px;

          background: rgba(0, 0, 0, 0.82);

          backdrop-filter: blur(8px);

        }

        .status-modal {

          width: min(560px, 100%);

          max-height: calc(100vh - 48px);

          overflow-y: auto;

          background: #050505;

          color: #f4f3ee;

          border: 1px solid rgba(244, 243, 238, 0.22);

          box-shadow: 0 30px 100px rgba(0,0,0,.55);

        }

        .status-modal-top {

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 14px 18px;

          border-bottom: 1px solid rgba(244,243,238,.12);

          font-family: "DM Mono", monospace;

          font-size: 9px;

          letter-spacing: .12em;

        }

        .status-modal-close {

          border: 0;

          background: transparent;

          color: #f4f3ee;

          font-size: 25px;

          line-height: 1;

          cursor: pointer;

        }

        .status-modal-body {

          padding: 28px;

        }

        .status-modal-index,

        .status-result-label {

          font-family: "DM Mono", monospace;

          font-size: 9px;

          letter-spacing: .12em;

          color: #88837c;

        }

        .status-modal-body h2 {

          margin: 10px 0 12px;

          font-family: "Space Grotesk", sans-serif;

          font-size: clamp(30px, 5vw, 50px);

          line-height: .94;

          letter-spacing: -.055em;

        }

        .status-modal-body > p {

          margin-bottom: 26px;

          color: #99938b;

          line-height: 1.6;

        }

        .status-check-button {

          margin-top: 8px;

        }

        .status-result {

          margin-top: 22px;

          padding: 18px;

          border: 1px solid rgba(244,243,238,.18);

        }

        .status-result > strong {

          display: block;

          margin: 7px 0 18px;

          font-family: "Space Grotesk", sans-serif;

          font-size: 24px;

        }

        .status-result-row {

          display: flex;

          justify-content: space-between;

          gap: 20px;

          padding: 12px 0;

          border-top: 1px solid rgba(244,243,238,.1);

          font-family: "DM Mono", monospace;

          font-size: 10px;

          letter-spacing: .06em;

        }

        .status-result-row span {

          color: #88837c;

        }

        .status-result-row strong {

          color: #f4f3ee;

          font-weight: 500;

          text-align: right;

        }

        @media (max-width: 600px) {

          .status-modal-body {

            padding: 20px;

          }

          .status-result-row {

            flex-direction: column;

            gap: 6px;

          }

          .status-result-row strong {

            text-align: left;

          }

        }

      `}</style>

      {/* FOOTER */}

      <footer className="recruit-footer">

        <span>ACES / RECRUITMENT</span>

        <span>COMMITTEE / 2026</span>

        <span>APPLICATIONS OPEN</span>

      </footer>

    </main>

  );

}
