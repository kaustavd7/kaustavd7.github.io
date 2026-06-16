"use client";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/src/utils";
import { FACETS, facetOptions, countActive } from "./photoFilters";
import { ChevronDownIcon, CheckIcon } from "./GalleryIcons";

// Floating bottom filter bar: one button per facet (Model/Lens/Year/Country).
// Each opens an upward popover of values with counts; values multi-select.
const FilterBar = ({ photos, filters, onToggle, onClear, dismissed = false }) => {
  const [openKey, setOpenKey] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!openKey) return;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenKey(null);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openKey]);

  const activeCount = countActive(filters);

  return (
    <div
      ref={containerRef}
      className={cx(
        "fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[120] max-w-[calc(100vw-1rem)]",
        "flex items-center gap-0.5 sm:gap-1 p-1 rounded-full",
        "bg-light/90 dark:bg-dark/90 backdrop-blur-md border border-dark/10 dark:border-light/15 shadow-lg",
        "transition-all duration-300",
        dismissed && "translate-y-[160%] opacity-0 pointer-events-none"
      )}
    >
      {FACETS.map(({ key, label }, index) => {
        const options = facetOptions(photos, filters, key);
        const selected = filters[key] || [];
        const isOpen = openKey === key;
        // Anchor edge popovers to the bar edge so they never clip off-screen on phones.
        const popoverAlign =
          index === 0
            ? "left-0"
            : index === FACETS.length - 1
            ? "right-0"
            : "left-1/2 -translate-x-1/2";
        return (
          <div key={key} className="relative">
            {isOpen ? (
              <div
                role="menu"
                className={cx(
                  "absolute bottom-full mb-2 w-48 sm:w-52 max-w-[calc(100vw-1.5rem)] max-h-72 overflow-y-auto",
                  "rounded-xl bg-light dark:bg-dark border border-dark/10 dark:border-light/15 shadow-xl py-1",
                  popoverAlign
                )}
              >
                {options.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray dark:text-light/50">No options</p>
                ) : (
                  options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={isSelected}
                        onClick={() => onToggle(key, option.value)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm
                        text-dark dark:text-light hover:bg-dark/5 dark:hover:bg-light/10 transition-colors"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={cx(
                              "shrink-0 w-4 h-4 rounded border flex items-center justify-center",
                              isSelected
                                ? "bg-accent border-accent dark:bg-accentDark dark:border-accentDark"
                                : "border-dark/30 dark:border-light/30"
                            )}
                          >
                            {isSelected ? <CheckIcon className="w-3 h-3 text-light dark:text-dark" /> : null}
                          </span>
                          <span className="truncate">{option.value}</span>
                        </span>
                        <span className="shrink-0 text-xs text-gray dark:text-light/50 tabular-nums">
                          {option.count}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : key)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              className={cx(
                "flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap",
                selected.length > 0
                  ? "bg-dark text-light dark:bg-light dark:text-dark"
                  : "text-dark dark:text-light hover:bg-dark/5 dark:hover:bg-light/10"
              )}
            >
              <span>{label}</span>
              {selected.length > 0 ? (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px]
                bg-light/30 dark:bg-dark/30 tabular-nums">
                  {selected.length}
                </span>
              ) : null}
              <ChevronDownIcon className={cx("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
            </button>
          </div>
        );
      })}

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="ml-0.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm text-gray dark:text-light/60
          hover:text-dark dark:hover:text-light transition-colors whitespace-nowrap"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
};

export default FilterBar;
