import React, { useEffect, useState } from "react";
import "./SyCodes.css";

const winners = [
  { rank: 1, name: "Rudra Chavan" },
  { rank: 2, name: "Sagar Nande" },
  { rank: 3, name: "Shlok Gupta" },
];

const leaderboard = [
  "Rudra Chavan", "Sagar Nande", "Shlok Gupta", "Ganesh Datar",
  "Suraj Jadhav", "Vishal Misal", "Rohit Garad", "Anish Kardar",
  "Yash Sagar Desai", "Prem Jagtap", "Arya Jadhav", "Mandar More",
  "Priti Udta", "Shaikh Alfiy", "Aarti Lamture", "Amruta Patil",
  "Shreyasi Yamgar",
];

export default function SyCodes() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <main className="sycodes-page sycodes-results-page">
      <div className="sycodes-frame" />

      <button type="button" className="sycodes-brand" onClick={goHome}>
        ACES<span>/</span>
      </button>

      <button type="button" className="sycodes-back" onClick={goHome}>
        ← BACK TO ACES
      </button>

      <header className="results-header">
        <div className="results-index">05 / SE CODING COMPETITION</div>

        <div className="results-header-main">
          <h1>
            FINAL
            <br />
            <span>RESULTS.</span>
          </h1>

          <div className="results-header-meta">
            <span>26 SEPTEMBER 2026</span>
            <span>PYTHON · HACKERRANK · VAC</span>
            <span>17 PARTICIPANTS</span>
          </div>
        </div>

        <p className="results-intro">
          The final standings from the ACES SE Coding Competition.
          Ranked in the order of final results.
        </p>
      </header>

      <section className={`podium-section ${revealed ? "is-revealed" : ""}`}>
        <div className="podium-heading">
          <span>01 / WINNERS</span>
          <span>TOP 03</span>
        </div>

        <div className="podium">
          <div className="podium-slot podium-third">
            <div className="podium-person">
              <span className="podium-rank">03</span>
              <strong>{winners[2].name}</strong>
            </div>
            <div className="podium-bar"><span>03</span></div>
          </div>

          <div className="podium-slot podium-first">
            <div className="podium-person">
              <span className="podium-rank">01</span>
              <strong>{winners[0].name}</strong>
            </div>
            <div className="podium-bar"><span>01</span></div>
          </div>

          <div className="podium-slot podium-second">
            <div className="podium-person">
              <span className="podium-rank">02</span>
              <strong>{winners[1].name}</strong>
            </div>
            <div className="podium-bar"><span>02</span></div>
          </div>
        </div>
      </section>

      <section className="results-list-section">
        <div className="results-list-heading">
          <span>02 / FINAL STANDINGS</span>
          <span>RANK / PARTICIPANT</span>
        </div>

        <div className="results-list">
          {leaderboard.map((name, index) => {
            const rank = index + 1;

            return (
              <div
                className={`results-row ${rank <= 3 ? "results-row-top" : ""} ${
                  revealed ? "results-row-visible" : ""
                }`}
                style={{
                  "--row-delay":
                    rank <= 3
                      ? `${1.25 + (3 - rank) * 0.22}s`
                      : `${1.95 + (index - 3) * 0.055}s`,
                }}
                key={rank}
              >
                <span className="results-rank">
                  {String(rank).padStart(2, "0")}
                </span>

                <span className="results-name">{name}</span>

                {rank <= 3 && (
                  <span className="results-top-label">
                    {rank === 1 ? "WINNER" : rank === 2 ? "RUNNER UP" : "THIRD"}
                  </span>
                )}

                <span className="results-arrow">↗</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="results-event-info">
        <div>
          <span>EVENT</span>
          <strong>SE CODING COMPETITION</strong>
        </div>
        <div>
          <span>DATE</span>
          <strong>26 SEP 2026</strong>
        </div>
        <div>
          <span>VENUE</span>
          <strong>SOFTWARE LAB 1 · A BUILDING</strong>
        </div>
        <div>
          <span>FORMAT</span>
          <strong>OFFLINE · HACKERRANK</strong>
        </div>
      </section>

      <footer className="results-footer">
        <span>ACES / RESULTS</span>
        <span>SE CODING · 2026</span>
        <span>17 / 17</span>
      </footer>
    </main>
  );
}
