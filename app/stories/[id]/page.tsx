import Story from "@/components/Story";
import { getAllStories, getStory } from "@/lib/stories";
import { notFound } from "next/navigation";

interface StoryPageProps {
  params: {
    id: string;
  };
}

function StoryPage({ params: { id } }: StoryPageProps) {
  //Explanation: The id is URL encoded, so we need to decode it before usng it to get the story. This fixes the issue where the story is not found when the id contains special characters such as %20 for spaces.

  const decodedId = decodeURIComponent(id);

  const story = getStory(decodedId);

  if (!story) {
    return notFound();
  }

  return <Story story={story} />;
}

export default StoryPage;

export async function generateStaticParams() {
  const stories = getAllStories();

  //Return an array of objects with the id property set to the story id.
  //This will generate a static page for each story.

  //Example: [{id: "story-1"}, {id: "story-2"}, ...]

  const paths = stories.map((story) => ({
    params: { id: story.story },
  }));

  return paths;
}
