# Mastra Music Agents

This is a server for serving LLM agents specialized in music generation and music theory. The server is created using Mastra.

The music generation agent can generate MIDI notes for user, and there's also a music theory agent that can teach about music concepts, and has special tools for visualizing music information.

## Features

### Music Generation

- `musicGenerationTool`: Accepts a musical composition based on MIDI-compatible JSON and generates a MIDI file for user to export.

### Music Theory

- `getChordTool`: Look up chord information by chord symbol
- `getScaleTool`: Look up scale information by scale name
- `getKeyTool`: Get key information including diatonic chords
- `getIntervalTool`: Get interval information by interval name
- `transposeNoteTool`: Transpose a note by an interval
- `noteDistanceTool`: Get interval between two notes
- `midiToNoteTool`: Convert MIDI number to note name
- `chordDetectionTool`: Detect chord from notes
- `scaleDetectionTool`: Detect scale from notes
- `chordTransposeTool`: Transpose a chord by an interval

## Requirements

- LM Studio

I used LM Studio locally with Qwen Coder 30B model (works well with tools).

> If you need to use a cloud model, you'll have to change the config on each agent. You can probably just have an LLM do it if you use the `/mastra` skill in chat.

## Development

1. Install deps: `yarn`
1. Spin up this app: `yarn dev`

Open [http://localhost:4111](http://localhost:4111) in your browser to access [Mastra Studio](https://mastra.ai/docs/studio/overview). It provides an interactive UI for building and testing your agents, along with a REST API that exposes your Mastra application as a local service. This lets you start building without worrying about integration right away.

You can start editing files inside the `src/mastra` directory. The development server will automatically reload whenever you make changes.

### [Frontend Chat App](https://github.com/whoisryosuke/mastra-react-test)

You can use the Studio dashboard to chat directly, but there's a frontend app you can also use to chat. It comes with a few custom components for visualizing music data.

[Clone the app](https://github.com/whoisryosuke/mastra-react-test) and follow the instructions in the README to get it running.

### LLM Development

There's a couple of skills you can use to simplify development. I used OpenCode with a local LLM to access these, but they should work with most clients like Claude or Cursor.

- `mastra` - Has basic info and examples on how to setup and use Mastra
- `tonal` - A JavaScript library with utilities for music theory. Generated from their docs.
