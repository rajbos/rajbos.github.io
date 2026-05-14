// YouTube Transcript — Copilot CLI Extension entry point.
// Core logic lives in .github/skills/youtube-transcript/fetch-transcript.mjs.
import { joinSession } from "@github/copilot-sdk/extension";
import { getTranscript, formatTranscript } from "../../skills/youtube-transcript/fetch-transcript.mjs";

// Prevent unhandled rejections from silently crashing the extension process
process.on("unhandledRejection", () => {});

const session = await joinSession({
    tools: [
        {
            name: "get_youtube_transcript",
            description:
                "Fetches the transcript (captions) from a YouTube video and returns it as text to use as context. " +
                "Accepts YouTube URLs (youtube.com/watch?v=..., youtu.be/..., YouTube Shorts) or a raw 11-character video ID.",
            parameters: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "YouTube video URL or 11-character video ID",
                    },
                },
                required: ["url"],
            },
            handler: async (args) => {
                await session.log(`Fetching YouTube transcript for: ${args.url}`, { ephemeral: true });
                try {
                    const result = await getTranscript(args.url);
                    const wordCount = result.transcript.split(/\s+/).filter(Boolean).length;
                    await session.log(
                        `✓ Transcript fetched: "${result.title}" — ${wordCount} words (lang: ${result.language})`
                    );
                    return formatTranscript(result);
                } catch (err) {
                    await session.log(`✗ Failed to fetch transcript: ${err.message}`, { level: "error" });
                    return { textResultForLlm: `Error: ${err.message}`, resultType: "failure" };
                }
            },
        },
    ],
});
