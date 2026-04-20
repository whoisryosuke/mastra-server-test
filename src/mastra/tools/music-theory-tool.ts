import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Chord, ChordType } from 'tonal';

export const getChordTool = createTool({
  id: 'get-chord',
  description: 'Get chord information by chord symbol (e.g., "Cmaj7", "Dm7", "G7")',
  inputSchema: z.object({
    chordSymbol: z.string().describe('Chord symbol to look up (e.g., "Cmaj7", "Dm7", "G7")'),
  }),
  outputSchema: z.object({
    chords: z.array(z.object({
      name: z.string(),
      tonic: z.string().nullable(),
      type: z.string().nullable(),
      notes: z.array(z.string()),
      intervals: z.array(z.string()),
      aliases: z.array(z.string()),
    })),
  }),
  execute: async ({ chordSymbol }) => {
    const chord = Chord.get(chordSymbol);
    
    if (chord.empty) {
      const typeNames = ChordType.names();
      const matches = typeNames.filter(t => 
        chordSymbol.toLowerCase().includes(t.toLowerCase()) ||
        t.toLowerCase().includes(chordSymbol.toLowerCase())
      );
      
      if (matches.length > 0) {
        const chordTypes = matches.slice(0, 5).map(type => {
          const ct = ChordType.get(type);
          return {
            name: `${chordSymbol} (${type})`,
            tonic: chordSymbol.replace(/[^A-Ga-g#b]/g, '') || null,
            type: type,
            notes: [],
            intervals: ct.intervals || [],
            aliases: ct.aliases || [],
          };
        });
        return { chords: chordTypes };
      }
      
      return { chords: [] };
    }
    
    return {
      chords: [{
        name: chord.name,
        tonic: chord.tonic,
        type: chord.type,
        notes: chord.notes,
        intervals: chord.intervals,
        aliases: chord.aliases || [],
      }],
    };
  },
});