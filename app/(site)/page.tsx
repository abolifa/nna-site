import ApplyComplaint from "@/components/apply-complaint";
import LatestPosts from "@/components/latest-posts";
import MainSlider from "@/components/main-slider";
import SystemStats from "@/components/system-stats";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="space-y-5">
      <MainSlider />
      <Separator />
      <LatestPosts />
      <Separator />
      <SystemStats />
      <Separator />
      <ApplyComplaint />
    </div>
  );
}
