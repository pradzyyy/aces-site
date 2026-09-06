import { useEffect, useId, useRef } from "react";
import "./StrokeText.css";

export default function StrokeText({
  phrase = "ASSOCIATION OF COMPUTER ENGINEERING STUDENTS",
  className = "",
  fontSize = 30,
  baseOpacity = 0.10,
  revealRadius = 120,
}) {
  const svgRef = useRef(null);
  const maskCircleRef = useRef(null);
  const rowsRef = useRef([]);
  const fillRowsRef = useRef([]);
  const rafRef = useRef(0);

  const pointerRef = useRef({
    x: -10000,
    y: -10000,
    active: false,
  });

  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const svg = svgRef.current;
    const maskCircle = maskCircleRef.current;

    if (!svg || !maskCircle) return undefined;

    const coarse = window.matchMedia(
      "(hover: none), (pointer: coarse)"
    );

    const onMove = (event) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      pointerRef.current.active = true;
    };

    const onLeave = () => {
      pointerRef.current.x = -10000;
      pointerRef.current.y = -10000;
      pointerRef.current.active = false;
    };

    if (!coarse.matches) {
      window.addEventListener("pointermove", onMove, {
        passive: true,
      });
      window.addEventListener("pointerleave", onLeave);
    }

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;

      /*
       * Smooth perpetual motion:
       * every row moves on a sine wave, alternating direction.
       * Because the phase is continuous, there is no visible stop/reset.
       */
      rowsRef.current.forEach((row, index) => {
        if (!row) return;

        const direction = index % 2 === 0 ? 1 : -1;
        const phase = index * 0.62;

        const x =
          Math.sin(elapsed * 0.00033 + phase) *
          155 *
          direction;

        const y =
          Math.sin(elapsed * 0.00019 + phase) *
          5;

        const transform =
          `translate(${x.toFixed(2)} ${y.toFixed(2)})`;

        row.setAttribute("transform", transform);

        const fillRow = fillRowsRef.current[index];

        if (fillRow) {
          fillRow.setAttribute("transform", transform);
        }
      });

      /*
       * Cursor mapping:
       * screen coordinates -> exact SVG user coordinates.
       *
       * We intentionally do not CSS-transform the SVG itself. The only
       * movement is inside SVG transforms, so the mask remains locked to
       * the cursor regardless of row movement.
       */
      if (
        !coarse.matches &&
        pointerRef.current.active
      ) {
        const matrix = svg.getScreenCTM();

        if (matrix) {
          const point = new DOMPoint(
            pointerRef.current.x,
            pointerRef.current.y
          ).matrixTransform(matrix.inverse());

          maskCircle.setAttribute(
            "cx",
            point.x.toFixed(2)
          );

          maskCircle.setAttribute(
            "cy",
            point.y.toFixed(2)
          );
        }
      } else {
        maskCircle.setAttribute("cx", "-10000");
        maskCircle.setAttribute("cy", "-10000");
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const rows = 14;
  const gap = 84;
  const viewWidth = 1800;
  const viewHeight = 1120;

  return (
    <div
      className={`stroke-text ${className}`}
      style={{
        "--stroke-opacity": baseOpacity,
      }}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        className="stroke-text-svg"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`${uid}-fill`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#f4f3ee" stopOpacity="0.92" />
            <stop offset="34%" stopColor="#20e3b2" stopOpacity="0.96" />
            <stop offset="68%" stopColor="#00c8ff" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#0066ff" stopOpacity="0.86" />
          </linearGradient>

          <radialGradient
            id={`${uid}-mask`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="56%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>

          <mask
            id={`${uid}-cursor`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={viewWidth}
            height={viewHeight}
          >
            <rect
              x="0"
              y="0"
              width={viewWidth}
              height={viewHeight}
              fill="black"
            />

            <circle
              ref={maskCircleRef}
              cx="-10000"
              cy="-10000"
              r={revealRadius}
              fill={`url(#${uid}-mask)`}
            />
          </mask>
        </defs>

        {/* One diagonal typographic plane. */}
        <g transform={`rotate(-11 900 560)`}>
          {Array.from({ length: rows }, (_, index) => (
            <g
              key={`outline-${index}`}
              ref={(element) => {
                rowsRef.current[index] = element;
              }}
            >
              <text
                x="900"
                y={72 + index * gap}
                textAnchor="middle"
                fontFamily="Oxanium, Space Grotesk, sans-serif"
                fontSize={fontSize}
                fontWeight="500"
                letterSpacing="3"
                fill="none"
                stroke="rgba(244,243,238,0.9)"
                strokeWidth="1.1"
                textLength="2480"
                lengthAdjust="spacingAndGlyphs"
              >
                {phrase}
              </text>
            </g>
          ))}
        </g>

        {/* Cursor-revealed colour fill. Same geometry + same row transforms. */}
        <g
          mask={`url(#${uid}-cursor)`}
          transform={`rotate(-11 900 560)`}
        >
          {Array.from({ length: rows }, (_, index) => (
            <g
              key={`fill-${index}`}
              ref={(element) => {
                fillRowsRef.current[index] = element;
              }}
            >
              <text
                x="900"
                y={72 + index * gap}
                textAnchor="middle"
                fontFamily="Oxanium, Space Grotesk, sans-serif"
                fontSize={fontSize}
                fontWeight="500"
                letterSpacing="3"
                fill={`url(#${uid}-fill)`}
                stroke="rgba(244,243,238,0.82)"
                strokeWidth="1.1"
                textLength="2480"
                lengthAdjust="spacingAndGlyphs"
              >
                {phrase}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
