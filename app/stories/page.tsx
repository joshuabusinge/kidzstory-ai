import { getAllStories } from "@/lib/stories";
import { Story } from "@/types/stories";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Stories() {
  const stories: Story[] = getAllStories();

  console.log(stories);
  return <div> Stories</div>;
}

export default Stories;
