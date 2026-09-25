import React, { useEffect, useRef, useState } from "react";
import "./Events.css";

export default function Events() {
  const eventsRef = useRef(null);
  const [showBrief, setShowBrief] = useState(false);

  const goToRecruit = () => {
    window.location.href = "/recruit";
  };

  const goToSyCodes = () => {
    window.location.href = "/sycodes";
  };

  const showBriefRef = useRef(false);

  useEffect(() => {
    const section = eventsRef.current;
    if (!section) return undefined;

    let previousScrollY = window.scrollY;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showBriefRef.current) {
          showBriefRef.current = true;
          setShowBrief(true);
        }
      },
      {
        threshold: 0.28,
      }
    );

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Dismiss as soon as the user starts scrolling upward.
      if (
        showBriefRef.current &&
        currentScrollY < previousScrollY
      ) {
        showBriefRef.current = false;
        setShowBrief(false);
      }

      previousScrollY = currentScrollY;
    };

    observer.observe(section);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <section className="events" id="events" ref={eventsRef}>
        <div className="events-inner">

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

          <div className="events-list">

            {/* EVENT 01 — VAC */}

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


            {/* EVENT 02 — RECRUITMENT */}

            <article className="event-row event-row-upcoming">

              <div className="event-number">
                02
              </div>

              <div className="event-main">

                <div className="event-topline">
                  <span className="event-label event-label-upcoming">
                    UPCOMING
                  </span>

                  <span className="event-status event-status-open">
                    <span className="status-dot"></span>
                    APPLICATIONS OPEN
                  </span>
                </div>

                <h3 className="event-title-main">
                  ACES RECRUITMENT
                </h3>

                <p className="event-description">
                  Join the 2026 committee and help
                  build the next chapter of ACES.
                </p>

              </div>

              <div className="event-action-wrap">

                <div className="event-meta-small">
                  JOIN THE COMMITTEE
                </div>

                <button
                  type="button"
                  className="event-action event-action-apply"
                  onClick={goToRecruit}
                >
                  <span>APPLY NOW</span>

                  <span className="event-action-arrow">
                    ↗
                  </span>
                </button>

              </div>

            </article>


            {/* EVENT 03 — SE CODING COMPETITION */}

            <article className="event-row event-row-upcoming">

              <div className="event-number">
                03
              </div>

              <div className="event-main">

                <div className="event-topline">
                  <span className="event-label event-label-upcoming">
                    UPCOMING
                  </span>

                  <span className="event-status event-status-open">
                    <span className="status-dot"></span>
                    HACKERRANK · 26 SEP
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
                  REGISTRATION OPEN · CLOSES 25 SEP / 5 PM
                </div>

                <div className="event-meta-small">
                  SOFTWARE LAB 1 · A BUILDING · STARTS 9:45 AM
                </div>

                <button
                  type="button"
                  className="event-action event-action-apply"
                  onClick={goToSyCodes}
                >
                  <span>REGISTER NOW</span>

                  <span className="event-action-arrow">
                    ↗
                  </span>
                </button>

              </div>

            </article>

          </div>

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


      {showBrief && (
        <div
          className="event-brief-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-brief-title"
        >
          <div className="event-brief-card">

            <button
              type="button"
              className="event-brief-close"
              onClick={() => {
                showBriefRef.current = false;
                setShowBrief(false);
              }}
              aria-label="Close event brief"
            >
              ×
            </button>

            <div className="event-brief-kicker">
              EVENT BRIEF / 03
            </div>

            <div className="event-brief-confirmed">
              VENUE CONFIRMED
            </div>

            <h3
              className="event-brief-title"
              id="event-brief-title"
            >
              SE CODING
              <br />
              COMPETITION.
            </h3>

            <div className="event-brief-divider" />

            <div className="event-brief-details">

              <div className="event-brief-time">
                <span className="event-brief-label">
                  STARTS
                </span>

                <strong>
                  09:45
                </strong>

                <small>
                  AM · 26 SEP 2026
                </small>
              </div>

              <div className="event-brief-location">
                <span className="event-brief-label">
                  LOCATION
                </span>

                <strong>
                  SOFTWARE LAB 1
                </strong>

                <small>
                  A BUILDING · DYPCOE
                </small>
              </div>

            </div>

            <div className="event-brief-footer">

              <span>
                <i></i>
                OFFLINE · HACKERRANK
              </span>

              <button
                type="button"
                onClick={() => {
                  showBriefRef.current = false;
                  setShowBrief(false);
                }}
              >
                GOT IT ↗
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}