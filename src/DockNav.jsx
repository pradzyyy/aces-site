import React, { useEffect, useState } from "react";
import "./DockNav.css";

const navItems = [
  {
    number: "01",
    label: "HOME",
    id: "home",
  },
  {
    number: "02",
    label: "TEAM",
    id: "team",
  },
  {
    number: "03",
    label: "DOMAINS",
    id: "domains",
  },
  {
    number: "04",
    label: "EVENTS",
    id: "events",
  },
];

export default function DockNav() {
  const [active, setActive] = useState("home");
  const [hovered, setHovered] = useState(null);

  /* =========================================================
     UPDATE ACTIVE ITEM WHILE SCROLLING
  ========================================================= */

  useEffect(() => {
    const sections = navItems
      .map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }))
      .filter((item) => item.element);

    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.35;

      let currentSection = "home";

      sections.forEach((section) => {
        const rect = section.element.getBoundingClientRect();

        if (
          rect.top <= triggerPoint &&
          rect.bottom > triggerPoint
        ) {
          currentSection = section.id;
        }
      });

      setActive(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  /* =========================================================
     SECTION NAVIGATION
  ========================================================= */

  const scrollToSection = (id) => {
    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const section = document.getElementById(id);

    if (!section) return;

    const top =
      section.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  /* =========================================================
     APPLY
  ========================================================= */

  const goToApply = () => {
    window.location.href = "/recruit";
  };

  return (
    <nav className="dock-nav">

      {/* =====================================================
          ACES BRAND
      ===================================================== */}

      <button
        type="button"
        className="dock-brand"
        onClick={() => scrollToSection("home")}
        aria-label="ACES Home"
      >
        ACES<span>/</span>
      </button>

      {/* =====================================================
          MAIN DOCK
      ===================================================== */}

      <div className="dock">

        <div className="dock-items">

          {navItems.map((item) => {
            const isHovered = hovered === item.id;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`
                  dock-item
                  ${isActive ? "is-active" : ""}
                  ${isHovered ? "is-hovered" : ""}
                `}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => scrollToSection(item.id)}
                aria-label={item.label}
              >
                <span className="dock-number">
                  {item.number}
                </span>

                <span className="dock-label">
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="dock-divider" />

        {/* =================================================
            APPLY
        ================================================= */}

        <button
          type="button"
          className={`
            dock-recruit
            ${hovered === "apply" ? "is-hovered" : ""}
          `}
          onMouseEnter={() => setHovered("apply")}
          onMouseLeave={() => setHovered(null)}
          onClick={goToApply}
          aria-label="Apply to ACES"
        >
          <span className="dock-recruit-dot" />

          <span className="dock-recruit-label">
            APPLY
          </span>

          <span className="dock-recruit-arrow">
            ↗
          </span>
        </button>

      </div>
    </nav>
  );
}
