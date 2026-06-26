import { useEffect, useRef } from "react";

const COLORS = ["#B1ADFF", "#9993FF", "#8D88EA", "#5B4DFF", "#C8C4FF"];
const MAX_PARTICLES = 150;
const SPAWN_COUNT = 4;

const CursorParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId;
    let isCurrent = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const spawn = (x, y) => {
      const room = MAX_PARTICLES - particles.length;
      const count = Math.min(SPAWN_COUNT, room);
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 1.0 + 0.5),
          radius: Math.random() * 2 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 0.9,
          decay: Math.random() * 0.007 + 0.018,
        });
      }
    };

    const onMouseMove = (e) => spawn(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const tick = () => {
      if (!isCurrent) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => p.alpha > 0);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.alpha -= p.decay;

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      isCurrent = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default CursorParticles;
