import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Note, Scale, Chord } from 'tonal';

export const getPianoNotesTool = createTool({
  id: 'get-piano-notes',
  description: 'Get piano note positions for scales, chords, or specific notes. Returns array of note objects with position data for UI rendering.',
  inputSchema: z.object({
    type: z.enum(['scale', 'chord', 'notes']).describe('Type of musical concept to get piano notes for'),
    name: z.string().describe('Name of the scale, chord, or note (e.g., "C major", "G7", "C4")'),
    octave: z.number().optional().describe('Octave number for note positions (default: 4)'),
    includePositions: z.boolean().optional().describe('Include piano key positions (default: true)'),
  }),
  outputSchema: z.object({
    notes: z.array(z.object({
      name: z.string(),
      midi: z.number(),
      position: z.number().nullable(),
      octave: z.number(),
      isBlackKey: z.boolean(),
    })),
    type: z.string(),
    concept: z.string(),
  }),
  execute: async ({ type, name, octave = 4, includePositions = true }) => {
    let notes: string[] = [];
    let conceptName = name;
    
    try {
      switch (type) {
        case 'scale':
          const scale = Scale.get(name);
          if (!scale.empty) {
            notes = scale.notes;
            conceptName = scale.name;
          } else {
            // Try to parse the scale manually
            const parts = name.split(' ');
            const tonic = parts[0];
            const scaleType = parts.slice(1).join(' ');
            
            // For now, just return empty array for unrecognized scales
            notes = [];
          }
          break;
          
        case 'chord':
          const chord = Chord.get(name);
          if (!chord.empty) {
            notes = chord.notes;
            conceptName = chord.name;
          } else {
            // Try to parse the chord manually
            notes = [];
          }
          break;
          
        case 'notes':
          // If it's a single note or comma-separated notes
          const noteArray = name.split(',').map(n => n.trim()).filter(n => n);
          notes = noteArray;
          break;
      }
      
      // Convert notes to piano positions
      const noteObjects = notes.map(note => {
        // Get MIDI number for the note
        const midi = Note.toMidi(note + octave);
        
        // Calculate piano position (simplified - middle C is C4 = MIDI 60)
        let position: number | null = null;
        if (includePositions) {
          const middleCPosition = 36; // Position of middle C on a standard 88-key piano
          position = midi - 60 + middleCPosition;
        }
        
        // Determine if it's a black key
        const isBlackKey = note.includes('#') || note.includes('b');
        
        return {
          name: note,
          midi,
          position,
          octave: octave,
          isBlackKey,
        };
      });
      
      return {
        notes: noteObjects,
        type,
        concept: conceptName,
      };
    } catch (error) {
      return {
        notes: [],
        type,
        concept: conceptName,
      };
    }
  },
});