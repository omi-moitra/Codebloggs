import { useEffect, useRef } from "react";

const CELL      = 24;
const COARSE    = 96;
const RADIUS    = 300;
const AMPLITUDE = 50;

// Color interpolation for line segments inside the bulge zone.
// t=0 → zone edge (matches far color), t=1 → cursor center.
//
// Light mode — all lines fade to delft-blue at the cursor:
//   fine   : tropical-indigo → delft-blue
//   coarse : neon-indigo     → delft-blue
//
// Dark mode — bright periwinkle at cursor, fading outward through:
//   fine   : periwinkle      → tropical-indigo → neon-indigo
//   coarse : bright-periwinkle → iris          → neon-indigo
function segmentColor(t, isCoarse, isDark) {
  let r, g, b, a;

  if (isDark) {
    if (isCoarse) {
      // bright-periwinkle #9993FF (153,147,255) ← iris #6A5CFF (106,92,255) ← neon-indigo #5B4DFF (91,77,255)
      if (t >= 0.5) {
        const s = (t - 0.5) * 2;          // iris → bright-periwinkle
        r = Math.round(106 + s * 47);     // 106 → 153
        g = Math.round(92  + s * 55);     // 92  → 147
        b = 255;
        a = 0.16 + s * 0.32;             // 0.16 → 0.48
      } else {
        const s = t * 2;                   // neon-indigo → iris
        r = Math.round(91 + s * 15);      // 91  → 106
        g = Math.round(77 + s * 15);      // 77  → 92
        b = 255;
        a = 0.13 + s * 0.03;             // 0.13 → 0.16
      }
    } else {
      // periwinkle #B1ADFF (177,173,255) ← tropical-indigo #8D88EA (141,136,234) ← neon-indigo #5B4DFF (91,77,255)
      if (t >= 0.5) {
        const s = (t - 0.5) * 2;          // tropical-indigo → periwinkle
        r = Math.round(141 + s * 36);     // 141 → 177
        g = Math.round(136 + s * 37);     // 136 → 173
        b = Math.round(234 + s * 21);     // 234 → 255
        a = 0.12 + s * 0.26;             // 0.12 → 0.38
      } else {
        const s = t * 2;                   // neon-indigo → tropical-indigo
        r = Math.round(91 + s * 50);      // 91  → 141
        g = Math.round(77 + s * 59);      // 77  → 136
        b = Math.round(255 - s * 21);     // 255 → 234
        a = 0.09 + s * 0.03;             // 0.09 → 0.12
      }
    }
  } else {
    // Light mode: ease toward delft-blue #403E6B (64,62,107) with t²
    const tSq = t * t;
    if (isCoarse) {
      // neon-indigo #5B4DFF (91,77,255) → delft-blue (64,62,107)
      r = Math.round(91  - tSq * 27);    // 91  → 64
      g = Math.round(77  - tSq * 15);    // 77  → 62
      b = Math.round(255 - tSq * 148);   // 255 → 107
      a = 0.13 + tSq * 0.52;            // 0.13 → 0.65
    } else {
      // tropical-indigo #8D88EA (141,136,234) → delft-blue (64,62,107)
      r = Math.round(141 - tSq * 77);    // 141 → 64
      g = Math.round(136 - tSq * 74);    // 136 → 62
      b = Math.round(234 - tSq * 127);   // 234 → 107
      a = 0.09 + tSq * 0.46;            // 0.09 → 0.55
    }
  }

  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

function drawGrid(ctx, W, H, mx, my, isDark) {
  ctx.clearRect(0, 0, W, H);

  // Lines outside the bulge zone
  const FINE_FAR   = isDark
    ? "rgba(91,77,255,0.09)"     // neon-indigo
    : "rgba(141,136,234,0.09)";  // tropical-indigo
  const COARSE_FAR = "rgba(91,77,255,0.13)"; // neon-indigo (both modes)

  function drawHLine(lineY, isCoarse) {
    const lw     = isCoarse ? 1 : 0.5;
    const farCol = isCoarse ? COARSE_FAR : FINE_FAR;
    ctx.lineWidth = lw;

    const dy   = lineY - my;
    const disc = RADIUS * RADIUS - dy * dy;

    if (disc <= 0) {
      ctx.strokeStyle = farCol;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(W, lineY);
      ctx.stroke();
      return;
    }

    const halfC = Math.sqrt(disc);
    const x0 = Math.max(0, mx - halfC);
    const x1 = Math.min(W, mx + halfC);

    if (x0 > 0) {
      ctx.strokeStyle = farCol;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(x0, lineY);
      ctx.stroke();
    }

    let prevPx = null, prevPy = null;
    for (let x = x0; x <= x1; x += 2) {
      const dx    = x - mx;
      const d     = Math.hypot(dx, dy);
      const t     = Math.max(0, 1 - d / RADIUS);
      const mag   = d > 0 ? AMPLITUDE * t * t : 0;
      const dSafe = Math.max(d, 0.1);
      const px    = x     + (dx / dSafe) * mag;
      const py    = lineY + (dy / dSafe) * mag;

      if (prevPx !== null) {
        ctx.strokeStyle = segmentColor(t, isCoarse, isDark);
        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      prevPx = px;
      prevPy = py;
    }

    if (x1 < W) {
      ctx.strokeStyle = farCol;
      ctx.beginPath();
      ctx.moveTo(x1, lineY);
      ctx.lineTo(W, lineY);
      ctx.stroke();
    }
  }

  function drawVLine(lineX, isCoarse) {
    const lw     = isCoarse ? 1 : 0.5;
    const farCol = isCoarse ? COARSE_FAR : FINE_FAR;
    ctx.lineWidth = lw;

    const dx   = lineX - mx;
    const disc = RADIUS * RADIUS - dx * dx;

    if (disc <= 0) {
      ctx.strokeStyle = farCol;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, H);
      ctx.stroke();
      return;
    }

    const halfC = Math.sqrt(disc);
    const y0 = Math.max(0, my - halfC);
    const y1 = Math.min(H, my + halfC);

    if (y0 > 0) {
      ctx.strokeStyle = farCol;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, y0);
      ctx.stroke();
    }

    let prevPx = null, prevPy = null;
    for (let y = y0; y <= y1; y += 2) {
      const dy    = y - my;
      const d     = Math.hypot(dx, dy);
      const t     = Math.max(0, 1 - d / RADIUS);
      const mag   = d > 0 ? AMPLITUDE * t * t : 0;
      const dSafe = Math.max(d, 0.1);
      const px    = lineX + (dx / dSafe) * mag;
      const py    = y     + (dy / dSafe) * mag;

      if (prevPx !== null) {
        ctx.strokeStyle = segmentColor(t, isCoarse, isDark);
        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      prevPx = px;
      prevPy = py;
    }

    if (y1 < H) {
      ctx.strokeStyle = farCol;
      ctx.beginPath();
      ctx.moveTo(lineX, y1);
      ctx.lineTo(lineX, H);
      ctx.stroke();
    }
  }

  for (let y = 0; y < H; y += CELL) {
    if (y % COARSE !== 0) drawHLine(y, false);
  }
  for (let x = 0; x < W; x += CELL) {
    if (x % COARSE !== 0) drawVLine(x, false);
  }
  for (let y = 0; y < H; y += COARSE) drawHLine(y, true);
  for (let x = 0; x < W; x += COARSE) drawVLine(x, true);
}

const BulgeGrid = () => {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const dirtyRef  = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    const isDark = () =>
      document.documentElement.getAttribute("data-theme") === "dark";

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      dirtyRef.current = true;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      dirtyRef.current = true;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const observer = new MutationObserver(() => { dirtyRef.current = true; });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let rafId;
    const loop = () => {
      if (dirtyRef.current) {
        const { x, y } = mouseRef.current;
        drawGrid(ctx, canvas.width, canvas.height, x, y, isDark());
        dirtyRef.current = false;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
};

export default BulgeGrid;
