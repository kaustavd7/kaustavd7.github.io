"use client";
import { cx } from "@/src/utils";
import { useEffect, useRef, useState } from "react";

// Content is visible in the server-rendered HTML; the reveal animation is a
// client-only enhancement applied to elements still below the viewport, so
// no-JS visitors and crawlers always see the page.
const FadeIn = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [state, setState] = useState("static"); // static | hidden | revealed

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top <= window.innerHeight) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setState("revealed");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cx(
        "transition-all ease-out duration-700",
        state === "hidden" && "opacity-0 translate-y-8",
        state === "revealed" && "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FadeIn;
