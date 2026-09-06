import { useEffect, useRef } from "react";
import "./CursorGrid.css";

/**
 * React-Bits-inspired Cursor Grid:
 * - canvas-rendered architectural grid
 * - cursor illuminates nearby cells
 * - click creates a short radial pulse
 * - transparent background so the existing hero remains black
 * - disabled on touch devices
 */
export default function CursorGrid({
  cellSize = 38,
  radius = 190,
  lineColor = "rgba(255,255,255,0.035)",
  glowColor = "32,227,178",
  opacity = 0.72,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!context) return;

    const coarsePointer = window.matchMedia(
      "(hover: none), (pointer: coarse)"
    );

    if (coarsePointer.matches) {
      return undefined;
    }

    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const pulses = [];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;

      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onPointerDown = (event) => {
      const rect = canvas.getBoundingClientRect();

      pulses.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        started: performance.now(),
        duration: 520,
      });

      if (!frame) frame = requestAnimationFrame(draw);
    };

    const draw = (now = performance.now()) => {
      frame = 0;

      context.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;

      context.lineWidth = 1;
      context.strokeStyle = lineColor;
      context.globalAlpha = opacity;

      // Base architectural grid.
      context.beginPath();

      for (let x = 0; x <= cols * cellSize; x += cellSize) {
        context.moveTo(Math.round(x) + 0.5, 0);
        context.lineTo(Math.round(x) + 0.5, height);
      }

      for (let y = 0; y <= rows * cellSize; y += cellSize) {
        context.moveTo(0, Math.round(y) + 0.5);
        context.lineTo(width, Math.round(y) + 0.5);
      }

      context.stroke();

      context.globalAlpha = 1;

      const pulseState = pulses.filter((pulse) => {
        return now - pulse.started < pulse.duration;
      });

      pulses.length = 0;
      pulses.push(...pulseState);

      const activeRadius = radius;
      const radiusSquared = activeRadius * activeRadius;

      const startColumn = pointer.active
        ? Math.max(0, Math.floor((pointer.x - activeRadius) / cellSize))
        : 0;

      const endColumn = pointer.active
        ? Math.min(
            cols,
            Math.ceil((pointer.x + activeRadius) / cellSize)
          )
        : 0;

      const startRow = pointer.active
        ? Math.max(0, Math.floor((pointer.y - activeRadius) / cellSize))
        : 0;

      const endRow = pointer.active
        ? Math.min(
            rows,
            Math.ceil((pointer.y + activeRadius) / cellSize)
          )
        : 0;

      // Cursor-reactive cells.
      if (pointer.active) {
        for (let row = startRow; row <= endRow; row += 1) {
          for (
            let column = startColumn;
            column <= endColumn;
            column += 1
          ) {
            const cellX = column * cellSize + cellSize / 2;
            const cellY = row * cellSize + cellSize / 2;

            const dx = cellX - pointer.x;
            const dy = cellY - pointer.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared > radiusSquared) continue;

            const distance = Math.sqrt(distanceSquared);
            const strength = Math.pow(
              1 - distance / activeRadius,
              2.25
            );

            const inset = 2;
            const fillAlpha = 0.08 * strength;
            const glowAlpha = 0.34 * strength;

            context.fillStyle = `rgba(${glowColor},${fillAlpha})`;
            context.fillRect(
              column * cellSize + inset,
              row * cellSize + inset,
              cellSize - inset * 2,
              cellSize - inset * 2
            );

            context.strokeStyle = `rgba(${glowColor},${0.055 * strength})`;

            context.strokeRect(
              column * cellSize + 0.5,
              row * cellSize + 0.5,
              cellSize - 1,
              cellSize - 1
            );

            if (strength > 0.18) {
              context.shadowBlur = 12 * strength;
              context.shadowColor = `rgba(${glowColor},${glowAlpha})`;
              context.fillStyle = `rgba(${glowColor},${0.06 * strength})`;
              context.fillRect(
                cellX - 1.25,
                cellY - 1.25,
                2.5,
                2.5
              );
              context.shadowBlur = 0;
            }
          }
        }
      }

      // Click pulses.
      pulses.forEach((pulse) => {
        const age = now - pulse.started;
        const progress = Math.min(
          Math.max(age / pulse.duration, 0),
          1
        );

        const pulseRadius =
          10 +
          progress *
            Math.max(width, height) *
            0.18;

        const alpha =
          Math.pow(1 - progress, 2.4) * 0.3;

        context.beginPath();
        context.arc(
          pulse.x,
          pulse.y,
          pulseRadius,
          0,
          Math.PI * 2
        );

        context.strokeStyle =
          `rgba(${glowColor},${alpha})`;

        context.lineWidth = 1;
        context.stroke();

        context.beginPath();
        context.arc(
          pulse.x,
          pulse.y,
          pulseRadius * 0.28,
          0,
          Math.PI * 2
        );

        context.strokeStyle =
          `rgba(${glowColor},${alpha * 0.55})`;

        context.stroke();
      });

      if (pointer.active || pulses.length) {
        frame = requestAnimationFrame(draw);
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    window.addEventListener("pointerleave", onPointerLeave);

    window.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    });

    draw();

    return () => {
      if (frame) cancelAnimationFrame(frame);

      resizeObserver.disconnect();

      window.removeEventListener(
        "pointermove",
        onPointerMove
      );

      window.removeEventListener(
        "pointerleave",
        onPointerLeave
      );

      window.removeEventListener(
        "pointerdown",
        onPointerDown
      );
    };
  }, [cellSize, radius, lineColor, glowColor, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-grid"
      aria-hidden="true"
    />
  );
}
