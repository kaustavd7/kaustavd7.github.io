import {blogs} from "@/.velite/generated";
import photoData from "@/src/data/photos.generated.json";
import HomeCoverSection from "../components/Home/HomeCoverSection";
import FeaturedPosts from "../components/Home/FeaturedPosts";
import HomeGallery from "../components/Home/HomeGallery";
import RecentPosts from "../components/Home/RecentPosts";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <HomeCoverSection blogs={blogs} />
      <FeaturedPosts blogs={blogs} />
      <HomeGallery photos={photoData.photos} />
      <RecentPosts blogs={blogs} />
    </main>
  )
}
