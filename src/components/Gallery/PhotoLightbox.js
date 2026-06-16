"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon } from "./GalleryIcons";

const Meta = ({ label, value }) => {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-wider text-light/40">{label}</dt>
      <dd className="text-sm text-light/90">{value}</dd>
    </div>
  );
};

// Fullscreen viewer with prev/next, keyboard control, focus trap, and a full
// EXIF metadata panel. `index` is the position within the (filtered) photos
// array the parent passes; the parent owns wrap-around via onPrev/onNext.
const PhotoLightbox = ({ photos, index, onClose, onPrev, onNext }) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const photo = photos[index];

  // Mount-only: lock scroll, focus the close button, restore focus on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  // Keyboard: Esc/arrows + Tab focus trap. Re-bound when callbacks change.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        onPrev();
      } else if (event.key === "ArrowRight") {
        onNext();
      } else if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll("button, a[href]");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!dialogRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  let dateString = null;
  if (photo.dateTaken) {
    try {
      dateString = format(parseISO(photo.dateTaken), "d MMM yyyy");
    } catch {
      dateString = null;
    }
  }
  const place = [photo.city, photo.country].filter(Boolean).join(", ") || null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.title || photo.model || "Photograph"}
      className="fixed inset-0 z-[200] bg-dark/95 flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 text-light/80"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="text-sm font-mr tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close fullscreen viewer"
          className="w-10 h-10 flex items-center justify-center rounded-full text-light hover:bg-light/10 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-light"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-2 sm:px-16 min-h-0" onClick={onClose}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
          className="absolute left-1 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full
          text-light hover:bg-light/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-light"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        <div className="relative max-h-full flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
          <Image
            src={photo.src}
            alt={photo.title || photo.model || "Photograph"}
            width={photo.width}
            height={photo.height}
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="w-auto h-auto max-w-[88vw] max-h-[60vh] sm:max-h-[68vh] object-contain"
            sizes="88vw"
            priority
          />
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
          className="absolute right-1 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full
          text-light hover:bg-light/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-light"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div
        className="px-4 sm:px-8 py-4 sm:py-5 bg-dark/80 border-t border-light/10 max-h-[34vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {photo.title ? <h2 className="text-light text-base font-medium mb-3">{photo.title}</h2> : null}
        <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-x-4 gap-y-3">
          <Meta label="Camera" value={photo.model} />
          <Meta label="Lens" value={photo.lens} />
          <Meta label="Focal" value={photo.focalLength ? `${photo.focalLength} mm` : null} />
          <Meta label="Aperture" value={photo.aperture ? `f/${photo.aperture}` : null} />
          <Meta label="Shutter" value={photo.shutter} />
          <Meta label="ISO" value={photo.iso} />
          <Meta label="Date" value={dateString} />
          <Meta label="Location" value={place} />
          <Meta label="Dimensions" value={`${photo.width} × ${photo.height}`} />
        </dl>
      </div>
    </div>
  );
};

export default PhotoLightbox;
