import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * ACESLogo
 * ----------------------------------------------------------------------
 * A fully vector (SVG) recreation of the ACES network logo. No raster
 * image is used anywhere in this component — every shape (outer network,
 * inner network, nodes, tech icons, and the "ACES" wordmark) is drawn
 * with <path>/<line>/<circle>/<rect> elements and animated once on mount
 * with GSAP using stroke-dasharray / stroke-dashoffset line-drawing.
 *
 * Geometry was measured directly from the reference artwork (node
 * positions, icon positions, and letterform bounding boxes were sampled
 * from the source image) so proportions and the open, asymmetric shape
 * of the network match the original rather than a generic/regular
 * polygon.
 *
 * The whole drawing lives in a single 640x640 viewBox, so it scales
 * identically (same geometry) on any screen size — only the CSS size of
 * the wrapping <div> changes between desktop and mobile.
 *
 * Usage:
 *   <ACESLogo className="hero-logo" />
 */
export default function ACESLogo({ className = "" }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const outerEdges = gsap.utils.toArray(root.querySelectorAll(".outer-edge"));
    const innerLines = gsap.utils.toArray(root.querySelectorAll(".inner-line"));
    const nodes = gsap.utils.toArray(root.querySelectorAll(".net-node"));
    const icons = gsap.utils.toArray(root.querySelectorAll(".tech-icon"));
    const wordmarkStrokes = gsap.utils.toArray(
      root.querySelectorAll(".wordmark-stroke")
    );
    const wordmarkFills = gsap.utils.toArray(
      root.querySelectorAll(".wordmark-fill")
    );

    // Prep every "drawable" line/path: measure its length and hide it
    // behind its own dasharray so GSAP can reveal it progressively.
    const drawables = [...outerEdges, ...innerLines, ...wordmarkStrokes];
    drawables.forEach((el) => {
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
    });

    gsap.set(nodes, { scale: 0, transformOrigin: "50% 50%", opacity: 0 });
    gsap.set(icons, { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" });
    gsap.set(wordmarkFills, { opacity: 0, scale: 0.9, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ defaults: { ease: "power1.inOut" } });

    // PHASE 1 + 2 — FAST outer network reveal.
    tl.to(outerEdges, {
      strokeDashoffset: 0,
      duration: 0.38,
      stagger: 0.07,
    }, 0);

    // PHASE 3 — FAST inner network reveal.
    tl.to(innerLines, {
      strokeDashoffset: 0,
      duration: 0.28,
      stagger: 0.035,
    }, 0.68);

    // PHASE 4 — connection nodes pop in individually.
    tl.to(nodes, {
      scale: 1,
      opacity: 1,
      duration: 0.18,
      stagger: 0.025,
      ease: "back.out(2.4)",
    }, 1.15);

    // PHASE 5 — technology icons fade/draw in quickly.
    tl.to(icons, {
      opacity: 1,
      scale: 1,
      duration: 0.18,
      stagger: 0.045,
      ease: "power2.out",
    }, 1.42);

    // PHASE 6 — ACES wordmark draws + fades in last.
    tl.to(wordmarkStrokes, {
      strokeDashoffset: 0,
      duration: 0.35,
      stagger: 0.07,
    }, 1.72);

    tl.to(wordmarkFills, {
      opacity: 1,
      scale: 1,
      duration: 0.25,
      stagger: 0.04,
      ease: "power2.out",
    }, 1.76);

    // PHASE 7 — nothing after this. No repeat, no yoyo, no pulsing.

    return () => tl.kill();
  }, []);

  return (
    <div ref={rootRef} className={`aces-logo ${className}`}>
      <svg
        viewBox="0 0 640 640"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ACES logo"
      >
        <defs>
          {/* userSpaceOnUse so the gradient sweeps once across the WHOLE
              ring / word, instead of restarting on every individual
              segment or letter (which is the default objectBoundingBox
              behavior and looks repetitive/banded). */}
          <linearGradient
            id="acesEdgeGradient"
            gradientUnits="userSpaceOnUse"
            x1="305" y1="60" x2="305" y2="577"
          >
            <stop offset="0%" stopColor="#2fe6c4" />
            <stop offset="55%" stopColor="#22b4d9" />
            <stop offset="100%" stopColor="#1d5fe0" />
          </linearGradient>
          <linearGradient
            id="acesWordGradient"
            gradientUnits="userSpaceOnUse"
            x1="115" y1="0" x2="538" y2="0"
          >
            <stop offset="0%" stopColor="#2fe6c4" />
            <stop offset="55%" stopColor="#22b4d9" />
            <stop offset="100%" stopColor="#1d5fe0" />
          </linearGradient>

          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ================= INNER NETWORK — EXACT TWO-LAYER TOPOLOGY ================= */}
        {/*
          This is intentionally NOT one connected mesh.

          TOP INNER LAYER:
            upper-left / top / upper-right nodes -> cloud -> globe -> chip

          LOWER INNER LAYER:
            left-middle -> android -> github -> python -> lower-right

          The original logo has NO inner lines extending from the right outer
          endpoints toward the ACES wordmark. Those were the lines that made
          the previous recreation look wrong.
        */}
        <g
          className="inner-network inner-network-top"
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {/* top node / upper network */}
          <line className="inner-line" x1="304" y1="60" x2="216" y2="151" />
          <line className="inner-line" x1="180" y1="88" x2="312" y2="146" />
          <line className="inner-line" x1="88" y1="185" x2="216" y2="151" />
          <line className="inner-line" x1="426" y1="88" x2="312" y2="146" />

          {/* chip / left-middle connection */}
          <line className="inner-line" x1="180" y1="88" x2="171" y2="215" />
          <line className="inner-line" x1="171" y1="215" x2="51" y2="316" />
          <line className="inner-line" x1="88" y1="185" x2="108" y2="315" />
        </g>

        <g
          className="inner-network inner-network-bottom"
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {/* left-middle -> android */}
          <line className="inner-line" x1="51" y1="316" x2="177" y2="411" />
          {/* Added from annotated reference: inner left node → lower-left outer node */}
          <line className="inner-line" x1="108" y1="315" x2="88" y2="445" />

          {/* android -> github */}
          <line className="inner-line" x1="88" y1="445" x2="217" y2="477" />

          {/* github / python / bottom */}
          {/* Added from annotated reference: Android → lower-left outer node */}
          <line className="inner-line" x1="177" y1="411" x2="180" y2="543" />
          <line className="inner-line" x1="180" y1="543" x2="305" y2="475" />
          {/* Added from annotated reference: Android → bottom-centre */}
          <line className="inner-line" x1="217" y1="477" x2="305" y2="577" />
          <line className="inner-line" x1="305" y1="475" x2="426" y2="544" />
        </g>

        {/* ================= OUTER OPEN NETWORK RING ================= */}
        {/* Deliberately open: no segment connects node 9 back to node 1. */}
        <g
          className="outer-network"
          fill="none"
          stroke="url(#acesEdgeGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        >
          <path className="outer-edge" d="M426,88 L304,60" />
          <path className="outer-edge" d="M304,60 L180,88" />
          <path className="outer-edge" d="M180,88 L88,185" />
          <path className="outer-edge" d="M88,185 L51,316" />
          <path className="outer-edge" d="M51,316 L88,445" />
          <path className="outer-edge" d="M88,445 L180,543" />
          <path className="outer-edge" d="M180,543 L305,577" />
          <path className="outer-edge" d="M305,577 L426,544" />
        </g>

        {/* ================= CONNECTION NODES ================= */}
        <g className="nodes" fill="#ffffff" stroke="#ffffff" strokeWidth="0" filter="url(#nodeGlow)">
          <circle className="net-node" cx="426" cy="88" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="304" cy="60" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="180" cy="88" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="88" cy="185" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="51" cy="316" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="88" cy="445" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="180" cy="543" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="305" cy="577" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="426" cy="544" r="7"  fill="#ffffff" stroke="none" opacity="1" />
          <circle className="net-node" cx="108" cy="315" r="5"  fill="#ffffff" stroke="none" opacity="1" />
        </g>

        {/* ================= TECH ICONS (simple line art) ================= */}
        <g
          className="tech-icons"
          fill="none"
          stroke="#c9cdd3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Cloud */}
          <g className="tech-icon" transform="translate(216 151) scale(0.72)">
            <path d="M-16,6 a9,9 0 0,1 2,-17.7 a11,11 0 0,1 21,-2.3 a8,8 0 0,1 1,17.9 a8,8 0 0,1 -1,0.1 z" />
          </g>

          {/* Globe */}
          <g className="tech-icon" transform="translate(312 146)">
            <circle cx="0" cy="0" r="13" />
            <ellipse cx="0" cy="0" rx="5.5" ry="13" />
            <line x1="-13" y1="0" x2="13" y2="0" />
            <line x1="-11" y1="-6.5" x2="11" y2="-6.5" />
            <line x1="-11" y1="6.5" x2="11" y2="6.5" />
          </g>

          {/* Chip */}
          <g className="tech-icon" transform="translate(171 215)">
            <rect x="-11" y="-11" width="22" height="22" rx="2" />
            <rect x="-5" y="-5" width="10" height="10" rx="1" />
            <line x1="-11" y1="-6" x2="-16" y2="-6" />
            <line x1="-11" y1="0" x2="-16" y2="0" />
            <line x1="-11" y1="6" x2="-16" y2="6" />
            <line x1="11" y1="-6" x2="16" y2="-6" />
            <line x1="11" y1="0" x2="16" y2="0" />
            <line x1="11" y1="6" x2="16" y2="6" />
            <line x1="-6" y1="-11" x2="-6" y2="-16" />
            <line x1="6" y1="-11" x2="6" y2="-16" />
            <line x1="-6" y1="11" x2="-6" y2="16" />
            <line x1="6" y1="11" x2="6" y2="16" />
          </g>

          {/* Android */}
          <g className="tech-icon" transform="translate(177 411)">
            <path d="M-11,-2 a11,11 0 0,1 22,0 z" />
            <line x1="-11" y1="-2" x2="11" y2="-2" />
            <line x1="-11" y1="-2" x2="-11" y2="7" />
            <line x1="11" y1="-2" x2="11" y2="7" />
            <line x1="-11" y1="7" x2="11" y2="7" />
            <line x1="-6.5" y1="-9" x2="-8.5" y2="-13" />
            <line x1="6.5" y1="-9" x2="8.5" y2="-13" />
            <line x1="-15" y1="-1" x2="-15" y2="6" />
            <line x1="15" y1="-1" x2="15" y2="6" />
            <line x1="-5" y1="10" x2="-5" y2="14" />
            <line x1="5" y1="10" x2="5" y2="14" />
          </g>

          {/* Git / repo node icon */}
          <g className="tech-icon" transform="translate(217 477) scale(0.72)">
            <circle cx="-8" cy="-9" r="3.2" />
            <circle cx="-8" cy="9" r="3.2" />
            <circle cx="8" cy="0" r="3.2" />
            <path d="M-8,-6 L-8,6" />
            <path d="M-8,6 C-8,0 0,3 5,0" />
          </g>

          {/* Python-like symbol */}
          <g className="tech-icon" transform="translate(305 475)">
            <path d="M-1,-13 C6,-13 8,-10 8,-6 L8,-1 L-6,-1 L-6,2 L11,2 L11,10 C11,14 8,15 1,15 C-6,15 -9,13 -9,9 L-4,9 C-4,11 -3,12 1,12 C5,12 6,11 6,9 L6,5 L-11,5 L-11,-6 C-11,-11 -8,-13 -1,-13 Z" />
            <circle cx="2.5" cy="-9" r="1.4" fill="#c9cdd3" stroke="none" />
            <circle cx="-2.5" cy="11" r="1.4" fill="#c9cdd3" stroke="none" />
          </g>
        </g>

        {/* ================= ACES WORDMARK (vector, drawn last) ================= */}
        <g className="aces-wordmark">
          {/* A */}
          <path
            className="wordmark-stroke"
            d="M169,264 L123,350"
            fill="none"
            stroke="url(#acesWordGradient)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            className="wordmark-stroke"
            d="M169,264 L215,350"
            fill="none"
            stroke="url(#acesWordGradient)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <circle
            className="wordmark-fill"
            cx="169"
            cy="323"
            r="11"
            fill="url(#acesWordGradient)"
          />

          {/* C */}
          <path
            className="wordmark-stroke"
            d="M312,278 A46,46 0 1,0 312,338"
            fill="none"
            stroke="url(#acesWordGradient)"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* E */}
          <rect className="wordmark-fill" x="339" y="266" width="92" height="11" rx="5.5" fill="url(#acesWordGradient)" />
          <rect className="wordmark-fill" x="339" y="301" width="92" height="11" rx="5.5" fill="url(#acesWordGradient)" />
          <rect className="wordmark-fill" x="339" y="335" width="92" height="11" rx="5.5" fill="url(#acesWordGradient)" />

          {/* S */}
          <path
            className="wordmark-stroke"
            d="M523,283
               C523,270 508,264 491,264
               C471,264 454,270 454,285
               C454,300 470,304 491,308
               C512,312 529,316 529,332
               C529,347 511,352 491,352
               C474,352 460,347 458,335"
            fill="none"
            stroke="url(#acesWordGradient)"
            strokeWidth="15"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
