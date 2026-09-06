import React, { useCallback, useEffect, useMemo, useRef } from "react";
import "./ProfileCard.css";

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const round = (value, precision = 3) =>
  parseFloat(value.toFixed(precision));

const adjust = (value, fromMin, fromMax, toMin, toMax) =>
  round(
    toMin +
      ((toMax - toMin) * (value - fromMin)) /
        (fromMax - fromMin)
  );

export default function ProfileCard({
  name = "",
  title = "",
  number = "01",
  avatarUrl = "",
  placeholder = "PHOTO / SOON",
  meta = "DYPCOE · COMPUTER ENGINEERING",
  instagram = "#",
  linkedin = "#",
  accent = "mint",
  compact = false,
  member1 = "",
  member2 = "",
  member3 = "",
  member4 = "",
  className = "",
}) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const current = useRef({ x: 50, y: 50 });
  const target = useRef({ x: 50, y: 50 });
  const hovering = useRef(false);

  const setVars = useCallback((percentX, percentY) => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const centerX = percentX - 50;
    const centerY = percentY - 50;

    wrap.style.setProperty("--pointer-x", `${percentX}%`);
    wrap.style.setProperty("--pointer-y", `${percentY}%`);

    wrap.style.setProperty(
      "--background-x",
      `${adjust(percentX, 0, 100, 30, 70)}%`
    );

    wrap.style.setProperty(
      "--background-y",
      `${adjust(percentY, 0, 100, 30, 70)}%`
    );

    wrap.style.setProperty(
      "--rotate-x",
      `${round(centerY / 5)}deg`
    );

    wrap.style.setProperty(
      "--rotate-y",
      `${round(-(centerX / 5))}deg`
    );

    // Used by the holographic foil layers.
    wrap.style.setProperty(
      "--holo-angle",
      `${round(135 + centerX * 0.75 + centerY * 0.2)}deg`
    );

    wrap.style.setProperty(
      "--holo-shift-x",
      `${round(centerX * 0.55)}px`
    );

    wrap.style.setProperty(
      "--holo-shift-y",
      `${round(centerY * 0.32)}px`
    );

    wrap.style.setProperty(
      "--holo-scale",
      `${round(1 + Math.abs(centerX + centerY) * 0.0012, 4)}`
    );
  }, []);

  const startRaf = useCallback(() => {
    if (rafRef.current) return;

    const tick = () => {
      current.current.x +=
        (target.current.x - current.current.x) * 0.14;

      current.current.y +=
        (target.current.y - current.current.y) * 0.14;

      setVars(
        current.current.x,
        current.current.y
      );

      const settled =
        Math.abs(target.current.x - current.current.x) < 0.05 &&
        Math.abs(target.current.y - current.current.y) < 0.05;

      if (settled && !hovering.current) {
        current.current = { x: 50, y: 50 };
        target.current = { x: 50, y: 50 };

        setVars(50, 50);

        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [setVars]);

  useEffect(() => {
    setVars(50, 50);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [setVars]);

  const onPointerMove = (event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = clamp(
      ((event.clientX - rect.left) / rect.width) * 100
    );

    const y = clamp(
      ((event.clientY - rect.top) / rect.height) * 100
    );

    target.current = { x, y };
    startRaf();
  };

  const onPointerEnter = (event) => {
    hovering.current = true;

    wrapRef.current?.classList.add("is-active");

    onPointerMove(event);
  };

  const onPointerLeave = () => {
    hovering.current = false;

    wrapRef.current?.classList.remove("is-active");

    target.current = { x: 50, y: 50 };

    startRaf();
  };

  const cardStyle = useMemo(
    () => ({
      "--accent":
        accent === "blue"
          ? "#0066ff"
          : accent === "violet"
          ? "#7557ff"
          : accent === "cyan"
          ? "#10cde1"
          : "#20e3b2",
    }),
    [accent]
  );

  return (
    <div
      ref={wrapRef}
      className={`aces-profile-card ${
        compact ? "aces-profile-card-compact" : ""
      } ${className}`}
      style={cardStyle}
    >
      <div className="aces-profile-glow" />

      <article
        ref={cardRef}
        className="aces-profile-shell"
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div className="aces-profile-card-inner">
          {/* Holographic foil layers */}
          <div className="aces-profile-holo-spectrum" aria-hidden="true" />
          <div className="aces-profile-holo-sheen" aria-hidden="true" />
          <div className="aces-profile-holo-noise" aria-hidden="true" />

          <div className="aces-profile-shine" aria-hidden="true" />
          <div className="aces-profile-glare" aria-hidden="true" />

          <div className="aces-profile-top">
            <span>ACES / {number}</span>
            <span>2026</span>
          </div>

          {!compact && (
            <div className="aces-profile-photo">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${name} portrait`}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              <div className="aces-photo-placeholder">
                <span>{placeholder}</span>
                <strong>{number}</strong>
                <div className="aces-photo-cross x" />
                <div className="aces-photo-cross y" />
              </div>
            </div>
          )}

          <div className="aces-profile-copy">
            {compact ? (
              <>
                <span className="aces-profile-role">
                  {title}
                </span>

                <div className="aces-profile-name-list">
                  {member1 && (
                    <div className="aces-profile-name-row">
                      <span>01</span>
                      <strong>{member1}</strong>
                    </div>
                  )}

                  {member2 && (
                    <div className="aces-profile-name-row">
                      <span>02</span>
                      <strong>{member2}</strong>
                    </div>
                  )}

                  {member3 && (
                    <div className="aces-profile-name-row">
                      <span>03</span>
                      <strong>{member3}</strong>
                    </div>
                  )}

                  {member4 && (
                    <div className="aces-profile-name-row">
                      <span>04</span>
                      <strong>{member4}</strong>
                    </div>
                  )}

                  {!member1 &&
                    !member2 &&
                    !member3 &&
                    !member4 &&
                    name && <h3>{name}</h3>}
                </div>

                <p>{meta}</p>
              </>
            ) : (
              <>
                <h3>{name}</h3>

                <span className="aces-profile-role">
                  {title}
                </span>

                <p>{meta}</p>
              </>
            )}
          </div>

          <div className="aces-profile-bottom">
            <span>ACES // 2026</span>

            {!compact && (
              <div className="aces-profile-links">
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  INSTAGRAM ↗
                </a>

                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  LINKEDIN ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
