// YouTube Transcript Extension
// Fetches captions/transcripts from YouTube videos to use as context.
// Uses only built-in Node.js APIs — no npm dependencies required.
import { joinSession } from "@github/copilot-sdk/extension";

// Prevent unhandled rejections from silently crashing the extension process
process.on("unhandledRejection", () => {});

function extractVideoId(input) {
    const patterns = [
        /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
        const m = input.trim().match(pattern);
        if (m) return m[1];
    }
    return null;
}

// Robustly extract a top-level JSON object assigned to a JS variable in a page.
function extractJsonObject(html, varName) {
    const marker = `var ${varName} = `;
    const start = html.indexOf(marker);
    if (start === -1) return null;

    const jsonStart = html.indexOf("{", start + marker.length);
    if (jsonStart === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = jsonStart; i < html.length; i++) {
        const c = html[i];
        if (escape) { escape = false; continue; }
        if (c === "\\" && inString) { escape = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (c === "{") depth++;
        else if (c === "}") {
            depth--;
            if (depth === 0) return html.substring(jsonStart, i + 1);
        }
    }
    return null;
}

function decodeCaptionXml(xml) {
    const texts = [];
    const re = /<text\b[^>]*>([^<]*)<\/text>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
        const t = m[1]
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n/g, " ")
            .trim();
        if (t) texts.push(t);
    }
    return texts.join(" ");
}

async function getTranscript(videoUrl) {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error(`Cannot extract video ID from: ${videoUrl}`);

    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+299",
        },
    });

    if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status} fetching video page`);

    const html = await pageRes.text();
    const jsonStr = extractJsonObject(html, "ytInitialPlayerResponse");
    if (!jsonStr) throw new Error("Could not find ytInitialPlayerResponse in page — YouTube may have changed its structure");

    const playerData = JSON.parse(jsonStr);
    const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks?.length) throw new Error("No captions available for this video (captions may be disabled or unavailable)");

    // Prefer English manual captions, then English auto-generated, then first available
    const track =
        tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
        tracks.find((t) => t.languageCode === "en") ||
        tracks[0];

    const captionRes = await fetch(track.baseUrl + "&fmt=xml");
    if (!captionRes.ok) throw new Error(`HTTP ${captionRes.status} fetching captions`);

    const xml = await captionRes.text();
    const transcript = decodeCaptionXml(xml);

    const title = playerData?.videoDetails?.title ?? "Unknown";
    const author = playerData?.videoDetails?.author ?? "Unknown";
    const lengthSeconds = playerData?.videoDetails?.lengthSeconds;
    const duration = lengthSeconds
        ? `${Math.floor(lengthSeconds / 60)}m ${lengthSeconds % 60}s`
        : "Unknown";

    return { videoId, title, author, duration, language: track.languageCode, transcript };
}

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
                    const { videoId, title, author, duration, language, transcript } =
                        await getTranscript(args.url);
                    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
                    await session.log(
                        `✓ Transcript fetched: "${title}" — ${wordCount} words (lang: ${language})`
                    );
                    return [
                        "# YouTube Transcript",
                        `**Video ID:** ${videoId}`,
                        `**Title:** ${title}`,
                        `**Channel:** ${author}`,
                        `**Duration:** ${duration}`,
                        `**Language:** ${language}`,
                        "",
                        "## Transcript",
                        transcript,
                    ].join("\n");
                } catch (err) {
                    await session.log(`✗ Failed to fetch transcript: ${err.message}`, { level: "error" });
                    return { textResultForLlm: `Error: ${err.message}`, resultType: "failure" };
                }
            },
        },
    ],
});
