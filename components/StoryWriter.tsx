"use client";

import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Frame } from "@gptscript-ai/gptscript";
import renderEventMessage from "@/lib/renderEventMessage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const storiesPath = "public/stories";

function StoryWriter() {
  const [story, setStory] = useState<string>("");
  const [pages, setPages] = useState<number>();
  const [progress, setProgress] = useState("");
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);
  const [currentTool, setCurrentTool] = useState("");
  const [events, setEvents] = useState<Frame[]>([]);
  const router = useRouter();

  async function runScript() {
    setRunStarted(true);
    setRunFinished(false);

    const response = await fetch("/api/run-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story, pages, path: storiesPath }),
    });

    if (response.ok && response.body) {
      // Handle streams from the API
      console.log("Streaming has started");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      handleStream(reader, decoder);
    } else {
      setRunFinished(true);
      setRunStarted(false);
      console.error("Failed to start streaming");
    }
  }

  async function handleStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder
  ) {
    // Manage the stream from the API...
    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // breaks out of the loop!

      // Decode the Uint8Array into a string.
      const chunk = decoder.decode(value, { stream: true });

      // Split the chunk into events by splitting it by the event: keyword.
      const eventData = chunk
        .split("\n\n")
        .filter((line) => line.startsWith("event:"))
        .map((line) => line.replace(/^event: /, ""));

      // Parse the JSON data and update the state accordingly.
      eventData.forEach((data) => {
        try {
          const parsedData = JSON.parse(data);
          console.log(parsedData);

          if (parsedData.type === "callProgress") {
            setProgress(
              parsedData.output[parsedData.output.length - 1].content
            );
            setCurrentTool(parsedData.tool?.description || "");
          } else if (parsedData.type === "callStart") {
            setCurrentTool(parsedData.tool?.description || "");
          } else if (parsedData.type === "runFinish") {
            setRunFinished(true);
            setRunStarted(false);
          } else {
            setEvents((prevEvents) => [...prevEvents, parsedData]);
          }
        } catch (error) {
          console.error("Failed to parse JSON", error);
        }
      });
    }
  }

  useEffect(() => {
    if (runFinished) {
      toast.success("Story generated successfully!", {
        action: (
          <Button
            onClick={() => router.push("/stories")}
            className="bg-purple-500 ml-auto"
          >
            View Stories
          </Button>
        ),
      });
    }
  }, [runFinished, router]);

  return (
    <div className="flex flex-col container">
      <section className="flex-1 flex flex-col border border-purple-300 rounded-md p-10 space-y-2">
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="flex-1 text-black"
          placeholder="Write a story about a boy that looks after his father's sheep..."
        />
        <Select onValueChange={(value) => setPages(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select the number of pages you want" />
          </SelectTrigger>

          <SelectContent className="w-full">
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          disabled={!story || !pages || runStarted}
          className="w-full"
          size="lg"
          onClick={runScript}
        >
          Generate Story
        </Button>
      </section>

      <section className="flex-1 pb-5 mt-5">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-scroll">
          <div>
            {runFinished === null && (
              <>
                <p className="animate-pulse mr-5">
                  Waiting for you to generate your story above...
                </p>
                <br />
              </>
            )}
            <span className="mr-5">{">>"}</span>
            {progress}
          </div>

          {/* Current Tool */}
          {currentTool && (
            <div className="py-10">
              <span className="mr-5">{"-- [Current Tool] ---"}</span>
              {currentTool}
            </div>
          )}

          {/* Render Events */}
          <div className="space-y-5">
            {events.map((event, index) => (
              <div key={index}>
                <span className="mr-5">{">>"}</span>
                {renderEventMessage(event)}
              </div>
            ))}
          </div>

          {runStarted && (
            <div>
              <span className="mr-5 animate-in">
                {"-- [KidzStory Teller AI Has Started] ---"}
              </span>
              <br />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StoryWriter;
