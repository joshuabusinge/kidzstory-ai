import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";
import fs from "fs";
import path from "path";

const script = "app/api/run-script/story-book.gpt";

export async function POST(request: NextRequest) {
  const { story, pages, path: storyPath } = await request.json();

  // Ensure the directory path is correctly resolved
  const dirPath = path.resolve(process.cwd(), storyPath);

  // Check if the directory exists, if not create it
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    console.log(`Directory created or exists: ${dirPath}`);
  } catch (error) {
    console.error("Failed to create directory for the story:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create directory for the story" }),
      {
        status: 500,
      }
    );
  }

  // Example CLI Command: gptscript ./story-book.gpt --story "A robot and a human become friends" --pages 5 --path ./stories
  const opts: RunOpts = {
    disableCache: true,
    input: `--story "${story}" --pages ${pages} --path "${dirPath}"`,
  };

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const run = await g.run(script, opts);

          run.on(RunEventType.Event, (data) => {
            controller.enqueue(
              encoder.encode(`event: ${JSON.stringify(data)}\n\n`)
            );
          });
        } catch (error) {
          controller.error(error);
          console.error("Error", error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error running script:", error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    });
  }
}
