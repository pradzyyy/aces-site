import React, { useEffect, useRef, useState } from "react";
import "./Domains.css";

const domains = [
  {
    number: "01",
    name: "TECHNICAL",
    subtitle: "BUILDING / DEVELOPMENT / WORKSHOPS",
    output: [
      "BUILDING",
      "DEVELOPMENT",
      "WORKSHOPS",
      "PROJECTS",
    ],
  },
  {
    number: "02",
    name: "SPORTS",
    subtitle: "COMPETITIONS / ACTIVITIES / COORDINATION",
    output: [
      "COMPETITIONS",
      "ACTIVITIES",
      "COORDINATION",
      "TOURNAMENTS",
    ],
  },
  {
    number: "03",
    name: "CULTURAL",
    subtitle: "EVENTS / PERFORMANCES / COMMUNITY",
    output: [
      "EVENTS",
      "PERFORMANCES",
      "COMMUNITY",
      "CELEBRATIONS",
    ],
  },
  {
    number: "04",
    name: "MEDIA",
    subtitle: "CONTENT / PHOTOGRAPHY / SOCIAL",
    output: [
      "CONTENT",
      "PHOTOGRAPHY",
      "SOCIAL MEDIA",
      "COVERAGE",
    ],
  },
  {
    number: "05",
    name: "PR",
    subtitle: "OUTREACH / PARTNERSHIPS / COMMUNICATION",
    output: [
      "OUTREACH",
      "PARTNERSHIPS",
      "COMMUNICATION",
      "NETWORKING",
    ],
  },
  {
    number: "06",
    name: "DESIGN",
    subtitle: "UI / UX / GRAPHICS / BRANDING",
    output: [
      "UI / UX",
      "GRAPHICS",
      "BRANDING",
      "VISUAL SYSTEMS",
    ],
  },
  {
    number: "07",
    name: "DOCUMENTATION",
    subtitle: "RECORDS / CONTENT / KNOWLEDGE",
    output: [
      "RECORDS",
      "CONTENT",
      "KNOWLEDGE",
      "ARCHIVES",
    ],
  },
  {
    number: "08",
    name: "MANAGEMENT",
    subtitle: "PLANNING / OPERATIONS / EXECUTION",
    output: [
      "PLANNING",
      "OPERATIONS",
      "EXECUTION",
      "COORDINATION",
    ],
  },
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function Domains() {
  const sectionRef = useRef(null);
  const sequenceRef = useRef(0);
  const startedRef = useRef(false);

  const [hasEntered, setHasEntered] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const [terminalLines, setTerminalLines] = useState([]);
  const [typing, setTyping] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  const [selectedDomain, setSelectedDomain] = useState(null);

  /* =========================================================
     TERMINAL ENGINE
  ========================================================= */

  const isCurrentSequence = (id) => {
    return sequenceRef.current === id;
  };

  const typeText = async (
    text,
    speed = 24,
    sequenceId
  ) => {
    let current = "";

    for (let i = 0; i < text.length; i++) {
      if (!isCurrentSequence(sequenceId)) {
        return false;
      }

      current += text[i];
      setTyping(current);

      await sleep(speed);
    }

    if (!isCurrentSequence(sequenceId)) {
      return false;
    }

    setTyping("");

    return true;
  };

  const commitLine = (line) => {
    setTerminalLines((current) => [
      ...current,
      line,
    ]);
  };

  /* =========================================================
     DEFAULT DOMAIN SCAN
  ========================================================= */

  const runDomainScan = async () => {
    const sequenceId = ++sequenceRef.current;

    setScanComplete(false);
    setSelectedDomain(null);
    setTerminalLines([]);
    setTyping("");

    await sleep(250);

    if (
      !(await typeText(
        "initializing ACES.domain_system --scan",
        22,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "command",
      prefix: "$",
      text: "initializing ACES.domain_system --scan",
    });

    await sleep(300);

    if (
      !(await typeText(
        "scanning domains",
        26,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "info",
      prefix: ">",
      text: "scanning domains",
    });

    await sleep(350);

    commitLine({
      type: "divider",
      text:
        "────────────────────────────────────────────────",
    });

    await sleep(220);

    for (const domain of domains) {
      const domainText =
        `${domain.number}    ${domain.name}`;

      if (
        !(await typeText(
          domainText,
          25,
          sequenceId
        ))
      ) {
        return;
      }

      commitLine({
        type: "domain",
        number: domain.number,
        name: domain.name,
      });

      await sleep(110);
    }

    await sleep(300);

    if (
      !(await typeText(
        "8 domains detected / connection established",
        20,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "info",
      prefix: ">",
      text:
        "8 domains detected / connection established",
    });

    await sleep(250);

    setScanComplete(true);

    commitLine({
      type: "prompt",
      prefix: "$",
      text:
        "select --interactive --domain",
    });
  };

  /* =========================================================
     DOMAIN DETAIL
  ========================================================= */

  const runDomainDetail = async (domain) => {
    const sequenceId = ++sequenceRef.current;

    setSelectedDomain(domain);
    setScanComplete(false);

    /*
      MOBILE ONLY

      On phones, the domain selector appears below the terminal.
      After selecting a domain, smoothly bring the terminal back
      into view so the user can immediately watch the detail
      sequence happen.

      Desktop behavior is completely unchanged.
    */
    if (
      window.matchMedia(
        "(max-width: 650px)"
      ).matches
    ) {
      requestAnimationFrame(() => {
        const terminal =
          sectionRef.current?.querySelector(
            ".terminal-window"
          );

        if (!terminal) return;

        const terminalTop =
          terminal.getBoundingClientRect().top +
          window.scrollY -
          72;

        window.scrollTo({
          top: Math.max(0, terminalTop),
          behavior: "smooth",
        });
      });
    }

    setTerminalLines([]);
    setTyping("");

    await sleep(220);

    if (
      !(await typeText(
        `select --domain ${domain.name}`,
        24,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "command",
      prefix: "$",
      text:
        `select --domain ${domain.name}`,
    });

    await sleep(280);

    if (
      !(await typeText(
        `loading domain: ${domain.name}`,
        22,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "info",
      prefix: ">",
      text:
        `loading domain: ${domain.name}`,
    });

    await sleep(220);

    if (
      !(await typeText(
        "connection established",
        22,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "info",
      prefix: ">",
      text:
        "connection established",
    });

    await sleep(300);

    commitLine({
      type: "divider",
      text:
        "────────────────────────────────────────────────",
    });

    await sleep(250);

    if (
      !(await typeText(
        `DOMAIN: ${domain.name}`,
        26,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "title",
      text:
        `DOMAIN: ${domain.name}`,
    });

    await sleep(100);

    if (
      !(await typeText(
        "----------------------------------------",
        12,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "rule",
      text:
        "----------------------------------------",
    });

    await sleep(260);

    for (const output of domain.output) {
      if (
        !(await typeText(
          output,
          28,
          sequenceId
        ))
      ) {
        return;
      }

      commitLine({
        type: "output",
        prefix: ">",
        text: output,
      });

      await sleep(110);
    }

    await sleep(260);

    if (
      !(await typeText(
        "STATUS: ACTIVE",
        23,
        sequenceId
      ))
    ) {
      return;
    }

    commitLine({
      type: "status",
      text: "STATUS: ACTIVE",
    });

    await sleep(350);

    setScanComplete(true);

    commitLine({
      type: "prompt",
      prefix: "$",
      text:
        "return --domain-index",
    });
  };

  /* =========================================================
     VIEWPORT TRIGGER
  ========================================================= */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            !startedRef.current
          ) {
            startedRef.current = true;
            setHasEntered(true);
          }
        },
        {
          threshold: 0.25,
        }
      );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEntered) return;

    runDomainScan();
  }, [hasEntered]);

  /* =========================================================
     ESC = RETURN TO INDEX
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      runDomainScan();
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =========================================================
     CURSOR BLINK
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible(
        (current) => !current
      );
    }, 500);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      ref={sectionRef}
      className="domains"
      id="domains"
    >
      <div className="domains-inner">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="domains-header">

          <div className="domains-index">
            02 / DOMAINS
          </div>

          <h2 className="domains-title">

            <span className="domains-title-solid">
              DOMAINS
            </span>

            <span className="domains-title-outline">
              AVAILABLE.
            </span>

          </h2>

          <p className="domains-intro">
            Eight working domains. One committee.
            <br />
            Find where you want to build.
          </p>

        </header>


        {/* =====================================================
            WORKSPACE
        ===================================================== */}

        <div className="domains-workspace">

          {/* =================================================
              TERMINAL
          ================================================= */}

          <div className="terminal-window">

            <div className="terminal-topbar">

              <div className="terminal-dots">

                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>

              </div>

              <span className="terminal-path">
                aces://domains
              </span>

              <span className="terminal-status">
                {selectedDomain
                  ? `DOMAIN / ${selectedDomain.number}`
                  : "SYSTEM / READY"}
              </span>

            </div>


            <div className="terminal-body">

              {terminalLines.map(
                (line, index) => {

                  /* -----------------------------------------
                     DIVIDER
                  ----------------------------------------- */

                  if (
                    line.type === "divider"
                  ) {
                    return (
                      <div
                        key={index}
                        className="terminal-divider-line"
                      >
                        {line.text}
                      </div>
                    );
                  }


                  /* -----------------------------------------
                     DOMAIN LINE
                  ----------------------------------------- */

                  if (
                    line.type === "domain"
                  ) {
                    return (
                      <div
                        key={index}
                        className="terminal-domain-line"
                      >

                        <span className="terminal-domain-number">
                          {line.number}
                        </span>

                        <span className="terminal-domain-name">
                          {line.name}
                        </span>

                        <span className="terminal-domain-status">
                          ACTIVE
                        </span>

                      </div>
                    );
                  }


                  /* -----------------------------------------
                     DETAIL TITLE
                  ----------------------------------------- */

                  if (
                    line.type === "title"
                  ) {
                    return (
                      <div
                        key={index}
                        className="terminal-detail-title"
                      >
                        {line.text}
                      </div>
                    );
                  }


                  /* -----------------------------------------
                     DETAIL RULE
                  ----------------------------------------- */

                  if (
                    line.type === "rule"
                  ) {
                    return (
                      <div
                        key={index}
                        className="terminal-detail-rule"
                      >
                        {line.text}
                      </div>
                    );
                  }


                  /* -----------------------------------------
                     OUTPUT
                  ----------------------------------------- */

                  if (
                    line.type === "output"
                  ) {
                    return (
                      <div
                        key={index}
                        className="terminal-output-line"
                      >

                        <span className="prompt-symbol">
                          {line.prefix}
                        </span>

                        <span>
                          {line.text}
                        </span>

                      </div>
                    );
                  }


                  /* -----------------------------------------
                     STATUS
                  ----------------------------------------- */

                  if (
                    line.type === "status"
                  ) {
                    return (
                      <div
                        key={index}
                        className="terminal-detail-status"
                      >
                        {line.text}
                      </div>
                    );
                  }


                  /* -----------------------------------------
                     COMMAND / INFO / PROMPT
                  ----------------------------------------- */

                  return (
                    <div
                      key={index}
                      className={
                        `terminal-line ${
                          line.type === "info"
                            ? "terminal-info"
                            : line.type === "prompt"
                            ? "terminal-bottom-command"
                            : "terminal-command"
                        }`
                      }
                    >

                      <span className="prompt-symbol">
                        {line.prefix}
                      </span>

                      <span>
                        {line.text}
                      </span>

                    </div>
                  );
                }
              )}


              {/* =================================================
                  LIVE TYPING
              ================================================= */}

              {typing && (
                <div className="terminal-line terminal-live-line">

                  <span className="prompt-symbol">
                    {selectedDomain
                      ? ">"
                      : "$"}
                  </span>

                  <span>
                    {typing}
                  </span>

                  <span
                    className="terminal-cursor"
                    style={{
                      opacity:
                        cursorVisible
                          ? 1
                          : 0,
                    }}
                  />

                </div>
              )}


              {/* =================================================
                  RETURN COMMAND
              ================================================= */}

              {selectedDomain &&
                scanComplete &&
                !typing && (
                  <button
                    type="button"
                    className="terminal-return"
                    onClick={
                      runDomainScan
                    }
                  >

                    <span>$</span>

                    <span>
                      return --domain-index
                    </span>

                    <span
                      className="terminal-cursor"
                      style={{
                        opacity:
                          cursorVisible
                            ? 1
                            : 0,
                      }}
                    />

                  </button>
                )}

            </div>

          </div>


          {/* =================================================
              DOMAIN SELECTOR
          ================================================= */}

          <aside className="domain-selector">

            <div className="selector-heading">

              <span>
                SELECT DOMAIN / CLICK TO INSPECT
              </span>

              <span>
                01 — 08
              </span>

            </div>


            <div className="selector-list">

              {domains.map(
                (domain) => (
                  <button
                    key={domain.number}
                    type="button"

                    className={
                      `domain-selector-item ${
                        selectedDomain?.number ===
                        domain.number
                          ? "is-selected"
                          : ""
                      }`
                    }

                    disabled={!scanComplete}

                    onClick={() =>
                      runDomainDetail(domain)
                    }
                  >

                    <span className="selector-number">
                      {domain.number}
                    </span>

                    <span className="selector-name">
                      {domain.name}
                    </span>

                    <span className="selector-arrow">
                      ↗
                    </span>

                  </button>
                )
              )}

            </div>


            <div
              className={
                scanComplete
                  ? "selector-ready"
                  : "selector-locked"
              }
            >
              {scanComplete
                ? "8 DOMAINS / READY"
                : "SYSTEM SCANNING..."}
            </div>


            {scanComplete && (
              <div className="selector-instruction">
                CLICK A DOMAIN TO INSPECT
              </div>
            )}

          </aside>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="domains-footer">

          <span>
            ACES / DOMAIN SYSTEM
          </span>

          <span>
            SELECT A DOMAIN TO INSPECT
          </span>

        </div>

      </div>
    </section>
  );
}