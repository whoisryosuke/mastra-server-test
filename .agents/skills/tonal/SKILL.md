---
name: tonal
description:
  "Use this skill whenever you need to work with music theory in JavaScript using the Tonal library.
  Triggers include: building music apps, generating chords or scales, working with MIDI, analyzing
  harmonic progressions, transposing notes, computing intervals, working with keys or modes, voicing
  chords, handling rhythm/time signatures, or any task involving music notation or theory in code.
  Always use this skill when the user mentions Tonal, tonal.js, or asks you to write JavaScript that
  involves notes, chords, scales, intervals, MIDI, or music theory — even if they don't use the word
  'Tonal' explicitly."
license: Apache-2.0
metadata:
  author: whoisryosuke
  version: "1.0.0"
  repository: https://github.com/whoisryosuke/skills
---

Tonal is a modular, functional JavaScript music theory library. It is tree-shakable and works in
both ESM and CommonJS environments (browser and Node.js).

**Reference files** are linked throughout this document. Read them when you need full API details,
type signatures, or exhaustive lists (chord/scale names, etc.).

---

## Installation

```bash
npm install tonal
```

```js
// Named imports — prefer this (tree-shakable)
import {
  Note,
  Chord,
  Scale,
  Key,
  Interval,
  Midi,
  Mode,
  ChordType,
  ScaleType,
  Progression,
  RomanNumeral,
  Collection,
  Range,
  Pattern,
  Duration,
  Rhythm,
} from "tonal";
```

You can also import from individual packages (e.g. `@tonaljs/note`) if bundle size is critical.

---

## Mental Model

Tonal is **functional and immutable**. Every function takes plain values (strings, numbers) and
returns plain values or plain objects — there are no mutable instances. Invalid inputs never throw;
they return `null`, `NaN`, or an object with an `empty: true` flag.

Key string conventions:

- **Notes**: `"C4"`, `"Db3"`, `"F#5"` — letter + optional accidental (`b`, `#`, `bb`, `##`) + optional octave
- **Intervals**: `"3M"` (major third), `"5P"` (perfect fifth), `"7m"` (minor seventh), `"-2M"` (descending major second)
- **Chord symbols**: `"Cmaj7"`, `"Dm7"`, `"G7"`, `"Abm"`, `"F#dim7"`
- **Scale names**: `"C major"`, `"D dorian"`, `"Bb pentatonic"`

> 📖 For full note/interval/MIDI conventions → [`references/basics/notes.md`](references/basics/notes.md), [`references/basics/intervals.md`](references/basics/intervals.md), [`references/basics/midi.md`](references/basics/midi.md)

---

## Notes

```js
import { Note } from "tonal";

Note.get("C4"); // { name:"C4", pc:"C", oct:4, step:0, alt:0, midi:60, freq:261.63, ... }
Note.name("db3"); // "Db3"   — normalize to canonical form
Note.pc("F#4"); // "F#"    — pitch class (no octave)
Note.oct("G5"); // 5
Note.midi("A4"); // 69
Note.freq("A4"); // 440

// Transposition
Note.transpose("C4", "3M"); // "E4"
Note.transpose("G4", "-5P"); // "C4"

// Distance between notes
Note.distance("C4", "G4") // "5P"

  [
    // Sort
    ("G4", "C4", "E4")
  ].sort(Note.sortedNameComparator); // ["C4","E4","G4"]

// Enharmonic equivalents
Note.enharmonic("Db4"); // "C#4"
```

> 📖 Full API → [`references/basics/notes.md`](references/basics/notes.md)

---

## Intervals

```js
import { Interval } from "tonal";

Interval.get("3M"); // { name:"3M", num:3, q:"M", semitones:4, ... }
Interval.semitones("5P"); // 7
Interval.fromSemitones(7); // "5P"
Interval.invert("3M"); // "6m"
Interval.simplify("9M"); // "2M"

// Add / subtract intervals
Interval.add("3M", "3m"); // "5P"
Interval.subtract("5P", "3M"); // "3m"
```

> 📖 Full API → [`references/basics/intervals.md`](references/basics/intervals.md)

---

## MIDI

```js
import { Midi } from "tonal";

Midi.toMidi("C4"); // 60
Midi.toMidi("A4"); // 69
Midi.midiToNoteName(60); // "C4"
Midi.midiToNoteName(61); // "Db4"
Midi.midiToNoteName(61, { sharps: true }); // "C#4"
Midi.midiToNoteName(60, { pitchClass: true }); // "C"  (no octave)
Midi.freqToMidi(440); // 69
Midi.midiToFreq(69); // 440
```

> 📖 Full API → [`references/basics/midi.md`](references/basics/midi.md)

---

## Chords

```js
import { Chord } from "tonal";

Chord.get("Cmaj7");
// { name:"Cmaj7", tonic:"C", type:"maj7", notes:["C","E","G","B"], intervals:["1P","3M","5P","7M"], ... }

Chord.notes("Dm7"); // ["D","F","A","C"]
Chord.get("Cmaj7").intervals; // ["1P","3M","5P","7M"]

// Detect chord from notes
Chord.detect(["C", "E", "G", "B"]); // ["Cmaj7", "Em/C", ...]

// Transpose a chord
Chord.transpose("Cmaj7", "2M"); // "Dmaj7"

// Chord in a specific octave
Chord.getChord("maj7", "C4"); // notes with octave: ["C4","E4","G4","B4"]
```

**Chord types dictionary** — thousands of named chord types including `"maj"`, `"min"`, `"dom7"`,
`"maj7"`, `"m7"`, `"dim"`, `"aug"`, `"sus2"`, `"sus4"`, etc.

```js
import { ChordType } from "tonal";
ChordType.all(); // array of all known chord type objects
ChordType.get("maj7"); // { name:"maj7", intervals:["1P","3M","5P","7M"], aliases:["M7",...], ... }
ChordType.names(); // all chord type name strings
```

> 📖 Chord groups/detection → [`references/groups/chords.md`](references/groups/chords.md)  
> 📖 Chord type dictionary → [`references/dictionaries/chord-types.md`](references/dictionaries/chord-types.md)

---

## Scales

```js
import { Scale, ScaleType } from "tonal";

Scale.get("C major");
// { name:"C major", tonic:"C", type:"major", notes:["C","D","E","F","G","A","B"],
//   intervals:["1P","2M","3M","4P","5P","6M","7M"], ... }

Scale.notes("Bb dorian"); // ["Bb","C","Db","Eb","F","G","Ab"]
Scale.degrees("C major"); // (n) => note at degree n

// Detect scale from notes
Scale.detect(["C", "D", "E", "F", "G", "A", "B"]); // ["C major", "C ionian", ...]

// Scale chord at degree
Scale.scaleChords("C major"); // chords that fit the scale
Scale.modeNames("C major"); // modal names within the scale

// All scale types
ScaleType.all(); // array of all known scale types
ScaleType.get("dorian"); // { name:"dorian", intervals:[...], ... }
ScaleType.names(); // all scale type name strings
```

> 📖 Scale groups → [`references/groups/scales.md`](references/groups/scales.md)  
> 📖 Scale type dictionary → [`references/dictionaries/scale-types.md`](references/dictionaries/scale-types.md)  
> 📖 Pitch class set operations → [`references/groups/pitch-class-sets.md`](references/groups/pitch-class-sets.md)

---

## Keys & Modes

```js
import { Key, Mode } from "tonal";

// Major key
Key.majorKey("G");
// { tonic:"G", type:"major", scale:["G","A","B","C","D","E","F#"],
//   chords:["Gmaj7","Am7","Bm7","Cmaj7","D7","Em7","F#m7b5"],
//   grades:["I","II","III","IV","V","VI","VII"],
//   chordsHarmonicFunction:["T","SD","T","SD","D","T","D"], ... }

// Minor key
Key.minorKey("A");
// Returns natural, harmonic, and melodic minor data plus chords for each

// Modes
Mode.get("dorian");
// { name:"dorian", modeNum:1, setNum:..., chroma:..., normalized:..., intervals:[...] }

Mode.notes("dorian", "D"); // ["D","E","F","G","A","B","C"]
```

> 📖 Keys → [`references/harmony/keys.md`](references/harmony/keys.md)  
> 📖 Modes → [`references/harmony/modes.md`](references/harmony/modes.md)

---

## Progressions & Roman Numerals

```js
import { Progression, RomanNumeral } from "tonal";

// Convert Roman numeral progression to chord names
Progression.fromRomanNumerals("C", ["I", "IV", "V", "I"]);
// ["C","F","G","C"]

Progression.fromRomanNumerals("G", ["Imaj7", "IIm7", "V7", "Imaj7"]);
// ["Gmaj7","Am7","D7","Gmaj7"]

// Analyze a chord list against a key
Progression.toRomanNumerals("C", ["C", "F", "G", "C"]);
// ["I","IV","V","I"]

// Roman numeral objects
RomanNumeral.get("IVmaj7");
// { name:"IVmaj7", roman:"IV", num:4, major:true, chordType:"maj7", ... }
```

> 📖 Progressions → [`references/harmony/progressions.md`](references/harmony/progressions.md)  
> 📖 Roman numerals → [`references/notation/roman-numerals.md`](references/notation/roman-numerals.md)

---

## Collections, Ranges & Utilities

```js
import { Collection, Range } from "tonal";

// Shuffle, permutations, combinations, rotate
Collection.shuffle(["C", "D", "E", "F"]); // randomized copy
Collection.rotate(2, ["C", "D", "E", "F"]); // ["E","F","C","D"]
Collection.permutations(["C", "D", "E"]); // all orderings

// Note ranges
Range.chromatic(["C4", "G4"]); // ["C4","Db4","D4","Eb4","E4","F4","F#4","G4"]
Range.chromatic(["C4", "G4"], { sharps: true }); // uses sharps
```

> 📖 Collections → [`references/utils/collections.md`](references/utils/collections.md)  
> 📖 Ranges → [`references/utils/ranges.md`](references/utils/ranges.md)

---

## Voicings

Voicings spread chord notes across octaves for real musical playability.

```js
import { VoiceLeading, Voicing } from "@tonaljs/voicing";
import { VoicingDictionary } from "@tonaljs/voicing-dictionary";

// Get a voiced chord (notes with octaves)
Voicing.get("Cmaj7", ["E3", "G5"]);
// returns array of note strings fitting the chord within the range

// Voice-lead between two chords (minimize movement)
VoiceLeading.analyze(
  ["C4", "E4", "G4", "B4"], // current voicing
  "Am7", // next chord
  ["C3", "C5"], // note range
);
```

> 📖 Voicings API → [`references/voicings/voicings.md`](references/voicings/voicings.md)  
> 📖 Voice leading → [`references/voicings/leading.md`](references/voicings/leading.md)  
> 📖 Voicing dictionary → [`references/voicings/dictionary.md`](references/voicings/dictionary.md)

---

## Time, Duration & Rhythm

```js
import { Duration, TimeSignature, Rhythm, Pattern } from "tonal";

Duration.get("q"); // { empty:false, value:0.25, name:"quarter", ... }
Duration.toSeconds("q", 120); // 0.5  (seconds at 120 BPM)

TimeSignature.get("4/4"); // { upper:4, lower:4, additive:false }
TimeSignature.get("6/8"); // { upper:6, lower:8 }

// Rhythmic patterns
Pattern.get("tresillo"); // { values:[3,3,2], ... }
```

> 📖 Duration → [`references/time/duration.md`](references/time/duration.md)  
> 📖 Patterns → [`references/time/patterns.md`](references/time/patterns.md)  
> 📖 Time signatures → [`references/time/signatures.md`](references/time/signatures.md)

---

## ABC Notation

```js
import { AbcNotation } from "tonal";

AbcNotation.scientificToAbcNotation("C4"); // "C"
AbcNotation.scientificToAbcNotation("C5"); // "c"
AbcNotation.scientificToAbcNotation("C3"); // "C,"
AbcNotation.abcToScientificNotation("c"); // "C5"
```

> 📖 Full API → [`references/notation/abc-notation.md`](references/notation/abc-notation.md)

---

## Common Patterns & Recipes

### Generate a chord progression in a key

```js
import { Key, Progression } from "tonal";

const key = Key.majorKey("C");
// key.chords → ["Cmaj7","Dm7","Em7","Fmaj7","G7","Am7","Bm7b5"]

// ii-V-I in C major
const chords = Progression.fromRomanNumerals("C", ["IIm7", "V7", "Imaj7"]);
// → ["Dm7","G7","Cmaj7"]
```

### Get all notes in a scale with octaves

```js
import { Scale, Note } from "tonal";
const pcs = Scale.get("D major").notes; // ["D","E","F#","G","A","B","C#"]
const notes = pcs.map((pc) => pc + "4"); // ["D4","E4","F#4","G4","A4","B4","C#4"]
```

### Transpose a whole chord progression

```js
import { Chord } from "tonal";
const progression = ["Cmaj7", "Am7", "Dm7", "G7"];
const transposed = progression.map((ch) => Chord.transpose(ch, "5P"));
// → ["Gmaj7","Em7","Am7","D7"]
```

### Convert a MIDI array to note names

```js
import { Midi } from "tonal";
[60, 62, 64, 65, 67].map((m) => Midi.midiToNoteName(m));
// → ["C4","D4","E4","F4","G4"]
```

### Detect what chord a set of notes forms

```js
import { Chord } from "tonal";
Chord.detect(["F", "A", "C", "E"]); // ["Fmaj7","Am/F",...]
```

---

## Error Handling

Tonal never throws. Check for empty/invalid results:

```js
const note = Note.get("Xyz");
if (note.empty) console.error("Invalid note");

const chord = Chord.get("Cmaj99");
if (chord.empty) console.error("Unknown chord type");

const semitones = Interval.semitones("bad");
if (isNaN(semitones)) console.error("Invalid interval");
```

---

## Resources

### Basics

- **Intervals**: [`references/basics/intervals.md`](references/basics/intervals.md)
- **Midi**: [`references/basics/midi.md`](references/basics/midi.md)
- **Notes**: [`references/basics/notes.md`](references/basics/notes.md)

### Dictionaries

- **Chord dictionary**: [`references/dictionaries/chord-types.md`](references/dictionaries/chord-types.md)
- **Scale dictionary**: [`references/dictionaries/chord-types.md`](references/dictionaries/scale-types.md)

### Groups

- **Chords**: [`references/groups/chords.md`](references/groups/chords.md)
- **Pitch Class Sets**: [`references/groups/pitch-class-sets.md`](references/groups/pitch-class-sets.md)
- **Scales**: [`references/groups/scales.md`](references/groups/scales.md)

### Harmony

- **Keys**: [`references/harmony/keys.md`](references/harmony/keys.md)
- **Modes**: [`references/harmony/modes.md`](references/harmony/modes.md)

### Progressions

- **Progressions**: [`references/harmony/progressions.md`](references/harmony/progressions.md)
- **Abc Notation**: [`references/notation/abc-notation.md`](references/notation/abc-notation.md)
- **Roman Numerals**: [`references/notation/roman-numerals.md`](references/notation/roman-numerals.md)

### Time

- **Duration**: [`references/time/duration.md`](references/time/duration.md)
- **Patterns**: [`references/time/patterns.md`](references/time/patterns.md)
- **Signatures**: [`references/time/signatures.md`](references/time/signatures.md)

### Collections

- **Collections**: [`references/utils/collections.md`](references/utils/collections.md)
- **Ranges**: [`references/utils/ranges.md`](references/utils/ranges.md)

### Voicings

- **Dictionary**: [`references/voicings/dictionary.md`](references/voicings/dictionary.md)
- **Leading**: [`references/voicings/leading.md`](references/voicings/leading.md)
- **Voicings**: [`references/voicings/voicings.md`](references/voicings/voicings.md)
