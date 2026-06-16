import photoData from "@/src/data/photos.generated.json";
import GalleryExperience from "@/src/components/Gallery/GalleryExperience";
import siteMetadata from "@/src/utils/siteMetaData";

export const metadata = {
  title: "Gallery",
  description:
    "A photo journal — browse by Flow or Grid and filter by camera, lens, year and country.",
};

export default function GalleryPage() {
  return (
    <GalleryExperience
      photos={photoData.photos}
      instagram={siteMetadata.instagram}
    />
  );
}
