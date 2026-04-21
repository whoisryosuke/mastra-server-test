import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import {
  getChordTool,
  getScaleTool,
  getKeyTool,
  getIntervalTool,
  transposeNoteTool,
  noteDistanceTool,
  midiToNoteTool,
  chordDetectionTool,
  scaleDetectionTool,
  chordTransposeTool,
} from "../tools/music-theory-tool";

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

      Available tools:
      - getChordTool: Look up chord information by chord symbol
      - getScaleTool: Look up scale information by scale name
      - getKeyTool: Get key information including diatonic chords
      - getIntervalTool: Get interval information by interval name
      - transposeNoteTool: Transpose a note by an interval
      - noteDistanceTool: Get interval between two notes
      - midiToNoteTool: Convert MIDI number to note name
      - chordDetectionTool: Detect chord from notes
      - scaleDetectionTool: Detect scale from notes
      - chordTransposeTool: Transpose a chord by an interval
  `,
  model: {
    id: "lmstudio/openai/gpt-oss-20b",
    url: "http://127.0.0.1:1234/v1",
  },
  tools: {
    getChordTool,
    getScaleTool,
    getKeyTool,
    getIntervalTool,
    transposeNoteTool,
    noteDistanceTool,
    midiToNoteTool,
    chordDetectionTool,
    scaleDetectionTool,
    chordTransposeTool,
  },
  memory: new Memory(),
});