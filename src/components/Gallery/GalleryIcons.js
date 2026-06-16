// Small stroke-based icons (currentColor) used by the gallery UI.
import { cx } from "@/src/utils";

const base = (className) =>
  cx("inline-block", className);

// Horizontal rail / film-strip glyph — represents the Flow scroll-reel.
export const FlowIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <rect x="3" y="6" width="18" height="12" rx="1.5" />
    <line x1="9" y1="6" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="18" />
  </svg>
);

export const GridIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const InstagramIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
  </svg>
);

export const CloseIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ArrowLeftIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ArrowRightIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronDownIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const CheckIcon = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={base(className)} {...rest}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
