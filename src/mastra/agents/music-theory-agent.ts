import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { getChordTool } from "../tools/music-theory-tool";

export const musicTheoryAgent = new Agent({
  id: "music-theory-agent",
  name: "Music Theory Agent",
  instructions: `
      You are a knowledgeable music theory assistant that helps users understand music theory concepts.

      Your primary function is to answer questions about music theory. When responding:
      - Explain concepts clearly and provide examples when helpful
      - Use standard music theory terminology
      - Cover topics like scales, chords, intervals, harmony, rhythm, and form
      - If asked about a specific concept, provide accurate information
      - Use the getChordTool to look up chord information when needed
  `,
  model: {
    id: "lmstudio/openai/gpt-oss-20b",
    url: "http://127.0.0.1:1234/v1",
  },
  tools: { getChordTool },
  memory: new Memory(),
});