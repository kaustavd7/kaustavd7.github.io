"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cx } from "@/src/utils";
import { applyFilters, emptyFilters } from "./photoFilters";
import FlowView from "./FlowView";
import GridView from "./GridView";
import FilterBar from "./FilterBar";
import PhotoLightbox from "./PhotoLightbox";
import FadeIn from "./FadeIn";
import { FlowIcon, GridIcon, InstagramIcon } from "./GalleryIcons";

const VIEWS = [
  { key: "flow", label: "Flow", Icon: FlowIcon },
  { key: "grid", label: "Grid", Icon: GridIcon },
];

const GalleryExperience = ({ photos, instagram }) => {
  const [view, setView] = useState("flow");
  const [filters, setFilters] = useState(emptyFilters);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  // Hide the floating controls when the page footer scrolls into view so they
  // never cover the footer's links.
  const [footerVisible, setFooterVisible] = useState(false);

  const filtered = useMemo(() => applyFilters(photos, filters), [photos, filters]);
  const lightboxOpen = lightboxIndex !== null && Boolean(filtered[lightboxIndex]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setFooterVisible(entries[0].isIntersecting),
      { rootMargin: "0px 0px -24px 0px" }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
    setLightboxIndex(null);
  }, []);

  const clearFilters = useCallback(() => setFilters(emptyFilters()), []);

  const openAt = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i == null ? i : (i + filtered.length - 1) % filtered.length
      ),
    [filtered.length]
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i == null ? i : (i + 1) % filtered.length)),
    [filtered.length]
  );

  return (
    <div className="w-full flex flex-col">
      {/* Everything except the lightbox is made inert while the modal is open,
          so the obscured gallery is unreachable by keyboard and screen readers. */}
      <div inert={lightboxOpen || undefined} aria-hidden={lightboxOpen || undefined}>
        <div className="sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-8 pt-2 sm:pt-3 pb-2 bg-light/85 dark:bg-dark/85 backdrop-blur-sm">
          <div>
            <p className="text-xs sm:text-sm text-gray dark:text-light/50">
              {filtered.length === photos.length
                ? `${photos.length} photographs`
                : `${filtered.length} of ${photos.length} photographs`}
            </p>
          </div>

          <div className="flex items-center gap-0.5 p-1 rounded-full border border-dark/10 dark:border-light/15">
            {VIEWS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-pressed={view === key}
                className={cx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors",
                  view === key
                    ? "bg-dark text-light dark:bg-light dark:text-dark"
                    : "text-gray dark:text-light/60 hover:text-dark dark:hover:text-light"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex-1 px-2 sm:px-4 lg:px-6 pb-28">
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center text-gray dark:text-light/60">
              <p className="text-lg">No photos match these filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-accent dark:text-accentDark underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : view === "flow" ? (
          // Full-bleed band so the rail's `calc(50vw …)` centering is accurate.
          <div className="relative w-full h-[68vh] sm:h-[72vh] mt-10 sm:mt-20 mb-32 sm:mb-56">
            <FlowView photos={filtered} onOpen={openAt} />
          </div>
        ) : (
          <div className="flex-1 px-2 sm:px-4 lg:px-6 pb-28">
            <FadeIn key="grid">
              <GridView photos={filtered} onOpen={openAt} />
            </FadeIn>
          </div>
        )}

        <FilterBar
          photos={photos}
          filters={filters}
          onToggle={toggleFilter}
          onClear={clearFilters}
          dismissed={footerVisible}
        />

        {instagram ? (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={cx(
              "fixed right-4 bottom-4 sm:bottom-6 z-[120] w-9 h-9 flex items-center justify-center rounded-full",
              "bg-light/90 dark:bg-dark/90 backdrop-blur-md border border-dark/10 dark:border-light/15 text-dark dark:text-light",
              "transition-all duration-300",
              footerVisible
                ? "translate-y-[160%] opacity-0 pointer-events-none"
                : "hover:scale-110"
            )}
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        ) : null}
      </div>

      {lightboxOpen ? (
        <PhotoLightbox
          photos={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      ) : null}
    </div>
  );
};

export default GalleryExperience;
