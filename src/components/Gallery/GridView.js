import Image from "next/image";

// Column masonry: photos keep their native aspect ratio and pack into columns.
// Clicking a photo opens it at its filtered index.
const GridView = ({ photos, onOpen }) => {
  return (
    <div className="columns-1 xs:columns-2 lg:columns-3 gap-3 sm:gap-4">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onOpen(index)}
          className="group relative block w-full mb-3 sm:mb-4 break-inside-avoid overflow-hidden rounded-sm bg-dark/5 dark:bg-light/5
          cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accentDark"
          aria-label={`Open ${photo.title || photo.model || "photo"} fullscreen`}
        >
          <Image
            src={photo.src}
            alt={photo.title || photo.model || "Photograph"}
            width={photo.width}
            height={photo.height}
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="w-full h-auto object-cover transition-transform ease duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </button>
      ))}
    </div>
  );
};

export default GridView;
