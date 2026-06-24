import { useEffect, useRef } from "react";

const CursorGlow = () => {
  const ref = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return <div className="cursor-glow" ref={ref} aria-hidden="true" />;
};

export default CursorGlow;
