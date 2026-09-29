import React from "react";
import "./Events.css";

export default function Events() {
  const goToSyCodes = () => {
    window.location.href = "/sycodes";
  };

  return (
    <section className="events" id="events">
      <div className="events-inner">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="events-header">
          <div className="events-index">
            04 / EVENTS
          </div>

          <div className="events-header-main">
            <h2 className="events-title">
              WHAT WE'VE
              <br />
              <span>ORGANIZED.</span>
            </h2>

            <div className="events-header-meta">
              <span>PAST / NEXT</span>
              <span>03 ENTRIES</span>
            </div>
          </div>
        </header>


        {/* =====================================================
            EVENT LIST
        ===================================================== */}

        <div className="events-list">

          {/* =================================================
              EVENT 01 — VAC
          ================================================= */}

          <article className="event-row">

            <div className="event-number">
              01
            </div>

            <div className="event-main">

              <div className="event-topline">
                <span className="event-label">
                  PAST EVENT
                </span>

                <span className="event-status">
                  COMPLETED · 2026
                </span>
              </div>

              <h3 className="event-title-main">
                VAC / PYTHON
              </h3>

              <p className="event-description">
                Value Added Course focused on
                Python programming and student
                upskilling.
              </p>

            </div>

            <div className="event-action-wrap">
              <div className="event-meta-small">
                VALUE ADDED COURSE
              </div>
            </div>

          </article>


          {/* =================================================
              EVENT 02 — RECRUITMENT
          ================================================= */}

          <article className="event-row">

            <div className="event-number">
              02
            </div>

            <div className="event-main">

              <div className="event-topline">
                <span className="event-label">
                  PAST EVENT
                </span>

                <span className="event-status">
                  COMPLETED · 2026
                </span>
              </div>

              <h3 className="event-title-main">
                ACES RECRUITMENT
              </h3>

              <p className="event-description">
                Recruitment for the 2026 ACES
                committee has been completed.
              </p>

            </div>

            <div className="event-action-wrap">
              <div className="event-meta-small">
                2026 COMMITTEE
              </div>
            </div>

          </article>


          {/* =================================================
              EVENT 03 — SE CODING COMPETITION
          ================================================= */}

          <article className="event-row">

            <div className="event-number">
              03
            </div>

            <div className="event-main">

              <div className="event-topline">
                <span className="event-label">
                  PAST EVENT
                </span>

                <span className="event-status">
                  COMPLETED · 2026
                </span>
              </div>

              <h3 className="event-title-main">
                SE CODING COMPETITION
              </h3>

              <p className="event-description">
                A coding competition for SE students
                featuring Python problems on HackerRank
                based on topics covered during the VAC.
              </p>

            </div>

            <div className="event-action-wrap">

              <div className="event-meta-small">
                26 SEP 2026 · HACKERRANK
              </div>

              <div className="event-meta-small">
                SOFTWARE LAB 1 · A BUILDING
              </div>

              <button
                type="button"
                className="event-action event-action-apply"
                onClick={goToSyCodes}
              >
                <span>VIEW RESULTS</span>

                <span className="event-action-arrow">
                  ↗
                </span>
              </button>

            </div>

          </article>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="events-footer">

          <span>
            ACES / EVENTS
          </span>

          <span>
            PAST / PRESENT / NEXT
          </span>

          <span>
            04 — 03
          </span>

        </div>

      </div>
    </section>
  );
}