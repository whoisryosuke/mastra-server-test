import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const dataSchema = z.object({
  notes: z
    .array(
      z.object({
        pitch: z.string().describe("Note pitch (e.g., C4, E#5)"),
        duration: z.number().describe("Note duration in beats"),
        time: z
          .number()
          .describe("Start time in beats from composition beginning"),
        velocity: z
          .number()
          .min(0)
          .max(127)
          .optional()
          .describe("Note velocity (loudness) 0-127, optional"),
      }),
    )
    .describe("Array of MIDI-compatible note objects with optional velocity"),
});

export const musicGenerationTool = createTool({
  id: "music-generation",
  description:
    "Display MIDI-compatible notes to user based on input. Returns a structured musical representation.",
  inputSchema: dataSchema,
  outputSchema: dataSchema,
  execute: async ({ notes }) => {
    return {
      notes,
      // metadata: {
      //   createdAt: new Date().toISOString(),
      //   version: "1.0.0",
      // },
    };
  },
});
