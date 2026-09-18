---
name: youtube-transcript
description: Fetches the transcript (captions) from a YouTube video to use as context. Use this when the user provides a YouTube URL or video ID and wants to reference, summarise, or ask questions about the video's content.
argument-hint: <YouTube URL or video ID>
---

# YouTube Transcript

When the user provides a YouTube video URL or ID and wants to work with the video's content, fetch the transcript using the included script and use the output as context.

## When to use this skill

- The user pastes a YouTube link and asks questions about it
- The user wants to summarise, translate, or extract information from a YouTube video
- The user references a YouTube video as background context for a task

## Steps

1. Extract the video URL or ID from the user's message.
2. Run the fetch script to download the transcript:

   ```bash
   node .github/skills/youtube-transcript/fetch-transcript.mjs "<YouTube URL or video ID>"
   ```

3. The script prints the transcript to stdout in this format:
   ```
   # YouTube Transcript
   **Title:** ...
   **Channel:** ...
   **Duration:** ...
   **Language:** ...

   ## Transcript
   <full transcript text>
   ```

4. Read the output and use the full transcript as context to answer the user's request.

## Notes

- The script requires Node.js 18+ (uses built-in `fetch`).
- It works with `youtube.com/watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, or a raw 11-character video ID.
- If captions are unavailable (disabled by the uploader), the script exits with an error message — let the user know.
- Prefer English captions when available; the script falls back to the first available language.

## Script reference

See [fetch-transcript.mjs](./fetch-transcript.mjs) for the full implementation.
