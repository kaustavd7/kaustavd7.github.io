import Image from "next/image";
import Link from "next/link";

const HomeGallery = ({ photos }) => {
  const recent = (photos || []).slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <section className="w-full mt-16 sm:mt-24 md:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32 flex flex-col items-center justify-center">
      <div className="w-full flex justify-between">
        <h2 className="w-fit inline-block font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light">
          Gallery
        </h2>
        <Link
          href="/gallery"
          className="inline-block font-medium text-accent dark:text-accentDark underline underline-offset-2 text-base md:text-lg"
        >
          view all
        </Link>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-16">
        {recent.map((photo) => {
          const place = [photo.city, photo.country].filter(Boolean).join(", ");
          return (
            <Link
              key={photo.id}
              href="/gallery"
              className="group relative block w-full aspect-[3/4] overflow-hidden rounded-xl bg-dark/5 dark:bg-light/5"
            >
              <Image
                src={photo.src}
                alt={photo.title || photo.model || "Photograph"}
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform ease duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute top-0 left-0 bottom-0 right-0 h-full bg-gradient-to-b from-transparent from-50% to-dark/90 z-10" />
              <div className="absolute bottom-0 w-full p-3 sm:p-4 z-20">
                {photo.title || photo.model ? (
                  <h3 className="font-semibold capitalize text-sm sm:text-base text-light">
                    {photo.title || photo.model}
                  </h3>
                ) : null}
                {place ? (
                  <span className="text-xs sm:text-sm text-light/70">{place}</span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default HomeGallery;
