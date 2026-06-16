"use client";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@/src/utils";

// Tunables from the design prototype (app.jsx TWEAK_DEFAULTS).
const CARD_H_VH = 34; // card height, in vh
const GAP = 28; // px between cards
const SCROLL_ZOOM = 0.16; // how far the whole reel shrinks at peak scroll velocity
const FOCUS = 1.0; // center-focus card scale (1 = disabled)

// FLOW — a horizontal scroll rail. Vertical wheel scrolls sideways, pointer
// drag pans, and the whole reel scales down while scrolling then springs back
// to full size at rest (velocity-driven). Cards keep a fixed height; their
// width follows each photo's aspect ratio. Click a card to open the lightbox.
const FlowView = ({ photos, onOpen }) => {
  const railRef = useRef(null);
  const cardRefs = useRef([]);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const zoom = useRef({ idle: null, lastSL: null, lastT: 0 });
  const [grabbing, setGrabbing] = useState(false);

  // Center-focus: nearest-to-center card scales up to FOCUS, others ease down.
  // No-op while FOCUS === 1 (the default).
  const applyFocus = useCallback(() => {
    const rail = railRef.current;
    if (!rail || FOCUS <= 1) return;
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    cardRefs.current.forEach((el) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      const norm = Math.min(1, dist / (rail.clientWidth * 0.42));
      const eased = 1 - norm * norm;
      el.style.transform = `scale(${(1 + (FOCUS - 1) * eased).toFixed(4)})`;
      el.style.zIndex = String(1000 - Math.round(dist));
    });
  }, []);

  // Scroll-velocity zoom: set the rail scale per scroll event; the CSS
  // transition provides the spring, and an idle timer releases back to 1.
  useLayoutEffect(() => {
    applyFocus();
    const rail = railRef.current;
    if (!rail) return;
    const z = zoom.current;
    const onScroll = () => {
      applyFocus();
      const now = performance.now();
      const sl = rail.scrollLeft;
      const dt = Math.max(16, now - (z.lastT || now));
      const v = Math.min(1, Math.abs(sl - (z.lastSL == null ? sl : z.lastSL)) / dt / 4.2);
      z.lastSL = sl;
      z.lastT = now;
      rail.style.transform = `scale(${(1 - v * SCROLL_ZOOM).toFixed(3)})`;
      clearTimeout(z.idle);
      z.idle = setTimeout(() => {
        rail.style.transform = "scale(1)";
      }, 150);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      clearTimeout(z.idle);
      rail.style.transform = "";
    };
  }, [applyFocus, photos]);

  // Vertical wheel -> horizontal scroll.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onWheel = (e) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      rail.scrollLeft += d;
      e.preventDefault();
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e) => {
    const rail = railRef.current;
    drag.current = { active: true, startX: e.clientX, startScroll: rail.scrollLeft, moved: 0 };
    rail.setPointerCapture(e.pointerId);
    setGrabbing(true);
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    railRef.current.scrollLeft = drag.current.startScroll - dx;
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setGrabbing(false);
  };

  const openIfTap = (index) => {
    if (drag.current.moved < 6) onOpen(index);
  };

  return (
    <div
      ref={railRef}
      className={cx(
        "absolute inset-0 flex items-center justify-start overflow-x-scroll overflow-y-hidden select-none",
        "[&::-webkit-scrollbar]:hidden",
        grabbing ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        scrollbarWidth: "none",
        transformOrigin: "50% 50%",
        willChange: "transform",
        transition: "transform .32s cubic-bezier(.22,.61,.36,1)",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="flex items-center flex-none"
        style={{ gap: GAP + "px", padding: "0 max(24px, 3vw)" }}
      >
        {photos.map((photo, index) => {
          const ratio = photo.width && photo.height ? photo.width / photo.height : 0.8;
          const height = `min(${CARD_H_VH}vh, 86vw / ${ratio})`;
          const title = photo.title || photo.model;
          const place = [photo.city, photo.country].filter(Boolean).join(", ");
          return (
            <figure
              key={photo.id}
              ref={(el) => (cardRefs.current[index] = el)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${title || "photo"} fullscreen`}
              className="group relative flex-none overflow-hidden rounded-md shadow-2xl bg-dark/10 dark:bg-light/10
              will-change-transform cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accentDark"
              style={{ height, width: `calc(${height} * ${ratio})` }}
              onClick={() => openIfTap(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(index);
                }
              }}
            >
              <Image
                src={photo.src}
                alt={title || "Photograph"}
                fill
                sizes="60vh"
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                draggable={false}
                className="object-cover"
              />
              {title || place ? (
                <figcaption
                  className="absolute left-0 right-0 bottom-0 flex flex-col gap-px px-3.5 pt-9 pb-3 text-light
                  bg-gradient-to-t from-black/60 to-transparent
                  opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
                >
                  {title ? <span className="text-[13px] font-semibold tracking-tight">{title}</span> : null}
                  {place ? <span className="text-xs text-light/80">{place}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </div>
  );
};

export default FlowView;
