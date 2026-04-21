import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Chord, ChordType, Scale, ScaleType, Note, Interval, Key, Midi, Scale as ScaleApi, Chord as ChordApi } from 'tonal';

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

export const getScaleTool = createTool({
  id: 'get-scale',
  description: 'Get scale information by scale name (e.g., "C major", "D dorian", "Bb pentatonic")',
  inputSchema: z.object({
    scaleName: z.string().describe('Scale name to look up (e.g., "C major", "D dorian", "Bb pentatonic")'),
  }),
  outputSchema: z.object({
    scales: z.array(z.object({
      name: z.string(),
      tonic: z.string().nullable(),
      type: z.string().nullable(),
      notes: z.array(z.string()),
      intervals: z.array(z.string()),
      aliases: z.array(z.string()),
    })),
  }),
  execute: async ({ scaleName }) => {
    const scale = Scale.get(scaleName);
    
    if (scale.empty) {
      const typeNames = ScaleType.names();
      const matches = typeNames.filter(t => 
        scaleName.toLowerCase().includes(t.toLowerCase()) ||
        t.toLowerCase().includes(scaleName.toLowerCase())
      );
      
      if (matches.length > 0) {
        const scaleTypes = matches.slice(0, 5).map(type => {
          const st = ScaleType.get(type);
          return {
            name: `${scaleName} (${type})`,
            tonic: scaleName.replace(/[^A-Ga-g#b]/g, '') || null,
            type: type,
            notes: [],
            intervals: st.intervals || [],
            aliases: st.aliases || [],
          };
        });
        return { scales: scaleTypes };
      }
      
      return { scales: [] };
    }
    
    return {
      scales: [{
        name: scale.name,
        tonic: scale.tonic,
        type: scale.type,
        notes: scale.notes,
        intervals: scale.intervals,
        aliases: scale.aliases || [],
      }],
    };
  },
});

export const getKeyTool = createTool({
  id: 'get-key',
  description: 'Get key information including diatonic chords, scale, and harmonic function (e.g., "C major", "A minor")',
  inputSchema: z.object({
    keyName: z.string().describe('Key name with type (e.g., "C major", "A minor")'),
  }),
  outputSchema: z.object({
    tonic: z.string(),
    type: z.string(),
    scale: z.array(z.string()),
    chords: z.array(z.string()),
    grades: z.array(z.string()),
    chordsHarmonicFunction: z.array(z.string()),
  }),
  execute: async ({ keyName }) => {
    const isMinor = keyName.toLowerCase().includes('minor');
    let key;
    
    if (isMinor) {
      const tonic = keyName.replace(/[\sminor]/gi, '').trim();
      key = Key.minorKey(tonic);
    } else {
      const tonic = keyName.replace(/[\smajor]/gi, '').trim();
      key = Key.majorKey(tonic);
    }
    
    if (!key.tonic) {
      return { tonic: '', type: '', scale: [], chords: [], grades: [], chordsHarmonicFunction: [] };
    }
    
    if (isMinor && 'natural' in key) {
      return {
        tonic: key.tonic,
        type: key.type,
        scale: key.natural?.scale || [],
        chords: key.natural?.chords || [],
        grades: key.natural?.grades || [],
        chordsHarmonicFunction: key.natural?.chordsHarmonicFunction || [],
      };
    }
    
    return {
      tonic: key.tonic,
      type: key.type,
      scale: (key as any).scale || [],
      chords: (key as any).chords || [],
      grades: (key as any).grades || [],
      chordsHarmonicFunction: (key as any).chordsHarmonicFunction || [],
    };
  },
});

export const getIntervalTool = createTool({
  id: 'get-interval',
  description: 'Get interval information by interval name (e.g., "3M", "5P", "7m")',
  inputSchema: z.object({
    intervalName: z.string().describe('Interval name (e.g., "3M", "5P", "7m", "2M", "4P")'),
  }),
  outputSchema: z.object({
    name: z.string(),
    num: z.number(),
    q: z.string(),
    semitones: z.number(),
    simple: z.string(),
    type: z.string(),
  }),
  execute: async ({ intervalName }) => {
    const interval = Interval.get(intervalName);
    
    if (!interval.name) {
      const semitones = Interval.semitones(intervalName);
      if (isNaN(semitones)) {
        return { name: '', num: 0, q: '', semitones: NaN, simple: '', type: '' };
      }
      const fromSemitones = Interval.fromSemitones(semitones);
      const simplified = Interval.simplify(intervalName);
      return {
        name: intervalName,
        num: 0,
        q: intervalName.replace(/[0-9]/g, ''),
        semitones,
        simple: simplified || fromSemitones || intervalName,
        type: semitones === 3 || semitones === 4 ? 'major' : semitones % 2 === 1 ? 'minor' : 'perfect',
      };
    }
    
    return {
      name: interval.name,
      num: interval.num,
      q: interval.q,
      semitones: interval.semitones,
      simple: interval.simple || interval.name,
      type: interval.type,
    };
  },
});

export const transposeNoteTool = createTool({
  id: 'transpose-note',
  description: 'Transpose a note by an interval',
  inputSchema: z.object({
    note: z.string().describe('Note to transpose (e.g., "C4", "F#3", "Ab5")'),
    interval: z.string().describe('Interval to transpose by (e.g., "3M", "5P", "-2M")'),
  }),
  outputSchema: z.object({
    original: z.string(),
    transposed: z.string(),
    interval: z.string(),
  }),
  execute: async ({ note, interval }) => {
    const result = Note.transpose(note, interval);
    return {
      original: note,
      transposed: result,
      interval,
    };
  },
});

export const noteDistanceTool = createTool({
  id: 'note-distance',
  description: 'Get the interval between two notes',
  inputSchema: z.object({
    note1: z.string().describe('First note (e.g., "C4")'),
    note2: z.string().describe('Second note (e.g., "G4")'),
  }),
  outputSchema: z.object({
    note1: z.string(),
    note2: z.string(),
    interval: z.string(),
    semitones: z.number(),
  }),
  execute: async ({ note1, note2 }) => {
    const interval = Note.distance(note1, note2);
    const semitones = Interval.semitones(interval);
    return {
      note1,
      note2,
      interval,
      semitones,
    };
  },
});

export const midiToNoteTool = createTool({
  id: 'midi-to-note',
  description: 'Convert MIDI number to note name',
  inputSchema: z.object({
    midi: z.number().describe('MIDI note number (0-127, e.g., 60 for Middle C)'),
    sharps: z.boolean().optional().describe('Use sharps instead of flats (default: false)'),
    pitchClass: z.boolean().optional().describe('Return pitch class only without octave (default: false)'),
  }),
  outputSchema: z.object({
    midi: z.number(),
    noteName: z.string(),
  }),
  execute: async ({ midi, sharps = false, pitchClass = false }) => {
    const noteName = Midi.midiToNoteName(midi, { sharps, pitchClass });
    return { midi, noteName };
  },
});

export const chordDetectionTool = createTool({
  id: 'detect-chord',
  description: 'Detect chord from an array of note names or pitch classes',
  inputSchema: z.object({
    notes: z.array(z.string()).describe('Array of notes (e.g., ["C", "E", "G", "B"] or ["F", "A", "C", "E"])'),
  }),
  outputSchema: z.object({
    detectedChords: z.array(z.string()),
  }),
  execute: async ({ notes }) => {
    const detectedChords = ChordApi.detect(notes);
    return { detectedChords };
  },
});

export const scaleDetectionTool = createTool({
  id: 'detect-scale',
  description: 'Detect scale from an array of notes',
  inputSchema: z.object({
    notes: z.array(z.string()).describe('Array of notes (e.g., ["C", "D", "E", "F", "G", "A", "B"])'),
  }),
  outputSchema: z.object({
    detectedScales: z.array(z.string()),
  }),
  execute: async ({ notes }) => {
    const detectedScales = ScaleApi.detect(notes);
    return { detectedScales };
  },
});

export const chordTransposeTool = createTool({
  id: 'transpose-chord',
  description: 'Transpose a chord by an interval',
  inputSchema: z.object({
    chord: z.string().describe('Chord to transpose (e.g., "Cmaj7", "Dm7", "G7")'),
    interval: z.string().describe('Interval to transpose by (e.g., "3M", "5P", "-2M")'),
  }),
  outputSchema: z.object({
    original: z.string(),
    transposed: z.string(),
    interval: z.string(),
  }),
  execute: async ({ chord, interval }) => {
    const result = ChordApi.transpose(chord, interval);
    return {
      original: chord,
      transposed: result,
      interval,
    };
  },
});